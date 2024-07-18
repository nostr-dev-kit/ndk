import NDK, { NDKEvent } from "@nostr-dev-kit/ndk";
import NDKWalletLifecycle from ".";

export default function handleEventDeletion(
    this: NDKWalletLifecycle,
    event: NDKEvent
): void {
    const deletedIds = event.getMatchingTags("e").map(tag => tag[1]);
    
    for (const deletedId of deletedIds) {
        if (!this.knownTokens.has(deletedId)) continue;

        this.wallets.forEach(wallet => {
            wallet.removeTokenId(deletedId);
        });
    }
}