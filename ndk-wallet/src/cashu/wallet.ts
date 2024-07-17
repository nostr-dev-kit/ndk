import NDK, { LnPaymentInfo, NDKEvent, NDKEventId, NDKKind, NDKPrivateKeySigner, NDKRelaySet, NDKSubscriptionCacheUsage, NDKTag, NDKUser, NDKZapConfirmation, NDKZapper, NutPaymentInfo } from "@nostr-dev-kit/ndk";
import { NostrEvent } from "nostr-tools";
import { NDKCashuToken, proofsTotalBalance } from "./token.js";
import { NDKCashuDeposit } from "./deposit.js";
import createDebug from "debug";
import { MintUrl } from "./mint/utils.js";
import { NDKCashuPay } from "./pay.js";
import { CashuMint, CashuWallet } from "@cashu/cashu-ts";
import { NDKWalletChange } from "./history.js";

const d = createDebug('ndk-wallet:cashu:wallet');

export class NDKCashuWallet extends NDKEvent {
    public tokens: NDKCashuToken[] = [];
    private knownTokens: Set<NDKEventId> = new Set();

    static kind = NDKKind.CashuWallet;
    static kinds = [NDKKind.CashuWallet];

    constructor(ndk?: NDK, event?: NostrEvent) {
        super(ndk, event);
        this.kind ??= NDKKind.CashuWallet;
    }

    get walletId(): string {
        return this.dTag!;
    }

    set walletId(id: string) {
        this.dTag = id;
    }

    static async from(event: NDKEvent) {
        const wallet = new NDKCashuWallet(event.ndk, event.rawEvent() as NostrEvent);

        console.log(event.rawEvent())

        const prevContent = wallet.content;
        try {
            await wallet.decrypt();
            console.log(event.content);
        } catch (e) {
            console.error(e);
        }
        wallet.content ??= prevContent;
        console.log(wallet.content);

        const contentTags = JSON.parse(wallet.content);
        wallet.tags = [...contentTags, ...wallet.tags];

        console.log()
        
        return wallet;
    }

    set relays(urls: WebSocket['url'][]) {
        this.tags = this.tags.filter(t => t[0] !== "relay");
        for (const url of urls) {
            this.tags.push(["relay", url]);
        }
        console.log('setting relay tags to', {urls})
    }

    get relays(): WebSocket['url'][] {
        const r = [];
        console.log('relay has tags', this.tags, this.content)
        for (const tag of this.tags) {
            if (tag[0] === "relay") { r.push(tag[1]); }
        }

        return r;
    }

    set mints(urls: WebSocket['url'][]) {
        this.tags = this.tags.filter(t => t[0] !== "mint");
        for (const url of urls) {
            this.tags.push(["mint", url]);
        }
    }

    get mints(): WebSocket['url'][] {
        const r = [];
        for (const tag of this.tags) {
            if (tag[0] === "mint") { r.push(tag[1]); }
        }

        return Array.from(new Set(r));
    }

    set name(url: string) {
        this.removeTag("name");
        this.tags.push(["name", url]);  
    }

    get name(): string | undefined {
        return this.tagValue("name");
    }
    
    get unit(): string {
        return this.tagValue("unit") ?? "sats";
    }

    set unit(unit: string) {
        this.removeTag("unit");
        this.tags.push(["unit", unit]);
    }

    async getP2pk(): Promise<string | undefined> {
        if (this.privkey) {
            const signer = new NDKPrivateKeySigner(this.privkey);
            return (await signer.user()).pubkey;
        }
    }

    get privkey(): string | undefined {
        const privkey = this.tagValue("privkey");
        if (privkey) return privkey;

        if (this.ndk?.signer instanceof NDKPrivateKeySigner) {
            return this.ndk.signer.privateKey;
        }
    }

    set privkey(privkey: string) {
        this.removeTag("privkey");
        this.tags.push(["privkey", privkey]);
    }

    async toNostrEvent(pubkey?: string): Promise<NostrEvent> {
        const encryptedTags: NDKTag[] = [];
        const unencryptedTags: NDKTag[] = [];

        const unencryptedTagNames = [ "d", "client", "mint" ]

        for (const tag of this.tags) {
            if (unencryptedTagNames.includes(tag[0])) { unencryptedTags.push(tag); }
            else { encryptedTags.push(tag); }
        }

        this.tags = unencryptedTags.filter(t => t[0] !== "client");
        this.content = JSON.stringify(encryptedTags);

        console.log('relay encryupted', this.content, { encryptedTags})

        const user = await this.ndk!.signer!.user();

        await this.encrypt(user);
        
        return super.toNostrEvent(pubkey) as unknown as NostrEvent;
    }

