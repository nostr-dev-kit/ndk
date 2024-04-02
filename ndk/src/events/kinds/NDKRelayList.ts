import { NDKKind } from "./index.js";
import type { NostrEvent } from "../index.js";
import { NDKEvent } from "../index.js";
import type { NDK } from "../../ndk/index.js";
import type { NDKRelay } from "../../relay/index.js";
import type { Hexpubkey } from "../../user/index.js";
import { NDKRelaySet } from "../../relay/sets/index.js";
import { normalizeRelayUrl } from "../../utils/normalize-url.js";

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

    static async forUser(pubkey: Hexpubkey, ndk: NDK): Promise<NDKRelayList | undefined> {
        // call forUsers with a single pubkey
        const result = await this.forUsers([pubkey], ndk);
        return result.get(pubkey);
    }

    /**
     * Gathers a set of relay list events for a given set of users.
     * @returns A map of pubkeys to relay list.
     */
    static async forUsers(pubkeys: Hexpubkey[], ndk: NDK): Promise<Map<Hexpubkey, NDKRelayList>> {
        const pool = ndk.outboxPool || ndk.pool;
        const set = new Set<NDKRelay>();

        for (const relay of pool.relays.values()) set.add(relay);

        const relayLists = new Map<Hexpubkey, NDKRelayList>();
        const fromContactList = new Map<Hexpubkey, NDKRelayList>();

        const relaySet = new NDKRelaySet(set, ndk);

        await Promise.all([
            // Fetch all kind 10002 events
            new Promise<void>(async (resolve) => {
                const lists = await ndk.fetchEvents(
                    { kinds: [10002], authors: pubkeys },
                    { closeOnEose: true, pool, groupable: false },
                    relaySet
                );

                for (const relayList of lists) {
                    relayLists.set(relayList.pubkey, NDKRelayList.from(relayList));
                }

                resolve();
            }),

            // Also fetch all kind 3 events
            new Promise<void>(async (resolve) => {
                const lists = await ndk.fetchEvents(
                    { kinds: [3], authors: pubkeys },
                    { closeOnEose: true, pool, groupable: false },
                    relaySet
                );

                for (const relayList of lists) {
                    const list = relayListFromKind3(ndk, relayList);
                    if (list) fromContactList.set(relayList.pubkey, list);
                }

                resolve();
            }),
        ]);

        const result = new Map<Hexpubkey, NDKRelayList>();

        // Merge the results, kind 10002 takes priority
        for (const pubkey of pubkeys) {
            const relayList = relayLists.get(pubkey) ?? fromContactList.get(pubkey);
            if (relayList) result.set(pubkey, relayList);
        }

        return result;
    }

    get readRelayUrls(): WebSocket["url"][] {
        return this.tags
            .filter((tag) => tag[0] === "r" || tag[0] === "relay")
            .filter((tag) => !tag[2] || (tag[2] && tag[2] === READ_MARKER))
            .map((tag) => tag[1]);
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
            .map((tag) => tag[1]);
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
}

function relayListFromKind3(ndk: NDK, contactList: NDKEvent): NDKRelayList | undefined {
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
