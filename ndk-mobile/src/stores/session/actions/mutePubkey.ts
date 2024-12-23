import { Hexpubkey, NDKList, NDKKind } from '@nostr-dev-kit/ndk';

export const mutePubkey = (pubkey: Hexpubkey, set) => {
    set((state) => {
        const muteList = new Set(state.muteList);
        let muteListEvent: NDKList;
        console.log('muting user', pubkey);

        if (state.muteListEvent) {
            muteListEvent = NDKList.from(state.muteListEvent);
        } else {
            muteListEvent = new NDKList(state.ndk);
            muteListEvent.kind = NDKKind.MuteList;
        }

        muteList.add(pubkey);
        muteListEvent.tags.push(['p', pubkey]);
        muteListEvent.publishReplaceable();

        return { muteList };
    });
}; 