import type { NDKEvent } from "../../events/index.js";
import type { NDK } from "../../ndk/index.js";
import { normalizeRelayUrl } from "../../utils/normalize-url.js";
import { NDKRelay, NDKRelayStatus } from "../index.js";

export { calculateRelaySetFromEvent } from "./calculate.js";

export class NDKPublishError extends Error {
    public errors: Map<NDKRelay, Error>;
    public publishedToRelays;

    /**
     * Intended relay set where the publishing was intended to happen.
     */
    public intendedRelaySet?: NDKRelaySet;

    public constructor(
        message: string,
        errors: Map<NDKRelay, Error>,
        publishedToRelays: Set<NDKRelay>,
        intendedRelaySet?: NDKRelaySet
    ) {
        super(message);
        this.errors = errors;
        this.publishedToRelays = publishedToRelays;
        this.intendedRelaySet = intendedRelaySet;
    }

    get relayErrors(): string {
        const errors: string[] = [];

        for (const [relay, err] of this.errors) {
            errors.push(`${relay.url}: ${err}`);
        }

        return errors.join("\n");
    }
}

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

    get relayUrls(): WebSocket["url"][] {
        return Array.from(this.relays).map((r) => r.url);
    }

    /**
     * Creates a relay set from a list of relay URLs.
     *
     * If no connection to the relay is found in the pool it will temporarily
     * connect to it.
     *
     * @param relayUrls - list of relay URLs to include in this set
     * @param ndk
     * @param connect - whether to connect to the relay immediately if it was already in the pool but not connected
     * @returns NDKRelaySet
     */
    static fromRelayUrls(relayUrls: string[], ndk: NDK, connect = true): NDKRelaySet {
        const relays = new Set<NDKRelay>();
        for (const url of relayUrls) {
            const relay = ndk.pool.relays.get(normalizeRelayUrl(url));
            if (relay) {
                if (relay.status < NDKRelayStatus.CONNECTED && connect) {
                    relay.connect();
                }

                relays.add(relay);
            } else {
                const temporaryRelay = new NDKRelay(
                    normalizeRelayUrl(url),
                    ndk?.relayAuthDefaultPolicy,
                    ndk
                );
                ndk.pool.useTemporaryRelay(
                    temporaryRelay,
                    undefined,
                    "requested from fromRelayUrls " + relayUrls
                );
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
     * @throws NDKPublishError if no relay was able to receive the event
     * @example
     * ```typescript
     * const event = new NDKEvent(ndk, {kinds: [NDKKind.Message], "#d": ["123"]});
     * try {
     *    const publishedToRelays = await relaySet.publish(event);
     *    console.log(`published to ${publishedToRelays.size} relays`)
     * } catch (error) {
     *   console.error("error publishing to relays", error);
     *
     *   if (error instanceof NDKPublishError) {
     *      for (const [relay, err] of error.errors) {
     *         console.error(`error publishing to relay ${relay.url}`, err);
     *       }
     *   }
     * }
     * ```
     */
    public async publish(
        event: NDKEvent,
        timeoutMs?: number,
        requiredRelayCount: number = 1
    ): Promise<Set<NDKRelay>> {
        const publishedToRelays: Set<NDKRelay> = new Set();
        const errors: Map<NDKRelay, Error> = new Map();
        const isEphemeral = event.isEphemeral();

        event.publishStatus = "pending";

        // go through each relay and publish the event
        const promises: Promise<void>[] = Array.from(this.relays).map((relay: NDKRelay) => {
            return new Promise<void>((resolve) => {
                relay
                    .publish(event, timeoutMs)
                    .then((e) => {
                        publishedToRelays.add(relay);
                        resolve();
                    })
                    .catch((err) => {
                        if (!isEphemeral) {
                            errors.set(relay, err);
                        }
                        resolve();
                    });
            });
        });

        await Promise.all(promises);

        if (publishedToRelays.size < requiredRelayCount) {
            // Ephemeral events are not acknowledged by the relay, so we don't
            // throw an error if no relay was able to receive the event.
            if (!isEphemeral) {
                const error = new NDKPublishError(
                    "Not enough relays received the event",
                    errors,
                    publishedToRelays,
                    this
                );
                event.publishStatus = "error";
                event.publishError = error;

                this.ndk.emit("event:publish-failed", event, error, this.relayUrls);

                throw error;
            }
        } else {
            event.emit("published", { relaySet: this, publishedToRelays });
        }

        return publishedToRelays;
    }

    get size(): number {
        return this.relays.size;
    }
}
