import { createStore } from 'zustand/vanilla';
import type { NDKEvent, NDKSubscription } from '@nostr-dev-kit/ndk';

// Helper function (moved to top to avoid hoisting issues)
const setHasAnyIntersection = (set1: Set<string>, set2: Set<string>): boolean => {
  if (set1.size === 0 || set2.size === 0) return false;
  for (const item of set1) {
    if (set2.has(item)) return true;
  }
  return false;
};

/**
 * Store interface for managing subscription state
 * @interface SubscribeStore
 * @property {T[]} events - Array of received events
 * @property {Map<string, T>} eventMap - Map of events by ID
 * @property {boolean} eose - End of stored events flag
 */
export interface MuteCriteria {
  mutedPubkeys: Set<string>;
  mutedEventIds: Set<string>;
  mutedHashtags: Set<string>; // Lowercase
  mutedWordsRegex: RegExp | null;
}

export interface SubscribeStore<T extends NDKEvent> {
  events: T[];
  eventMap: Map<string, T>;
  eose: boolean;
  // isSubscribed: boolean; // Removed
  subscriptionRef: NDKSubscription | undefined; // Keep ref for potential direct access if needed? Or remove too? Let's remove for now.
  addEvent: (event: T) => void;
  addEvents: (events: T[]) => void;
  removeEventId: (id: string) => void;
  filterMutedEvents: (criteria: MuteCriteria) => void; // Updated signature
  setEose: () => void;
  // setSubscription: (sub: NDKSubscription | undefined) => void; // Removed
  reset: () => void;
}

/**
 * Creates a store to manage subscription state with optional event buffering
 * @param bufferMs - Buffer time in milliseconds, false to disable buffering
 */
