import { Hexpubkey, NDKList, NDKKind, NDKEvent } from '@nostr-dev-kit/ndk';
import { SessionState } from '../types.js';

type MuteType = 'pubkey' | 'hashtag' | 'word' | 'thread';

export const mute = (value: string | NDKEvent, type: MuteType, publish: boolean, set) => {
    set((state: SessionState) => {
        let muteListEvent: NDKList;

        if (state.muteListEvent) {
            muteListEvent = NDKList.from(state.muteListEvent);
        } else {
            muteListEvent = new NDKList(state.ndk);
            muteListEvent.kind = NDKKind.MuteList;
        }

        let addPromise: Promise<void>;
        let retVal: Partial<SessionState>;

        switch (type) {
            case 'pubkey': {
                const list = new Set(state.mutedPubkeys);
                list.add(value as string);
                addPromise = muteListEvent.addItem(['p', value as string]);
                retVal = { mutedPubkeys: list };
                break;
            }
            case 'hashtag': {
                const list = new Set(state.mutedHashtags);
                list.add(value as string);
                addPromise = muteListEvent.addItem(['t', value as string]);
                retVal = { mutedHashtags: list };
                break;
            }
            case 'word': {
                const list = new Set(state.mutedWords);
                list.add(value as string);
                addPromise = muteListEvent.addItem(['word', value as string]);
                retVal = { mutedWords: list };
                break;
            }
            case 'thread': {
                const list = new Set(state.mutedEventIds);
                list.add((value as NDKEvent).id);
                addPromise = muteListEvent.addItem(['e', value as string]);
                retVal = { mutedEventIds: list };
                break;
            }
        }

        if (publish) {
            addPromise.then(() => {
                console.log('published mute list', JSON.stringify(muteListEvent.rawEvent(), null, 2));
                muteListEvent.publishReplaceable();
            });
        }

        return retVal;
    });
}; 