import type { NostrEvent } from "..";
import { NDKEvent } from "..";
import { NDKKind } from ".";
import type { NDK } from "../../ndk";
import type { NDKRelayUrl } from "../../relay";

const READ_MARKER = "read";
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
        return this.getMatchingTags("r")
            .filter((tag) => !tag[2] || (tag[2] && tag[2] === READ_MARKER))
            .map((tag) => tag[1]);
    }

    set readRelayUrls(relays: NDKRelayUrl[]) {
        for (const relay of relays) {
            this.tags.push(["r", relay, READ_MARKER]);
        }
    }

    get writeRelayUrls(): NDKRelayUrl[] {
        return this.getMatchingTags("r")
            .filter((tag) => !tag[2] || (tag[2] && tag[2] === WRITE_MARKER))
            .map((tag) => tag[1]);
    }

    set writeRelayUrls(relays: NDKRelayUrl[]) {
        for (const relay of relays) {
            this.tags.push(["r", relay, WRITE_MARKER]);
        }
    }

    get bothRelayUrls(): NDKRelayUrl[] {
        return this.getMatchingTags("r")
            .filter((tag) => !tag[2])
            .map((tag) => tag[1]);
    }

    set bothRelayUrls(relays: NDKRelayUrl[]) {
        for (const relay of relays) {
            this.tags.push(["r", relay]);
        }
    }
}
