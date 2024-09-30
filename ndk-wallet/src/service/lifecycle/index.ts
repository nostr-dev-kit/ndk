import type {
    NDKEvent,
    NDKEventId,
    NDKFilter,
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
import handleMintList from "./mint-list.js";
import handleWalletEvent from "./wallet.js";
import handleTokenEvent from "./token.js";
import handleEventDeletion from "./deletion.js";
import type { NDKCashuWallet} from "../../cashu/wallet.js";
import type { NDKCashuToken } from "../../cashu/token.js";
import createDebug from "debug";
import { NDKWalletChange } from "../../cashu/history.js";
import { EventEmitter } from "tseep";
import { NDKWallet } from "../../wallet/index.js";

/**
 * This class is responsible for managing the lifecycle of a user wallets.
 * It fetches the user wallets, tokens and nutzaps and keeps them up to date.
 */
class NDKWalletLifecycle extends EventEmitter<{
    "wallet:default": (wallet: NDKWallet) => void;
    "mintlist:ready": (mintList: NDKCashuMintList) => void;
    "wallet": (wallet: NDKWallet) => void;
    "ready": () => void;
}> {
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

    constructor(ndk: NDK, user: NDKUser) {
        super();
        this.ndk = ndk;
        this.user = user;
    }

    /**
     * Check for wallets
     */
    async start() {
        const userRelayList = await getRelayListForUser(this.user.pubkey, this.ndk);
        const filters: NDKFilter[] = [
            {
                kinds: [NDKKind.CashuMintList, NDKKind.CashuWallet],
                authors: [this.user.pubkey],
            },
            { kinds: [NDKKind.WalletChange], authors: [this.user!.pubkey], limit: 10 },
        ]

        // if we have a clientName, also get NIP-78 AppSpecificData
        if (this.ndk.clientName) {
            filters.push({ kinds: [NDKKind.AppSpecificData], authors: [this.user.pubkey], "#d": [this.ndk.clientName] })
        }

        this.sub = this.ndk.subscribe(
            filters,
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
            // case NDKKind.Nutzap:
            //     this.nutzap.addNutzap(event);
            //     break;
            // case NDKKind.WalletChange:
            //     NDKWalletChange.from(event).then((wc) => {
            //         if (wc) {
            //             this.nutzap.addWalletChange(wc);
            //         }
            //     });
            case NDKKind.AppSpecificData:
                // handleAppSpecificData.bind(this, event, relay).call(this);
                break;
        }
    }

    private eoseHandler() {
        this.eosed = true;

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
            if (!oldestWalletTimestamp || wallet.event.created_at! > oldestWalletTimestamp) {
                oldestWalletTimestamp = wallet.event.created_at!;
            }

            this.emit("wallet", wallet);
        }

        this.tokensSub = this.ndk.subscribe(
            [
                { kinds: [NDKKind.CashuToken], authors: [this.user!.pubkey] },
                { kinds: [NDKKind.EventDeletion], authors: [this.user!.pubkey], limit: 0 },
                { kinds: [NDKKind.WalletChange], authors: [this.user!.pubkey] },
                // {
                //     kinds: [NDKKind.Nutzap],
                //     "#p": [this.user!.pubkey],
                //     since: oldestWalletTimestamp,
                // },
            ],
            {
                subId: "ndk-wallet-tokens",
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
        this.tokensSubEosed = true;
        this.emit("ready");

        // this.nutzap.eosed().then(() => {
        //     // once we finish processing nutzaps
        //     // we can update the wallet's cached balance
        //     for (const wallet of this.wallets.values()) {
        //         wallet.status = NDKWalletStatus.READY;
        //         wallet.updateBalance();
        //     }
        // });
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
