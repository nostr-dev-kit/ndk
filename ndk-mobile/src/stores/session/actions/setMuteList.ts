import { NDKEvent, NDKList } from '@nostr-dev-kit/ndk';

export const setMuteList = (muteList: NDKEvent, set) => {
    set((state) => {
        if (state.muteListEvent && state.muteListEvent.created_at >= muteList.created_at) {
            return state;
        }

        const pubkeys = new Set(muteList.tags.filter((tag) => tag[0] === 'p' && !!tag[1]).map((tag) => tag[1]));
        return { muteList: pubkeys, muteListEvent: NDKList.from(muteList) };
    });
}; 