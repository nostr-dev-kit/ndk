import createDebug from "debug";
import type { NDKRelayList } from "../events/kinds/relay-list.js";
import { NDKRelay } from "../relay/index.js";
import type { NDKUser } from "../user/index.js";
import { getRelayListForUser } from "../utils/get-users-relay-list.js";
import type { NDK } from "./index.js";

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

    debug("Connected to %d user relays", userRelays.relays.length);
    return userRelays;
}

export async function setActiveUser(this: NDK, user: NDKUser) {
    // Only connect to user's relays if autoConnectUserRelays is true
    if (!this.autoConnectUserRelays) return;

    const pool = this.outboxPool || this.pool;

    if (pool.connectedRelays.length > 0) {
        await getUserRelayList.call(this, user);
    } else {
        pool.once("connect", async () => {
            await getUserRelayList.call(this, user);
        });
    }
}
