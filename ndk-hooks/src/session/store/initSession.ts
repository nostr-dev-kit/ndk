import type NDK from '@nostr-dev-kit/ndk';
import {
    NDKKind,
    profileFromEvent,
} from '@nostr-dev-kit/ndk';
import type {
    NDKEvent,
    NDKFilter,
    NDKSubscription,
    NDKUser,
    NDKSigner,
} from '@nostr-dev-kit/ndk';
import type { StoreApi } from 'zustand';
import type { SessionInitOptions, SessionState, UserSessionData } from '../types';

/**
 * Initialize a session for a Nostr user.
 *
 * This is the main entry point for setting up a user session with NDK.
 */
export async function initializeSession(
    set: StoreApi<SessionState>['setState'],
    get: StoreApi<SessionState>['getState'],
    ndk: NDK,
    user: NDKUser,
    signer?: NDKSigner,
    opts: SessionInitOptions = {},
): Promise<string | undefined> {
    const pubkey = user.pubkey;

    try {
        // Set up session data and NDK configuration
        setupSessionData(get, ndk, pubkey, signer);

        // Set as active session if requested
        if (opts.autoSetActive !== false) {
            get().setActiveSession(pubkey);
        }

        // Build subscription filter based on options
        const filter = buildEventFilter(pubkey, opts);

        // Set up and start subscription if we have kinds to fetch
        if (filter.kinds && filter.kinds.length > 0) {
            setupEventSubscription(get, ndk, pubkey, filter, opts);
        }

        return pubkey;
    } catch (error) {
        console.error(`Error initializing session for ${pubkey}:`, error);
        return undefined;
    }
}

/**
 * Set up the session data in the store.
 * Either creates a new session or updates an existing one.
 */
function setupSessionData(
    get: StoreApi<SessionState>['getState'],
    ndk: NDK,
    pubkey: string,
    signer?: NDKSigner
): void {
    // Check if session already exists
    let session = get().sessions.get(pubkey);

    if (!session) {
        // Create new session
        get().createSession(pubkey, { signer });
        session = get().sessions.get(pubkey);

        // Verify session creation was successful
        if (!session) {
            throw new Error(`Failed to create session for pubkey ${pubkey}`);
        }
    } else {
        // Update existing session
        const updateData: Partial<UserSessionData> = {};
        if (signer && !session.signer) {
            updateData.signer = signer;
        }
        get().updateSession(pubkey, updateData);
    }
}

/**
 * Build an event filter based on the provided options.
 */
function buildEventFilter(pubkey: string, opts: SessionInitOptions): NDKFilter {
    const kindsToFetch: NDKKind[] = [];

    // Add kinds based on options
    if (opts.profile) {
        kindsToFetch.push(NDKKind.Metadata);
    }
    if (opts.follows) {
        kindsToFetch.push(NDKKind.Contacts);
    }
    if (opts.muteList) {
        kindsToFetch.push(NDKKind.MuteList);
    }
    if (opts.events) {
        kindsToFetch.push(...opts.events.keys());
    }

    // Ensure we have a valid kinds array (even if empty) for type safety
    return {
        authors: [pubkey],
        kinds: [...new Set(kindsToFetch)] // This ensures kinds is always an array
    };
}

/**
 * Set up and start the event subscription.
 */
function setupEventSubscription(
    get: StoreApi<SessionState>['getState'],
    ndk: NDK,
    pubkey: string,
    filter: NDKFilter,
    opts: SessionInitOptions
): NDKSubscription {
    const subscription = ndk.subscribe(filter, {
        closeOnEose: false,
    });

    subscription.on('event', (event: NDKEvent) => {
        handleEventUpdate(get, pubkey, event, opts);
    });

    subscription.start();
    return subscription;
}

/**
 * Handle an event update from the subscription.
 */
function handleEventUpdate(
    get: StoreApi<SessionState>['getState'],
    pubkey: string,
    event: NDKEvent,
    opts: SessionInitOptions
): void {
    const currentSession = get().sessions.get(pubkey);
    if (!currentSession) return;

    switch (event.kind) {
        case NDKKind.Metadata:
            handleMetadataEvent(get, pubkey, event, currentSession);
            break;
        case NDKKind.Contacts:
            handleContactsEvent(get, pubkey, event, currentSession);
            break;
        case NDKKind.MuteList:
            handleMuteListEvent(get, pubkey, event, currentSession);
            break;
        default:
            handleCustomEvent(get, pubkey, event, currentSession, opts);
            break;
    }
}

