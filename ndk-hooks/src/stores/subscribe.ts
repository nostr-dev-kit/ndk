import { createStore } from 'zustand/vanilla';
import type { NDKEvent, NDKSubscription } from '@nostr-dev-kit/ndk';

/**
 * Store interface for managing subscription state
 * @interface SubscribeStore
 * @property {T[]} events - Array of received events
 * @property {Map<string, T>} eventMap - Map of events by ID
 * @property {boolean} eose - End of stored events flag
 */
export interface SubscribeStore<T extends NDKEvent> {
  events: T[];
  eventMap: Map<string, T>;
  eose: boolean;
  addEvent: (event: T) => void;
  addEvents: (events: T[]) => void;
  removeEventId: (id: string) => void;
  setEose: () => void;
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
        });
      }
    };
  });
  
  return store;
};