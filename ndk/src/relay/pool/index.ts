import type debug from "debug";
import { EventEmitter } from "tseep";

import type { NDK } from "../../ndk/index.js";
import { NDKRelay, NDKRelayStatus } from "../index.js";
import type { NDKFilter } from "../../subscription/index.js";
import { normalizeRelayUrl } from "../../utils/normalize-url.js";

export type NDKPoolStats = {
    total: number;
    connected: number;
    disconnected: number;
    connecting: number;
};

/**
 * Handles connections to all relays. A single pool should be used per NDK instance.
 *
 * @emit connecting - Emitted when a relay in the pool is connecting.
 * @emit connect - Emitted when all relays in the pool are connected, or when the specified timeout has elapsed, and some relays are connected.
 * @emit notice - Emitted when a relay in the pool sends a notice.
 * @emit flapping - Emitted when a relay in the pool is flapping.
 * @emit relay:connect - Emitted when a relay in the pool connects.
 * @emit relay:ready - Emitted when a relay in the pool is ready to serve requests.
 * @emit relay:disconnect - Emitted when a relay in the pool disconnects.
 */
export class NDKPool extends EventEmitter<{
    notice: (relay: NDKRelay, notice: string) => void;
    flapping: (relay: NDKRelay) => void;
    connect: () => void;

    "relay:connecting": (relay: NDKRelay) => void;

