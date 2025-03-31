import {
  type NDKEvent,
  type NDKFilter,
  NDKRelaySet,
  type NDKSubscriptionOptions,
} from '@nostr-dev-kit/ndk';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useStore } from 'zustand';
import { createSubscribeStore } from '../stores/subscribe';
import { useNDK } from './ndk';

/**
 * Extends NDKEvent with a 'from' method to wrap events with a kind-specific handler
 */
export type NDKEventWithFrom<T extends NDKEvent> = T & { from: (event: NDKEvent) => T };
export type NDKEventWithAsyncFrom<T extends NDKEvent> = T & {
  from: (event: NDKEvent) => Promise<T>;
};

export type UseSubscribeOptions = NDKSubscriptionOptions & {
  /**
   * Whether to wrap the event with the kind-specific class when possible
   */
  wrap?: boolean;

  /**
   * Whether to include deleted events
   */
  includeDeleted?: boolean;

  /**
   * Buffer time in ms, false to disable buffering
   */
  bufferMs?: number | false;

  /**
   * Optional relay URLs to connect to
   */
  relays?: string[];
};

/**
 * React hook for subscribing to Nostr events
 * @param filters - Filters to run or false to avoid running the subscription. Note that when setting the filters to false, changing the filters prop
 *                  to have a different value will run the subscription, but changing the filters won't.
 * @param opts - UseSubscribeOptions
 * @param dependencies - any[] - dependencies to re-run the subscription when they change
 * @returns {Object} Subscription state
 * @returns {T[]} events - Array of received events
 * @returns {boolean} eose - End of stored events flag
 * @returns {boolean} isSubscribed - Subscription status
 */
export const useSubscribe = <T extends NDKEvent>(
  filters: NDKFilter[] | false,
  opts: UseSubscribeOptions = {},
  dependencies: any[] = []
) => {
  // Use stable reference for filters to avoid unnecessary re-renders
  const filtersRef = useRef(filters);
  filtersRef.current = filters;
  
  // Create a stable deps array to avoid re-creating the store on each render
  const stableDeps = useMemo(() => [...dependencies, !!filters], [JSON.stringify(dependencies), !!filters]);
  
  const { ndk } = useNDK();
  const store = useMemo(() => createSubscribeStore<T>(opts?.bufferMs), []);
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
  const isSubscribing = useRef(false);

  const relaySet = useMemo(() => {
    if (ndk && opts.relays && opts.relays.length > 0) {
      return NDKRelaySet.fromRelayUrls(opts.relays, ndk);
    }
    return undefined;
  }, [ndk, opts.relays ? opts.relays.join(',') : '']);

  const handleEvent = useCallback(
    (event: NDKEvent) => {
      const id = event.tagId();

      if (
        opts?.includeDeleted !== true &&
        event.isParamReplaceable() &&
        event.hasTag("deleted")
      ) {
        // We mark the event but we don't add the actual event, since
        // it has been deleted
        eventIds.current.set(id, event.created_at!);
        return;
      }

      event.once("deleted", () => {
        storeInstance.removeEventId(id);
      });

      storeInstance.addEvent(event as T);
      eventIds.current.set(id, event.created_at!);
    },
    [storeInstance, opts?.includeDeleted]
  );

  const handleEose = useCallback(() => {
    storeInstance.setEose();
  }, [storeInstance]);

  const handleClosed = useCallback(() => {
    storeInstance.setSubscription(undefined);
  }, [storeInstance]);

  // Use a ref to track whether we need to perform cleanup
  const hasSubscription = useRef(false);

  useEffect(() => {
    // Don't subscribe if no valid filters or NDK
    if (!filtersRef.current || (Array.isArray(filtersRef.current) && filtersRef.current.length === 0) || !ndk) {
      return;
    }

    // Prevent concurrent subscriptions
    if (isSubscribing.current) return;
    isSubscribing.current = true;

    // Clean up any existing subscription
    if (storeInstance.subscriptionRef) {
      storeInstance.subscriptionRef.stop();
      storeInstance.setSubscription(undefined);
      storeInstance.reset();
    }

    // Create and set up new subscription
    const subscription = ndk.subscribe(filtersRef.current, opts, relaySet, false);
    subscription.on("event", handleEvent);
    subscription.on("eose", handleEose);
    subscription.on("closed", handleClosed);

    storeInstance.setSubscription(subscription);
    hasSubscription.current = true;
    // Start the subscription and handle any initial events
    const cachedEvents = subscription.start(false);
    if (Array.isArray(cachedEvents) && cachedEvents.length > 0) {
      // Use addEvents for batch processing of cached events
      storeInstance.addEvents(cachedEvents as T[]);
      
      // Update eventIds for all cached events
      for (const event of cachedEvents) {
        const id = event.tagId();
        eventIds.current.set(id, event.created_at!);
        
        // Set up deletion listener for each event
        event.once("deleted", () => {
          storeInstance.removeEventId(id);
        });
      }
    }
    
    isSubscribing.current = false;

    return () => {
      if (hasSubscription.current && storeInstance.subscriptionRef) {
        storeInstance.subscriptionRef.stop();
        storeInstance.setSubscription(undefined);
      }
      eventIds.current.clear();
      storeInstance.reset();
      hasSubscription.current = false;
    };
  }, [ndk, ...stableDeps, relaySet, handleEvent, handleEose, handleClosed]);

  return {
    events: storeInstance.events,
    eose: storeInstance.eose,
    isSubscribed: storeInstance.isSubscribed,
    subscription: storeInstance.subscriptionRef,
  };
};

/**
 * Utility function to check if two sets have any intersection
 * @param set1 First set
 * @param set2 Second set
 * @returns boolean True if sets have any intersection
 */
export const setHasAnyIntersection = (set1: Set<string>, set2: Set<string>) => {
  for (const item of set1) {
    if (set2.has(item)) return true;
  }
  return false;
};