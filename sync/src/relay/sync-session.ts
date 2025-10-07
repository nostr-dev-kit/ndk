/**
 * Sync session manager.
 * Handles a single sync session with one relay.
 */

import type { NDKFilter, NDKRelay } from "@nostr-dev-kit/ndk";
import { EventEmitter } from "tseep";
import { FRAME_SIZE_LIMITS, TIMEOUTS } from "../constants.js";
import { Negentropy } from "../negentropy/core.js";
import type { NegentropyStorage } from "../negentropy/storage.js";
import { hexToUint8Array, uint8ArrayToHex } from "../negentropy/utils.js";
import type { NDKSyncOptions } from "../types.js";

/**
 * Typeguard to check if a message is a valid NEG message format.
 */
function isNegMessage(message: unknown[]): message is [string, string, ...string[]] {
    return (
        Array.isArray(message) &&
        message.length >= 2 &&
        typeof message[0] === "string" &&
        typeof message[1] === "string"
    );
}

/**
 * Typeguard to check if a message is a NEG-MSG format with payload.
 */
function isNegMsgWithPayload(message: unknown[]): message is [string, string, string] {
    return isNegMessage(message) && message.length === 3 && typeof message[2] === "string";
}

/**
 * Typeguard to check if relay has WebSocket connectivity.
 */
function hasWebSocketConnectivity(
    relay: NDKRelay,
): relay is NDKRelay & { connectivity: { send(message: string): Promise<void> } } {
    return "connectivity" in relay && relay.connectivity && typeof (relay.connectivity as any).send === "function";
}

/**
 * Manages a sync session with a single relay.
 * Handles NEG-* protocol messages and coordinates with the Negentropy engine.
 */
