import type { NDKUser } from "./index.js";
import { NDKEvent, type NostrEvent } from "../events/index.js";
import { NDKKind } from "../events/kinds/index.js";
import NDKList from "../events/kinds/lists/index.js";
import { NDKSubscriptionCacheUsage } from "../subscription/index.js";

/**
 * Pins an event
 */
export async function pinEvent(
    user: NDKUser,
    event: NDKEvent,
    pinEvent?: NDKEvent,
    publish?: boolean
): Promise<NDKEvent> {
    const kind = NDKKind.PinList;
    if (!user.ndk) throw new Error("No NDK instance found");

    user.ndk.assertSigner();

    // If no pin event is provided, fetch the most recent pin event
    if (!pinEvent) {
        const events: Set<NDKEvent> = await user.ndk.fetchEvents(
            { kinds: [kind], authors: [user.pubkey] },
            { cacheUsage: NDKSubscriptionCacheUsage.ONLY_RELAY }
        );

        if (events.size > 0) {
            pinEvent = NDKList.from(Array.from(events)[0]);
        } else {
            pinEvent = new NDKEvent(user.ndk, {
                kind: kind,
            } as NostrEvent);
        }
    }

    pinEvent.tag(event);

    if (publish) {
        await pinEvent.publish();
    }

    return pinEvent;
}
