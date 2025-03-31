import NDK, { type NDKEvent } from "@nostr-dev-kit/ndk";
import { NDKCashuDeposit } from "../deposit";
import { NDKCashuQuote } from "../quote";
import type { NDKCashuWallet } from "../wallet";

export async function handleQuote(this: NDKCashuWallet, event: NDKEvent) {
    const quote = await NDKCashuQuote.from(event);
    if (!quote) return;

    const deposit = NDKCashuDeposit.fromQuoteEvent(this, quote);
    if (this.depositMonitor.addDeposit(deposit)) {
        deposit.finalize();
    }
}
