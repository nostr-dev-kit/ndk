import type debug from "debug";
import { EventEmitter } from "tseep";

import type { NDK } from "../../ndk/index.js";
import type { NDKFilter } from "../../subscription/index.js";
import { normalizeRelayUrl } from "../../utils/normalize-url.js";
import { NDKRelay, NDKRelayStatus } from "../index.js";

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
    private _relays = new Map<WebSocket["url"], NDKRelay>();
    private status: "idle" | "active" = "idle";
    public autoConnectRelays = new Set<WebSocket["url"]>();
    private debug: debug.Debugger;
    private temporaryRelayTimers = new Map<WebSocket["url"], NodeJS.Timeout>();
    private flappingRelays: Set<WebSocket["url"]> = new Set();
    // A map to store timeouts for each flapping relay.
    private backoffTimes: Map<string, number> = new Map();
    private ndk: NDK;

    // System-wide disconnection detection
    private disconnectionTimes = new Map<WebSocket["url"], number>();
    private systemEventDetector?: ReturnType<typeof setTimeout>;

    /**
     * @param relayUrls - The URLs of the relays to connect to.
     * @param ndk - The NDK instance.
     * @param opts - Options for the pool.
     */
    public constructor(
        relayUrls: WebSocket["url"][],
        ndk: NDK,
        {
            debug,
            name,
        }: {
            debug?: debug.Debugger;
            name?: string;
        } = {},
    ) {
        super();
        this.debug = debug ?? ndk.debug.extend("pool");
        if (name) this._name = name;
        this.ndk = ndk;
        this.relayUrls = relayUrls;

        if (this.ndk.pools) {
            this.ndk.pools.push(this);
        }
    }

    get relays() {
        return this._relays;
    }

    set relayUrls(urls: WebSocket["url"][]) {
        this._relays.clear();
        for (const relayUrl of urls) {
            const relay = new NDKRelay(relayUrl, undefined, this.ndk);
            relay.connectivity.netDebug = this.ndk.netDebug;
            this.addRelay(relay);
        }
    }

    private _name = "unnamed";

    get name() {
        return this._name;
    }

    set name(name: string) {
        this._name = name;
        this.debug = this.debug.extend(name);
    }

    /**
     * Adds a relay to the pool, and sets a timer to remove it if it is not used within the specified time.
     * @param relay - The relay to add to the pool.
     * @param removeIfUnusedAfter - The time in milliseconds to wait before removing the relay from the pool after it is no longer used.
     */
    public useTemporaryRelay(relay: NDKRelay, removeIfUnusedAfter = 30000, filters?: NDKFilter[] | string) {
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
        const isCustomRelayUrl = relay.url.includes("/npub1");
        let reconnect = true;

        const relayUrl = relay.url;

        if (isAlreadyInPool) return;

        // Check if relay connection is allowed using the filter
        if (this.ndk.relayConnectionFilter && !this.ndk.relayConnectionFilter(relayUrl)) {
            this.debug(`Refusing to add relay ${relayUrl}: blocked by relayConnectionFilter`);
            return;
        }
        if (isCustomRelayUrl) {
            this.debug(`Refusing to add relay ${relayUrl}: is a filter relay`);
            return;
        }

        if (this.ndk.cacheAdapter?.getRelayStatus) {
            const infoOrPromise = this.ndk.cacheAdapter.getRelayStatus(relayUrl);
            const info = infoOrPromise instanceof Promise ? undefined : infoOrPromise;

            // if we have info and the relay should not connect yet, set a delayed connect
            if (info?.dontConnectBefore) {
                if (info.dontConnectBefore > Date.now()) {
                    const delay = info.dontConnectBefore - Date.now();
                    this.debug(`Refusing to add relay ${relayUrl}: delayed connect for ${delay}ms`);
                    setTimeout(() => {
                        this.addRelay(relay, connect);
                    }, delay);
                    return;
                }
                reconnect = false;
            }
        }

        const noticeHandler = (notice: string) => this.emit("notice", relay, notice);
        const connectHandler = () => this.handleRelayConnect(relayUrl);
        const readyHandler = () => this.handleRelayReady(relay);
        const disconnectHandler = () => {
            this.recordDisconnection(relay);
            this.emit("relay:disconnect", relay);
        };
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
        this._relays.set(relayUrl, relay);
        if (connect) this.autoConnectRelays.add(relayUrl);

        // only connect if the pool is active
        if (connect && this.status === "active") {
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
    public getRelay(url: WebSocket["url"], connect = true, temporary = false, filters?: NDKFilter[]): NDKRelay {
        let relay = this.relays.get(normalizeRelayUrl(url));

        if (!relay) {
            relay = new NDKRelay(url, undefined, this.ndk);
            relay.connectivity.netDebug = this.ndk.netDebug;
            if (temporary) {
                this.useTemporaryRelay(relay, 30000, filters);
            } else {
                this.addRelay(relay, connect);
            }
        }

        return relay;
    }

    private handleRelayConnect(relayUrl: string) {
        const relay = this.relays.get(relayUrl)!;
        if (!relay) {
            console.error("NDK BUG: relay not found in pool", { relayUrl });
            return;
        }

        this.emit("relay:connect", relay);

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
        this.status = "active";
        this.debug(`Connecting to ${this.relays.size} relays${timeoutMs ? `, timeout ${timeoutMs}ms` : ""}...`);

        const relaysToConnect = Array.from(this.autoConnectRelays.keys())
            .map((url) => this.relays.get(url))
            .filter((relay): relay is NDKRelay => !!relay);

        // Start connecting all relays (if not already connected/connecting)
        for (const relay of relaysToConnect) {
            if (relay.status !== NDKRelayStatus.CONNECTED && relay.status !== NDKRelayStatus.CONNECTING) {
                this.emit("relay:connecting", relay);
                relay.connect().catch((e) => {
                    this.debug(`Failed to connect to relay ${relay.url}: ${e ?? "No reason specified"}`);
                });
            }
        }

        // Helper to check if all relays are connected
        const allConnected = () => relaysToConnect.every((r) => r.status === NDKRelayStatus.CONNECTED);

        // Promise that resolves when all relays are connected
        const allConnectedPromise = new Promise<void>((resolve) => {
            if (allConnected()) {
                resolve();
                return;
            }
            const listeners: Array<() => void> = [];
            for (const relay of relaysToConnect) {
                const handler = () => {
                    if (allConnected()) {
                        // Remove all listeners
                        for (let i = 0; i < relaysToConnect.length; i++) {
                            relaysToConnect[i].off("connect", listeners[i]);
                        }
                        resolve();
                    }
                };
                listeners.push(handler);
                relay.on("connect", handler);
            }
        });

        // Promise that resolves after the timeout
        const timeoutPromise =
            typeof timeoutMs === "number"
                ? new Promise<void>((resolve) => setTimeout(resolve, timeoutMs))
                : new Promise<void>(() => {
                      /* never resolves if no timeout */
                  });

        // Wait for either all relays to connect, or the timeout
        await Promise.race([allConnectedPromise, timeoutPromise]);

        // Done: at this point, some relays may still be connecting, but we've waited up to the timeout
        // (or less if all relays connected early)
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

    /**
     * Records when a relay disconnects to detect system-wide events
     */
    private recordDisconnection(relay: NDKRelay) {
        const now = Date.now();
        this.disconnectionTimes.set(relay.url, now);

        // Clean up old disconnection times (older than 10 seconds)
        for (const [url, time] of this.disconnectionTimes.entries()) {
            if (now - time > 10000) {
                this.disconnectionTimes.delete(url);
            }
        }

        // Check if this might be a system-wide event
        this.checkForSystemWideDisconnection();
    }

    /**
     * Checks if multiple relays disconnected simultaneously, indicating a system event
     */
    private checkForSystemWideDisconnection() {
        const now = Date.now();
        const recentDisconnections: number[] = [];

        // Count disconnections in the last 5 seconds
        for (const time of this.disconnectionTimes.values()) {
            if (now - time < 5000) {
                recentDisconnections.push(time);
            }
        }

        // If more than 50% of relays disconnected within 5 seconds, it's likely a system event
        if (recentDisconnections.length > this.relays.size / 2 && this.relays.size > 1) {
            this.debug(
                `System-wide disconnection detected: ${recentDisconnections.length}/${this.relays.size} relays disconnected`,
            );
            this.handleSystemWideReconnection();
        }
    }

    /**
     * Handles system-wide reconnection (e.g., after sleep/wake or network change)
     */
    private handleSystemWideReconnection() {
        // If we're already in a system-wide reconnection period, skip
        if (this.systemEventDetector) {
            this.debug("System-wide reconnection already in progress, skipping");
            return;
        }

        this.debug("Initiating system-wide reconnection with reset backoff");

        // Prevent multiple system-wide reconnections
        this.systemEventDetector = setTimeout(() => {
            this.systemEventDetector = undefined;
        }, 10000);

        // Reset backoff for all relays and force reconnection
        for (const relay of this.relays.values()) {
            if (relay.connectivity) {
                // Reset reconnection state for system-wide event
                relay.connectivity.resetReconnectionState();

                // Reconnect if not connected
                if (relay.status !== NDKRelayStatus.CONNECTED && relay.status !== NDKRelayStatus.CONNECTING) {
                    relay.connect().catch((e) => {
                        this.debug(`Failed to reconnect relay ${relay.url} after system event: ${e}`);
                    });
                }
            }
        }

        // Clear disconnection times after handling
        this.disconnectionTimes.clear();
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
        return Array.from(this.relays.values()).filter((relay) => relay.status >= NDKRelayStatus.CONNECTED);
    }

    public permanentAndConnectedRelays(): NDKRelay[] {
        return Array.from(this.relays.values()).filter(
            (relay) => relay.status >= NDKRelayStatus.CONNECTED && !this.temporaryRelayTimers.has(relay.url),
        );
    }

    /**
     * Get a list of all relay urls in the pool.
     */
    public urls(): string[] {
        return Array.from(this.relays.keys());
    }
}
