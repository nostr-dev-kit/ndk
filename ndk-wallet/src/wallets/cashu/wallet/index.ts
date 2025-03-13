import type {
    CashuPaymentInfo,
    Hexpubkey,
    LnPaymentInfo,
    NDKFilter,
    NDKNutzap,
    NDKPaymentConfirmationCashu,
    NDKZapDetails,
    NDKSubscription,
    NDKSubscriptionOptions,
    NDKRelay,
    NDKPaymentConfirmationLN,
    NDKTag,
} from "@nostr-dev-kit/ndk";
import NDK, { NDKEvent, NDKKind, NDKPrivateKeySigner, NDKRelaySet, NDKUser } from "@nostr-dev-kit/ndk";
import { NDKCashuDeposit } from "../deposit.js";
import createDebug from "debug";
import type { MintUrl } from "../mint/utils.js";
import type { CashuWallet, GetInfoResponse, MintKeys, Proof, SendResponse } from "@cashu/cashu-ts";
import { CashuMint, getDecodedToken } from "@cashu/cashu-ts";
import { consolidateTokens } from "../validate.js";
import { NDKWallet, NDKWalletBalance, NDKWalletEvents, NDKWalletStatus } from "../../index.js";
import { EventEmitter } from "tseep";
import { eventDupHandler, eventHandler } from "../event-handlers/index.js";
import { NDKCashuDepositMonitor } from "../deposit-monitor.js";
import { walletForMint } from "../mint.js";

const d = createDebug("ndk-wallet:cashu:wallet");

export type WalletWarning = {
    msg: string;
    event?: NDKEvent;
    relays?: NDKRelay[];
}

import { PaymentHandler, PaymentWithOptionalZapInfo } from "./payment.js";
import { createInTxEvent, createOutTxEvent } from "./txs.js";
import { WalletState } from "./state/index.js";

/**
 * This class tracks state of a NIP-60 wallet
 */
