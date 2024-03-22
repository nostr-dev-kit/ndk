import { NDKKind } from ".";
import type { NostrEvent } from "..";
import { NDKEvent } from "../index.js";
import type { NDK } from "../../ndk";
import { NDKRelay } from "../../relay";
import { NDKUser } from "../../user";
import { NDKRelaySet } from "../../relay/sets";

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

    /**
     * Returns a set of relay list events for a user.
     * @returns {Promise<Set<NDKEvent>>} A set of NDKEvents returned for the given user.
     */
    static async forUser(user: NDKUser, ndk: NDK): Promise<NDKRelayList | undefined> {
        const pool = ndk.outboxPool || ndk.pool;
        const set = new Set<NDKRelay>();

        for (const relay of pool.relays.values()) set.add(relay);

        const relaySet = new NDKRelaySet(set, ndk);
        const event = await ndk.fetchEvent(
            {
                kinds: [10002],
                authors: [user.pubkey],
            },
            {
                closeOnEose: true,
                pool,
                groupable: true,
                subId: `relay-list-${user.pubkey.slice(0, 6)}`,
            },
            relaySet
        );

        if (event) return NDKRelayList.from(event);

        return await relayListFromKind3(user, ndk);
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

async function relayListFromKind3(user: NDKUser, ndk: NDK): Promise<NDKRelayList | undefined> {
    const followList = await ndk.fetchEvent({
        kinds: [3],
        authors: [user.pubkey],
    });
    if (followList) {
        try {
            const content = JSON.parse(followList.content);
            const relayList = new NDKRelayList(ndk);
            const readRelays = new Set<string>();
            const writeRelays = new Set<string>();

            for (const [key, config] of Object.entries(content)) {
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
        } catch (e) {
            // Don't do anything
        }
    }

    return undefined;
}
