import NDK, { NDKCashuMintList, NDKEvent, NDKEventId, NDKKind, NDKRelaySet, NDKSubscription, NDKSubscriptionCacheUsage, NDKUser } from "@nostr-dev-kit/ndk";
import NDKWallet from "../index.js";
import handleMintList from "./mint-list.js";
import handleWalletEvent from "./wallet.js";
import handleTokenEvent from "./token.js";
import handleEventDeletion from "./deletion.js";
import { NDKCashuWallet } from "../../cashu/wallet.js";
import { NDKCashuToken } from "../../cashu/token.js";
import createDebug from "debug";

class NDKWalletLifecycle {
    private wallet: NDKWallet;
    private sub: NDKSubscription | undefined;
    public eosed = false;
    private ndk: NDK;
    private user: NDKUser;
    public _mintList: NDKCashuMintList | undefined;
    public wallets = new Map<string, NDKCashuWallet>();
    public defaultWallet: NDKCashuWallet | undefined;
    private tokensSub: NDKSubscription | undefined;
    public orphanedTokens = new Map<string, NDKCashuToken>();
    public knownTokens = new Set<NDKEventId>();
    public tokensSubEosed = false;
    public debug = createDebug("ndk-wallet:lifecycle");
    
    constructor(wallet: NDKWallet, ndk: NDK, user: NDKUser) {
        this.wallet = wallet;
        this.ndk = ndk;
        this.user = user;
    }

    public start() {
        this.debug("starting wallet lifecycle", this.user.pubkey);
        this.sub = this.ndk.subscribe([
            { kinds: [
                NDKKind.CashuMintList,
                NDKKind.CashuWallet
            ], authors: [this.user.pubkey] },
        ], {
            subId: 'ndk-wallet',
            groupable: false,
            cacheUsage: NDKSubscriptionCacheUsage.ONLY_RELAY
        }, undefined, false);

        this.sub.on("event", this.eventHandler.bind(this));
        this.sub.on("eose", this.eoseHandler.bind(this));

        this.sub!.start();
    }

    private eventHandler(event: NDKEvent) {
        switch (event.kind) {
            case NDKKind.CashuMintList:
                handleMintList.bind(this, NDKCashuMintList.from(event)).call(this);
                break;
            case NDKKind.CashuWallet:
                handleWalletEvent.bind(this, event).call(this);
                break;
            case NDKKind.CashuToken:
                handleTokenEvent.bind(this, event).call(this);
                break;
            case NDKKind.EventDeletion:
                handleEventDeletion.bind(this, event).call(this);
        }
    }

    private eoseHandler() {
        this.debug("main sub eose")
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

        this.tokensSub = this.ndk.subscribe([
            { kinds: [NDKKind.CashuToken], authors: [this.user!.pubkey] },
            { kinds: [NDKKind.EventDeletion], authors: [this.user!.pubkey], limit: 0 },
        ], {
            subId: 'ndk-wallet-tokens',
            groupable: false,
            cacheUsage: NDKSubscriptionCacheUsage.ONLY_RELAY
        }, undefined, false);
        this.tokensSub.on("event", this.eventHandler.bind(this));
        this.tokensSub.on("eose", this.tokensSubEose.bind(this));
        this.tokensSub.start();
    }

    private tokensSubEose() {
        this.tokensSubEosed = true;
    }

    // private handleMintList = handleMintList.bind

    public emit(event: string, ...args: any[]) {
        this.wallet.emit(event as unknown as any, ...args);
    }

    // Sets the default wallet as seen by the mint list
    public setDefaultWallet(p2pkPubkey?: string, wallet?: NDKCashuWallet) {
        let w = wallet; 
        if (!w && p2pkPubkey) 
            w = Array.from(this.wallets.values()).find(w => w.p2pkPubkey === p2pkPubkey);

        if (w) {
            this.defaultWallet = w;
            this.emit("wallet:default", w);
        }
    }
}

export default NDKWalletLifecycle;