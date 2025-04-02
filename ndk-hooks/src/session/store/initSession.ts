import NDK, {
    NDKEvent,
    NDKFilter,
    NDKKind,
    NDKSubscription,
    NDKUser,
    profileFromEvent,
} from '@nostr-dev-kit/ndk';
import { StoreApi } from 'zustand';
import { SessionInitOptions, SessionState, UserSessionData } from '../types';

export async function initializeSession(
    set: StoreApi<SessionState>['setState'], // Correct type for set
    get: StoreApi<SessionState>['getState'], // Correct type for get
    ndk: NDK,
    user: NDKUser,
    opts: SessionInitOptions = {},
    cb?: (error: Error | null, pubkey?: string) => void
): Promise<string | undefined> {
    const pubkey = user.pubkey;

    try {
        // 1. Create or Get Session
        let session = get().sessions.get(pubkey);
        if (!session) {
            get().createSession(pubkey, { ndk }); // Call action via get()
            session = get().sessions.get(pubkey)!; // Re-fetch session
        } else if (!session.ndk) {
            get().updateSession(pubkey, { ndk }); // Call action via get()
            session = { ...session, ndk }; // Update local copy
        }

        // 2. Set Active (if requested)
        if (opts.autoSetActive !== false) {
            get().setActiveSession(pubkey); // Call action via get()
        }

        // 3. Fetch Initial Data via Subscription
        const filter: NDKFilter = { authors: [pubkey], kinds: [] };
        const kindsToFetch: NDKKind[] = [];

        if (opts.profile) {
            kindsToFetch.push(NDKKind.Metadata);
        }
        if (opts.follows) {
            kindsToFetch.push(NDKKind.Contacts);
        }
        if (opts.muteList) {
            // NDKKind doesn't export MuteList, use the number directly
            kindsToFetch.push(NDKKind.MuteList);
        }
        if (opts.events) {
            kindsToFetch.push(...opts.events.keys());
        }

        // Remove duplicates just in case
        filter.kinds = [...new Set(kindsToFetch)];

        // Only subscribe if there's something to fetch
        if (filter.kinds.length > 0) {
            // Create the subscription with filter and options
            const subscription: NDKSubscription = ndk.subscribe(filter, {
                closeOnEose: false,
            });

            // Attach the event handler to the subscription object
            subscription.on('event', (event: NDKEvent) => {
                const currentSession = get().sessions.get(pubkey);
                if (!currentSession) return; // Session might have been deleted

                switch (event.kind) {
                    case NDKKind.Metadata: {
                        const existingProfile = currentSession.profile;
                        // Check timestamp before parsing potentially expensive JSON
                        if (
                            !existingProfile ||
                            event.created_at! >
                                (existingProfile.created_at || 0)
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
                        break;
                    }
                    case NDKKind.Contacts: {
                        const existingEvent =
                            currentSession.replaceableEvents.get(
                                NDKKind.Contacts
                            );
                        if (
                            !existingEvent ||
                            event.created_at! > existingEvent.created_at!
                        ) {
                            const followSet = new Set<string>();
                            event.tags.forEach((tag) => {
                                if (tag[0] === 'p' && tag[1].length === 64)
                                    followSet.add(tag[1]);
                            });
                            const newReplaceableEvents = new Map(
                                currentSession.replaceableEvents
                            );
                            newReplaceableEvents.set(NDKKind.Contacts, event);
                            // Update both followSet and the event in the map
                            get().updateSession(pubkey, {
                                followSet,
                                replaceableEvents: newReplaceableEvents,
                            });
                        }
                        break;
                    }
                    case NDKKind.MuteList: {
                        const existingEvent =
                            currentSession.replaceableEvents.get(
                                NDKKind.MuteList
                            );
                        if (
                            !existingEvent ||
                            event.created_at! > existingEvent.created_at!
                        ) {
                            const newReplaceableEvents = new Map(
                                currentSession.replaceableEvents
                            );
                            newReplaceableEvents.set(NDKKind.MuteList, event);
                            get().updateSession(pubkey, {
                                replaceableEvents: newReplaceableEvents,
                            });
                            // Note: We removed the direct call to setMuteListForSession.
                            // The processing of the mute list should happen elsewhere,
                            // likely triggered by observing changes to this event in the store.
                        }
                        break;
                    }
                    default: {
                        // Handle custom replaceable events from opts.events
                        const eventOptions = opts.events?.get(event.kind!);
                        if (eventOptions) {
                            const existingEvent =
                                currentSession.replaceableEvents.get(
                                    event.kind!
                                );
                            if (
                                !existingEvent ||
                                event.created_at! > existingEvent.created_at!
                            ) {
                                let finalEvent = event;
                                if (
                                    eventOptions.wrap &&
                                    typeof eventOptions.wrap.from === 'function'
                                ) {
                                    try {
                                        // Use the static 'from' method of the wrapper class
                                        finalEvent =
                                            eventOptions.wrap.from(event);
                                    } catch (wrapError) {
                                        console.error(
                                            `Error wrapping event kind ${event.kind}:`,
                                            wrapError
                                        );
                                        // Proceed with the original event if wrapping fails
                                    }
                                }
                                const newReplaceableEvents = new Map(
                                    currentSession.replaceableEvents
                                );
                                newReplaceableEvents.set(
                                    event.kind!,
                                    finalEvent
                                );
                                get().updateSession(pubkey, {
                                    replaceableEvents: newReplaceableEvents,
                                });
                            }
                        }
                        break;
                    }
                }
            });

            // NDK usually starts subscriptions automatically upon creation,
            // but explicitly calling start() ensures it if behavior changes.
            subscription.start();
        }

        // Callback indicates setup is complete, data will stream in
        cb?.(null, pubkey);
        return pubkey;
    } catch (error) {
        console.error(`Error initializing session for ${pubkey}:`, error);
        cb?.(error as Error);
        return undefined;
    }
}
