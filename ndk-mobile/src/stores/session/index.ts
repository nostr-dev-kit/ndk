import { create } from "zustand";
import { SessionState } from "./types.js";
import { initSession } from "./actions/init.js";
import { mute } from "./actions/mute.js";
import { setMuteList } from "./actions/setMuteList.js";
import { setEvents } from "./actions/setEvents.js";
import { addEvent } from "./actions/addEvent.js";

export const useNDKSession = create<SessionState>()((set, get) => ({
    follows: undefined,
    ndk: undefined,
    mutedPubkeys: new Set(),
    mutedHashtags: new Set(),
    mutedWords: new Set(),
    mutedEventIds: new Set(),
    muteListEvent: undefined,
    events: new Map(),
    wot: new Map(),

    init: (ndk, user, settingsStore, opts, cb) =>
        initSession(ndk, user, settingsStore, opts, cb, set, get),
    mute: (value, type, publish = true) => mute(value, type, publish, set),
    setMuteList: (muteList) => setMuteList(muteList, set),
    setEvents: (kind, events) => setEvents(kind, events, set),
    addEvent: (event, onAdded) => addEvent(event, onAdded, set),
}));
