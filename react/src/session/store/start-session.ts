import type { Hexpubkey, NDKEvent, NDKFilter, NDKRelay } from "@nostr-dev-kit/ndk";
import { NDKCashuMintList, NDKKind, profileFromEvent } from "@nostr-dev-kit/ndk";
import { useNDKMutes } from "../../mutes/store";
import type { MonitorItem, NDKEventConstructor, NDKSessionsState, NDKUserSession, SessionStartOptions } from "./types";

/**
 * Normalize monitor array into kinds and constructor map
 */
function normalizeMonitor(monitor?: MonitorItem[]): {
    kinds: NDKKind[];
    constructorMap: Map<NDKKind, NDKEventConstructor>;
} {
    const kinds: NDKKind[] = [];
    const constructorMap = new Map<NDKKind, NDKEventConstructor>();

    if (!monitor || monitor.length === 0) {
        return { kinds, constructorMap };
    }

    for (const item of monitor) {
        if (typeof item === "number") {
            // Raw NDKKind
            kinds.push(item);
        } else if (item.kinds && Array.isArray(item.kinds)) {
            // NDKEventConstructor
            for (const kind of item.kinds) {
                kinds.push(kind);
                constructorMap.set(kind, item);
            }
        }
    }

    return { kinds, constructorMap };
}

function handleProfileEvent(event: NDKEvent, session: NDKUserSession): void {
    const profile = profileFromEvent(event);
    if (profile) {
        profile.created_at = event.created_at;
        session.profile = profile;
    }
}

function handleContactsEvent(event: NDKEvent, session: NDKUserSession): void {
    const followSet = new Set<Hexpubkey>(event.tags.filter((t) => t[0] === "p").map((t) => t[1]));
    session.followSet = followSet;
}

function handleOtherEvent(event: NDKEvent, session: NDKUserSession, constructorMap: Map<NDKKind, NDKEventConstructor>): void {
    const existingEvent = session.events.get(event.kind);
    // Only update if the new event is newer
    if (!existingEvent || event.created_at > existingEvent.created_at) {
        const eventConstructor = constructorMap.get(event.kind);
        const wrappedEvent = eventConstructor && typeof eventConstructor.from === "function" ? eventConstructor.from(event) : event;
        session.events.set(event.kind, wrappedEvent);
    }
}

function processEvent(event: NDKEvent, session: NDKUserSession, constructorMap: Map<NDKKind, NDKEventConstructor>): void {
    const knownEventForKind = session.events?.get(event.kind);

    if (!(!knownEventForKind || knownEventForKind.created_at < event.created_at) && event.isReplaceable()) {
        return;
    }

    try {
        switch (event.kind) {
            case NDKKind.Metadata:
                handleProfileEvent(event, session);
                break;
            case NDKKind.Contacts:
                handleContactsEvent(event, session);
                break;
            case NDKKind.MuteList:
                useNDKMutes.getState().loadMuteList(event);
                break;
            default:
                handleOtherEvent(event, session, constructorMap);
        }

        // add the event
        session.events.set(event.kind, event);
    } catch (error) {
        console.error(`Error processing event kind ${event.kind} for ${session.pubkey}:`, error, event);
    }
}

function buildSessionFilter(pubkey: string, opts: SessionStartOptions, monitorKinds: NDKKind[]): NDKFilter[] {
    const mainKindsToFetch = new Set<NDKKind>();

    if (opts.profile !== false) mainKindsToFetch.add(NDKKind.Metadata);
    if (opts.follows) mainKindsToFetch.add(NDKKind.Contacts);
    mainKindsToFetch.add(NDKKind.MuteList);

    // Add monitor kinds
    for (const kind of monitorKinds) {
        mainKindsToFetch.add(kind);
    }

    const filter: NDKFilter[] = [{ kinds: Array.from(mainKindsToFetch), authors: [pubkey] }];

    return filter;
}

export const startSession = (
    set: (partial: Partial<NDKSessionsState> | ((state: NDKSessionsState) => Partial<NDKSessionsState>)) => void,
    get: () => NDKSessionsState,
    pubkey: Hexpubkey,
    opts: SessionStartOptions,
): void => {
    const ndk = get().ndk;
    if (!ndk) {
        console.error("NDK instance not initialized in session store. Cannot start session.");
        return;
    }

    const existingSession = get().sessions.get(pubkey);
    if (!existingSession) {
        return;
    }

    // Stop existing subscriptions if present
    if (existingSession.subscriptions) {
        for (const sub of existingSession.subscriptions) {
            sub.stop();
        }
        set((state) => {
            const session = state.sessions.get(pubkey);
            if (!session) return {};
            const updatedSession = { ...session, subscriptions: [] };
            const newSessions = new Map(state.sessions);
            newSessions.set(pubkey, updatedSession);
            return { sessions: newSessions };
        });
    }

    // Normalize monitor items
    const { kinds: monitorKinds, constructorMap } = normalizeMonitor(opts.monitor);

    // Build the filter(s) based on options
    const filters = buildSessionFilter(pubkey, opts, monitorKinds);

    if (filters.length === 0) {
        console.warn(`No filters generated for session start options for pubkey ${pubkey}. No subscription created.`);
        return; // Don't create a subscription if no filters are generated
    }

    // --- Subscription Handlers ---

    const onEvent = (event: NDKEvent, relay?: NDKRelay) => {
        console.log("handle session event", event.pubkey.slice(0, 6), event.kind, relay?.url);
        set((state) => {
            const session = state.sessions.get(pubkey);
            if (!session) return {};
            // Clone session and events map for immutability
            const updatedSession: NDKUserSession = { ...session, events: new Map(session.events) };
            // Process event (mutates updatedSession)
            processEvent(event, updatedSession, constructorMap);
            const newSessions = new Map(state.sessions);
            newSessions.set(pubkey, updatedSession);
            return { sessions: newSessions };
        });
    };

    const onEvents = (events: NDKEvent[]) => {
        set((state) => {
            const session = state.sessions.get(pubkey);
            if (!session) return {};
            // Clone session and events map for immutability
            const updatedSession: NDKUserSession = { ...session, events: new Map(session.events) };
            for (const event of events) {
                processEvent(event, updatedSession, constructorMap);
            }
            const newSessions = new Map(state.sessions);
            newSessions.set(pubkey, updatedSession);
            console.debug(`Processed ${events.length} cached events for ${pubkey}`);
            return { sessions: newSessions };
        });
    };

    console.debug("Starting session for", pubkey, "with filters", JSON.stringify(filters, null, 4));

    const sub = ndk.subscribe(filters, { closeOnEose: false, addSinceFromCache: true, onEvent, onEvents });

    // Store the subscription handle in the subscriptions array
    set((state) => {
        const session = state.sessions.get(pubkey);
        if (!session) return {};
        const updatedSession = { ...session, subscriptions: [sub] };
        const newSessions = new Map(state.sessions);
        newSessions.set(pubkey, updatedSession);
        return { sessions: newSessions };
    });
};
