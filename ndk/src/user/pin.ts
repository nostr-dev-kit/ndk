import { NDKUser } from ".";
import { NDKEvent, NostrEvent } from "../events";
import { NDKKind } from "../events/kinds";
import NDKList from "../events/kinds/lists";
import { NDKSubscriptionCacheUsage } from "../subscription";

export async function pin(
    this: NDKUser,
    event: NDKEvent,
    pinEvent?: NDKEvent,
    publish?: boolean
): Promise<NDKEvent> {
    const kind = NDKKind.PinList;
    if (!this.ndk) throw new Error("No NDK instance found");

    this.ndk.assertSigner();

    // If no pin event is provided, fetch the most recent pin event
    if (!pinEvent) {
        const events: Set<NDKEvent> = await this.ndk.fetchEvents(
            { kinds: [kind], authors: [this.pubkey] },
            { cacheUsage: NDKSubscriptionCacheUsage.ONLY_RELAY }
        );

        if (events.size > 0) {
            pinEvent = NDKList.from(Array.from(events)[0]);
        } else {
            pinEvent = new NDKEvent(this.ndk, {
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
