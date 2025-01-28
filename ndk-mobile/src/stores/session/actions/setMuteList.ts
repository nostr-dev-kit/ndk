import { NDKEvent, NDKList } from '@nostr-dev-kit/ndk';

export const setMuteList = (muteList: NDKEvent, set) => {
    set((state) => {
        if (state.muteListEvent && state.muteListEvent.created_at >= muteList.created_at) {
            return state;
        }

        const pubkeys = new Set();
        const hashtags = new Set();
        const words = new Set();
        const eventIds = new Set();

        for (const tag of muteList.tags) {
            const value = tag[1];
            switch (tag[0]) {
                case 'p': pubkeys.add(value); break;
                case 't': hashtags.add(value); break;
                case 'word': words.add(value); break;
                case 'e': eventIds.add(value); break;
            }
        }

        return {
            mutedPubkeys: pubkeys,
            mutedHashtags: hashtags,
            mutedWords: words,
            mutedEventIds: eventIds,
            muteListEvent: NDKList.from(muteList)
        };
    });
}; 