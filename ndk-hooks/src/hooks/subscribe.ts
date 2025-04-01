import {
  type NDKEvent,
  type NDKFilter,
  NDKRelaySet,
  NDKSubscription,
  type NDKSubscriptionOptions,
} from '@nostr-dev-kit/ndk';
import { useEffect, useMemo, useRef } from 'react';
import { useStore } from 'zustand';
import { useShallow } from 'zustand/shallow';
import { createSubscribeStore, type SubscribeStore } from '../stores/subscribe';
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
 */
export function useSubscribe<T extends NDKEvent>(
  filters: NDKFilter[] | false,
  opts: UseSubscribeOptions = {},
  dependencies: any[] = []
) {
  const { ndk } = useNDK();
  
  // Ensure store instance is stable across renders, even with Fast Refresh
  const storeRef = useRef<ReturnType<typeof createSubscribeStore<T>> | null>(null);
  if (!storeRef.current) {
      // Pass bufferMs directly, assuming opts stability is handled by useEffect deps
      storeRef.current = createSubscribeStore<T>(opts.bufferMs);
  }
  const store = storeRef.current;

  // Reference to subscription - doesn't trigger re-renders when changed
  const subRef = useRef<NDKSubscription | null>(null);

  // Setup subscription only when NDK or deps change
  useEffect(() => {
    // Skip if no NDK or no filters
    if (!ndk || !filters || (Array.isArray(filters) && filters.length === 0)) return;
    
    // Clean up previous subscription
    if (subRef.current) {
      subRef.current.stop();
      subRef.current = null;
    }
        
    // Helper function to set up event handlers and start subscription
    const setupSubscription = () => {
      // Create relay set if needed
      let relaySet: NDKRelaySet | undefined;
      if (opts?.relays && opts?.relays.length > 0) {
        relaySet = NDKRelaySet.fromRelayUrls(opts?.relays, ndk);
      }
      
      // Create subscription - we know filters is not false here
      // because of the check above, but we need to tell TypeScript
      const currentFilters = filters as NDKFilter[];
      const sub = ndk.subscribe(currentFilters, opts, relaySet, false);
      subRef.current = sub;
      
      // Set up event handler that respects deleted flag
      sub.on('event', (event: NDKEvent) => {
        // Skip deleted events if includeDeleted is false
        if (!opts.includeDeleted && event.hasTag('deleted')) {
          return;
        }
        
        // Set up deleted event handler
        event.once('deleted', () => {
          const state = store.getState();
          state.removeEventId(event.tagId());
        });
        
        // Add event to store
        const state = store.getState();
        state.addEvent(event as T);
      });
      
      // Handle end of stored events
      sub.on('eose', () => {
        const state = store.getState();
        state.setEose();
      });
      
      // Start subscription and handle cached events
      const cached = sub.start(false);
      
      // Process any cached events
      if (cached && cached.length > 0) {
        // Filter out deleted events if needed
        const validEvents = opts.includeDeleted 
          ? cached 
          : cached.filter((e: NDKEvent) => !e.hasTag('deleted'));
        
        if (validEvents.length > 0) {
          // Add all valid events at once
          const state = store.getState();
          state.addEvents(validEvents as T[]);
          
          // Set up deleted handlers for each event
          for (const evt of validEvents) {
            evt.once('deleted', () => {
              const state = store.getState();
              state.removeEventId(evt.tagId());
            });
          }
        }
      }
    };
    
    // Set up subscription
    setupSubscription();
    
    // Cleanup function
    return () => {
      if (subRef.current) {
        subRef.current.stop();
        subRef.current = null;
      }
    };
  }, [ndk, ...dependencies]);

  // Extract store state in a way that doesn't cause unnecessary re-renders
  const events = useStore(store, (state) => state.events);
  const eose = useStore(store, (state) => state.eose);

  return {
    events,
    eose,
  };
}


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