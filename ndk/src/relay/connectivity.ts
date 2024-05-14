import type { Relay } from "nostr-tools";
import { relayInit } from "nostr-tools";

import type { NDKRelay, NDKRelayConnectionStats } from ".";
import { NDKRelayStatus } from ".";
import { runWithTimeout } from "../utils/timeout";

const MAX_RECONNECT_ATTEMPTS = 5;

export class NDKRelayConnectivity {
    private ndkRelay: NDKRelay;
    private _status: NDKRelayStatus;
    public relay: Relay;
    private timeoutMs?: number;
    private connectedAt?: number;
    private _connectionStats: NDKRelayConnectionStats = {
        attempts: 0,
        success: 0,
        durations: [],
    };
    private debug: debug.Debugger;
    private reconnectTimeout: any;

    constructor(ndkRelay: NDKRelay) {
        this.ndkRelay = ndkRelay;
        this._status = NDKRelayStatus.DISCONNECTED;
        this.relay = relayInit(this.ndkRelay.url);
        this.debug = this.ndkRelay.debug.extend("connectivity");

        this.relay.on("notice", (notice: string) => this.handleNotice(notice));
    }

    public async connect(
        timeoutMs?: number,
        reconnect = true
    ): Promise<void> {
        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = undefined;
        }

        timeoutMs ??= this.timeoutMs;
        if (!this.timeoutMs && timeoutMs) this.timeoutMs = timeoutMs;

        const connectHandler = () => {
            this.updateConnectionStats.connected();

            this._status = NDKRelayStatus.CONNECTED;
            this.ndkRelay.emit("connect");
            this.ndkRelay.emit("ready");
        };

        const disconnectHandler = () => {
            this.updateConnectionStats.disconnected();

            if (this._status === NDKRelayStatus.CONNECTED) {
                this._status = NDKRelayStatus.DISCONNECTED;

                this.handleReconnection();
            }
            this.ndkRelay.emit("disconnect");
        };

        const authHandler = async (challenge: string) => {
            this.debug("Relay requested authentication", {
                havePolicy: !!this.ndkRelay.authPolicy,
            });
            if (this.ndkRelay.authPolicy) {
                if (this._status !== NDKRelayStatus.AUTHENTICATING) {
                    this._status = NDKRelayStatus.AUTHENTICATING;
                    await this.ndkRelay.authPolicy(this.ndkRelay, challenge);

                    if (this._status === NDKRelayStatus.AUTHENTICATING) {
                        this.debug("Authentication policy finished");
                        this._status = NDKRelayStatus.CONNECTED;
                        this.ndkRelay.emit("authed");
                    }
                }
            } else {
                await this.ndkRelay.emit("auth", challenge);
            }
        };

        try {
            this.updateConnectionStats.attempt();
            if (this._status === NDKRelayStatus.DISCONNECTED)
                this._status = NDKRelayStatus.CONNECTING;
            else this._status = NDKRelayStatus.RECONNECTING;

            this.relay.off("connect", connectHandler);
            this.relay.off("disconnect", disconnectHandler);
            this.relay.on("connect", connectHandler);
            this.relay.on("disconnect", disconnectHandler);
            this.relay.on("auth", authHandler);

            await runWithTimeout(this.relay.connect, timeoutMs, "Timed out while connecting");
        } catch (e) {
            // this.debug("Failed to connect", e);
            this._status = NDKRelayStatus.DISCONNECTED;
            if (reconnect)
                this.handleReconnection();
            else
                this.ndkRelay.emit("delayed-connect", 2 * 24 * 60 * 60 * 1000);
            throw e;
        }
    }

    public disconnect(): void {
        this._status = NDKRelayStatus.DISCONNECTING;
        this.relay.close();
    }

    get status(): NDKRelayStatus {
        return this._status;
    }

    public isAvailable(): boolean {
        return this._status === NDKRelayStatus.CONNECTED;
    }

    /**
     * Evaluates the connection stats to determine if the relay is flapping.
     */
    private isFlapping(): boolean {
        const durations = this._connectionStats.durations;
        if (durations.length % 3 !== 0) return false;

        const sum = durations.reduce((a, b) => a + b, 0);
        const avg = sum / durations.length;
        const variance =
            durations.map((x) => Math.pow(x - avg, 2)).reduce((a, b) => a + b, 0) /
            durations.length;
        const stdDev = Math.sqrt(variance);
        const isFlapping = stdDev < 1000;

        return isFlapping;
    }

    private async handleNotice(notice: string) {
        // This is a prototype; if the relay seems to be complaining
        // remove it from relay set selection for a minute.
        if (notice.includes("oo many") || notice.includes("aximum")) {
            this.disconnect();

            // fixme
            setTimeout(() => this.connect(), 2000);
            this.debug(this.relay.url, "Relay complaining?", notice);
            // this.complaining = true;
            // setTimeout(() => {
            //     this.complaining = false;
            //     console.log(this.relay.url, 'Reactivate relay');
            // }, 60000);
        }

        this.ndkRelay.emit("notice", notice);
    }

    /**
     * Called when the relay is unexpectedly disconnected.
     */
    private handleReconnection(attempt = 0): void {
        if (this.reconnectTimeout) return;
        this.debug("Attempting to reconnect", { attempt });

        if (this.isFlapping()) {
            this.ndkRelay.emit("flapping", this._connectionStats);
            this._status = NDKRelayStatus.FLAPPING;
            return;
        }

        const reconnectDelay = this.connectedAt
            ? Math.max(0, 60000 - (Date.now() - this.connectedAt))
            : 5000 * (this._connectionStats.attempts + 1);

        this.reconnectTimeout = setTimeout(() => {
            this.reconnectTimeout = undefined;
            this._status = NDKRelayStatus.RECONNECTING;
            // this.debug(`Reconnection attempt #${attempt}`);
            this.connect()
                .then(() => {
                    this.debug("Reconnected");
                })
                .catch((err) => {
                    // this.debug("Reconnect failed", err);

                    if (attempt < MAX_RECONNECT_ATTEMPTS) {
                        setTimeout(() => {
                            this.handleReconnection(attempt + 1);
                        }, (1000 * (attempt + 1)) ^ 4);
                    } else {
                        this.debug("Reconnect failed");
                    }
                });
        }, reconnectDelay);

        this.ndkRelay.emit("delayed-connect", reconnectDelay);

        this.debug("Reconnecting in", reconnectDelay);
        this._connectionStats.nextReconnectAt = Date.now() + reconnectDelay;
    }

    /**
     * Utility functions to update the connection stats.
     */
    private updateConnectionStats = {
        connected: () => {
            this._connectionStats.success++;
            this._connectionStats.connectedAt = Date.now();
        },

        disconnected: () => {
            if (this._connectionStats.connectedAt) {
                this._connectionStats.durations.push(
                    Date.now() - this._connectionStats.connectedAt
                );

                if (this._connectionStats.durations.length > 100) {
                    this._connectionStats.durations.shift();
                }
            }
            this._connectionStats.connectedAt = undefined;
        },

        attempt: () => {
            this._connectionStats.attempts++;
        },
    };

    /**
     * Returns the connection stats.
     */
    get connectionStats(): NDKRelayConnectionStats {
        return this._connectionStats;
    }
}
