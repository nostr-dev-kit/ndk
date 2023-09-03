import { NDKKind } from ".";
import { NDKEvent, NostrEvent } from "..";
import { NDK } from "../../ndk";
import { NDKRelayUrl } from "../../relay";

const READ_MARKER = 'read';
const WRITE_MARKER = "write";

export class NDKRelayList extends NDKEvent {
    public relays: Set<NDKRelayUrl> = new Set();

    constructor(ndk?: NDK, rawEvent?: NostrEvent) {
        super(ndk, rawEvent);
        this.kind ??= NDKKind.RelayList;
    }

    static from(ndkEvent: NDKEvent): NDKRelayList {
        return new NDKRelayList(ndkEvent.ndk, ndkEvent.rawEvent());
    }

    get readRelayUrls(): NDKRelayUrl[] {
        const relays = new Set<NDKRelayUrl>();

        for (const tag of this.getMatchingTags("r")) {
            if (tag[2] && tag[2] === READ_MARKER) {
                relays.add(tag[1]);
            }
        }

        return Array.from(relays);
    }

    get writeRelayUrls(): NDKRelayUrl[] {
        const relays = new Set<NDKRelayUrl>();

        for (const tag of this.getMatchingTags("r")) {
            if (tag[2] && tag[2] === WRITE_MARKER) {
                relays.add(tag[1]);
            }
        }

        return Array.from(relays);
    }
}