import type { NDKEvent, NDKUser } from "@nostr-dev-kit/ndk";
import { NDKKind, NDKNutzap, NDKZap } from "@nostr-dev-kit/ndk";
import type { ProcessedZap } from "@nostr-dev-kit/svelte";
import { getZapAmount, getZapComment, getZapSender } from "@nostr-dev-kit/svelte";

/**
 * Convert NDKEvent to ProcessedZap interface
 */
export function toProcessedZap(
    event: NDKEvent,
    target: NDKEvent | NDKUser
): ProcessedZap | undefined {
    const sender = getZapSender(event);
    if (!sender) return undefined;

    const amount = getZapAmount(event);
    const comment = getZapComment(event);

    // Determine recipient
    const recipient = event instanceof NDKEvent ? event.author : target;

    const processedZap: ProcessedZap = {
        amount,
        sender,
        recipient,
        comment,
    };

    // Add typed instances based on kind
    if (event.kind === NDKKind.Zap) {
        processedZap.zap = NDKZap.from(event);
    } else if (event.kind === NDKKind.Nutzap) {
        processedZap.nutzap = NDKNutzap.from(event);
    }

    return processedZap;
}
