import NDK, { NDKEvent } from "@nostr-dev-kit/ndk";
import { NDKCashuWallet } from "../wallet";
import { NDKCashuQuote } from "../quote";
import { NDKCashuDeposit } from "../deposit";

export async function handleQuote(this: NDKCashuWallet, event: NDKEvent) {
    const quote = await NDKCashuQuote.from(event);
    if (!quote) return;

    const deposit = NDKCashuDeposit.fromQuoteEvent(this, quote);
    if (this.depositMonitor.addDeposit(deposit)) {
        deposit.finalize();
    }
}
