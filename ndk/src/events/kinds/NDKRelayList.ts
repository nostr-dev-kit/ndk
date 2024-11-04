import { NDKKind } from "./index.js";
import type { NostrEvent } from "../index.js";
import { NDKEvent } from "../index.js";
import type { NDK } from "../../ndk/index.js";
import { NDKRelaySet } from "../../relay/sets/index.js";
import { normalizeRelayUrl, tryNormalizeRelayUrl } from "../../utils/normalize-url.js";

const READ_MARKER = "read";
const WRITE_MARKER = "write";

/**
 * Represents a relay list for a user, ideally coming from a NIP-65 kind:10002 or alternatively from a kind:3 event's content.
 * @group Kind Wrapper
 */
export class NDKRelayList extends NDKEvent {
    constructor(ndk?: NDK, rawEvent?: NostrEvent) {
        super(ndk, rawEvent);
        this.kind ??= NDKKind.RelayList;
    }

    static from(ndkEvent: NDKEvent): NDKRelayList {
        return new NDKRelayList(ndkEvent.ndk, ndkEvent.rawEvent());
    }

    get readRelayUrls(): WebSocket["url"][] {
        return this.tags
            .filter((tag) => tag[0] === "r" || tag[0] === "relay")
            .filter((tag) => !tag[2] || (tag[2] && tag[2] === READ_MARKER))
            .map((tag) => tryNormalizeRelayUrl(tag[1]))
            .filter((url) => !!url) as WebSocket["url"][];
    }

    set readRelayUrls(relays: WebSocket["url"][]) {
        for (const relay of relays) {
            this.tags.push(["r", relay, READ_MARKER]);
        }
    }

    get writeRelayUrls(): WebSocket["url"][] {
        return this.tags
            .filter((tag) => tag[0] === "r" || tag[0] === "relay")
            .filter((tag) => !tag[2] || (tag[2] && tag[2] === WRITE_MARKER))
            .map((tag) => tryNormalizeRelayUrl(tag[1]))
            .filter((url) => !!url) as WebSocket["url"][];
    }

    set writeRelayUrls(relays: WebSocket["url"][]) {
        for (const relay of relays) {
            this.tags.push(["r", relay, WRITE_MARKER]);
        }
    }

    get bothRelayUrls(): WebSocket["url"][] {
        return this.tags
            .filter((tag) => tag[0] === "r" || tag[0] === "relay")
            .filter((tag) => !tag[2])
            .map((tag) => tag[1]);
    }
    set bothRelayUrls(relays: WebSocket["url"][]) {
        for (const relay of relays) {
            this.tags.push(["r", relay]);
        }
    }

    get relays(): WebSocket["url"][] {
        return this.tags.filter((tag) => tag[0] === "r" || tag[0] === "relay").map((tag) => tag[1]);
    }

    /**
     * Provides a relaySet for the relays in this list.
     */
    get relaySet(): NDKRelaySet {
        if (!this.ndk) throw new Error("NDKRelayList has no NDK instance");

        return new NDKRelaySet(
            new Set(this.relays.map((u) => this.ndk!.pool.getRelay(u))),
            this.ndk
        );
    }
}

export function relayListFromKind3(ndk: NDK, contactList: NDKEvent): NDKRelayList | undefined {
    try {
        const content = JSON.parse(contactList.content);
        const relayList = new NDKRelayList(ndk);
        const readRelays = new Set<string>();
        const writeRelays = new Set<string>();

        for (let [key, config] of Object.entries(content)) {
            try {
                key = normalizeRelayUrl(key);
            } catch {
                continue;
            }

            if (!config) {
                readRelays.add(key);
                writeRelays.add(key);
            } else {
                const relayConfig: { read?: boolean; write?: boolean } = config;
                if (relayConfig.write) writeRelays.add(key);
                if (relayConfig.read) readRelays.add(key);
            }
        }

        relayList.readRelayUrls = Array.from(readRelays);
        relayList.writeRelayUrls = Array.from(writeRelays);

        return relayList;
    } catch {
        /* */
    }

    return undefined;
}
