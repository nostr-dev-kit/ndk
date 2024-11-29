import type { NDKEvent } from "@nostr-dev-kit/ndk";
import { NDKCashuWallet } from "../wallet";

export default function handleEventDeletion(this: NDKCashuWallet, event: NDKEvent): void {
    console.log("received event deletion", event.id, "deletes", event.getMatchingTags("e").length, "tokens");
    const deletedIds = event.getMatchingTags("e").map((tag) => tag[1]);

    for (const deletedId of deletedIds) {
        if (!this.knownTokens.has(deletedId)) {
            console.log("token not known, skipping", deletedId);
            continue;
        }

        this.removeTokenId(deletedId);
    }
}