export const createSubscribeStore = <T extends NDKEvent>(bufferMs: number | false = 30) => {
  const store = createStore<SubscribeStore<T>>((set, get) => {
    // Global buffer outside of the store state
    const buffer = new Map<string, T>();
    let timeout: NodeJS.Timeout | null = null;
    
    // Function to flush buffer and update state
    const flushBuffer = () => {
      const state = get();
      const newEventMap = new Map(state.eventMap);
      let hasChanges = false;
      
      // Add buffered events to the event map
      for (const [id, event] of buffer.entries()) {
        const existingEvent = newEventMap.get(id);
        
        // Only add newer events or events without existing entry
        if (!existingEvent || (existingEvent.created_at !== undefined && 
            event.created_at !== undefined && 
            event.created_at > existingEvent.created_at)) {
          newEventMap.set(id, event);
          hasChanges = true;
        }
      }
      
      // Clear buffer after processing
      buffer.clear();
      
      // Only update state if there were changes
      if (hasChanges) {
        // Create a new events array from the map values
        const newEvents = Array.from(newEventMap.values());
        
        // Update state
        set({ eventMap: newEventMap, events: newEvents });
      }
      
      timeout = null;
    };
    
    return {
      events: [],
      eventMap: new Map<string, T>(),
      eose: false,
      // isSubscribed: false, // Removed
      subscriptionRef: undefined, // Removed
      
      // Add an event to the store
      addEvent: (event) => {
        const id = event.tagId();
        
        if (bufferMs !== false) {
          // Buffering is enabled
          // Check if we already have a newer version of this event
          const existingInBuffer = buffer.get(id);
          const existingInStore = get().eventMap.get(id);
          
          if (existingInBuffer && existingInBuffer.created_at !== undefined && 
              event.created_at !== undefined && existingInBuffer.created_at >= event.created_at) {
            return; // Skip older events
          }
          
          if (existingInStore && existingInStore.created_at !== undefined && 
              event.created_at !== undefined && existingInStore.created_at >= event.created_at) {
            return; // Skip older events
          }
          
          // Add to buffer
          buffer.set(id, event);
          
          // Schedule buffer flush if not already scheduled
          if (!timeout) {
            timeout = setTimeout(flushBuffer, bufferMs);
          }
        } else {
          // Immediate update (no buffering)
          const state = get();
          const newEventMap = new Map(state.eventMap);
          const existingEvent = newEventMap.get(id);
          
          // Skip older events
          if (existingEvent && existingEvent.created_at !== undefined && 
              event.created_at !== undefined && existingEvent.created_at >= event.created_at) {
            return;
          }
          
          // Update map with new event
          newEventMap.set(id, event);
          
          // Create new events array
          const newEvents = Array.from(newEventMap.values());
          
          // Update state
          set({ eventMap: newEventMap, events: newEvents });
        }
      },
      
      // Add multiple events to the store efficiently
      addEvents: (events) => {
        if (!events || events.length === 0) return;
        
        if (bufferMs !== false) {
          // Buffering is enabled - add all valid events to buffer
          let needsFlush = false;
          
          for (const event of events) {
            if (!event) continue;
            
            const id = event.tagId();
            const existingInBuffer = buffer.get(id);
            const existingInStore = get().eventMap.get(id);
            
            // Skip older events
            if (existingInBuffer && existingInBuffer.created_at !== undefined && 
                event.created_at !== undefined && existingInBuffer.created_at >= event.created_at) {
              continue;
            }
            
            if (existingInStore && existingInStore.created_at !== undefined && 
                event.created_at !== undefined && existingInStore.created_at >= event.created_at) {
              continue;
            }
            
            // Add to buffer
            buffer.set(id, event);
            needsFlush = true;
          }
          
          // Schedule buffer flush if needed and not already scheduled
          if (needsFlush && !timeout) {
            timeout = setTimeout(flushBuffer, bufferMs);
          }
        } else {
          // Immediate update (no buffering)
          const state = get();
          const newEventMap = new Map(state.eventMap);
          
          // Process all events at once
          let hasUpdates = false;
          
          for (const event of events) {
            if (!event) continue;
            
            const id = event.tagId();
            const existingEvent = newEventMap.get(id);
            
            // Skip older events
            if (existingEvent && existingEvent.created_at !== undefined && 
                event.created_at !== undefined && existingEvent.created_at >= event.created_at) {
              continue;
            }
            
            // Update map with new event
            newEventMap.set(id, event);
            hasUpdates = true;
          }
          
          // Only update state if there were actual changes
          if (hasUpdates) {
            const newEvents = Array.from(newEventMap.values());
            set({ eventMap: newEventMap, events: newEvents });
          }
        }
      },
      
      // Remove an event by ID
      removeEventId: (id) => {
        const state = get();
        const newEventMap = new Map(state.eventMap);
        newEventMap.delete(id);
        const newEvents = Array.from(newEventMap.values());
        set({ eventMap: newEventMap, events: newEvents });
      },
      
      /**
       * Filters the *existing* events in the store based on comprehensive mute criteria.
       * @param criteria - An object containing sets of muted pubkeys, event IDs, hashtags (lowercase), and a regex for muted words.
       */
      filterMutedEvents: (criteria: MuteCriteria) => {
        const { mutedPubkeys, mutedEventIds, mutedHashtags, mutedWordsRegex } = criteria;
    
        // Optimization: If all criteria are empty, no filtering is needed.
        if (
          mutedPubkeys.size === 0 &&
          mutedEventIds.size === 0 &&
          mutedHashtags.size === 0 &&
          !mutedWordsRegex
        ) {
          return;
        }
    
        const state = get();
        const currentEventMap = state.eventMap;
        const newEventMap = new Map<string, T>();
        let changed = false;
    
        for (const [id, event] of currentEventMap.entries()) {
          // Check against all mute criteria
          const tags = new Set(event.getMatchingTags("t").map((tag) => tag[1].toLowerCase()));
          const taggedEvents = new Set(event.getMatchingTags("e").map((tag) => tag[1]));
          taggedEvents.add(event.id); // Include the event's own ID
    
          const isMuted =
            mutedPubkeys.has(event.pubkey) ||
            setHasAnyIntersection(mutedEventIds, taggedEvents) ||
            setHasAnyIntersection(mutedHashtags, tags) ||
            (mutedWordsRegex && event.content && event.content.match(mutedWordsRegex));
    
          if (!isMuted) {
            newEventMap.set(id, event);
          } else {
            changed = true; // Mark as changed if an event was removed
          }
        }
    
        // Only update state if events were actually removed
        if (changed) {
          const newEvents = Array.from(newEventMap.values());
          set({ eventMap: newEventMap, events: newEvents });
        }
      },
      
      // Set EOSE flag and flush buffer
      setEose: () => {
        // Ensure buffer is flushed immediately
        if (timeout) {
          clearTimeout(timeout);
          timeout = null;
          flushBuffer();
        }
        
        // Update EOSE flag
        set({ eose: true });
        
        // Adjust buffer time for faster updates after EOSE
        if (bufferMs !== false) {
          bufferMs = 16;
        }
      },
      
      // setSubscription removed
    
      // Reset store to initial state
      reset: () => {
        // Clear buffer and any pending flush
        buffer.clear();
        if (timeout) {
          clearTimeout(timeout);
          timeout = null;
        }
    
        // Reset state
        set({
          events: [],
          eventMap: new Map<string, T>(),
          eose: false,
          // isSubscribed: false, // Removed reset
          subscriptionRef: undefined, // Removed reset
        });
      },
    };
  });
  
  return store;
};