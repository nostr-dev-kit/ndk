import type { NDKNWCTransaction } from "./types.js";
import type { NDKWalletTransaction } from "../index.js";

/**
 * Converts an NWC transaction to the unified wallet transaction format.
 * Normalizes direction naming and converts millisats to sats.
 */
export function toWalletTransaction(tx: NDKNWCTransaction): NDKWalletTransaction {
    return {
        id: tx.payment_hash,
        direction: tx.type === "incoming" ? "in" : "out",
        amount: Math.floor(tx.amount / 1000),
        timestamp: tx.created_at,
        description: tx.description,
        fee: tx.fees_paid ? Math.floor(tx.fees_paid / 1000) : undefined,
        invoice: tx.invoice,
    };
}
