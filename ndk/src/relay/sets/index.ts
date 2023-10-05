import type { NDKEvent } from "../../events/index.js";
import type { NDK } from "../../ndk/index.js";
import { NDKRelay } from "../index.js";

/**
 * A relay set is a group of relays. This grouping can be short-living, for a single
 * REQ or can be long-lasting, for example for the explicit relay list the user
 * has specified.
 *
 * Requests to relays should be sent through this interface.
 */
export class NDKRelaySet {
    readonly relays: Set<NDKRelay>;
    private debug: debug.Debugger;
    private ndk: NDK;

    public constructor(relays: Set<NDKRelay>, ndk: NDK) {
        this.relays = relays;
        this.ndk = ndk;
        this.debug = ndk.debug.extend("relayset");
    }

    /**
     * Adds a relay to this set.
     */
    public addRelay(relay: NDKRelay) {
        this.relays.add(relay);
    }

    /**
     * Creates a relay set from a list of relay URLs.
     *
     * If no connection to the relay is found in the pool it will temporarily
     * connect to it.
     *
     * @param relayUrls - list of relay URLs to include in this set
     * @param ndk
     * @returns NDKRelaySet
     */
    static fromRelayUrls(relayUrls: string[], ndk: NDK): NDKRelaySet {
        const relays = new Set<NDKRelay>();
        for (const url of relayUrls) {
            const relay = ndk.pool.relays.get(url);
            if (relay) {
                relays.add(relay);
            } else {
                const temporaryRelay = new NDKRelay(url);
                ndk.pool.useTemporaryRelay(temporaryRelay);
                relays.add(temporaryRelay);
            }
        }

        return new NDKRelaySet(new Set(relays), ndk);
    }

    /**
     * Publish an event to all relays in this set. Returns the number of relays that have received the event.
     * @param event
     * @param timeoutMs - timeout in milliseconds for each publish operation and connection operation
     * @returns A set where the event was successfully published to
     */
    public async publish(event: NDKEvent, timeoutMs?: number): Promise<Set<NDKRelay>> {
        const publishedToRelays: Set<NDKRelay> = new Set();
        const isEphemeral = event.isEphemeral();

        // go through each relay and publish the event
        const promises: Promise<void>[] = Array.from(this.relays).map((relay: NDKRelay) => {
            return new Promise<void>((resolve) => {
                relay
                    .publish(event, timeoutMs)
                    .then(() => {
                        publishedToRelays.add(relay);
                        resolve();
                    })
                    .catch((err) => {
                        this.debug("error publishing to relay", {
                            relay: relay.url,
                            err,
                        });
                        resolve();
                    });
            });
        });

        await Promise.all(promises);

        if (publishedToRelays.size === 0) {
            // Ephemeral events are not acknowledged by the relay, so we don't
            // throw an error if no relay was able to receive the event.
            if (!isEphemeral) {
                throw new Error("No relay was able to receive the event");
            }
        }

        return publishedToRelays;
    }

    public size(): number {
        return this.relays.size;
    }
}