    /**
     * Emitted when a relay in the pool connects.
     * @param relay - The relay that connected.
     */
    "relay:connect": (relay: NDKRelay) => void;
    "relay:ready": (relay: NDKRelay) => void;
    "relay:disconnect": (relay: NDKRelay) => void;
    "relay:auth": (relay: NDKRelay, challenge: string) => void;
    "relay:authed": (relay: NDKRelay) => void;
}> {
    // TODO: This should probably be an LRU cache
    public relays = new Map<WebSocket["url"], NDKRelay>();
    public autoConnectRelays = new Set<WebSocket["url"]>();
    public blacklistRelayUrls: Set<WebSocket["url"]>;
    private debug: debug.Debugger;
    private temporaryRelayTimers = new Map<WebSocket["url"], NodeJS.Timeout>();
    private flappingRelays: Set<WebSocket["url"]> = new Set();
    // A map to store timeouts for each flapping relay.
    private backoffTimes: Map<string, number> = new Map();
    private ndk: NDK;

    public constructor(
        relayUrls: WebSocket["url"][] = [],
        blacklistedRelayUrls: WebSocket["url"][] = [],
        ndk: NDK,
        debug?: debug.Debugger
    ) {
        super();
        this.debug = debug ?? ndk.debug.extend("pool");
        this.ndk = ndk;

        for (const relayUrl of relayUrls) {
            const relay = new NDKRelay(relayUrl, undefined, this.ndk);
            this.addRelay(relay, false);
        }

        this.blacklistRelayUrls = new Set(blacklistedRelayUrls);
    }

    set name(name: string) {
        this.debug = this.debug.extend(name);
    }

    /**
     * Adds a relay to the pool, and sets a timer to remove it if it is not used within the specified time.
     * @param relay - The relay to add to the pool.
     * @param removeIfUnusedAfter - The time in milliseconds to wait before removing the relay from the pool after it is no longer used.
     */
    public useTemporaryRelay(
        relay: NDKRelay,
        removeIfUnusedAfter = 30000,
        filters?: NDKFilter[] | string
    ) {
        const relayAlreadyInPool = this.relays.has(relay.url);

        // check if the relay is already in the pool
        if (!relayAlreadyInPool) {
            this.addRelay(relay);
            this.debug("Adding temporary relay %s for filters %o", relay.url, filters);
        }

        // check if the relay already has a disconnecting timer
        const existingTimer = this.temporaryRelayTimers.get(relay.url);
        if (existingTimer) {
            clearTimeout(existingTimer);
        }

        // add a disconnecting timer only if the relay was not already in the pool
        // or if it had an existing timer
        // this prevents explicit relays from being removed from the pool
        if (!relayAlreadyInPool || existingTimer) {
            // set a timer to remove the relay from the pool if it is not used within the specified time
            const timer = setTimeout(() => {
                // check if this relay is in the explicit relays list, if it is, it was connected temporary first
                // and then made explicit, so we shouldn't disconnect
                if (this.ndk.explicitRelayUrls?.includes(relay.url)) return;

                this.removeRelay(relay.url);
            }, removeIfUnusedAfter) as unknown as NodeJS.Timeout;

            this.temporaryRelayTimers.set(relay.url, timer);
        }
    }

    /**
     * Adds a relay to the pool.
     *
     * @param relay - The relay to add to the pool.
     * @param connect - Whether or not to connect to the relay.
     */
    public addRelay(relay: NDKRelay, connect = true) {
        const isAlreadyInPool = this.relays.has(relay.url);
        const isBlacklisted = this.blacklistRelayUrls?.has(relay.url);
        const isCustomRelayUrl = relay.url.includes("/npub1");
        let reconnect = true;

        const relayUrl = relay.url;

        if (isAlreadyInPool) return;
        if (isBlacklisted) {
            this.debug(`Refusing to add relay ${relayUrl}: blacklisted`);
            return;
        }
        if (isCustomRelayUrl) {
            this.debug(`Refusing to add relay ${relayUrl}: is a filter relay`);
            return;
        }

        if (this.ndk.cacheAdapter?.getRelayStatus) {
            const info = this.ndk.cacheAdapter.getRelayStatus(relayUrl);

            // if we have info and the relay should not connect yet, set a delayed connect
            if (info && info.dontConnectBefore) {
                if (info.dontConnectBefore > Date.now()) {
                    const delay = info.dontConnectBefore - Date.now();
                    this.debug(`Refusing to add relay ${relayUrl}: delayed connect for ${delay}ms`);
                    setTimeout(() => {
                        this.addRelay(relay, connect);
                    }, delay);
                    return;
                } else {
                    reconnect = false;
                }
            }
        }

        const noticeHandler = (notice: string) => this.emit("notice", relay, notice);
        const connectHandler = () => this.handleRelayConnect(relayUrl);
        const readyHandler = () => this.handleRelayReady(relay);
        const disconnectHandler = () => this.emit("relay:disconnect", relay);
        const flappingHandler = () => this.handleFlapping(relay);
        const authHandler = (challenge: string) => this.emit("relay:auth", relay, challenge);
        const authedHandler = () => this.emit("relay:authed", relay);

        // make sure to remove the old handlers before adding new ones
        relay.off("notice", noticeHandler);
        relay.off("connect", connectHandler);
        relay.off("ready", readyHandler);
        relay.off("disconnect", disconnectHandler);
        relay.off("flapping", flappingHandler);
        relay.off("auth", authHandler);
        relay.off("authed", authedHandler);

        // add the handlers
        relay.on("notice", noticeHandler);
        relay.on("connect", connectHandler);
        relay.on("ready", readyHandler);
        relay.on("disconnect", disconnectHandler);
        relay.on("flapping", flappingHandler);
        relay.on("auth", authHandler);
        relay.on("authed", authedHandler);

        // Update the cache adapter with the new relay status
        relay.on("delayed-connect", (delay: number) => {
            if (this.ndk.cacheAdapter?.updateRelayStatus) {
                this.ndk.cacheAdapter.updateRelayStatus(relay.url, {
                    dontConnectBefore: Date.now() + delay,
                });
            }
        });
        this.relays.set(relayUrl, relay);
        if (connect) this.autoConnectRelays.add(relayUrl);

        if (connect) {
            this.emit("relay:connecting", relay);
            relay.connect(undefined, reconnect).catch((e) => {
                this.debug(`Failed to connect to relay ${relayUrl}`, e);
            });
        }
    }

    /**
     * Removes a relay from the pool.
     * @param relayUrl - The URL of the relay to remove.
     * @returns {boolean} True if the relay was removed, false if it was not found.
     */
    public removeRelay(relayUrl: string): boolean {
        const relay = this.relays.get(relayUrl);
        if (relay) {
            relay.disconnect();
            this.relays.delete(relayUrl);
            this.autoConnectRelays.delete(relayUrl);
            this.emit("relay:disconnect", relay);
            return true;
        }

        // remove the relay from the temporary relay timers
        const existingTimer = this.temporaryRelayTimers.get(relayUrl);
        if (existingTimer) {
            clearTimeout(existingTimer);
            this.temporaryRelayTimers.delete(relayUrl);
        }

        return false;
    }

    /**
     * Checks whether a relay is already connected in the pool.
     */
    public isRelayConnected(url: WebSocket["url"]) {
        const normalizedUrl = normalizeRelayUrl(url);
        const relay = this.relays.get(normalizedUrl);
        if (!relay) return false;

        return relay.status === NDKRelayStatus.CONNECTED;
    }

    /**
     * Fetches a relay from the pool, or creates a new one if it does not exist.
     *
     * New relays will be attempted to be connected.
     */
    public getRelay(
        url: WebSocket["url"],
        connect = true,
        temporary = false,
        filters?: NDKFilter[]
    ): NDKRelay {
        let relay = this.relays.get(normalizeRelayUrl(url));

        if (!relay) {
            relay = new NDKRelay(url, undefined, this.ndk);
            if (temporary) {
                this.useTemporaryRelay(relay, 30000, filters);
            } else {
                this.addRelay(relay, connect);
            }
        }

        return relay;
    }

    private handleRelayConnect(relayUrl: string) {
        this.emit("relay:connect", this.relays.get(relayUrl)!);

        if (this.stats().connected === this.relays.size) {
            this.emit("connect");
        }
    }

    private handleRelayReady(relay: NDKRelay) {
        this.emit("relay:ready", relay);
    }

    /**
     * Attempts to establish a connection to each relay in the pool.
     *
     * @async
     * @param {number} [timeoutMs] - Optional timeout in milliseconds for each connection attempt.
     * @returns {Promise<void>} A promise that resolves when all connection attempts have completed.
     * @throws {Error} If any of the connection attempts result in an error or timeout.
     */
    public async connect(timeoutMs?: number): Promise<void> {
        const promises: Promise<void>[] = [];

        this.debug(
            `Connecting to ${this.relays.size} relays${
                timeoutMs ? `, timeout ${timeoutMs}...` : ""
            }`
        );

        const relaysToConnect = new Set(this.autoConnectRelays.keys());
        this.ndk.explicitRelayUrls?.forEach((url) => {
            const normalizedUrl = normalizeRelayUrl(url);
            relaysToConnect.add(normalizedUrl);
        });

        for (const relayUrl of relaysToConnect) {
            const relay = this.relays.get(relayUrl);
            if (!relay) continue;

            const connectPromise = new Promise<void>((resolve, reject) => {
                this.emit("relay:connecting", relay);
                return relay.connect(timeoutMs).then(resolve).catch(reject);
            });

            if (timeoutMs) {
                const timeoutPromise = new Promise<void>((_, reject) => {
                    setTimeout(() => reject(`Timed out after ${timeoutMs}ms`), timeoutMs);
                });

                promises.push(
                    Promise.race([connectPromise, timeoutPromise]).catch((e) => {
                        this.debug(
                            `Failed to connect to relay ${relay.url}: ${e ?? "No reason specified"}`
                        );
                    })
                );
            } else {
                promises.push(connectPromise);
            }
        }

        // If we are running with a timeout, check if we need to emit a `connect` event
        // in case some, but not all, relays were connected
        if (timeoutMs) {
            setTimeout(() => {
                const allConnected = this.stats().connected === this.relays.size;
                const someConnected = this.stats().connected > 0;

                if (!allConnected && someConnected) {
                    this.emit("connect");
                }
            }, timeoutMs);
        }

        await Promise.all(promises);
    }

    private checkOnFlappingRelays() {
        const flappingRelaysCount = this.flappingRelays.size;
        const totalRelays = this.relays.size;

        if (flappingRelaysCount / totalRelays >= 0.8) {
            // Likely an issue on our end. Reset the backoff for all relays.
            for (const relayUrl of this.flappingRelays) {
                this.backoffTimes.set(relayUrl, 0);
            }
        }
    }

    private handleFlapping(relay: NDKRelay) {
        this.debug(`Relay ${relay.url} is flapping`);

        // Increment the backoff time for this relay, starting with 5 seconds.
        let currentBackoff = this.backoffTimes.get(relay.url) || 5000;
        currentBackoff = currentBackoff * 2;
        this.backoffTimes.set(relay.url, currentBackoff);

        this.debug(`Backoff time for ${relay.url} is ${currentBackoff}ms`);

        setTimeout(() => {
            this.debug(`Attempting to reconnect to ${relay.url}`);
            this.emit("relay:connecting", relay);
            relay.connect();
            this.checkOnFlappingRelays();
        }, currentBackoff);

        relay.disconnect();

        this.emit("flapping", relay);
    }

    public size(): number {
        return this.relays.size;
    }

    /**
     * Returns the status of each relay in the pool.
     * @returns {NDKPoolStats} An object containing the number of relays in each status.
     */
    public stats(): NDKPoolStats {
        const stats: NDKPoolStats = {
            total: 0,
            connected: 0,
            disconnected: 0,
            connecting: 0,
        };

        for (const relay of this.relays.values()) {
            stats.total++;
            if (relay.status === NDKRelayStatus.CONNECTED) {
                stats.connected++;
            } else if (relay.status === NDKRelayStatus.DISCONNECTED) {
                stats.disconnected++;
            } else if (relay.status === NDKRelayStatus.CONNECTING) {
                stats.connecting++;
            }
        }

        return stats;
    }

    public connectedRelays(): NDKRelay[] {
        return Array.from(this.relays.values()).filter(
            (relay) => relay.status === NDKRelayStatus.CONNECTED
        );
    }

    public permanentAndConnectedRelays(): NDKRelay[] {
        return Array.from(this.relays.values()).filter(
            (relay) =>
                relay.status >= NDKRelayStatus.CONNECTED &&
                !this.temporaryRelayTimers.has(relay.url)
        );
    }

    /**
     * Get a list of all relay urls in the pool.
     */
    public urls(): string[] {
        return Array.from(this.relays.keys());
    }
}
