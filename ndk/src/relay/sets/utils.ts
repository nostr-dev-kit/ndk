import type { NDKPool } from "../../relay/pool/index.js";
import type { NDKRelaySet } from "../../relay/sets/index.js";

/**
 * If the provided relay set does not include connected relays in the pool
 * the relaySet will have the connected relays added to it.
 */
export function correctRelaySet(relaySet: NDKRelaySet, pool: NDKPool): NDKRelaySet {
    const connectedRelays = pool.connectedRelays();
    const includesConnectedRelay = Array.from(relaySet.relays).some((relay) => {
        return connectedRelays.map((r) => r.url).includes(relay.url);
    });

    if (!includesConnectedRelay) {
        // Add connected relays to the relay set
        for (const relay of connectedRelays) {
            relaySet.addRelay(relay);
        }
    }

    // if connected relays is empty (such us when we're first starting, add all relays)
    if (connectedRelays.length === 0) {
        for (const relay of pool.relays.values()) {
            relaySet.addRelay(relay);
        }
    }

    return relaySet;
}
