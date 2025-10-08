import NDK, { type NDKEvent } from "@nostr-dev-kit/ndk";
import { NDKCashuDeposit } from "../deposit";
import { NDKCashuQuote } from "../quote";
import type { NDKCashuWallet } from "../wallet";

export async function handleQuote(this: NDKCashuWallet, event: NDKEvent) {
    const quote = await NDKCashuQuote.from(event);
    if (!quote) return;

    // Only auto-check deposits from the past 1 hour
    const oneHourAgo = Date.now() / 1000 - 3600;
    if (event.created_at && event.created_at < oneHourAgo) {
        return;
    }

    const deposit = NDKCashuDeposit.fromQuoteEvent(this, quote);
    if (this.depositMonitor.addDeposit(deposit)) {
        deposit.finalize();
    }
}
