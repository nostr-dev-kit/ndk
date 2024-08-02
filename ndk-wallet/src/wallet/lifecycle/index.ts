import type {
    NDKEvent,
    NDKEventId,
    NDKRelay,
    NDKSubscription,
    NDKUser} from "@nostr-dev-kit/ndk";
import type NDK from "@nostr-dev-kit/ndk";
import {
    getRelayListForUser,
    NDKCashuMintList,
    NDKKind,
    NDKRelaySet,
    NDKSubscriptionCacheUsage
} from "@nostr-dev-kit/ndk";
import type NDKWallet from "../index.js";
import handleMintList from "./mint-list.js";
import handleWalletEvent from "./wallet.js";
import handleTokenEvent from "./token.js";
import handleEventDeletion from "./deletion.js";
import type { NDKCashuWallet} from "../../cashu/wallet.js";
import { NDKCashuWalletState } from "../../cashu/wallet.js";
import type { NDKCashuToken } from "../../cashu/token.js";
import createDebug from "debug";
import { NDKWalletChange } from "../../cashu/history.js";
import NutzapHandler from "./nutzap.js";

/**
 * This class is responsible for managing the lifecycle of a user wallets.
 * It fetches the user wallets, tokens and nutzaps and keeps them up to date.
 */
class NDKWalletLifecycle {
    public wallet: NDKWallet;
    private sub: NDKSubscription | undefined;
    public eosed = false;
    public ndk: NDK;
    private user: NDKUser;
    public _mintList: NDKCashuMintList | undefined;
    public wallets = new Map<string, NDKCashuWallet>();
    public walletsByP2pk = new Map<string, NDKCashuWallet>();
    public defaultWallet: NDKCashuWallet | undefined;
    private tokensSub: NDKSubscription | undefined;
    public orphanedTokens = new Map<string, NDKCashuToken>();
    public knownTokens = new Set<NDKEventId>();
    public tokensSubEosed = false;
    public debug = createDebug("ndk-wallet:lifecycle");
    public state: "loading" | "ready" = "loading";

    public nutzap: NutzapHandler;

    constructor(wallet: NDKWallet, ndk: NDK, user: NDKUser) {
        this.wallet = wallet;
        this.ndk = ndk;
        this.user = user;
        this.nutzap = new NutzapHandler(this);
    }

    async start() {
        const userRelayList = await getRelayListForUser(this.user.pubkey, this.ndk);
        this.sub = this.ndk.subscribe(
            [
                {
                    kinds: [NDKKind.CashuMintList, NDKKind.CashuWallet],
                    authors: [this.user.pubkey],
                },
                { kinds: [NDKKind.WalletChange], authors: [this.user!.pubkey], limit: 10 },
            ],
            {
                subId: "ndk-wallet",
                groupable: false,
                cacheUsage: NDKSubscriptionCacheUsage.PARALLEL,
            },
            userRelayList?.relaySet,
            false
        );

        this.sub.on("event", this.eventHandler.bind(this));
        this.sub.on("eose", this.eoseHandler.bind(this));

        this.sub!.start();
    }

    private eventHandler(event: NDKEvent, relay?: NDKRelay) {
        switch (event.kind) {
            case NDKKind.CashuMintList:
                handleMintList.bind(this, NDKCashuMintList.from(event)).call(this);
                break;
            case NDKKind.CashuWallet:
                handleWalletEvent.bind(this, event, relay).call(this);
                break;
            case NDKKind.CashuToken:
                handleTokenEvent.bind(this, event, relay).call(this);
                break;
            case NDKKind.EventDeletion:
                handleEventDeletion.bind(this, event).call(this);
                break;
            case NDKKind.Nutzap:
                this.nutzap.addNutzap(event);
                break;
            case NDKKind.WalletChange:
                NDKWalletChange.from(event).then((wc) => {
                    if (wc) {
                        this.nutzap.addWalletChange(wc);
                    }
                });
        }
    }

