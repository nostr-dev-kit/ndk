import type { NDKEvent } from "@nostr-dev-kit/ndk";
import { NDKCashuWallet } from "../wallet";

export default function handleEventDeletion(this: NDKCashuWallet, event: NDKEvent): void {
    const deletedIds = event.getMatchingTags("e").map((tag) => tag[1]);

    for (const deletedId of deletedIds) {
        if (!this.knownTokens.has(deletedId)) {
            continue;
        }

        this.removeTokenId(deletedId);
    }
}
