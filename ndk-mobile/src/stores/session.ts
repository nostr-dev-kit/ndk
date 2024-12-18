import { create } from 'zustand'
import { NDKEvent, NDKKind, Hexpubkey, NDKList } from '@nostr-dev-kit/ndk'

interface SessionState {
    follows: string[] | undefined
    muteListEvent: NDKEvent | undefined
    muteList: Set<Hexpubkey>
    events: Map<NDKKind, NDKEvent[]>

    setFollows: (follows: string[]) => void
    setMuteList: (muteList: NDKEvent) => void
    setEvents: (kind: NDKKind, events: NDKEvent[]) => void
    mutePubkey: (pubkey: Hexpubkey) => void

    addEvent: (kind: NDKKind, event: NDKEvent) => void
}

export const useSessionStore = create<SessionState>((set) => ({
    follows: undefined,

    muteList: new Set(),
    muteListEvent: undefined,
    mutePubkey: (pubkey: Hexpubkey) => set((state) => {
        state.muteList.add(pubkey);
        console.log('muting user', pubkey);
        if (state.muteListEvent) {
            console.log('publishing mute list event');
            state.muteListEvent.tags.push(['p', pubkey]);
            state.muteListEvent.publishReplaceable();
        } else {
            console.log('no mute list event, creating one');
        }
        return state;
    }),

    events: new Map(),
    setFollows: (follows) => set({ follows }),
    setMuteList: (muteList: NDKEvent) => {
        set((state) => {
            console.log('setting mute list', muteList.created_at, state.muteListEvent?.created_at);
            if (state.muteListEvent && state.muteListEvent.created_at >= muteList.created_at) {
                return state
            }
            
            const pubkeys = new Set(muteList.tags.filter((tag) => tag[0] === 'p' && !!tag[1]).map((tag) => tag[1]));
            console.log('have a mute list of ', pubkeys.size, 'users');
            return { muteList: pubkeys, muteListEvent: NDKList.from(muteList) }
        })
    },
    setEvents: (kind, events) => set((state) => {
        const newEvents = new Map(state.events)
        newEvents.set(kind, events)
        return { events: newEvents }
    }),
    addEvent: (kind, event) => set((state) => {
        const newEvents = new Map(state.events)
        let existing = newEvents.get(kind) || []

        // safety check for replaceable events
        if (event.isReplaceable()) {
            const existingEvent = existing.find((e) => e.dTag === event.dTag)
            if (existingEvent) {
                if (existingEvent.created_at >= event.created_at) {
                    return state
                } else {
                    // remove the existing event
                    existing = existing.filter((e) => e.id !== existingEvent.id)
                }
            }
        }
        
        newEvents.set(kind, [...existing, event])
        return { events: newEvents }
    })
}))
