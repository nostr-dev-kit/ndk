import type { NDKEvent } from "@nostr-dev-kit/ndk";
import { NDKCashuWallet } from "../wallet";

export async function handleEventDeletion(this: NDKCashuWallet, event: NDKEvent): Promise<void> {
    const deletedIds = event.getMatchingTags("e").map((tag) => tag[1]);

    for (const deletedId of deletedIds) {
        this.state.removeTokenId(deletedId);
    }
}
