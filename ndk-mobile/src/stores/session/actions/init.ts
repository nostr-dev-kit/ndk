import NDK, { NDKEvent, NDKKind, Hexpubkey, NDKUser, NDKRelaySet, NDKList, NDKRelay } from '@nostr-dev-kit/ndk';
import { SessionInitCallbacks, SessionInitOpts, SessionState } from '../types.js';
import { generateFilters } from '../utils.js';
import { SettingsStore } from '../../../types.js';
import { NDKCacheAdapterSqlite } from '../../../cache-adapter/sqlite.js';
import { addWotEntries, shouldUpdateWot, wotEntries } from './wot.js';

const isValidPubkey = (pubkey: Hexpubkey) => pubkey.length === 64 && /^[0-9a-fA-F]+$/.test(pubkey);

export const initSession = (
    ndk: NDK,
    user: NDKUser,
    settingsStore: SettingsStore,
    opts: SessionInitOpts,
    on: SessionInitCallbacks = {},
    set: (state: Partial<SessionState>) => void,
    get: () => SessionState
) => {
    const { addEvent } = get();
    let follows: Hexpubkey[] = [];
    let kindFollows = new Set<Hexpubkey>();
    const filters = generateFilters(ndk, user, opts);
    const sub = ndk.subscribe(filters, { groupable: false, closeOnEose: false, subId: 'ndk-mobile-session', ...(opts.subOpts || {}) }, undefined, false);
    let eosed = false;

    let updateFollowTimer: NodeJS.Timeout | undefined;

    const debouncedUpdateFollows = () => {
        if (updateFollowTimer) clearTimeout(updateFollowTimer);

        updateFollowTimer = setTimeout(updateFollows, 50);
    }

    const updateFollows = () => {
        set({ follows: Array.from(new Set([ ...follows, ...Array.from(kindFollows) ])) });
    }

    const handleKindFollowEvent = (event: NDKEvent) => {
        let modified = false;
        for (const tag of event.getMatchingTags('p')) {
            if (!kindFollows.has(tag[1])) {
                if (isValidPubkey(tag[1])) {
                    kindFollows.add(tag[1]);
                    modified = true;
                }
            }
        }

        if (modified) {
            if (eosed) updateFollows();
            else debouncedUpdateFollows();
        }
    }

    const handleEvent = (event: NDKEvent) => {
        addEvent(event, () => {
            if (event.kind === NDKKind.Contacts) {
                follows = event.tags
                    .filter((tag) => tag[0] === 'p' && !!tag[1])
                    .map((tag) => tag[1])
                    .filter(isValidPubkey);

                // if we have already eosed, get the pubkeys that are not in the wotEntries and add them to the wotEntries
                if (eosed && opts.wot) {
                    const newEntries = follows.filter((pubkey) => !wotEntries.has(pubkey));
                    console.log('eosed, adding wot entries', follows.length, newEntries.length);
                    addWotEntries(ndk, newEntries, settingsStore, set, () => {
                        on.onWotReady?.();
                    });
                }
                
                return { follows: [ ...follows, ...Array.from(kindFollows) ] };
            } else if (event.kind === 967) {
                handleKindFollowEvent(event);
            } else if (event.kind === NDKKind.MuteList) {
                const muteList = new Set(event.tags.filter((tag) => tag[0] === 'p' && !!tag[1]).map((tag) => tag[1]));
                return { muteList, muteListEvent: NDKList.from(event) };
            }
        });
    };

    sub.on('event', handleEvent);

    sub.once('eose', () => {
        on?.onReady?.();
        eosed = true;

        if (opts.wot) {
            console.log('shouldUpdateWot', shouldUpdateWot(ndk, settingsStore));
            if (shouldUpdateWot(ndk, settingsStore)) {
                addWotEntries(ndk, follows, settingsStore, set, () => {
                    on.onWotReady?.();
                });
            } else {
                console.log('not updating wot');
                
                // fetch wot from database
                const cacheAdapter = ndk.cacheAdapter;
                if (!(cacheAdapter instanceof NDKCacheAdapterSqlite)) {
                    return;
                }

                cacheAdapter.fetchWot().then((wot) => {
                    set({ wot });
                    on.onWotReady?.();
                });
            }
        }

        eosed = true;
    });
    sub.start();

    set({ ndk, follows: opts.follows ? [user.pubkey] : [] });
};