    get relaySet(): NDKRelaySet | undefined {
        console.log('relayset', this.relays)
        return NDKRelaySet.fromRelayUrls(
            this.relays, this.ndk!
        )
    }

    public deposit(amount: number, mint?: string) {
        return new NDKCashuDeposit(this, amount, mint);
    }

    async zap(
        target: NDKEvent | NDKUser,
        amount: number,
        unit: string,
        comment?: string,
        recipient?: NDKUser
    ): Promise<NDKZapConfirmation> {
        if (!recipient) {
            if (target instanceof NDKUser) {
                recipient = target;
            } else {
                recipient = target.author;
            }
        }

        const zapper = new NDKZapper(target, amount, unit, comment);

        return new Promise<NDKZapConfirmation>((resolve, reject) => {
            zapper.onComplete = (info) => { resolve(info); };
            zapper.onLnPay = async ({info}) => {
                const { pr } = info as LnPaymentInfo
                const res = await this.lnPay(pr);
                if (res) return { preimage: res };
                return false;
            };
            zapper.onNutPay = async ({ info, amount, unit }) => {
                const { mints, p2pkPubkey, relays } = info as NutPaymentInfo;
                const res = await this.nutPay(amount, unit, mints, p2pkPubkey);

                if (!res) return false;
                const { proofs, mint } = res;
                const nutzapEvent = new NDKEvent(this.ndk, {
                    kind: NDKKind.Nutzap,
                    content: JSON.stringify(proofs),
                    tags: [
                        [ "u", mint ],
                        [ "amount", amount.toString(), unit ],
                    ],
                } as NostrEvent);

                // add comment
                if (comment) nutzapEvent.tags.push(["comment", comment]);
                
                nutzapEvent.tag(target);

                // ensure we only have a single "p"-tag
                nutzapEvent.tags = nutzapEvent.tags.filter(t => t[0] !== "p");
                nutzapEvent.tag(recipient);
                
                // publish
                await nutzapEvent.sign();
                nutzapEvent.publish();

                if (relays.length > 0) {
                    const relaySet = NDKRelaySet.fromRelayUrls(relays, this.ndk!);
                    d("relaying nutzap to %o", relaySet);
                    nutzapEvent.publish(relaySet);
                }
            
                return nutzapEvent;
            };

            zapper.zap();
        });
    }

    async lnPay(pr: string) {
        const pay = new NDKCashuPay(this, {pr});
        return pay.payLn();
    }

    /**
     * Swaps tokens to a specific amount, optionally locking to a p2pk.
     * @param amount
     */
    async nutPay(
        amount: number,
        unit: string,
        mints: MintUrl[],
        p2pk?: string,
    ) {
        const pay = new NDKCashuPay(this, { amount, unit, mints, p2pk });
        return pay.pay();
    }

    async redeemNutzap(nutzap: NDKEvent) {
        this.emit('nutzap:seen', nutzap);

        try {
            const mint = nutzap.tagValue("u");
            if (!mint) throw new Error("missing mint");
            const proofs = JSON.parse(nutzap.content);
            console.log(proofs);

            const _wallet = new CashuWallet(new CashuMint(mint));
            const res = await _wallet.receiveTokenEntry({ proofs, mint }, {
                privkey: this.privkey,
            });

            if (res) {
                this.emit('nutzap:redeemed', nutzap);
            }

            const tokenEvent = new NDKCashuToken(this.ndk);
            tokenEvent.proofs = proofs;
            tokenEvent.mint = mint;
            tokenEvent.wallet = this;
            await tokenEvent.sign();
            tokenEvent.publish(this.relaySet);
            console.log("new token event", tokenEvent.rawEvent());

            const historyEvent = new NDKWalletChange(this.ndk);
            console.log('adding nutzap')
            historyEvent.addRedeemedNutzap(nutzap);
            console.log('adding wallet')
            historyEvent.tag(this);
            console.log('adding token', tokenEvent.rawEvent())
            historyEvent.tag(tokenEvent, NDKWalletChange.MARKERS.CREATED);
            await historyEvent.sign();
            historyEvent.publish(this.relaySet);
            console.log("new history event", historyEvent.rawEvent());
        } catch (e) {
            console.trace(e);
            this.emit('nutzap:failed', nutzap, e);
        }
    }