    private eoseHandler() {
        this.debug("Loaded wallets", {
            defaultWallet: this.defaultWallet?.rawEvent(),
            wallets: Array.from(this.wallets.values()).map((w) => w.rawEvent()),
        });
        this.eosed = true;

        if (this.tokensSub) {
            this.debug("WE ALREADY HAVE TOKENS SUB!!!");
            return;
        }

        // if we don't have a default wallet, choose the first one if there is one
        const firstWallet = Array.from(this.wallets.values())[0];
        if (!this.defaultWallet && firstWallet) {
            this.debug("setting default wallet to first wallet", firstWallet.walletId);
            this.setDefaultWallet(undefined, firstWallet);
        }

        // get all relay sets
        const relaySet = new NDKRelaySet(new Set(), this.ndk);

        for (const wallet of this.wallets.values()) {
            for (const relayUrl of wallet.relays) {
                const relay = this.ndk.pool.getRelay(relayUrl, true, true);
                relaySet.addRelay(relay);
            }
        }

        let oldestWalletTimestamp = undefined;
        for (const wallet of this.wallets.values()) {
            if (!oldestWalletTimestamp || wallet.created_at! > oldestWalletTimestamp) {
                oldestWalletTimestamp = wallet.created_at!;
                this.debug("oldest wallet timestamp", oldestWalletTimestamp);
            }
        }

        this.debug("oldest wallet timestamp", oldestWalletTimestamp, this.wallets.values());

        this.tokensSub = this.ndk.subscribe(
            [
                { kinds: [NDKKind.CashuToken], authors: [this.user!.pubkey] },
                { kinds: [NDKKind.EventDeletion], authors: [this.user!.pubkey], limit: 0 },
                { kinds: [NDKKind.WalletChange], authors: [this.user!.pubkey] },
                {
                    kinds: [NDKKind.Nutzap],
                    "#p": [this.user!.pubkey],
                    since: oldestWalletTimestamp,
                },
            ],
            {
                subId: "ndk-wallet-tokens2",
                groupable: false,
                cacheUsage: NDKSubscriptionCacheUsage.ONLY_RELAY,
            },
            relaySet,
            false
        );
        this.tokensSub.on("event", this.eventHandler.bind(this));
        this.tokensSub.on("eose", this.tokensSubEose.bind(this));
        this.tokensSub.start();
    }

    private tokensSubEose() {
        this.state = "ready";
        console.log("EMITTING READY");
        this.wallet.emit("ready");
        this.tokensSubEosed = true;
        this.nutzap.eosed().then(() => {
            // once we finish processing nutzaps
            // we can update the wallet's cached balance
            for (const wallet of this.wallets.values()) {
                wallet.state = NDKCashuWalletState.READY;
                wallet.updateBalance();
            }
        });
    }

    // private handleMintList = handleMintList.bind

    public emit(event: string, ...args: any[]) {
        this.wallet.emit(event as unknown as any, ...args);
    }

    // Sets the default wallet as seen by the mint list
    public setDefaultWallet(p2pk?: string, wallet?: NDKCashuWallet) {
        let w = wallet;
        if (!w && p2pk) w = Array.from(this.wallets.values()).find((w) => w.p2pk === p2pk);

        if (w) {
            this.defaultWallet = w;
            this.emit("wallet:default", w);
        }
    }

    /**
     * Track when is the most recently redeemed nutzap redemption
     * so we know when to start processing nutzaps
     */
    public latestNutzapRedemptionAt: number = 0;

    public addNutzapRedemption(event: NDKWalletChange) {
        console.log("add nutzap redemption", event.created_at);
        if (this.latestNutzapRedemptionAt && this.latestNutzapRedemptionAt > event.created_at!)
            return;

        this.latestNutzapRedemptionAt = event.created_at!;
    }
}

export default NDKWalletLifecycle;
