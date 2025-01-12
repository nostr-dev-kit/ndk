import type { Proof } from "@cashu/cashu-ts";
import { CashuWallet } from "@cashu/cashu-ts";
import type { NDKCashuWallet } from "./wallet/index.js";
import { EventEmitter } from "tseep";
import { NDKCashuToken } from "./token";
import createDebug from "debug";
import { NDKEvent } from "@nostr-dev-kit/ndk";
import { NDKCashuQuote } from "./quote";
import { createInTxEvent } from "./wallet/txs.js";

const d = createDebug("ndk-wallet:cashu:deposit");

function randomMint(wallet: NDKCashuWallet) {
    const mints = wallet.mints;
    const mint = mints[Math.floor(Math.random() * mints.length)];
    return mint;
}

export class NDKCashuDeposit extends EventEmitter<{
    success: (token: NDKCashuToken) => void;
    error: (error: string) => void;
}> {
    public mint: string;
    public amount: number;
    public quoteId: string | undefined;
    private wallet: NDKCashuWallet;
    private _wallet?: CashuWallet;
    public checkTimeout: NodeJS.Timeout | undefined;
    public checkIntervalLength = 2500;
    public finalized = false;
    public unit?: string;

    private quoteEvent?: NDKEvent;

    constructor(wallet: NDKCashuWallet, amount: number, mint?: string, unit?: string) {
        super();
        this.wallet = wallet;
        this.mint = mint || randomMint(wallet);
        this.amount = amount;
        this.unit = unit;
    }

    static fromQuoteEvent(wallet: NDKCashuWallet, quote: NDKCashuQuote) {
        if (!quote.amount) throw new Error("quote has no amount");
        if (!quote.mint) throw new Error("quote has no mint");

        const unit = quote.unit ?? wallet.unit;
        
        const deposit = new NDKCashuDeposit(wallet, quote.amount, quote.mint, quote.unit);

        deposit.quoteId = quote.quoteId;
        return deposit;
    }

    /**
     * Creates a quote ID and start monitoring for payment.
     * 
     * Once a payment is received, the deposit will emit a "success" event.
     * 
     * @param pollTime - time in milliseconds between checks
     * @returns 
     */
    async start(pollTime: number = 2500) {
        const cashuWallet = await this.wallet.cashuWallet(this.mint);
        const quote = await cashuWallet.createMintQuote(this.amount);
        d("created quote %s for %d %s", quote.quote, this.amount, this.mint);

        this.quoteId = quote.quote;

        // register deposit with monitor
        this.wallet.depositMonitor.addDeposit(this);

        setTimeout(this.check.bind(this, pollTime), pollTime);
        this.createQuoteEvent(quote.quote, quote.request)
            .then((event) => this.quoteEvent = event);

        return quote.request;
    }

    /**
     * This generates a 7374 event containing the quote ID
     * with an optional expiration set to the bolt11 expiry (if there is one)
     */
    private async createQuoteEvent(quoteId: string, bolt11: string) {
        const { ndk } = this.wallet;

        const quoteEvent = new NDKCashuQuote(ndk);
        quoteEvent.quoteId = quoteId;
        quoteEvent.mint = this.mint;
        quoteEvent.amount = this.amount;
        quoteEvent.unit = this.unit;
        quoteEvent.wallet = this.wallet;
        quoteEvent.invoice = bolt11;

        try {
            await quoteEvent.save();
            d("saved quote on event %s", quoteEvent.rawEvent());
        } catch (e: any) {
            d("error saving quote on event %s", e.relayErrors);
        }

        return quoteEvent;
    }

    private async runCheck() {
        if (!this.finalized) await this.finalize();
        if (!this.finalized) this.delayCheck();
    }

    private delayCheck() {
        setTimeout(() => {
            this.runCheck();
            this.checkIntervalLength += 500;
        }, this.checkIntervalLength);
    }

    /**
     * Check if the deposit has been finalized.
     * @param timeout A timeout in milliseconds to wait before giving up.
     */
    async check(timeout?: number) {
        this.runCheck();

        if (timeout) {
            setTimeout(() => {
                clearTimeout(this.checkTimeout);
            }, timeout);
        }
    }

    async finalize() {
        if (!this.quoteId) throw new Error("No quoteId set.");

        let proofs: Array<Proof>;

        try {
            d("Checking for minting status of %s", this.quoteId);
            const cashuWallet = await this.wallet.cashuWallet(this.mint);
            const proofsWeHave = await this.wallet.proofsForMint(this.mint);
            proofs = await cashuWallet.mintProofs(this.amount, this.quoteId, {
                proofsWeHave,
            });
            if (proofs.length === 0) return;
        } catch (e: any) {
            if (e.message.match(/not paid/i)) return;

            if (e.message.match(/already issued/i)) {
                d("Mint is saying the quote has already been issued, destroying quote event: %s", e.message);
                this.destroyQuoteEvent();
                this.finalized = true;
                return;
            }

            if (e.message.match(/rate limit/i)) {
                d("Mint seems to be rate limiting, lowering check interval");
                this.checkIntervalLength += 5000;
                return;
            }
            
            d(e.message);
            return;
        }

        try {
            this.finalized = true;

            const updateRes = await this.wallet.state.update({
                store: proofs,
                mint: this.mint,
            });

            const tokenEvent = updateRes.created;
            if (!tokenEvent) throw new Error("no token event created");

            createInTxEvent(this.wallet, proofs, this.wallet.unit, this.mint, updateRes, { description: "Deposit" });

            this.emit("success", tokenEvent);

            // delete the quote event if it exists
            this.destroyQuoteEvent();
        } catch (e: any) {
            console.log("relayset", this.wallet.relaySet);
            this.emit("error", e.message);
            console.error(e);
        }
    }

    private async destroyQuoteEvent() {
        if (!this.quoteEvent) return;
        const deleteEvent = await this.quoteEvent.delete(undefined, false);
        deleteEvent.publish(this.wallet.relaySet);
    }
}
