import type { NDKAggregatedCountResult, NDKCountOptions, NDKCountResult } from "../../count/index.js";
import { NDKCountHll } from "../../count/index.js";
import type { NDKEvent } from "../../events/index.js";
import type { NDK } from "../../ndk/index.js";
import type { NDKFilter } from "../../subscription/index.js";
import { normalizeRelayUrl } from "../../utils/normalize-url.js";
import { NDKRelay, NDKRelayStatus } from "../index.js";
import type { NDKPool } from "../pool/index.js";

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
        intendedRelaySet?: NDKRelaySet,
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
    private pool: NDKPool;

    public constructor(relays: Set<NDKRelay>, ndk: NDK, pool?: NDKPool) {
        this.relays = relays;
        this.ndk = ndk;
        this.pool = pool ?? ndk.pool;
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
    static fromRelayUrls(relayUrls: readonly string[], ndk: NDK, connect = true, pool?: NDKPool): NDKRelaySet {
        pool = pool ?? ndk.pool;

        if (!pool) throw new Error("No pool provided");

        const relays = new Set<NDKRelay>();
        for (const url of relayUrls) {
            const relay = pool.relays.get(normalizeRelayUrl(url));
            if (relay) {
                if (relay.status < NDKRelayStatus.CONNECTED && connect) {
                    relay.connect();
                }

                relays.add(relay);
            } else {
                const temporaryRelay = new NDKRelay(normalizeRelayUrl(url), ndk?.relayAuthDefaultPolicy, ndk);
                pool.useTemporaryRelay(temporaryRelay, undefined, `requested from fromRelayUrls ${relayUrls}`);
                relays.add(temporaryRelay);
            }
        }

        return new NDKRelaySet(new Set(relays), ndk, pool);
    }

    /**
     * Publish an event to all relays in this relay set.
     *
     * This method implements a robust mechanism for publishing events to multiple relays with
     * built-in handling for race conditions, timeouts, and partial failures. The implementation
     * uses a dual-tracking mechanism to ensure accurate reporting of which relays successfully
     * received an event.
     *
     * Key aspects of this implementation:
     *
     * 1. DUAL-TRACKING MECHANISM:
     *    - Promise-based tracking: Records successes/failures from the promises returned by relay.publish()
     *    - Event-based tracking: Listens for 'relay:published' events that indicate successful publishing
     *    This approach ensures we don't miss successful publishes even if there are subsequent errors in
     *    the promise chain.
     *
     * 2. RACE CONDITION HANDLING:
     *    - If a relay emits a success event but later fails in the promise chain, we still count it as a success
     *    - If a relay times out after successfully publishing, we still count it as a success
     *    - All relay operations happen in parallel, with proper tracking regardless of completion order
     *
     * 3. TIMEOUT MANAGEMENT:
     *    - Individual timeouts for each relay operation
     *    - Proper cleanup of timeouts to prevent memory leaks
     *    - Clear timeout error reporting
     *
     * 4. ERROR HANDLING:
     *    - Detailed tracking of specific errors for each failed relay
     *    - Special handling for ephemeral events (which don't expect acknowledgement)
     *    - RequiredRelayCount parameter to control the minimum success threshold
     *
     * @param event Event to publish
     * @param timeoutMs Timeout in milliseconds for each relay publish operation
     * @param requiredRelayCount The minimum number of relays we expect the event to be published to
     * @returns A set of relays the event was published to
     * @throws {NDKPublishError} If the event could not be published to at least `requiredRelayCount` relays
     * @example
     * ```typescript
     * const relaySet = new NDKRelaySet(new Set([relay1, relay2]), ndk);
     * const publishedToRelays = await relaySet.publish(event);
     * // publishedToRelays can contain relay1, relay2, both, or none
     * // depending on which relays the event was successfully published to
     * if (publishedToRelays.size > 0) {
     *   console.log("Event published to at least one relay");
     * }
     * ```
     */
    public async publish(event: NDKEvent, timeoutMs?: number, requiredRelayCount = 1): Promise<Set<NDKRelay>> {
        // Set to track relays that successfully received the event.
        // This set is populated both by promise resolutions and by relay:published events
        // We use a Set data structure to ensure each relay is only counted once
        // even if multiple success signals are received from the same relay
        const publishedToRelays: Set<NDKRelay> = new Set();

        // Map to track errors from relays that failed to publish the event
        // This maintains a per-relay record of specific error messages
        // which is valuable for debugging and error reporting
        const errors: Map<NDKRelay, Error> = new Map();

        // Ephemeral events (like NIP-15 Events with Expiration Time) are treated differently
        // because they don't expect acknowledgement from relays
        // NIP-16 defines ephemeral events as ones with kinds from 20000 to 29999
        const isEphemeral = event.isEphemeral();

        // Set the event status to pending at the start of the publish process
        // This status will be updated to either 'success' or 'error' by the end
        // and can be used by consumers to track the publish state
        event.publishStatus = "pending";

        // FIRST TRACKING MECHANISM: EVENT-BASED TRACKING
        // Set up an event listener to track successes that might not be caught by promises
        // This is critical for handling race conditions where an event is published successfully
        // but the promise chain encounters an error afterward
        // This mechanism relies on the fact that NDKRelay instances emit 'published' events
        // when they successfully send an event to a relay
        const relayPublishedHandler = (relay: NDKRelay) => {
            // When a relay emits a success event, we register it regardless of
            // what happens with the corresponding promise
            publishedToRelays.add(relay);
        };

        // Register the event listener
        // The 'relay:published' event is emitted by the event when a relay successfully
        // publishes it. This provides an additional signal path beyond promises.
        event.on("relay:published", relayPublishedHandler);

        try {
            // SECOND TRACKING MECHANISM: PROMISE-BASED TRACKING
            // Create a promise for each relay to track its publishing status
            // Each promise will resolve to a boolean indicating success or failure
            const promises: Promise<boolean>[] = Array.from(this.relays).map((relay: NDKRelay) => {
                // Create a new promise for each relay that wraps the publish operation
                // This allows us to handle timeouts and errors in a controlled way
                return new Promise<boolean>((resolve) => {
                    // Create a timeout if a timeout duration was specified
                    // This controls how long to wait for each individual relay
                    // Note: This is a per-relay timeout, not a global timeout for the entire operation
                    const timeoutId = timeoutMs
                        ? setTimeout(() => {
                              // Only timeout if we haven't already recorded this relay as successful
                              // (prevents race conditions with event-based tracking)
                              // This is crucial: if the relay already succeeded through the event mechanism,
                              // we don't want to incorrectly mark it as timed out
                              if (!publishedToRelays.has(relay)) {
                                  // Record the specific timeout error for this relay
                                  errors.set(relay, new Error(`Publish timeout after ${timeoutMs}ms`));
                                  // Signal that this relay's publish operation has failed
                                  resolve(false);
                              }
                          }, timeoutMs)
                        : null;

                    // Attempt to publish to this relay
                    // The relay.publish method sends the event to the relay and returns a promise
                    // that resolves to true if the relay acknowledges receipt of the event
                    relay
                        .publish(event, timeoutMs)
                        .then((success) => {
                            // Clear the timeout to prevent memory leaks
                            // This is important to ensure we don't have dangling timeouts
                            // if the relay responds before the timeout period
                            if (timeoutId) clearTimeout(timeoutId);

                            if (success) {
                                // Record successful publish in our tracking set
                                // Note: The relay might already be in the set if it emitted a success event
                                // but the Set data structure ensures it's only counted once
                                publishedToRelays.add(relay);
                                resolve(true);
                            } else {
                                // The relay explicitly returned false, indicating it rejected the event
                                // but didn't throw an exception
                                resolve(false);
                            }
                        })
                        .catch((err) => {
                            // Clear the timeout to prevent memory leaks
                            if (timeoutId) clearTimeout(timeoutId);

                            // Record the error for non-ephemeral events
                            // We don't track errors for ephemeral events since they don't expect
                            // acknowledgement from relays
                            if (!isEphemeral) {
                                errors.set(relay, err);
                            }
                            // Signal that this relay's publish operation has failed
                            resolve(false);
                        });
                });
            });

            // Wait for all relay operations to complete (success or failure)
            // This ensures we don't return or throw until every relay has either succeeded,
            // failed, or timed out
            await Promise.all(promises);

            // Determine if we met the required success threshold
            // The requiredRelayCount parameter allows the caller to specify a minimum number
            // of relays that must successfully receive the event
            if (publishedToRelays.size < requiredRelayCount) {
                // Special handling for ephemeral events which don't expect acknowledgement
                // For ephemeral events, we don't throw even if no relay received it
                if (!isEphemeral) {
                    // Construct a detailed error with information about which relays failed and why
                    // The NDKPublishError class provides a structured way to report not just that
                    // publishing failed, but specifically which relays failed and which succeeded
                    const error = new NDKPublishError(
                        "Not enough relays received the event (" +
                            publishedToRelays.size +
                            " published, " +
                            requiredRelayCount +
                            " required)",
                        errors,
                        publishedToRelays,
                        this,
                    );

                    // Update the event status to reflect the failure
                    // This allows consumers to check event.publishStatus to determine if an event was
                    // successfully published
                    event.publishStatus = "error";
                    event.publishError = error;

                    // Emit an event to notify listeners of the failure
                    // This allows application code to react to publish failures globally
                    this.ndk?.emit("event:publish-failed", event, error, this.relayUrls);

                    // Propagate the error to the caller
                    // This allows the caller to catch and handle the error if desired
                    throw error;
                }
                // For ephemeral events, we continue without throwing an error
                // even if we didn't reach the required relay count
            } else {
                // Update the event status to reflect success
                // This allows consumers to check event.publishStatus to determine if an event was
                // successfully published
                event.publishStatus = "success";

                // Emit an event to notify listeners of the successful publish
                // This allows application code to react to successful publishes
                event.emit("published", { relaySet: this, publishedToRelays });
            }

            // Return the set of relays that successfully received the event
            // This allows the caller to know exactly which relays received the event,
            // which can be important for application logic
            return publishedToRelays;
        } finally {
            // Clean up the event listener to prevent memory leaks
            // This is critical for long-running applications
            // The finally block ensures this cleanup happens regardless of success or failure
            // preventing zombie event listeners that could cause memory leaks and unexpected behavior
            event.off("relay:published", relayPublishedHandler);
        }
    }

    get size(): number {
        return this.relays.size;
    }

    /**
     * Counts events matching the given filters across all relays in this set.
     *
     * This method implements NIP-45 COUNT with HyperLogLog (HLL) support for
     * accurate cardinality estimation across multiple relays.
     *
     * When relays return HLL data, the counts are merged using the HLL algorithm
     * to avoid double-counting events that appear on multiple relays.
     *
     * @param filters - The filters to count events for
     * @param opts - Optional count options (timeout, custom id)
     * @returns An aggregated count result with the best estimate and per-relay results
     *
     * @example
     * ```typescript
     * const relaySet = new NDKRelaySet(new Set([relay1, relay2]), ndk);
     * const result = await relaySet.count([{ kinds: [1], authors: [pubkey] }]);
     * console.log(`Estimated unique count: ${result.count}`);
     * console.log(`Relay 1 reported: ${result.relayResults.get(relay1.url)?.count}`);
     * ```
     */
    public async count(
        filters: NDKFilter | NDKFilter[],
        opts: NDKCountOptions = {},
    ): Promise<NDKAggregatedCountResult> {
        const timeout = opts.timeout ?? 5000;
        const filtersArray = Array.isArray(filters) ? filters : [filters];

        // Track results from each relay
        const relayResults = new Map<string, NDKCountResult>();
        const hlls: NDKCountHll[] = [];

        // Create promises for each relay
        const promises: Promise<void>[] = Array.from(this.relays).map(async (relay) => {
            // Skip relays that aren't connected
            if (relay.status < NDKRelayStatus.CONNECTED) {
                return;
            }

            try {
                // Create a timeout promise
                const timeoutPromise = new Promise<never>((_, reject) => {
                    setTimeout(() => reject(new Error(`Count timeout after ${timeout}ms`)), timeout);
                });

                // Race the count against the timeout
                const result = await Promise.race([
                    relay.connectivity.count(filtersArray, { id: opts.id }),
                    timeoutPromise,
                ]);

                relayResults.set(relay.url, result);
                if (result.hll) {
                    hlls.push(result.hll);
                }
            } catch (error) {
                this.debug(`Count failed for relay ${relay.url}:`, error);
            }
        });

        // Wait for all relays to respond (or timeout)
        await Promise.allSettled(promises);

        // Compute the best estimate
        let count: number;
        let mergedHll: NDKCountHll | undefined;

        if (hlls.length > 0) {
            // If we have HLL data, merge it and estimate
            mergedHll = NDKCountHll.merge(hlls);
            count = mergedHll.estimate();
        } else {
            // Fall back to maximum count from all relays
            count = 0;
            for (const result of relayResults.values()) {
                count = Math.max(count, result.count);
            }
        }

        return {
            count,
            mergedHll,
            relayResults,
        };
    }
}