/**
 * Handle a Metadata (Kind 0) event.
 */
function handleMetadataEvent(
    get: StoreApi<SessionState>['getState'],
    pubkey: string,
    event: NDKEvent,
    currentSession: UserSessionData
): void {
    const existingProfile = currentSession.profile;
    
    // Only update if we don't have a profile or the new one is newer
    if (
        !existingProfile ||
        (event.created_at ?? 0) > (existingProfile.created_at || 0)
    ) {
        try {
            const profile = profileFromEvent(event);
            profile.created_at = event.created_at;
            get().updateSession(pubkey, { profile });
        } catch (e) {
            console.error(
                `Failed to parse profile JSON for ${pubkey}:`,
                e,
                event.content
            );
        }
    }
}

/**
 * Handle a Contacts (Kind 3) event.
 */
function handleContactsEvent(
    get: StoreApi<SessionState>['getState'],
    pubkey: string,
    event: NDKEvent,
    currentSession: UserSessionData
): void {
    const existingEvent = currentSession.replaceableEvents.get(NDKKind.Contacts);
    
    // Only update if we don't have the event or the new one is newer
    if (
        !existingEvent ||
        (event.created_at ?? 0) > (existingEvent.created_at ?? 0)
    ) {
        // Extract follow list from 'p' tags
        const followSet = new Set<string>();
        for (const tag of event.tags) {
            if (tag[0] === 'p' && tag[1]?.length === 64) {
                followSet.add(tag[1]);
            }
        }
        
        // Create new map to avoid mutating the session directly
        const newReplaceableEvents = new Map(currentSession.replaceableEvents);
        newReplaceableEvents.set(NDKKind.Contacts, event);
        
        // Update session with new followSet and event
        get().updateSession(pubkey, {
            followSet,
            replaceableEvents: newReplaceableEvents,
        });
    }
}

/**
 * Handle a MuteList (Kind 10000) event.
 */
function handleMuteListEvent(
    get: StoreApi<SessionState>['getState'],
    pubkey: string,
    event: NDKEvent,
    currentSession: UserSessionData
): void {
    const existingEvent = currentSession.replaceableEvents.get(NDKKind.MuteList);
    
    // Only update if we don't have the event or the new one is newer
    if (
        !existingEvent ||
        (event.created_at ?? 0) > (existingEvent.created_at ?? 0)
    ) {
        const newReplaceableEvents = new Map(currentSession.replaceableEvents);
        newReplaceableEvents.set(NDKKind.MuteList, event);
        
        // Update session with new event
        // Note: The actual mute list processing happens in a store.subscribe handler
        get().updateSession(pubkey, {
            replaceableEvents: newReplaceableEvents,
        });
    }
}

/**
 * Handle a custom event (not Kind 0, 3, or 10000).
 */
function handleCustomEvent(
    get: StoreApi<SessionState>['getState'],
    pubkey: string,
    event: NDKEvent,
    currentSession: UserSessionData,
    opts: SessionInitOptions
): void {
    const kind = event.kind;
    if (kind === undefined) return; // Skip if kind is missing

    const eventOptions = opts.events?.get(kind);
    if (!eventOptions) return; // Skip if we don't have options for this kind

    const existingEvent = currentSession.replaceableEvents.get(kind);
    
    // Only update if we don't have the event or the new one is newer
    if (
        !existingEvent ||
        (event.created_at ?? 0) > (existingEvent.created_at ?? 0)
    ) {
        let finalEvent = event;
        
        // Apply wrapper if configured
        if (eventOptions.wrap) {
            try {
                finalEvent = eventOptions.wrap.from(event);
            } catch (wrapError) {
                console.error(
                    `Error wrapping event kind ${event.kind}:`,
                    wrapError
                );
            }
        }
        
        const newReplaceableEvents = new Map(currentSession.replaceableEvents);
        newReplaceableEvents.set(kind, finalEvent);
        
        // Update session with new event
        get().updateSession(pubkey, {
            replaceableEvents: newReplaceableEvents,
        });
    }
}
