import { create } from 'zustand';
import { SessionState } from './types.js';
import { initSession } from './actions/init.js';
import { mutePubkey } from './actions/mutePubkey.js';
import { setMuteList } from './actions/setMuteList.js';
import { setEvents } from './actions/setEvents.js';
import { addEvent } from './actions/addEvent.js';

export const useNDKSessionStore = create<SessionState>()((set, get) => ({
    follows: undefined,
    ndk: undefined,
    muteList: new Set(),
    muteListEvent: undefined,
    randomId: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
    events: new Map(),
    wot: new Map(),

    init: (ndk, user, settingsStore, opts, cb) => initSession(ndk, user, settingsStore, opts, cb, set, get),
    mutePubkey: (pubkey) => mutePubkey(pubkey, set),
    setMuteList: (muteList) => setMuteList(muteList, set),
    setEvents: (kind, events) => setEvents(kind, events, set),
    addEvent: (event, onAdded) => addEvent(event, onAdded, set)
}));