export class NDKCashuWallet extends EventEmitter<NDKWalletEvents & {
    warning: (warning: WalletWarning) => void;
}> implements NDKWallet {
    readonly type = "nip-60";
    
    public _p2pk: string | undefined;
    private sub?: NDKSubscription;
    public ndk: NDK;

    public status: NDKWalletStatus = NDKWalletStatus.INITIAL;

    static kind = NDKKind.CashuWallet;
    static kinds = [NDKKind.CashuWallet];

    public mints: string[] = [];
    public privkeys = new Map<string, NDKPrivateKeySigner>();
    public signer?: NDKPrivateKeySigner;

    public _event?: NDKEvent;

    public walletId: string = "nip-60";

    public depositMonitor = new NDKCashuDepositMonitor();

    /**
     * Warnings that have been raised
     */
    public warnings: WalletWarning[] = [];

    private paymentHandler: PaymentHandler;
    public state: WalletState;

    public relaySet?: NDKRelaySet;

    /**
     * Called when the wallet needs to load mint info. Use this
     * to load mint info from a database or other source.
     */
    public onMintInfoNeeded?: (mint: string) => Promise<GetInfoResponse | undefined>;

    /**
     * Called when the wallet has loaded mint info.
     */
    public onMintInfoLoaded?: (mint: string, info: GetInfoResponse) => void;

    /**
     * Called when the wallet needs to load mint keys. Use this
     * to load mint keys from a database or other source.
     */
    public onMintKeysNeeded?: (mint: string) => Promise<MintKeys[] | undefined>;

    /**
     * Called when the wallet has loaded mint keys.
     */
    public onMintKeysLoaded?: (mint: string, keysets: Map<string, MintKeys>) => void;

    constructor(ndk: NDK, event?: NDKEvent) {
        super();
        if (!ndk) throw new Error("no ndk instance");
        this.ndk = ndk;
        if (!event) {
            event = new NDKEvent(ndk);
            event.kind = NDKKind.CashuWallet;
            event.tags = [];
        }
        
        this.event = event;
        this.ndk = ndk;
        this.paymentHandler = new PaymentHandler(this);
        this.state = new WalletState(this);
    }

    set event(e: NDKEvent | undefined) {
        this._event = e;
    }

    get event(): NDKEvent | undefined {
        return this._event;
    }

    /**
     * Generates a backup of this wallet
     */
    async backup(publish = true) {
        if (!this.event) throw new Error("wallet event not available");

        const backup = new NDKCashuWalletBackup(this.ndk);
        backup.privkeys = Array.from(this.privkeys.values().map(signer => signer.privateKey!));
        backup.mints = this.mints;
        if (publish) backup.publish(this.relaySet);

        return backup;
    }

    tagId() {
        return this.event?.tagId();
    }

    public checkProofs = consolidateTokens.bind(this);
    public consolidateTokens = consolidateTokens.bind(this);

    /**
     * Generates nuts that can be used to send to someone.
     * 
     * Note that this function does not send anything, it just generates a specific amount of proofs.
     * @param amounts 
     * @returns 
     */
    async mintNuts(amounts: number[]) {
        let result: SendResponse | undefined;
        const totalAmount = amounts.reduce((acc, amount) => acc + amount, 0);
        
        for (const mint of this.mints) {
            const wallet = await this.cashuWallet(mint);
            const mintProofs = await this.state.getProofs({ mint });
             result = await wallet.send(totalAmount, mintProofs, {
                proofsWeHave: mintProofs,
                includeFees: true,
                outputAmounts: {
                    sendAmounts: amounts
                }
            });

            if (result.send.length > 0) {
                const change = { store: result?.keep ?? [], destroy: result.send, mint };
                const updateRes = await this.state.update(change);

                // create a change event
                createOutTxEvent(this.ndk, {
                    paymentDescription: "minted nuts",
                    amount: amounts.reduce((acc, amount) => acc + amount, 0),
                }, {
                    result: { proofs: result.send, mint },
                    proofsChange: change,
                    stateUpdate: updateRes,
                    mint,
                    fee: 0
                }, this.relaySet);
                this.emit("balance_updated");

                return result;
            }
        }
    }

    static async from(event: NDKEvent): Promise<NDKCashuWallet | undefined> {
        if (!event.ndk) throw new Error("no ndk instance on event");
        const wallet = new NDKCashuWallet(event.ndk, event);
        if (!wallet.event) return;
        if (wallet.isDeleted) return;

        try {
            await wallet.event.decrypt();
        } catch (e) {
        }

        try {
            const content = JSON.parse(wallet.event.content);
            for (const tag of content) {
                if (tag[0] === "mint") {
                    wallet.mints.push(tag[1]);
                } else if (tag[0] === "privkey") {
                    await wallet.addPrivkey(tag[1]);
                }
            }
        } catch (e) {
            throw e;
        }

        await wallet.getP2pk();

        return wallet;
    }

    /**
     * Starts monitoring the wallet.
     * 
     * Use `since` to start syncing state from a specific timestamp. This should be
     * used by storing at the app level a time in which we know we were able to communicate
     * with the relays, for example, by saving the time the wallet has emitted a "ready" event.
     */
    start(opts?: NDKSubscriptionOptions & { pubkey?: Hexpubkey, since?: number }) {
        const pubkey = opts?.pubkey ?? this.event?.pubkey;
        if (!pubkey) throw new Error("no pubkey");
        
        const filters: NDKFilter[] = [
            { kinds: [NDKKind.CashuToken], authors: [pubkey] },
            { kinds: [NDKKind.CashuQuote], authors: [pubkey] },
            { kinds: [NDKKind.EventDeletion], authors: [pubkey], "#k": [NDKKind.CashuToken.toString()] },
        ];

        if (opts?.since) {
            filters[0].since = opts.since;
            filters[1].since = opts.since;
        }

        opts ??= {};
        opts.subId ??= "cashu-wallet-state";

        this.sub = this.ndk.subscribe(filters, opts, this.relaySet, false);
        
        this.sub.on("event:dup", eventDupHandler.bind(this));
        this.sub.on("event", eventHandler.bind(this));
        this.sub.on("eose", () => {
            this.emit("ready");
            this.status = NDKWalletStatus.READY;
        });
        this.sub.start();
    }

    stop() {
        this.sub?.stop();
    }

    /**
     * Returns the p2pk of this wallet or generates a new one if we don't have one
     */
    async getP2pk(): Promise<string> {
        if (this._p2pk) return this._p2pk;

        if (this.privkeys.size === 0) {
            const signer = NDKPrivateKeySigner.generate();
            console.trace('generating a new p2pk', signer.privateKey);
            await this.addPrivkey(signer.privateKey!);
        }

        return this.p2pk;
    }

    /**
     * If this wallet has access to more than one privkey, this will return all of them.
     */
    get p2pks(): string[] {
        return Array.from(this.privkeys.keys());
    }

    async addPrivkey(privkey: string) {
        const signer = new NDKPrivateKeySigner(privkey);
        const user = await signer.user();
        this.privkeys.set(user.pubkey, signer);

        if (this.privkeys.size === 1) {
            this._p2pk = user.pubkey;
        }
    }

    set p2pk(pubkey: string) {
        if (this.privkeys.has(pubkey)) {
            this.signer = this.privkeys.get(pubkey);
            this.p2pk = pubkey;
        } else {
            throw new Error("privkey for "+pubkey+" not found");
        }
    }

    /**
     * Whether this wallet has been deleted
     */
    get isDeleted(): boolean {
        if (!this.event?.tags) return false;
        return this.event.tags.some((t) => t[0] === "deleted");
    }

    /** 
     * Generates the payload for a wallet event
     */
    private walletPayload(): NDKTag[] {
        const privkeys = Array.from(this.privkeys.values().map(signer => signer.privateKey!));
        
        return payloadForEvent(privkeys, this.mints);
    }

    async publish() {
        if (!this.event) throw new Error("wallet event not available");
        
        if (!this.isDeleted) {
            this.event.content = JSON.stringify(this.walletPayload());
            const user = await this.ndk!.signer!.user();
            await this.event.encrypt(user, undefined, "nip44");
        }

        return this.event.publishReplaceable(this.relaySet);
    }

    /**
     * Prepares a deposit
     * @param amount
     * @param mint
     *
     * @example
     * const wallet = new NDKCashuWallet(...);
     * const deposit = wallet.deposit(1000, "https://mint.example.com", "sats");
     * deposit.on("success", (token) => {
     *   console.log("deposit successful", token);
     * });
     * deposit.on("error", (error) => {
     *   console.log("deposit failed", error);
     * });
     *
     * // start monitoring the deposit
     * deposit.start();
     */
    public deposit(amount: number, mint?: string): NDKCashuDeposit {
        const deposit = new NDKCashuDeposit(this, amount, mint);
        deposit.on("success", (token) => {
            this.state.addToken(token);
        });
        return deposit;
    }

    /**
     * Receives a token and adds it to the wallet
     * @param token
     * @returns the token event that was created
     */
    public async receiveToken(
        token: string,
        description?: string,
    ) {
        let { mint } = getDecodedToken(token);
        const wallet = await this.cashuWallet(mint);
        const proofs = await wallet.receive(token);

        const updateRes = await this.state.update({
            store: proofs,
            mint,
        });
        const tokenEvent = updateRes.created;

        createInTxEvent(this.ndk, proofs, mint, updateRes, { description }, this.relaySet);

        return tokenEvent;
    }

    /**
     * Pay a LN invoice with this wallet
     */
    async lnPay(payment: PaymentWithOptionalZapInfo<LnPaymentInfo>, createTxEvent = true): Promise<NDKPaymentConfirmationLN | undefined> {
        return this.paymentHandler.lnPay(payment, createTxEvent);
    }

    /**
     * Swaps tokens to a specific amount, optionally locking to a p2pk.
     * 
     * This function has side effects:
     * - It swaps tokens at the mint
     * - It updates the wallet state (deletes affected tokens, might create new ones)
     * - It creates a wallet transaction event
     * 
     * This function returns the proofs that need to be sent to the recipient.
     * @param amount
     */
    async cashuPay(payment: NDKZapDetails<CashuPaymentInfo>): Promise<NDKPaymentConfirmationCashu | undefined> {
        return this.paymentHandler.cashuPay(payment);
    }

    private wallets = new Map<string, CashuWallet>();

    async cashuWallet(mint: string): Promise<CashuWallet> {
        if (this.wallets.has(mint)) return this.wallets.get(mint) as CashuWallet;

        const w = await walletForMint(mint, {
            onMintInfoNeeded: this.onMintInfoNeeded,
            onMintInfoLoaded: this.onMintInfoLoaded,
            onMintKeysNeeded: this.onMintKeysNeeded,
            onMintKeysLoaded: this.onMintKeysLoaded,
        });

        if (!w) throw new Error("unable to load wallet for mint " + mint);
        this.wallets.set(mint, w);
        return w;
    }

    async redeemNutzaps(
        cashuWallet: CashuWallet,
        nutzaps: NDKNutzap[],
        proofs: Proof[],
        mint: string,
        privkey: string
    ): Promise<number> {
        try {
            const proofsWeHave = this.state.getProofs({ mint });
            const res = await cashuWallet.receive(
                { proofs, mint },
                { proofsWeHave, privkey }
            );

            const receivedAmount = proofs.reduce((acc, proof) => acc + proof.amount, 0);
            const redeemedAmount = res.reduce((acc, proof) => acc + proof.amount, 0);
            const fee = receivedAmount - redeemedAmount;

            const updateRes = await this.state.update({
                store: res,
                mint,
            });

            createInTxEvent(this.ndk, res, mint, updateRes, { nutzaps, fee }, this.relaySet)

            return receivedAmount;
        } catch (e) {
            console.log('error redeeming nutzaps', nutzaps.map((n) => n.encode()), e);
            console.trace(e);
            throw e;
        }
    }

    async redeemNutzap(
        nutzap: NDKNutzap,
        privkey: NDKPrivateKeySigner | undefined,
        { onRedeemed }: { onRedeemed?: (res: Proof[]) => void }
    ) {
        const user = this.ndk.activeUser;

        if (!user) throw new Error("no active user");

        const isP2pk = !!nutzap.p2pk;

        privkey ??= isP2pk ? this.privkeys.get(nutzap.p2pk) : undefined;

        // if the nutzap is p2pk to the user's pubkey, check if we have the private key in memory
        if (!privkey && nutzap.p2pk === user.pubkey) {
            if (this.ndk.signer instanceof NDKPrivateKeySigner)
                privkey = this.ndk.signer;
            else {
                throw new Error("nutzap p2pk to the active user directly and we don't have access to the private key; login with your nsec to redeem this nutzap");
            }
        }
        
        if (isP2pk && !privkey) throw new Error("Nutzap is p2pk to an invalid pubkey ("+nutzap.p2pk+")");
        
        try {
            const mint = nutzap.mint;
            const proofs = nutzap.proofs;
            if (!mint) throw new Error("missing mint");

            const _wallet = await this.cashuWallet(mint);
            const proofsWeHave = this.state.getProofs({ mint });
            const res = await _wallet.receive(
                { proofs, mint },
                { proofsWeHave, privkey: privkey?.privateKey }
            );

            d("redeemed nutzap %o", nutzap.rawEvent());
            onRedeemed?.(res);

            const receivedAmount = proofs.reduce((acc, proof) => acc + proof.amount, 0);
            const redeemedAmount = res.reduce((acc, proof) => acc + proof.amount, 0);
            const fee = receivedAmount - redeemedAmount;

            const updateRes = await this.state.update({
                store: res,
                mint,
            });

            createInTxEvent(this.ndk, res, mint, updateRes, {nutzaps: [nutzap], fee}, this.relaySet);
        } catch (e) {
            console.log('error redeeming nutzap', nutzap.encode(),  e);
            console.trace(e);

            if (e instanceof Error && e.message.match(/already spent/i)) {
                return false;
            }
        }
    }

    public warn(msg: string, event?: NDKEvent, relays?: NDKRelay[]) {
        relays ??= event?.onRelays;
        this.warnings.push({ msg, event, relays });
        this.emit("warning", { msg, event, relays });
    }

    /**
     * Deletes this wallet
     */
    async delete(reason?: string, publish = true): Promise<NDKEvent> {
        if (!this.event) throw new Error("wallet event not available");
        this.event.content = "";
        this.event.tags = [["deleted"]];
        if (publish) this.event.publishReplaceable();

        const deleteEvent = await this.event.delete(reason, publish);
        return deleteEvent;
    }


    balance(): NDKWalletBalance | undefined {
        return {
            amount: this.state.getBalance({ onlyAvailable: true }),
        };
    }

    /**
     * Gets the total balance for a specific mint, including reserved proofs
     */
    public mintBalance(mint: MintUrl): number {
        return this.mintBalances[mint] || 0;
    }

    /**
     * Gets all tokens, grouped by mint with their total balances
     */
    get mintBalances(): Record<MintUrl, number> {
        return this.state.getMintsBalance({ onlyAvailable: true });
    }

    /**
     * Returns a list of mints that have enough available balance (excluding reserved proofs)
     * to cover the specified amount
     */
    getMintsWithBalance(amount: number): MintUrl[] {
        const availableBalances = this.state.getMintsBalance({ onlyAvailable: true });
        return Object.entries(availableBalances)
            .filter(([_, balance]) => balance >= amount)
            .map(([mint]) => mint);
    }
}


