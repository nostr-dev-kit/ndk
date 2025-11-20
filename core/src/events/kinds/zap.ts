import type { NostrEvent } from "../index.js";
import { NDKEvent } from "../index.js";
import { NDKKind } from "./index.js";
import type { NDK } from "../../ndk/index.js";
import type { NDKUser } from "../../user/index.js";
import { zapInvoiceFromEvent, type NDKZapInvoice } from "../../zap/invoice.js";

/**
 * Represents a NIP-57 zap event (kind 9735)
 *
 * @example
 * ```typescript
 * const zapEvent = await ndk.fetchEvent(zapId);
 * const zap = NDKZap.from(zapEvent);
 *
 * if (zap) {
 *     console.log(`${zap.amount} sats from ${zap.sender.npub}`);
 *     console.log(`Comment: ${zap.comment}`);
 *     console.log(`Recipient: ${zap.recipient.npub}`);
 * }
 * ```
 */
export class NDKZap extends NDKEvent {
    static kind = NDKKind.Zap;
    static kinds = [NDKKind.Zap];

    private _invoice?: NDKZapInvoice | null;

    constructor(ndk?: NDK, rawEvent?: NostrEvent) {
        super(ndk, rawEvent);
        this.kind ??= NDKKind.Zap;
    }

    /**
     * Creates an NDKZap instance from an NDKEvent
     *
     * @param event The event to convert
     * @returns NDKZap instance or null if invalid
     */
    static from(event: NDKEvent): NDKZap | null {
        if (event.kind !== NDKKind.Zap) return null;
        return new NDKZap(event.ndk, event.rawEvent());
    }

    /**
     * Get the parsed zap invoice (lazy loaded, cached)
     * Returns null if the zap event is invalid or malformed
     */
    get invoice(): NDKZapInvoice | null {
        if (this._invoice !== undefined) return this._invoice;
        this._invoice = zapInvoiceFromEvent(this);
        return this._invoice;
    }

    /**
     * Amount in sats (converted from millisats in the invoice)
     * Returns 0 if invoice is invalid
     */
    get amount(): number {
        return this.invoice ? Math.floor(this.invoice.amount / 1000) : 0;
    }

    /**
     * The user who sent the zap (zappee)
     *
     * @throws Error if zap is invalid or NDK instance is not available
     */
    get sender(): NDKUser {
        const pubkey = this.invoice?.zappee;
        if (!pubkey) throw new Error("Invalid zap - no sender");
        if (!this.ndk) throw new Error("No NDK instance");
        return this.ndk.getUser({ pubkey });
    }

    /**
     * The user who received the zap (zapped)
     *
     * @throws Error if zap is invalid or NDK instance is not available
     */
    get recipient(): NDKUser {
        const pubkey = this.invoice?.zapped;
        if (!pubkey) throw new Error("Invalid zap - no recipient");
        if (!this.ndk) throw new Error("No NDK instance");
        return this.ndk.getUser({ pubkey });
    }

    /**
     * Zap comment/message from the zap request
     */
    get comment(): string | undefined {
        return this.invoice?.comment;
    }

    /**
     * The event that was zapped (if any)
     * Can be an event ID (e tag) or address (a tag)
     */
    get zappedEventId(): string | undefined {
        return this.invoice?.zappedEvent;
    }

    /**
     * The zapper service pubkey that processed this zap
     */
    get zapper(): string | undefined {
        return this.invoice?.zapper;
    }

    /**
     * Check if this is a valid zap
     */
    get isValid(): boolean {
        return this.invoice !== null;
    }
}
