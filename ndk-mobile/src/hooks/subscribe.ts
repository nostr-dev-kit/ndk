import '@bacons/text-decoder/install';
import { createStore } from 'zustand/vanilla';
import { NDKEvent, NDKFilter, NDKRelaySet, NDKSubscription, NDKSubscriptionOptions } from '@nostr-dev-kit/ndk';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useNDK } from './ndk';
import { useStore } from 'zustand';

export type NDKEventWithFrom<T extends NDKEvent> = T & { from: (event: NDKEvent) => T };

interface UseSubscribeParams {
    filters: NDKFilter[] | null;
    opts?: NDKSubscriptionOptions & {
        klass?: NDKEventWithFrom<any>;
        includeDeleted?: boolean;
    };
    relays?: string[];
}

interface SubscribeStore<T> {
    events: T[];
    eventMap: Map<string, T>;
    eose: boolean;
    isSubscribed: boolean;
    addEvent: (event: T) => void;
    setEose: () => void;
    clearEvents: () => void;
    setSubscription: (sub: NDKSubscription | undefined) => void;
    subscriptionRef: NDKSubscription | undefined;
}

const createSubscribeStore = <T extends NDKEvent>() =>
    createStore<SubscribeStore<T>>((set) => ({
        events: [],
        eventMap: new Map(),
        eose: false,
        isSubscribed: false,
        subscriptionRef: undefined,
        addEvent: (event) =>
            set((state) => {
                const { eventMap } = state;
                eventMap.set(event.tagId(), event);
                const events = Array.from(eventMap.values());
                return { eventMap, events };
            }),
        setEose: () => set({ eose: true }),
        clearEvents: () => set({ eventMap: new Map(), eose: false }),
        setSubscription: (sub) => set({ subscriptionRef: sub, isSubscribed: !!sub }),
    }));

export const useSubscribe = <T extends NDKEvent>({ filters, opts = undefined, relays = undefined }: UseSubscribeParams) => {
    const { ndk } = useNDK();
    const store = useMemo(() => createSubscribeStore<T>(), []);
    const storeInstance = useStore(store);

    /**
     * Map of eventIds that have been received by this subscription.
     *
     * Key: event identifier (event.dTag or event.id)
     *
     * Value: timestamp of the event, used to choose the
     * most recent event on replaceable events
     */
    const eventIds = useRef<Map<string, number>>(new Map());

    const relaySet = useMemo(() => {
        if (ndk && relays && relays.length > 0) {
            return NDKRelaySet.fromRelayUrls(relays, ndk);
        }
        return undefined;
    }, [ndk, relays]);

    const shouldAcceptEvent = (event: NDKEvent) => {
        const id = event.tagId();
        const currentVal = eventIds.current.get(id);

        // We have not seen this ID yet
        if (!currentVal) return true;

        // The ID we have seen is older
        if (currentVal < event.created_at!) return true;

        return false;
    };

    const handleEvent = useCallback(
        (event: NDKEvent) => {
            const id = event.tagId();

            if (!shouldAcceptEvent(event)) return;

            if (opts?.includeDeleted !== true && event.isParamReplaceable() && event.hasTag('deleted')) {
                // We mark the event but we don't add the actual event, since
                // it has been deleted
                eventIds.current.set(id, event.created_at!);

                return;
            }

            // If we need to convert the event, we do so
            if (opts?.klass) event = opts.klass.from(event);

            // If conversion failed, we bail
            if (!event) return;

            storeInstance.addEvent(event as T);
            eventIds.current.set(id, event.created_at!);
        },
        [opts?.klass]
    );

    const handleEose = () => {
        storeInstance.setEose();
    };

    const handleClosed = () => {
        storeInstance.setSubscription(undefined);
    };

    useEffect(() => {
        if (!filters || filters.length === 0 || !ndk) return;

        if (storeInstance.subscriptionRef) {
            storeInstance.subscriptionRef.stop();
            storeInstance.setSubscription(undefined);
        }

        const subscription = ndk.subscribe(filters, opts, relaySet, false);
        subscription.on('event', handleEvent);
        subscription.on('eose', handleEose);
        subscription.on('closed', handleClosed);

        storeInstance.setSubscription(subscription);
        subscription.start();

        return () => {
            if (storeInstance.subscriptionRef) {
                storeInstance.subscriptionRef.stop();
                storeInstance.setSubscription(undefined);
            }
            eventIds.current.clear();
            storeInstance.clearEvents();
        };
    }, [filters, opts, relaySet, ndk]);

    return {
        events: storeInstance.events,
        eose: storeInstance.eose,
        isSubscribed: storeInstance.isSubscribed,
    };
};
