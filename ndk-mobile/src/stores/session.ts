import { create } from 'zustand'
import { NDKEvent, NDKKind, Hexpubkey, NDKList } from '@nostr-dev-kit/ndk'
import { NDKCashuWallet } from '@nostr-dev-kit/ndk-wallet'

interface SessionState {
    follows: string[] | undefined
    muteListEvent: NDKEvent | undefined
    muteList: Set<Hexpubkey>
    events: Map<NDKKind, NDKEvent[]>

    activeCashuWallet: NDKCashuWallet | undefined
    cashuWalletEvents: Record<string, NDKEvent>
    cashuWallets: NDKCashuWallet[] | undefined
    cashuMintListEvent: NDKEvent | undefined
    
    setFollows: (follows: string[]) => void
    setMuteList: (muteList: NDKEvent) => void
    setEvents: (kind: NDKKind, events: NDKEvent[]) => void
    mutePubkey: (pubkey: Hexpubkey) => void

    addCashuEvent: (event: NDKEvent) => void

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

    activeCashuWallet: undefined,
    cashuWalletEvents: {},
    cashuWallets: [],
    cashuMintListEvent: undefined,
    
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

    addCashuEvent: (event: NDKEvent) => set((state) => {
        return state;
        // if (event.kind === NDKKind.CashuWallet) {
        //     const isKnown
            
        //     if (state.cashuWallets && state.cashuWallets.find((wallet) => wallet.walletId === event.dTag)) {
        //         return state
        //     }
            
        //     return { cashuWallets: [...(state.cashuWallets || []), event] }
        // } else if (event.kind === NDKKind.CashuMintList) {
        //     if (state.cashuMintListEvent && state.cashuMintListEvent.created_at >= event.created_at) {
        //         return state
        //     }
            
        //     return { cashuMintListEvent: event }
        // }
    }),

    setActiveCashuWallet: (wallet: NDKCashuWallet) => set({ activeCashuWallet: wallet }),

    addEvent: (kind, event) => set((state) => {
        const newEvents = new Map(state.events)
        const existing = newEvents.get(kind) || []
        newEvents.set(kind, [...existing, event])
        return { events: newEvents }
    })
}))
