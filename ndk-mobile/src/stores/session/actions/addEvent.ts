import { NDKEvent } from '@nostr-dev-kit/ndk';
import { firstIsNewer } from '../utils.js';
import { SessionState } from '../types.js';

/**
 * This function is called when a new event is received.
 * 
 * It inspects the event to determine if the event should be added to the session.
 *   - Checks if the newest version if the event is replaceable.
 * 
 * @param event 
 * @param onAdded 
 * @param set 
 */
export const addEvent = (event: NDKEvent, onAdded, set) => {
    set((state: SessionState) => {
        const kind = event.kind!;
        const newEvents = new Map(state.events);
        let existing = newEvents.get(kind) || [];

        console.log('\tadding event', event.kind);

        if (event.isParamReplaceable()) {
            const existingEvent = existing.find((e) => e.dTag === event.dTag);
            if (existingEvent) {
                if (firstIsNewer(existingEvent, event)) {
                    return state;
                } else {
                    existing = existing.filter((e) => e.id !== existingEvent.id);
                }
            }
        } else if (event.isReplaceable()) {
            const existingEvent = existing[0];
            if (firstIsNewer(existingEvent, event)) {
                return state;
            } else {
                existing = [];
            }
        }

        newEvents.set(kind, [...existing, event]);

        const changes = onAdded?.();
        return { events: newEvents, ...changes };
    });
}; 
