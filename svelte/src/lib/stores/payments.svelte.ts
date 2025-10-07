import type { Hexpubkey, NDKEvent, NDKUser, NDKZapper } from "@nostr-dev-kit/ndk";
import type { PendingPayment, Transaction } from "../payments/types.js";
import { getZapperTarget, randomId, targetToId } from "../payments/types.js";

/**
 * Reactive wrapper around payments
 */
export class ReactivePaymentsStore {
    pending = $state<PendingPayment[]>([]);
    history = $state<Transaction[]>([]);
    byTarget = $state<Map<string, Transaction[]>>(new Map());

    /**
     * Get total zap amount sent to a target
     */
    getZapAmount(target: NDKUser | NDKEvent): number {
        const id = targetToId(target);
        const transactions = this.byTarget.get(id) || [];
        return transactions
            .filter((tx) => tx.type === "zap_sent" && tx.status === "complete")
            .reduce((sum, tx) => sum + tx.amount, 0);
    }

    /**
     * Check if user has zapped a target
     */
    isZapped(target: NDKUser | NDKEvent): boolean {
        const id = targetToId(target);
        const transactions = this.byTarget.get(id) || [];
        return transactions.some(
            (tx) => tx.type === "zap_sent" && (tx.status === "complete" || tx.status === "pending"),
        );
    }

    /**
     * Add a pending payment
     */
    addPending(zapper: NDKZapper, sender: Hexpubkey): void {
        const { id: targetId, type: targetType } = getZapperTarget(zapper);
        const amount = zapper.amount;
        const unit = zapper.unit;

        const pending: PendingPayment = {
            internalId: randomId(),
            targetId,
            targetType,
            target: zapper.target,
            recipient: targetType === "user" ? targetId : zapper.target.pubkey,
            sender,
            amount,
            unit,
            status: "pending",
            comment: zapper.comment,
            timestamp: Date.now(),
            zapper,
        };

        this.pending = [...this.pending, pending];
    }

    /**
     * Mark a pending payment as complete and move to history
     */
    completePending(internalId: string, event: NDKEvent): void {
        const pending = this.pending.find((p) => p.internalId === internalId);
        if (!pending) return;

        const transaction: Transaction = {
            id: event.id,
            type: "zap_sent",
            direction: "out",
            status: "complete",
            amount: pending.amount,
            unit: pending.unit,
            timestamp: event.created_at || pending.timestamp,
            target: pending.target,
            targetId: pending.targetId,
            targetType: pending.targetType,
            recipient: pending.recipient,
            sender: pending.sender,
            comment: pending.comment,
            event,
        };

        // Remove from pending
        this.pending = this.pending.filter((p) => p.internalId !== internalId);

        // Add to history
        this.history = [...this.history, transaction];

        // Add to byTarget
        const targetTransactions = this.byTarget.get(pending.targetId) || [];
        this.byTarget.set(pending.targetId, [...targetTransactions, transaction]);
    }

    /**
     * Mark a pending payment as failed
     */
    failPending(internalId: string, error: string): void {
        const pending = this.pending.find((p) => p.internalId === internalId);
        if (!pending) return;

        pending.status = "failed";
        pending.error = error;

        // Trigger reactivity
        this.pending = [...this.pending];
    }
}

export function createReactivePayments(): ReactivePaymentsStore {
    return new ReactivePaymentsStore();
}
