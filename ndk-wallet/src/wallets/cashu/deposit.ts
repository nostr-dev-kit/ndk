import type { Proof } from "@cashu/cashu-ts";
import { CashuWallet } from "@cashu/cashu-ts";
import type { NDKCashuWallet } from "./wallet";
import { EventEmitter } from "tseep";
import { NDKCashuToken } from "./token";
import createDebug from "debug";
import { NDKEvent, NDKKind, NDKTag, NostrEvent } from "@nostr-dev-kit/ndk";
import { NDKWalletChange } from "./history";
import { NDKCashuQuote } from "./quote";

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
        const w = await this.wallet.walletForMint(this.mint);
        if (!w) throw new Error("unable to load wallet for mint " + this.mint);
        this._wallet = w;
        const quote = await this._wallet.createMintQuote(this.amount);
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
            if (this.checkIntervalLength > 30000) {
                this.checkIntervalLength = 30000;
            }
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
            const w = await this.wallet.walletForMint(this.mint);
            if (!w) throw new Error("unable to load wallet for mint " + this.mint);
            this._wallet = w;
            proofs = await this._wallet.mintProofs(this.amount, this.quoteId);
            if (proofs.length === 0) return;
        } catch (e: any) {
            if (e.message.match(/not paid/i)) return;
            d(e.message);
            return;
        }

        try {
            this.finalized = true;

            const tokenEvent = new NDKCashuToken(this.wallet.ndk);
            tokenEvent.proofs = proofs;
            tokenEvent.mint = this.mint;
            tokenEvent.wallet = this.wallet;

            await tokenEvent.publish(this.wallet.relaySet);

            const historyEvent = new NDKWalletChange(this.wallet.ndk);
            historyEvent.direction = 'in';
            historyEvent.amount = tokenEvent.amount;
            historyEvent.unit = this.unit;
            historyEvent.createdTokens = [ tokenEvent ];
            historyEvent.description = "Deposit";
            historyEvent.mint = this.mint;
            historyEvent.publish(this.wallet.relaySet);

            this.emit("success", tokenEvent);

            // delete the quote event if it exists
            if (this.quoteEvent) {
                console.log("destroying quote event", this.quoteEvent.id);
                const deleteEvent = await this.quoteEvent.delete(undefined, false);
                deleteEvent.publish(this.wallet.relaySet);
            }

        } catch (e: any) {
            console.log("relayset", this.wallet.relaySet);
            this.emit("error", e.message);
            console.error(e);
        }
    }
}
