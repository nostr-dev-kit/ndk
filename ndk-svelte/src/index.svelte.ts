import NDK, {
    type NDKConstructorParams,
    NDKEvent,
    type NDKFilter,
    type NDKRelay,
    type NDKRelaySet,
    type NDKSubscriptionOptions,
} from "@nostr-dev-kit/ndk";
import { onDestroy } from "svelte";

type ClassWithConvertFunction<T extends NDKEvent> = {
    from: (event: NDKEvent) => T | undefined;
};

type NDKSubscribeOptions = NDKSubscriptionOptions & {
    autoStart?: boolean;
    repostsFilters?: NDKFilter[];
    unrefUnsubscribeTimeout?: number;
    relaySet?: NDKRelaySet;
    skipDeleted?: boolean;
    onEose?: () => void;
    onEvent?: (event: NDKEvent, relay?: NDKRelay) => void;
};

type Actions = {
    unsubscribe?: () => void;
};

class NDKSvelte extends NDK {
    constructor(opts?: NDKConstructorParams) {
        super(opts);
    }

    /**
     * Subscribes to NDK events and returns a reactive list of events.
     * Automatically cleans up the subscription when no longer needed.
     */
    public $subscribe = <T extends NDKEvent>(
        filters: NDKFilter[],
        opts?: NDKSubscribeOptions,
        klass?: ClassWithConvertFunction<T>
    ) => {
        // A reactive list for the events
        const eventList = $state<T[] & Actions>([]);
        const eventMap = new Map<string, T>(); // Map for deduplication

        // Process an incoming event
        const processEvent = (event: NDKEvent) => {
            let e = event;

            // Convert the event to a specific class if provided
            if (klass) {
                const convertedEvent = klass.from(event);
                if (!convertedEvent) return;
                e = convertedEvent;
                e.relay = event.relay;
            }

            const dedupKey = e.deduplicationKey();

            // Avoid duplicate or older events
            if (eventMap.has(dedupKey)) {
                const existingEvent = eventMap.get(dedupKey)!;
                if (existingEvent.created_at! >= e.created_at!) return;
            }

            eventMap.set(dedupKey, e as T);

            // Update the reactive event list inserting the event in the right position according to the created_at timestamp
            const pos = eventList.findIndex(event => event.created_at! < e.created_at!);
            eventList.splice(pos, 0, e as T);
        };

        // Create the subscription
        const subscription = this.subscribe(
            Array.isArray(filters) ? filters : [filters],
            opts,
            opts?.relaySet,
            false
        );

        // Handle incoming events
        subscription.on("event", (event, relay) => {
            processEvent(event);
            if (opts?.onEvent) opts.onEvent(event, relay);
        });

        // Handle EOSE
        subscription.on("eose", () => {
            if (opts?.onEose) opts.onEose();
        });

        subscription.start();

        // Cleanup when the component or context is destroyed
        onDestroy(() => {
            subscription.stop();
        });

        eventList.unsubscribe = () => subscription.stop();

        return eventList;
    }
}

export default NDKSvelte;
