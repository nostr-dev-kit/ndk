import { NDKKind } from ".";
import type { NostrEvent } from "..";
import { NDKEvent } from "../index.js";
import type { NDK } from "../../ndk";
import { NDKRelay } from "../../relay";
import { Hexpubkey, NDKUser } from "../../user";
import { NDKRelaySet } from "../../relay/sets";
import { write } from "fs";
import { normalizeRelayUrl } from "../../utils/normalize-url";

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
        ]);

        const result = new Map<Hexpubkey, NDKRelayList>();

        // merge the two lists giving priority to the relay list
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
            this.tags.push(["relay", relay, READ_MARKER]);
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
            this.tags.push(["relay", relay, WRITE_MARKER]);
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
            this.tags.push(["relay", relay]);
        }
    }

    get relays(): WebSocket["url"][] {
        return this.tags.filter((tag) => tag[0] === "r" || tag[0] === "relay").map((tag) => tag[1]);
    }
}

async function relayListFromKind3(
    pubkey: Hexpubkey,
    ndk: NDK,
    contactList?: NDKEvent | null
): Promise<NDKRelayList | undefined> {
    contactList ??= await ndk.fetchEvent({
        kinds: [3],
        authors: [pubkey],
    });

    if (contactList) {
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

            if (writeRelays.size === 0) {
                console.error("No write relays found for user", `https://njump.me/p/${pubkey}`);
            }

            relayList.readRelayUrls = Array.from(readRelays);
            relayList.writeRelayUrls = Array.from(writeRelays);

            return relayList;
        } catch (e) {
            // Don't do anything
        }
    } else {
        console.error("No contact list found for user", pubkey);
    }

    return undefined;
}