export class NDKCashuWalletBackup extends NDKEvent {
    public privkeys: string[] = [];
    public mints: string[] = [];
    
    constructor(ndk: NDK, event?: NDKEvent) {
        super(ndk, event);
        this.kind ??= NDKKind.CashuWalletBackup;
    }

    static async from(event: NDKEvent): Promise<NDKCashuWalletBackup | undefined> {
        if (!event.ndk) throw new Error("no ndk instance on event");
        
        const backup = new NDKCashuWalletBackup(event.ndk, event);
        
        try {
            await backup.decrypt();
            const content = JSON.parse(backup.content);
            for (const tag of content) {
                if (tag[0] === "mint") {
                    backup.mints.push(tag[1]);
                } else if (tag[0] === "privkey") {
                    backup.privkeys.push(tag[1]);
                }
            }
        } catch (e) {
            console.log('error decrypting backup event', backup.encode(), e);
            return;
        }

        return backup;
    }

    async save(relaySet?: NDKRelaySet) {
        if (!this.ndk) throw new Error("no ndk instance");
        this.content = JSON.stringify(payloadForEvent(this.privkeys, this.mints));
        await this.encrypt(this.ndk.activeUser!, undefined, "nip44");
        return this.publish(relaySet);
    }
}

function payloadForEvent(privkeys: string[], mints: string[]) {
    if (privkeys.length === 0) throw new Error("privkey not set");
    
    const payload: NDKTag[] = [
        ...mints.map((mint) => ["mint", mint]),
        ...privkeys.map((privkey) => ["privkey", privkey]),
    ];

    return payload;
}