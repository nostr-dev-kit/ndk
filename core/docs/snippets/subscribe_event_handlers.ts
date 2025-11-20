import NDK, { type NDKEvent, type NDKRelay, type NDKSubscription } from "@nostr-dev-kit/ndk";

const ndk = new NDK();

ndk.subscribe(
    { kinds: [1] }, // Filters
    { closeOnEose: true }, // Options (no explicit relays specified)
    {
        // Direct handlers via autoStart parameter (now the 3rd argument)
        onEvent: (event: NDKEvent, relay?: NDKRelay) => {
            // Called for events received from relays after the initial cache load (if onEvents is used)
            console.log("Received event from relay (id):", event.id);
        },
        onEvents: (events: NDKEvent[]) => {
            // Parameter renamed to 'events'
            console.log(`Received ${events.length} events from cache initially.`);
        },
        onEose: (subscription: NDKSubscription) => {
            console.log("Subscription reached EOSE:", subscription.internalId);
        },
    },
);
