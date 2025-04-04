import NDK, { NDKEvent, NDKFilter, NDKKind, NDKSubscription, NDKUser, profileFromEvent } from '@nostr-dev-kit/ndk';
import { StoreApi } from 'zustand';
import { SessionInitOptions, SessionState, UserSessionData } from '../types';

export async function initializeSession(
    set: StoreApi<SessionState>['setState'],
    get: StoreApi<SessionState>['getState'],
    ndk: NDK,
    user: NDKUser,
    opts: SessionInitOptions = {},
    cb?: (error: Error | null, pubkey?: string) => void
): Promise<string | undefined> {
    const pubkey = user.pubkey;

    try {
        let session = get().sessions.get(pubkey);
        if (!session) {
            get().createSession(pubkey, { ndk });
            session = get().sessions.get(pubkey)!;
        } else if (!session.ndk) {
            get().updateSession(pubkey, { ndk });
            session = { ...session, ndk };
        }

        if (opts.autoSetActive !== false) {
            get().setActiveSession(pubkey);
        }

        const filter: NDKFilter = { authors: [pubkey], kinds: [] };
        const kindsToFetch: NDKKind[] = [];

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

        filter.kinds = [...new Set(kindsToFetch)];

        if (filter.kinds.length > 0) {
            const subscription: NDKSubscription = ndk.subscribe(filter, {
                closeOnEose: false,
            });

            subscription.on('event', (event: NDKEvent) => {
                const currentSession = get().sessions.get(pubkey);
                if (!currentSession) return;

                switch (event.kind) {
                    case NDKKind.Metadata: {
                        const existingProfile = currentSession.profile;
                        if (!existingProfile || event.created_at! > (existingProfile.created_at || 0)) {
                            try {
                                const profile = profileFromEvent(event);
                                profile.created_at = event.created_at;
                                get().updateSession(pubkey, { profile });
                            } catch (e) {
                                console.error(`Failed to parse profile JSON for ${pubkey}:`, e, event.content);
                            }
                        }
                        break;
                    }
                    case NDKKind.Contacts: {
                        const existingEvent = currentSession.replaceableEvents.get(NDKKind.Contacts);
                        if (!existingEvent || event.created_at! > existingEvent.created_at!) {
                            const followSet = new Set<string>();
                            event.tags.forEach((tag) => {
                                if (tag[0] === 'p' && tag[1].length === 64) followSet.add(tag[1]);
                            });
                            const newReplaceableEvents = new Map(currentSession.replaceableEvents);
                            newReplaceableEvents.set(NDKKind.Contacts, event);
                            get().updateSession(pubkey, {
                                followSet,
                                replaceableEvents: newReplaceableEvents,
                            });
                        }
                        break;
                    }
                    case NDKKind.MuteList: {
                        const existingEvent = currentSession.replaceableEvents.get(NDKKind.MuteList);
                        if (!existingEvent || event.created_at! > existingEvent.created_at!) {
                            const newReplaceableEvents = new Map(currentSession.replaceableEvents);
                            newReplaceableEvents.set(NDKKind.MuteList, event);
                            get().updateSession(pubkey, {
                                replaceableEvents: newReplaceableEvents,
                            });
                        }
                        break;
                    }
                    default: {
                        const eventOptions = opts.events?.get(event.kind!);
                        if (eventOptions) {
                            const existingEvent = currentSession.replaceableEvents.get(event.kind!);
                            if (!existingEvent || event.created_at! > existingEvent.created_at!) {
                                let finalEvent = event;
                                if (eventOptions.wrap && typeof eventOptions.wrap.from === 'function') {
                                    try {
                                        finalEvent = eventOptions.wrap.from(event);
                                    } catch (wrapError) {
                                        console.error(`Error wrapping event kind ${event.kind}:`, wrapError);
                                    }
                                }
                                const newReplaceableEvents = new Map(currentSession.replaceableEvents);
                                newReplaceableEvents.set(event.kind!, finalEvent);
                                get().updateSession(pubkey, {
                                    replaceableEvents: newReplaceableEvents,
                                });
                            }
                        }
                        break;
                    }
                }
            });

            subscription.start();
        }

        cb?.(null, pubkey);
        return pubkey;
    } catch (error) {
        console.error(`Error initializing session for ${pubkey}:`, error);
        cb?.(error as Error);
        return undefined;
    }
}
