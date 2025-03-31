import type NDK from "@nostr-dev-kit/ndk";
import {
    type NDKEventId,
    type NDKFilter,
    NDKNutzap,
    type NDKRelaySet,
    NDKSubscriptionCacheUsage,
} from "@nostr-dev-kit/ndk";

export async function fetchPage(
    ndk: NDK,
    filter: NDKFilter,
    _knownNutzaps: Set<NDKEventId>,
    relaySet?: NDKRelaySet
): Promise<NDKNutzap[]> {
    const events = await ndk.fetchEvents(
        filter,
        {
            cacheUsage: NDKSubscriptionCacheUsage.ONLY_RELAY,
            groupable: false,
            subId: "recent-nutzap",
        },
        relaySet
    );

    return Array.from(events)
        .map((e) => NDKNutzap.from(e))
        .filter((n) => !!n) as NDKNutzap[];
}
