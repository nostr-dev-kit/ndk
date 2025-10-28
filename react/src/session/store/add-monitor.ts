import type { NDKEvent, NDKRelay } from "@nostr-dev-kit/ndk";
import type { MonitorItem, NDKEventConstructor, NDKSessionsState, NDKUserSession } from "./types";

/**
 * Normalize monitor array into kinds and constructor map
 */
function normalizeMonitor(monitor?: MonitorItem[]): {
    kinds: number[];
    constructorMap: Map<number, NDKEventConstructor>;
} {
    const kinds: number[] = [];
    const constructorMap = new Map<number, NDKEventConstructor>();

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

/**
 * Process event and wrap with constructor if available
 */
function processMonitoredEvent(
    event: NDKEvent,
    session: NDKUserSession,
    constructorMap: Map<number, NDKEventConstructor>,
): void {
    const existingEvent = session.events.get(event.kind);

    // Only update if the new event is newer
    if (!existingEvent || event.created_at > existingEvent.created_at) {
        const eventConstructor = constructorMap.get(event.kind);
        const wrappedEvent =
            eventConstructor && typeof eventConstructor.from === "function" ? eventConstructor.from(event) : event;
        session.events.set(event.kind, wrappedEvent);
    }
}

/**
 * Add monitors to the active session
 */
export const addMonitor = (
    set: (partial: Partial<NDKSessionsState> | ((state: NDKSessionsState) => Partial<NDKSessionsState>)) => void,
    get: () => NDKSessionsState,
    monitor: MonitorItem[],
): void => {
    const state = get();
    const { ndk, activePubkey } = state;

    if (!ndk) {
        console.error("NDK instance not initialized");
        return;
    }

    if (!activePubkey) {
        console.warn("No active session to add monitor to");
        return;
    }

    const session = state.sessions.get(activePubkey);
    if (!session) {
        console.error(`Session not found for ${activePubkey}`);
        return;
    }

    // Normalize monitor items
    const { kinds, constructorMap } = normalizeMonitor(monitor);

    if (kinds.length === 0) {
        return; // Nothing to monitor
    }

    // Create subscription handlers
    const onEvent = (event: NDKEvent, relay?: NDKRelay) => {
        console.log("handle monitored event", event.pubkey.slice(0, 6), event.kind, relay?.url);
        set((state) => {
            const session = state.sessions.get(activePubkey);
            if (!session) return {};
            // Clone session and events map for immutability
            const updatedSession: NDKUserSession = { ...session, events: new Map(session.events) };
            // Process event
            processMonitoredEvent(event, updatedSession, constructorMap);
            const newSessions = new Map(state.sessions);
            newSessions.set(activePubkey, updatedSession);
            return { sessions: newSessions };
        });
    };

    const onEvents = (events: NDKEvent[]) => {
        set((state) => {
            const session = state.sessions.get(activePubkey);
            if (!session) return {};
            // Clone session and events map for immutability
            const updatedSession: NDKUserSession = { ...session, events: new Map(session.events) };
            for (const event of events) {
                processMonitoredEvent(event, updatedSession, constructorMap);
            }
            const newSessions = new Map(state.sessions);
            newSessions.set(activePubkey, updatedSession);
            console.debug(`Processed ${events.length} monitored cached events`);
            return { sessions: newSessions };
        });
    };

    // Create new subscription for the additional monitors
    const subscription = ndk.subscribe(
        {
            kinds,
            authors: [activePubkey],
        },
        { closeOnEose: false },
        { onEvent, onEvents },
    );

    // Add subscription to the array
    set((state) => {
        const session = state.sessions.get(activePubkey);
        if (!session) return {};
        const updatedSession = { ...session, subscriptions: [...session.subscriptions, subscription] };
        const newSessions = new Map(state.sessions);
        newSessions.set(activePubkey, updatedSession);
        return { sessions: newSessions };
    });
};