    private redeemQueue = new Map<NDKEventId, NDKEvent>();
    private knownRedeemedTokens = new Set<NDKEventId>();
    
    private pushToRedeemQueue(nutzap: NDKEvent) {
        this.redeemQueue.set(nutzap.id, nutzap);
    }

    private processRedeemQueue() {
        // go through knownRedeemedTokens and remove them from the queue
        for (const id of this.knownRedeemedTokens) {
            this.redeemQueue.delete(id);
        }

        // process the queue
        for (const nutzap of this.redeemQueue.values()) {
            this.redeemNutzap(nutzap);
        }
    }

    public start() {
        let eosed = false;

        d("monitoring wallet %s", this.walletId!);

        const sub = this.ndk!.subscribe([
            { kinds: [ NDKKind.CashuToken, NDKKind.EventDeletion, NDKKind.WalletChange ], "#a": [ this.tagId() ], authors: [this.pubkey] },
            { kinds: [ NDKKind.Nutzap ], "#p": [this.pubkey] }
        ], {
            cacheUsage: NDKSubscriptionCacheUsage.ONLY_RELAY
        }, this.relaySet, false);

        /**
         * Add the token to the wallet if it's not already known
         */
        const handleTokenEvent = async (event: NDKEvent) => {
            const token = NDKCashuToken.from(event);
            if (!this.knownTokens.has(token.id)) {
                d("received event %o", event.rawEvent());
                this.knownTokens.add(token.id);
                this.tokens.push(token);
            }
        };

        /**
         * Remove deleted tokens from the wallet
         */
        const handleEventDeletion = async (event: NDKEvent) => {
            const deletedIds = event.getMatchingTags("e").map(t => t[1]);
            deletedIds.forEach(id => this.knownTokens.delete(id));
            this.tokens = this.tokens.filter(t => !deletedIds.includes(t.id));
        }

        /**
         * Add nutzap to the redeem queue or redeem if we have EOSEd already
         */
        const handleNutzapEvent = async (event: NDKEvent) => {
            if (!eosed) {
                this.pushToRedeemQueue(event);
            } else {
                d("received nutzap %o", event.rawEvent());
                this.redeemNutzap(event);
            }
        };

        /**
         * Add redeemed nutzaps to the knownRedeemedTokens set
         */
        const handleWalletChangeEvent = async (event: NDKEvent) => {
            const redeemedIds = event.getMatchingTags("e").map(t => t[1]);
            redeemedIds.forEach(id => this.knownRedeemedTokens.add(id));
        }

        sub.on('event', (event: NDKEvent) => {
            switch (event.kind) {
                case NDKKind.CashuToken: handleTokenEvent(event); break;
                case NDKKind.EventDeletion: handleEventDeletion(event); break;
                case NDKKind.Nutzap: handleNutzapEvent(event); break;
                case NDKKind.WalletChange: handleWalletChangeEvent(event); break;
            }

            if (eosed) {
                this.emit('update');
            }
        })

        sub.on('eose', () => {
            eosed = true;
            this.processRedeemQueue();
            this.emit('update');
        });
        
        sub.start();

        return sub;
    }

    /**
     * Gets all tokens, grouped by mint
     */
    get mintTokens(): Record<MintUrl, NDKCashuToken[]> {
        const tokens: Record<MintUrl, NDKCashuToken[]> = {};

        for (const token of this.tokens) {
            if (token.mint) {
                tokens[token.mint] ??= [];
                tokens[token.mint].push(token);
            }
        }

        return tokens;
    }

    get balance(): number | undefined {
        // aggregate all token balances
        return proofsTotalBalance(this.tokens.map(t => t.proofs).flat());
    }

    get mintBalances(): Record<MintUrl, number> {
        const balances: Record<MintUrl, number> = {};

        for (const token of this.tokens) {
            if (token.mint) {
                balances[token.mint] ??= 0;
                balances[token.mint] += token.amount;
            }
        }

        return balances;
    }
}