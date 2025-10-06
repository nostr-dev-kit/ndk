import type { Hexpubkey, NDKEvent } from "@nostr-dev-kit/ndk";
import { NDKNutzap, zapInvoiceFromEvent } from "@nostr-dev-kit/ndk";
import type { Transaction, TransactionDirection, TransactionStatus, TransactionType } from "./types.js";

/**
 * Parse a kind:7376 spending history event into a Transaction.
 *
 * Per NIP-60, kind:7376 events have:
 * - .content: encrypted array of [["direction", "in|out"], ["amount", "123"], ...]
 * - tags: e-tags with markers "created", "destroyed", "redeemed"
 */
export function parseSpendingHistory(event: NDKEvent, currentUser: Hexpubkey): Transaction {
    // Note: In production, content would need to be decrypted first
    // For now, assume it's already decrypted or plaintext for testing
    let decrypted: [string, string][];
    try {
        decrypted = JSON.parse(event.content);
    } catch {
        // If parse fails, try to decrypt first (implementation-specific)
        decrypted = [];
    }

    const directionValue = decrypted.find(([k]) => k === "direction")?.[1];
    const direction: TransactionDirection =
        directionValue === "in" || directionValue === "out" ? directionValue : "out";
    const amount = parseInt(decrypted.find(([k]) => k === "amount")?.[1] ?? "0");

    const createdTokens = event.tags.filter(([t, , , marker]) => t === "e" && marker === "created").map(([, id]) => id);

    const destroyedTokens = event.tags
        .filter(([t, , , marker]) => t === "e" && marker === "destroyed")
        .map(([, id]) => id);

    const redeemedNutzap = event.tags.find(([t, , , marker]) => t === "e" && marker === "redeemed")?.[1];

    // Determine transaction type based on available data
    let type: TransactionType;
    if (redeemedNutzap) {
        type = "nutzap_received";
    } else if (direction === "in") {
        type = "deposit";
    } else if (createdTokens.length > 0) {
        type = "nutzap_sent"; // Could also be swap
    } else {
        type = "withdrawal";
    }

    return {
        id: event.id,
        type,
        direction,
        status: "confirmed",
        amount,
        unit: "sat",
        timestamp: event.created_at || Math.floor(Date.now() / 1000),
        createdTokens,
        destroyedTokens,
        redeemedNutzap,
        event,
    };
}

/**
 * Parse a kind:9321 nutzap event into a Transaction.
 *
 * Nutzaps can be sent or received by the current user.
 */
export function parseNutzap(event: NDKEvent, currentUser: Hexpubkey): Transaction {
    const nutzap = NDKNutzap.from(event);
    if (!nutzap) {
        throw new Error(`Failed to parse nutzap from event ${event.id}`);
    }

    const isSent = event.pubkey === currentUser;
    const recipient = event.tagValue("p");

    if (!recipient) {
        throw new Error(`Nutzap event ${event.id} missing recipient (p tag)`);
    }

    return {
        id: event.id,
        type: isSent ? "nutzap_sent" : "nutzap_received",
        direction: isSent ? "out" : "in",
        status: "confirmed",
        amount: nutzap.amount,
        unit: nutzap.unit ?? "sat",
        timestamp: event.created_at || Math.floor(Date.now() / 1000),
        sender: event.pubkey,
        recipient,
        comment: event.content,
        targetId: event.tags.find(([t]) => ["e", "a"].includes(t))?.[1],
        event,
    };
}

/**
 * Parse a kind:9735 zap receipt into a Transaction.
 *
 * Zap receipts contain a bolt11 invoice and zap request.
 */
export function parseZapReceipt(event: NDKEvent, currentUser: Hexpubkey): Transaction {
    const invoice = zapInvoiceFromEvent(event);
    if (!invoice) {
        throw new Error(`Failed to parse zap invoice from event ${event.id}`);
    }

    const isSent = invoice.zappee === currentUser;

    return {
        id: event.id,
        type: isSent ? "zap_sent" : "zap_received",
        direction: isSent ? "out" : "in",
        status: "confirmed",
        amount: invoice.amount / 1000, // Convert msat to sat
        unit: "sat",
        timestamp: event.created_at || Math.floor(Date.now() / 1000),
        sender: invoice.zappee,
        recipient: invoice.zapped,
        comment: invoice.comment,
        targetId: invoice.zappedEvent,
        event,
    };
}

/**
 * Convert a PendingPayment to a Transaction.
 */
export function pendingToTransaction(pending: {
    internalId: string;
    targetId: string;
    targetType: "user" | "event";
    target?: any;
    recipient: string;
    sender: string;
    amount: number;
    unit: string;
    status: "pending" | "delayed" | "failed";
    comment?: string;
    timestamp: number;
    error?: string;
}): Transaction {
    return {
        id: pending.internalId,
        type: "nutzap_sent", // Could be zap_sent depending on wallet type
        direction: "out",
        status: pending.status,
        amount: pending.amount,
        unit: pending.unit,
        timestamp: pending.timestamp,
        sender: pending.sender,
        recipient: pending.recipient,
        comment: pending.comment,
        targetId: pending.targetId,
        target: pending.target,
        error: pending.error,
    };
}
