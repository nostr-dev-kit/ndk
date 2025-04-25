import type { Hexpubkey, NDKEvent, NDKFilter, NDKRelay } from "@nostr-dev-kit/ndk";
import { NDKCashuMintList, NDKKind, profileFromEvent } from "@nostr-dev-kit/ndk";
import type { Draft } from "immer";
import type { NDKSessionsState, NDKUserSession, SessionStartOptions } from "./types";
import { useNDKMutes } from "../../mutes/store";

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

function handleOtherEvent(event: NDKEvent, sessionDraft: Draft<NDKUserSession>, opts?: SessionStartOptions): void {
    const existingEvent = sessionDraft.events.get(event.kind);
    // Only update if the new event is newer
    if (!existingEvent || event.created_at > existingEvent.created_at) {
        sessionDraft.events.set(event.kind, event);
    }

    const klassWrapper = opts?.events?.get(event.kind);
    if (klassWrapper) {
        const wrappedEvent = klassWrapper.from(event);
        if (wrappedEvent) sessionDraft.events.set(event.kind, wrappedEvent);
    }
}

/**
 * Called when we need to update the kindFollowSet
 *
 * This is called when we are handling a follow event or when we need to undo a follow event because it was deleted.
 */
function handleKindFollowEvent(
    event: NDKEvent,
    sessionDraft: Draft<NDKUserSession>,
    followed = true,
    last_updated_at = event.created_at,
): void {
    const kindFollowSet =
        sessionDraft.kindFollowSet ??
        new Map<NDKKind, Map<Hexpubkey, { followed: boolean; last_updated_at: number }>>();

    // get all the kind numbers in the follow event
    const kinds = event.getMatchingTags("k").map((t) => Number(t[1]));

    // get all the followed pubkeys
    const followedPubkeys = event.getMatchingTags("p").map((t) => t[1]);

    for (const kind of kinds) {
        for (const pubkey of followedPubkeys) {
            const kindFollows =
                kindFollowSet.get(kind) || new Map<Hexpubkey, { followed: boolean; last_updated_at: number }>();
            const followedInfo = { followed, last_updated_at };

            // see if we already have this pubkey in the map and if the timestamp we have now is newer
            const existingFollowedInfo = kindFollows.get(pubkey);
            if (!existingFollowedInfo || existingFollowedInfo.last_updated_at < event.created_at) {
                kindFollows.set(pubkey, followedInfo);
            }
            kindFollowSet.set(kind, kindFollows);
        }
    }

    sessionDraft.kindFollowSet = kindFollowSet;
}

/**
 * Called when we receive a deletion of a follow event,
 * we need to go through the kindFollowSet and remove the pubkey if the event we have now is newer
 * @returns
 */
function handkeEventDeletion(event: NDKEvent, sessionDraft: Draft<NDKUserSession>): void {
    const kindFollowSet = sessionDraft.kindFollowSet;

    if (!kindFollowSet) return;

    for (const eTag of event.getMatchingTags("e")) {
        if (!eTag[1]) continue;
        if (!event.ndk) continue;

        const followEventDeleted = event.ndk.fetchEventSync(eTag[1]);
        if (!followEventDeleted?.[0]) continue;
        handleKindFollowEvent(followEventDeleted[0], sessionDraft, false, event.created_at);
    }
}

function processEvent(event: NDKEvent, sessionDraft: Draft<NDKUserSession>, opts?: SessionStartOptions): void {
    const knownEventForKind = sessionDraft.events?.get(event.kind);

    if (!(!knownEventForKind || knownEventForKind.created_at < event.created_at) && event.isReplaceable()) {
        return;
    }

    try {
        switch (event.kind) {
            case NDKKind.Metadata:
                handleProfileEvent(event, sessionDraft);
                break;
            case NDKKind.Contacts:
                handleContactsEvent(event, sessionDraft);
                break;
            case NDKKind.MuteList:
                useNDKMutes.getState().loadMuteList(event);
                break;
            case 967:
                handleKindFollowEvent(event, sessionDraft);
                break;
            case NDKKind.EventDeletion:
                handkeEventDeletion(event, sessionDraft);
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
    mainKindsToFetch.add(NDKKind.MuteList);

    for (const kind of opts.events?.keys() || []) {
        mainKindsToFetch.add(kind);
    }

    const filter: NDKFilter[] = [{ kinds: Array.from(mainKindsToFetch), authors: [pubkey] }];

    if (Array.isArray(opts.follows)) {
        filter.push({ kinds: [967 as NDKKind], "#k": opts.follows.map((k) => k.toString()), authors: [pubkey] });
    }

    return filter;
}

export const startSession = (
    set: (fn: (draft: Draft<NDKSessionsState>) => void) => void,
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

    // Stop existing subscription if present
    if (existingSession.subscription) {
        existingSession.subscription.stop();
        set((draft) => {
            const session = draft.sessions.get(pubkey);
            if (session) {
                session.subscription = undefined;
            }
        });
    }

    // Build the filter(s) based on options
    const filters = buildSessionFilter(pubkey, opts);

    if (filters.length === 0) {
        console.warn(`No filters generated for session start options for pubkey ${pubkey}. No subscription created.`);
        return; // Don't create a subscription if no filters are generated
    }

    // --- Subscription Handlers ---

    const onEvent = (event: NDKEvent, relay?: NDKRelay) => {
        console.log("handle session event", event.pubkey.slice(0, 6), event.kind, relay?.url);
        set((draft) => {
            const session = draft.sessions.get(pubkey);
            if (!session) return; // Session might have been removed while processing
            processEvent(event, session, opts);
        });
    };

    const onEvents = (events: NDKEvent[]) => {
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

    console.debug("Starting session for", pubkey, "with filters", JSON.stringify(filters, null, 4));
    
    const sub = ndk.subscribe(filters, { closeOnEose: false, addSinceFromCache: true }, { onEvent, onEvents });

    // Store the subscription handle
    set((draft) => {
        const session = draft.sessions.get(pubkey);
        if (session) {
            session.subscription = sub;
        }
    });
};
