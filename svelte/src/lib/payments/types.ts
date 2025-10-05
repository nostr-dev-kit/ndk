import type { NDKEvent, NDKUser, NDKZapper } from "@nostr-dev-kit/ndk";

export type TransactionDirection = "in" | "out";
export type TransactionStatus = "pending" | "complete" | "confirmed" | "failed";

export type TransactionType =
    | "zap_sent" // Outgoing lightning zap
    | "zap_received" // Incoming lightning zap
    | "nutzap_sent" // Outgoing nutzap
    | "nutzap_received" // Incoming nutzap
    | "token_created" // Cashu token creation
    | "token_destroyed" // Cashu token destruction
    | "deposit" // Cashu mint deposit
    | "withdrawal"; // Cashu withdrawal

/**
 * Unified transaction - the heart of the system
 */
export interface Transaction {
    // Identity
    id: string; // Internal ID (pending) or event.id (confirmed)
    type: TransactionType;
    direction: TransactionDirection;
    status: TransactionStatus;

    // Core data
    amount: number;
    unit: string;
    timestamp: number;

    // Zap-specific
    target?: NDKUser | NDKEvent;
    targetId?: string;
    targetType?: "user" | "event";
    recipient?: string;
    sender?: string;
    comment?: string;

    // Cashu-specific (from kind:7376)
    createdTokens?: string[]; // Event IDs of created tokens
    destroyedTokens?: string[]; // Event IDs of destroyed tokens
    redeemedNutzap?: string; // Nutzap event ID

    // Metadata
    event?: NDKEvent; // The receipt event
    error?: string; // Error message if failed
}

/**
 * Pending payment (pre-confirmation)
 */
export interface PendingPayment {
    internalId: string;
    targetId: string;
    targetType: "user" | "event";
    target?: NDKUser | NDKEvent;
    recipient: string;
    sender: string;
    amount: number;
    unit: string;
    status: "pending" | "delayed" | "failed";
    comment?: string;
    timestamp: number;
    zapper?: NDKZapper;
    error?: string;
}

/**
 * Helper to convert target to ID
 */
export function targetToId(target: NDKUser | NDKEvent): string {
    if ("pubkey" in target && typeof target.pubkey === "string") {
        return target.pubkey;
    }
    return (target as NDKEvent).tagId();
}

/**
 * Generate random internal ID for pending payments
 */
export function randomId(): string {
    return Math.random().toString(36).substring(2, 15);
}

/**
 * Extract target info from zapper
 */
export function getZapperTarget(zapper: NDKZapper): { id: string; type: "user" | "event" } {
    const { target } = zapper;
    if ("pubkey" in target && typeof target.pubkey === "string") {
        return { id: target.pubkey, type: "user" };
    }
    return { id: (target as NDKEvent).tagId(), type: "event" };
}
