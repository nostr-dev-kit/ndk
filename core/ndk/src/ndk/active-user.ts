import type { NDK } from "./index.js";
import type { NDKRelayList } from "../events/kinds/NDKRelayList.js";
import type { NDKUser } from "../user/index.js";
import createDebug from "debug";
import type { NDKFilter } from "../subscription/index.js";
import { NDKKind } from "../events/kinds/index.js";
import type { NDKEvent } from "../events/index.js";
import NDKList from "../events/kinds/lists/index.js";
import { NDKRelay } from "../relay/index.js";
import { getRelayListForUser } from "../utils/get-users-relay-list.js";

const debug = createDebug("ndk:active-user");

async function getUserRelayList(this: NDK, user: NDKUser): Promise<NDKRelayList | undefined> {
    if (!this.autoConnectUserRelays) return;

    const userRelays = await getRelayListForUser(user.pubkey, this);
    if (!userRelays) return;

    for (const url of userRelays.relays) {
        let relay = this.pool.relays.get(url);
        if (!relay) {
            relay = new NDKRelay(url, this.relayAuthDefaultPolicy, this);
            this.pool.addRelay(relay);
        }
    }

    return userRelays;
}

export async function setActiveUser(this: NDK, user: NDKUser) {
    const pool = this.outboxPool || this.pool;

    if (pool.connectedRelays.length > 0) {
        setActiveUserConnected.call(this, user);
    } else {
        pool.once("connect", () => {
            setActiveUserConnected.call(this, user);
        });
    }
}

async function setActiveUserConnected(this: NDK, user: NDKUser) {
    const userRelays = await getUserRelayList.call(this, user);

    const filters: NDKFilter[] = [
        {
            kinds: [NDKKind.BlockRelayList],
            authors: [user.pubkey],
        },
    ];

    if (this.autoFetchUserMutelist) {
        filters[0].kinds!.push(NDKKind.MuteList);
    }

    const relaySet = userRelays ? userRelays.relaySet : undefined;

    const sub = this.subscribe(
        filters,
        { subId: "active-user-settings", closeOnEose: true },
        relaySet,
        false
    );

    const events: Map<NDKKind, NDKEvent> = new Map();

    // Collect most recent version of these events
    sub.on("event", (event) => {
        const prevEvent = events.get(event.kind!);

        if (prevEvent && prevEvent.created_at! >= event.created_at!) return;
        events.set(event.kind!, event);
    });

    // Once we EOSE, process the events
    sub.on("eose", () => {
        for (const event of events.values()) {
            processEvent.call(this, event);
        }
    });

    sub.start();
}

async function processEvent(this: NDK, event: NDKEvent) {
    if (event.kind === NDKKind.BlockRelayList) {
        processBlockRelayList.call(this, event);
    } else if (event.kind === NDKKind.MuteList) {
        processMuteList.call(this, event);
    }
}

function processBlockRelayList(this: NDK, event: NDKEvent) {
    const list = NDKList.from(event);

    for (const item of list.items) {
        this.pool.blacklistRelayUrls.add(item[0]);
    }

    debug("Added %d relays to relay blacklist", list.items.length);
}

function processMuteList(this: NDK, muteList: NDKEvent) {
    const list = NDKList.from(muteList);

    for (const item of list.items) {
        this.mutedIds.set(item[1], item[0]);
    }

    debug("Added %d users to mute list", list.items.length);
}
