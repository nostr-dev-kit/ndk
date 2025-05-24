import type { NDKEvent, NDKFilter, NDKSubscription } from "@nostr-dev-kit/ndk";
import { useEffect, useRef } from "react";
import { useStore } from "zustand";
import { useNDK } from "../../ndk/hooks";
import { createSubscribeStore } from "../store";
import { useMuteFilter } from "../../mutes/hooks/use-mute-filter";
import { UseSubscribeOptions } from ".";

/**
 * React hook for subscribing to Nostr events
 * @param filters - Filters to run or false to avoid running the subscription. Note that when setting the filters to false, changing the filters prop
 *                  to have a different value will run the subscription, but changing the filters won't.
 * @param opts - UseSubscribeOptions
 * @param dependencies - unknown[] - dependencies to re-run the subscription when they change
 * @returns {UseSubscribeResult<T>} Subscription state including events, eose flag, subscription, and store reference
 */
export function useSubscribe<T extends NDKEvent, R = T[]>(
    filters: NDKFilter[] | false,
    opts: UseSubscribeOptions = {},
    dependencies: unknown[] = [],
): { events: T[]; eose: boolean } {
    const { ndk } = useNDK();

    const muteFilter = useMuteFilter();

    const storeRef = useRef<ReturnType<typeof createSubscribeStore<T>> | null>(null);
    if (!storeRef.current) {
        storeRef.current = createSubscribeStore<T>(opts.bufferMs);
    }
    const store = storeRef.current;

    const subRef = useRef<NDKSubscription | null>(null);

    // biome-ignore lint/correctness/useExhaustiveDependencies: <we only one to depend on the explicit dependencies>
    useEffect(() => {
        if (!ndk || !filters) return;

        if (subRef.current) {
            subRef.current.stop();
            subRef.current = null;
        }

        const state = store.getState();
        state.filterExistingEvents(filters);

        const setupSubscription = () => {
            const currentFilters = filters;
            const handleEvent = (event: NDKEvent) => {
                if (!opts.includeDeleted && event.hasTag("deleted")) {
                    return;
                }

                if (!opts.includeMuted && muteFilter(event)) {
                    return;
                }

                event.once("deleted", () => {
                    const state = store.getState();
                    state.removeEventId(event.tagId());
                });

                const state = store.getState();
                state.addEvent(event as T);
            };

            const handleCachedEvents = (events: NDKEvent[]) => {
                if (events && events.length > 0) {
                    const validEvents = events.filter((e: NDKEvent) => {
                        if (!opts.includeDeleted && e.hasTag("deleted")) return false;
                        if (!opts.includeMuted && muteFilter(e)) return false;
                        return true;
                    });

                    if (validEvents.length > 0) {
                        const state = store.getState();
                        state.addEvents(validEvents as T[]);

                        for (const evt of validEvents) {
                            evt.once("deleted", () => {
                                const state = store.getState();
                                state.removeEventId(evt.tagId());
                            });
                        }
                    }
                }
            };

            const handleEose = () => {
                const state = store.getState();
                state.setEose();
            };

            const sub = ndk.subscribe(currentFilters, opts, {
                onEvent: handleEvent,
                onEvents: handleCachedEvents,
                onEose: handleEose,
            });
            subRef.current = sub;
        };

        setupSubscription();

        return () => {
            if (subRef.current) {
                subRef.current.stop();
                subRef.current = null;
            }
        };
    }, [ndk, muteFilter, !!filters, ...dependencies]);

    useEffect(() => {
        if (!opts.includeMuted) {
            const state = store.getState();
            state.filterMutedEvents(muteFilter);
        }
    }, [muteFilter, store, opts.includeMuted]);

    const events = useStore(store, (s) => s.events);
    const eose = useStore(store, (s) => s.eose);

    return { events, eose };
}
