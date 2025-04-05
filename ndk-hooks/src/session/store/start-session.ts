// src/session/store/start-session.ts
import type { Draft } from "immer";
import type { Hexpubkey, NDKEvent, NDKSubscription, NDKUserProfile, NDKFilter, NDKRelay } from "@nostr-dev-kit/ndk";
import NDK, { NDKKind, profileFromEvent } from "@nostr-dev-kit/ndk";
import type { NDKSessionsState, SessionStartOptions, NDKUserSession } from "./types";

function handleProfileEvent(event: NDKEvent, sessionDraft: Draft<NDKUserSession>): void {
    const profile = profileFromEvent(event);
    if (profile) {
        profile.created_at = event.created_at;
        sessionDraft.profile = profile;
    }
}

function handleContactsEvent(event: NDKEvent, sessionDraft: Draft<NDKUserSession>): void {
    const followSet = new Set<Hexpubkey>(event.tags.filter((t) => t[0] === "p").map((t) => t[1]));
    sessionDraft.followSet = followSet;
}

function handleMuteListEvent(event: NDKEvent, sessionDraft: Draft<NDKUserSession>): void {
    // Only update if the new event is newer or same timestamp
    // Need to store the timestamp of the last mute list event processed
    // Let's add `muteListLastFetched` to NDKUserSession type later if needed.
    // For now, assume latest received is best.
    const mutedPubkeys = new Set<Hexpubkey>();
    const mutedEvents = new Set<string>();
    const mutedHashtags = new Set<string>();
    const mutedWords = new Set<string>();

    for (const tag of event.tags) {
        if (tag[0] === "p") mutedPubkeys.add(tag[1]);
        else if (tag[0] === "e") mutedEvents.add(tag[1]);
        else if (tag[0] === "t") mutedHashtags.add(tag[1]);
        else if (tag[0] === "word") mutedWords.add(tag[1]);
    }

    sessionDraft.mutedPubkeys = mutedPubkeys;
    sessionDraft.mutedEventIds = mutedEvents;
    sessionDraft.mutedHashtags = mutedHashtags;
    sessionDraft.mutedWords = mutedWords;
    console.debug(`Updated mute list for ${sessionDraft.pubkey}`);
}

function handleOtherEvent(event: NDKEvent, sessionDraft: Draft<NDKUserSession>, opts?: SessionStartOptions): void {
    const existingEvent = sessionDraft.events.get(event.kind);
    // Only update if the new event is newer
    if (!existingEvent || event.created_at > existingEvent.created_at) {
        sessionDraft.events.set(event.kind, event);
    }

    const klassWrapper = opts?.events?.get(event.kind);
    if (klassWrapper) {
        const wrappedEvent = klassWrapper.from(event);
        if (wrappedEvent) {
            sessionDraft.events.set(event.kind, wrappedEvent);
        }
    }
}

function processEvent(event: NDKEvent, sessionDraft: Draft<NDKUserSession>, opts?: SessionStartOptions): void {
    const knownEventForKind = sessionDraft.events?.get(event.kind);

    if (!(!knownEventForKind || knownEventForKind.created_at < event.created_at)) {
        console.log("We already have an event of kind " + event.kind + " that is newer", {
            knownEvent: knownEventForKind.created_at,
            incomingEvent: event.created_at,
        });
        return;
    }

    try {
        switch (event.kind) {
            case NDKKind.Metadata:
                handleProfileEvent(event, sessionDraft);
                break;
            case NDKKind.Contacts:
                console.log("setting contact list with", event.created_at, event.tags.length);
                handleContactsEvent(event, sessionDraft);
                break;
            case NDKKind.MuteList:
                handleMuteListEvent(event, sessionDraft);
                break;
            default:
                handleOtherEvent(event, sessionDraft, opts);
        }

        // add the event
        sessionDraft.events.set(event.kind, event);
    } catch (error) {
        console.error(`Error processing event kind ${event.kind} for ${sessionDraft.pubkey}:`, error, event);
    }
}

function buildSessionFilter(pubkey: string, opts: SessionStartOptions): NDKFilter[] {
    const mainKindsToFetch = new Set<NDKKind>();

    if (opts.profile !== false) mainKindsToFetch.add(NDKKind.Metadata);
    if (opts.follows !== false) mainKindsToFetch.add(NDKKind.Contacts);
    if (opts.muteList !== false) mainKindsToFetch.add(NDKKind.MuteList);

    for (const kind of opts.events?.keys() || []) {
        mainKindsToFetch.add(kind);
    }

    return [{ kinds: Array.from(mainKindsToFetch), authors: [pubkey] }];
}

export const startSession = (
    set: (fn: (draft: Draft<NDKSessionsState>) => void) => void,
    get: () => NDKSessionsState,
    pubkey: Hexpubkey,
    opts: SessionStartOptions,
): void => {
    console.log("will start session", pubkey);
    const ndk = get().ndk;
    if (!ndk) {
        console.error("NDK instance not initialized in session store. Cannot start session.");
        return;
    }

    const existingSession = get().sessions.get(pubkey);
    if (!existingSession) {
        console.error(`Session for pubkey ${pubkey} does not exist. Cannot start subscription.`);
        return;
    }

    // Stop existing subscription if present
    if (existingSession.subscription) {
        console.debug(`Stopping existing subscription for ${pubkey} before starting new one.`);
        existingSession.subscription.stop();
        set((draft) => {
            const session = draft.sessions.get(pubkey);
            if (session) {
                session.subscription = undefined;
            }
        });
    }

    console.debug(`Starting session subscription for ${pubkey} with opts:`, opts);

    // Build the filter(s) based on options
    const filters = buildSessionFilter(pubkey, opts);

    if (filters.length === 0) {
        console.warn(`No filters generated for session start options for pubkey ${pubkey}. No subscription created.`);
        return; // Don't create a subscription if no filters are generated
    }

    console.debug(`Subscribing with filters for ${pubkey}:`, filters);

    // --- Subscription Handlers ---

    const handleEvent = (event: NDKEvent, relay: NDKRelay) => {
        console.log("handle session event", event.pubkey.slice(0, 6), event.kind, relay?.url);
        set((draft) => {
            const session = draft.sessions.get(pubkey);
            if (!session) return; // Session might have been removed while processing
            processEvent(event, session, opts);
        });
    };

    const handleEvents = (events: NDKEvent[]) => {
        console.log("handle session events", events.map((event) => event.pubkey.slice(0, 6) + event.kind).join(", "));
        set((draft) => {
            const session = draft.sessions.get(pubkey);
            if (!session) return; // Session might have been removed

            // Process all cached events modifying the draft session
            for (const event of events) {
                processEvent(event, session, opts);
            }
            // Single update to the store after processing all cached events
            console.debug(`Processed ${events.length} cached events for ${pubkey}`);
        });
    };

    // --- Create Subscription ---
    console.log("starting subscription for", pubkey);

    const sub = ndk.subscribe(
        filters,
        { closeOnEose: false, addSinceFromCache: true },
        { onEvent: handleEvent, onEvents: handleEvents },
    );

    // Store the subscription handle
    set((draft) => {
        const session = draft.sessions.get(pubkey);
        if (session) {
            session.subscription = sub;
        }
    });
};
