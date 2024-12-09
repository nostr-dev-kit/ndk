import type { Proof } from "@cashu/cashu-ts";
import { CashuMint, CashuWallet } from "@cashu/cashu-ts";
import type { NDKCashuWallet } from "./wallet";
import { EventEmitter } from "tseep";
import { NDKCashuToken } from "./token";
import createDebug from "debug";
import { NDKEvent, NDKKind, NDKTag, NostrEvent } from "@nostr-dev-kit/ndk";
import { getBolt11ExpiresAt } from "../utils/ln.js";
import { NDKWalletChange } from "./history";

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
    private mint: string;
    public amount: number;
    public quoteId: string | undefined;
    private wallet: NDKCashuWallet;
    private _wallet: CashuWallet;
    public checkTimeout: NodeJS.Timeout | undefined;
    public checkIntervalLength = 2500;
    public finalized = false;
    public unit?: string;

    constructor(wallet: NDKCashuWallet, amount: number, mint?: string, unit?: string) {
        super();
        this.wallet = wallet;
        this.mint = mint ?? randomMint(wallet);
        this.amount = amount;
        this.unit = unit;
        this._wallet = new CashuWallet(new CashuMint(this.mint), { unit });
    }

    async start() {
        const quote = await this._wallet.createMintQuote(this.amount);
        d("created quote %s for %d %s", quote.quote, this.amount, this.mint);

        this.quoteId = quote.quote;

        this.check();
        this.createQuoteEvent(quote.quote, quote.request);

        return quote.request;
    }

    /**
     * This generates a 7374 event containing the quote ID
     * with an optional expiration set to the bolt11 expiry (if there is one)
     */
    private async createQuoteEvent(quoteId: string, bolt11: string) {
        const { ndk } = this.wallet;
        const bolt11Expiry = getBolt11ExpiresAt(bolt11);
        let tags: NDKTag[] = [
            ["a", this.wallet.tagId()],
            ["mint", this.mint],
        ];

        // if we have a bolt11 expiry, expire this event at that time
        if (bolt11Expiry) tags.push(["expiration", bolt11Expiry.toString()]);

        const event = new NDKEvent(ndk, {
            kind: NDKKind.CashuQuote,
            content: quoteId,
            tags,
        } as NostrEvent);
        d("saving quote ID: %o", event.rawEvent());
        await event.encrypt(ndk.activeUser, undefined, "nip44");
        await event.sign();
        try {
            await event.publish(this.wallet.relaySet);
            d("saved quote on event %s", event.encode());
        } catch (e: any) {
            d("error saving quote on event %s", e.relayErrors);
        }
        return event;
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

        let ret: { proofs: Array<Proof> };

        try {
            d("Checking for minting status of %s", this.quoteId);
            ret = await this._wallet.mintTokens(this.amount, this.quoteId);
            if (!ret?.proofs) return;
        } catch (e: any) {
            if (e.message.match(/not paid/i)) return;
            d(e.message);
            return;
        }

        try {
            this.finalized = true;

            const tokenEvent = new NDKCashuToken(this.wallet.event.ndk);
            tokenEvent.proofs = ret.proofs;
            tokenEvent.mint = this.mint;
            tokenEvent.wallet = this.wallet;

            await tokenEvent.publish(this.wallet.relaySet);

            const historyEvent = new NDKWalletChange(this.wallet.event.ndk);
            historyEvent.direction = 'in';
            historyEvent.amount = tokenEvent.amount;
            historyEvent.unit = this.unit;
            historyEvent.createdTokens = [ tokenEvent ];
            historyEvent.description = "Deposit";
            historyEvent.mint = this.mint;
            historyEvent.publish(this.wallet.relaySet);

            this.emit("success", tokenEvent);
        } catch (e: any) {
            console.log("relayset", this.wallet.relaySet);
            this.emit("error", e.message);
            console.error(e);
        }
    }
}
