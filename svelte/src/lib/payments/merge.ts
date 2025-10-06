import type { Hexpubkey, NDKEvent } from "@nostr-dev-kit/ndk";
import { parseNutzap, parseSpendingHistory, parseZapReceipt, pendingToTransaction } from "./parsers.js";
import type { PendingPayment, Transaction } from "./types.js";

/**
 * Merge all transaction sources into a unified, deduplicated, sorted list.
 *
 * This function:
 * 1. Parses events from all sources into Transaction objects
 * 2. Adds pending payments that haven't been confirmed yet
 * 3. Deduplicates (same event appearing in multiple sources)
 * 4. Sorts by timestamp descending (newest first)
 */
export function mergeTransactions(
    spendingHistory: Map<string, NDKEvent>,
    zapReceipts: Map<string, NDKEvent>,
    nutzaps: Map<string, NDKEvent>,
    pendingMap: Map<string, PendingPayment>,
    currentUser: Hexpubkey,
): Transaction[] {
    const transactions: Transaction[] = [];

    // Parse kind:7376 spending history
    for (const event of spendingHistory.values()) {
        try {
            transactions.push(parseSpendingHistory(event, currentUser));
        } catch (e) {
            console.error("Failed to parse spending history event:", e);
        }
    }

    // Parse kind:9735 zap receipts
    for (const event of zapReceipts.values()) {
        try {
            transactions.push(parseZapReceipt(event, currentUser));
        } catch (e) {
            console.error("Failed to parse zap receipt:", e);
        }
    }

    // Parse kind:9321 nutzaps
    for (const event of nutzaps.values()) {
        try {
            transactions.push(parseNutzap(event, currentUser));
        } catch (e) {
            console.error("Failed to parse nutzap:", e);
        }
    }

    // Add pending payments (only if not already confirmed)
    for (const p of pendingMap.values()) {
        // Check if this pending payment has been confirmed
        const isConfirmed = transactions.some(
            (tx) =>
                tx.targetId === p.targetId &&
                tx.recipient === p.recipient &&
                tx.direction === "out" &&
                Math.abs(tx.timestamp - p.timestamp) < 60, // Within 1 minute
        );

        if (!isConfirmed) {
            transactions.push(pendingToTransaction(p));
        }
    }

    // Deduplicate and sort
    return deduplicateAndSort(transactions);
}

/**
 * Deduplicate transactions and sort by timestamp.
 *
 * The same transaction might appear in multiple sources:
 * - A nutzap might be in both nutzaps and spending history
 * - A zap might appear as both receipt and spending history
 */
function deduplicateAndSort(txs: Transaction[]): Transaction[] {
    // Remove duplicates based on event ID
    const seen = new Set<string>();
    const unique = txs.filter((tx) => {
        if (tx.event?.id && seen.has(tx.event.id)) {
            return false;
        }
        if (tx.event?.id) {
            seen.add(tx.event.id);
        }
        return true;
    });

    // Sort by timestamp descending (newest first)
    return unique.sort((a, b) => b.timestamp - a.timestamp);
}

/**
 * Try to match an incoming event to a pending payment and update status.
 */
export function matchEventToPending(
    event: NDKEvent,
    getPending: () => Map<string, PendingPayment>,
    updateStatus: (id: string, status: "complete", event: NDKEvent) => void,
): void {
    const pending = getPending();

    // Extract recipient from event
    const recipient = event.tagValue("p");
    if (!recipient) return;

    // Find matching pending payment
    for (const [id, payment] of pending.entries()) {
        if (payment.recipient === recipient && Math.abs(event.created_at! - payment.timestamp) < 120) {
            // Within 2 minutes
            updateStatus(id, "complete", event);
            return;
        }
    }
}