export class SyncSession extends EventEmitter<{
    complete: (result: { need: Set<string>; have: Set<string> }) => void;
    error: (error: Error) => void;
}> {
    private relay: NDKRelay;
    private filters: NDKFilter[];
    private negentropy: Negentropy;
    private sessionId: string;
    private need = new Set<string>();
    private have = new Set<string>();
    private active = false;
    private opts: NDKSyncOptions;

    constructor(relay: NDKRelay, filters: NDKFilter[], storage: NegentropyStorage, opts: NDKSyncOptions) {
        super();
        this.relay = relay;
        this.filters = filters;
        this.sessionId = this.generateSessionId();
        this.opts = opts;

        // Create negentropy instance
        this.negentropy = new Negentropy(storage, opts.frameSizeLimit || FRAME_SIZE_LIMITS.DEFAULT);

        // Monitor relay disconnections
        this.setupRelayMonitoring();
    }

    /**
     * Start the sync session.
     */
    async start(): Promise<{ need: Set<string>; have: Set<string> }> {
        if (this.active) {
            throw new Error("Sync session already active");
        }

        this.active = true;

        // Register protocol handlers for negentropy-specific messages
        this.relay.registerProtocolHandler("NEG-MSG", this.handleNegMsg.bind(this));
        this.relay.registerProtocolHandler("NEG-ERR", this.handleNegErr.bind(this));
        this.relay.registerProtocolHandler("NEG-CLOSE", this.handleNegClose.bind(this));

        // Listen for NOTICE events from the relay (not a protocol handler to avoid blocking other listeners)
        this.relay.on("notice", this.handleNotice.bind(this));

        try {
            // Generate initial message
            const initialMsg = await this.negentropy.initiate();

            // Send NEG-OPEN
            const message = JSON.stringify(["NEG-OPEN", this.sessionId, this.filters, uint8ArrayToHex(initialMsg)]);
            await this.sendRaw(message);

            // Wait for completion
            return await new Promise((resolve, reject) => {
                this.once("complete", resolve);
                this.once("error", reject);

                // Timeout after configured time
                setTimeout(() => {
                    if (this.active) {
                        this.cleanup();
                        reject(new Error("Sync session timeout"));
                    }
                }, this.opts.timeout || TIMEOUTS.SYNC_SESSION);
            });
        } catch (error) {
            this.cleanup();
            throw error;
        }
    }

    /**
     * Handle NEG-MSG message from relay.
     */
    private async handleNegMsg(_relay: NDKRelay, message: unknown[]): Promise<void> {
        try {
            if (!isNegMsgWithPayload(message)) {
                throw new Error("Invalid NEG-MSG format: expected [string, string, string]");
            }

            const [, id, payload] = message;

            if (id !== this.sessionId) return; // Not our session

            // Convert hex payload to Uint8Array
            const query = hexToUint8Array(payload);

            // Process with negentropy
            const result = await this.negentropy.reconcile(query);

            // Accumulate need/have
            for (const id of result.need) {
                this.need.add(uint8ArrayToHex(id));
            }
            for (const id of result.have) {
                this.have.add(uint8ArrayToHex(id));
            }

            if (result.nextMessage) {
                // Continue sync
                const msg = JSON.stringify(["NEG-MSG", this.sessionId, uint8ArrayToHex(result.nextMessage)]);
                await this.sendRaw(msg);
            } else {
                // Sync complete
                const closeMsg = JSON.stringify(["NEG-CLOSE", this.sessionId]);
                await this.sendRaw(closeMsg);
                this.complete();
            }
        } catch (error) {
            this.error(error instanceof Error ? error : new Error(String(error)));
        }
    }

    /**
     * Handle NEG-ERR message from relay.
     */
    private handleNegErr(_relay: NDKRelay, message: unknown[]): void {
        if (!isNegMsgWithPayload(message)) {
            this.error(new Error("Invalid NEG-ERR format: expected [string, string, string]"));
            return;
        }

        const [, id, errorMsg] = message;

        if (id !== this.sessionId) return;

        this.error(new Error(`Relay sync error: ${errorMsg}`));
    }

    /**
     * Handle NEG-CLOSE message from relay.
     */
    private handleNegClose(_relay: NDKRelay, message: unknown[]): void {
        if (!isNegMessage(message)) {
            this.error(new Error("Invalid NEG-CLOSE format: expected [string, string]"));
            return;
        }

        const [, id] = message;

        if (id !== this.sessionId) return;

        this.complete();
    }

    /**
     * Handle NOTICE message from relay.
     * Relays often send NOTICE for unsupported protocol messages, including negentropy.
     */
    private handleNotice(noticeText: string): void {
        if (typeof noticeText !== "string") {
            return; // Ignore malformed NOTICE
        }

        const lowerNotice = noticeText.toLowerCase();

        // Check if this is a negentropy-related error
        // Common patterns: "bad msg", "negentropy", "unknown", "unsupported"
        const isNegentropyError =
            lowerNotice.includes("negentropy") ||
            lowerNotice.includes("bad msg") ||
            lowerNotice.includes("bad message") ||
            (lowerNotice.includes("unknown") && lowerNotice.includes("msg")) ||
            (lowerNotice.includes("unsupported") && lowerNotice.includes("protocol"));

        if (isNegentropyError) {
            this.error(new Error(`Relay does not support negentropy: ${noticeText}`));
        }
    }

    /**
     * Complete the sync session successfully.
     */
    private complete(): void {
        if (!this.active) return;

        this.cleanup();
        this.emit("complete", { need: this.need, have: this.have });
    }

    /**
     * Error out the sync session.
     */
    private error(error: Error): void {
        if (!this.active) return;

        this.cleanup();
        this.emit("error", error);
    }

    /**
     * Clean up the session.
     */
    private cleanup(): void {
        this.active = false;

        // Unregister protocol handlers
        this.relay.unregisterProtocolHandler("NEG-MSG");
        this.relay.unregisterProtocolHandler("NEG-ERR");
        this.relay.unregisterProtocolHandler("NEG-CLOSE");

        // Remove event listeners
        this.relay.off("notice", this.handleNotice);
        this.relay.off("disconnect", this.handleRelayDisconnect);
    }

    /**
     * Set up monitoring for relay disconnections.
     */
    private setupRelayMonitoring(): void {
        this.relay.once("disconnect", this.handleRelayDisconnect.bind(this));
    }

    /**
     * Handle relay disconnection during sync.
     */
    private handleRelayDisconnect(): void {
        if (this.active) {
            this.error(new Error("Relay disconnected during sync session"));
        }
    }

    /**
     * Send a raw message to the relay.
     */
    private async sendRaw(message: string): Promise<void> {
        const relayUrl = this.relay.url;

        // Check connection status before sending
        if (!this.relay.connected) {
            throw new Error(`Relay ${relayUrl} is not connected`);
        }

        if (!hasWebSocketConnectivity(this.relay)) {
            throw new Error(`Relay ${relayUrl} does not support direct message sending`);
        }

        try {
            await this.relay.connectivity.send(message);
        } catch (error) {
            throw new Error(
                `Failed to send message to relay ${relayUrl}: ${error instanceof Error ? error.message : String(error)}`,
            );
        }
    }

    /**
     * Generate a unique session ID.
     */
    private generateSessionId(): string {
        return `neg-${Math.random().toString(36).substring(2, 15)}`;
    }
}
