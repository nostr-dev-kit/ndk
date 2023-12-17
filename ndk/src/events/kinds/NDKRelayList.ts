import { NDKKind } from ".";
import type { NostrEvent } from "..";
import { NDKEvent } from "..";
import type { NDK } from "../../ndk";

const READ_MARKER = "read";
const WRITE_MARKER = "write";

export class NDKRelayList extends NDKEvent {
    constructor(ndk?: NDK, rawEvent?: NostrEvent) {
        super(ndk, rawEvent);
        this.kind ??= NDKKind.RelayList;
    }

    static from(ndkEvent: NDKEvent): NDKRelayList {
        return new NDKRelayList(ndkEvent.ndk, ndkEvent.rawEvent());
    }

    get readRelayUrls(): WebSocket["url"][] {
        return this.getMatchingTags("r")
            .filter((tag) => !tag[2] || (tag[2] && tag[2] === READ_MARKER))
            .map((tag) => tag[1]);
    }

    set readRelayUrls(relays: WebSocket["url"][]) {
        for (const relay of relays) {
            this.tags.push(["r", relay, READ_MARKER]);
        }
    }

    get writeRelayUrls(): WebSocket["url"][] {
        return this.getMatchingTags("r")
            .filter((tag) => !tag[2] || (tag[2] && tag[2] === WRITE_MARKER))
            .map((tag) => tag[1]);
    }

    set writeRelayUrls(relays: WebSocket["url"][]) {
        for (const relay of relays) {
            this.tags.push(["r", relay, WRITE_MARKER]);
        }
    }

    get bothRelayUrls(): WebSocket["url"][] {
        return this.getMatchingTags("r")
            .filter((tag) => !tag[2])
            .map((tag) => tag[1]);
    }
    set bothRelayUrls(relays: WebSocket["url"][]) {
        for (const relay of relays) {
            this.tags.push(["r", relay]);
        }
    }

    get relays(): WebSocket["url"][] {
        return this.getMatchingTags("r").map((tag) => tag[1]);
    }
}
