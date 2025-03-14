import NDK, { NostrEvent } from "@nostr-dev-kit/ndk";

import { NDKKind } from "@nostr-dev-kit/ndk";

import { NDKEvent } from "@nostr-dev-kit/ndk";
import { NDKCashuWallet } from "./wallet/index.js";
import { getBolt11ExpiresAt } from "../../utils/ln";

export class NDKCashuQuote extends NDKEvent {
    public quoteId: string | undefined;
    public mint: string | undefined;
    public amount: number | undefined;
    public unit: string | undefined;

    private _wallet: NDKCashuWallet | undefined;

    static kind = NDKKind.CashuQuote;

    constructor(ndk?: NDK, event?: NostrEvent | NDKEvent) {
        super(ndk, event);
        this.kind ??= NDKKind.CashuQuote;
    }

    static async from(event: NDKEvent): Promise<NDKCashuQuote | undefined> {
        const quote = new NDKCashuQuote(event.ndk, event);
        const original = event;

        try {
            await quote.decrypt();
        } catch {
            quote.content = original.content;
        }

        try {
            const content = JSON.parse(quote.content);
            quote.quoteId = content.quoteId;
            quote.mint = content.mint;
            quote.amount = content.amount;
            quote.unit = content.unit;
        } catch (e) {
            return;
        }

        return quote;
    }

    set wallet(wallet: NDKCashuWallet) {
        this._wallet = wallet;
    }

    set invoice(invoice: string) {
        const bolt11Expiry = getBolt11ExpiresAt(invoice);

        // if we have a bolt11 expiry, expire this event at that time
        if (bolt11Expiry) this.tags.push(["expiration", bolt11Expiry.toString()]);
    }

    async save() {
        if (!this.ndk) throw new Error("NDK is required");

        this.content = JSON.stringify({
            quoteId: this.quoteId,
            mint: this.mint,
            amount: this.amount,
            unit: this.unit,
        });

        await this.encrypt(this.ndk.activeUser, undefined, "nip44");
        await this.sign();
        await this.publish(this._wallet?.relaySet);
    }
}
