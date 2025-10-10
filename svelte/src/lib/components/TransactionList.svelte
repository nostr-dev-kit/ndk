<script lang="ts">
	import { useTransactions } from '../payments/runes.svelte.js';
	import type { NDKSvelte } from '$lib/ndk-svelte.svelte.js';
	import type { Transaction } from '../payments/types.js';

	interface Props {
		ndk: NDKSvelte;
		limit?: number;
		direction?: 'in' | 'out';
	}

	let { ndk, limit, direction }: Props = $props();

	// Reactive transaction list
	const transactions = useTransactions(ndk, { limit, direction });

	// Access the value property with computed properties
	const reactiveTxs = $derived(transactions.value.map(tx => enrichTransaction(tx)));

	// Helper to enrich transactions with computed properties
	function enrichTransaction(tx: Transaction) {
		const isPending = tx.status === 'pending';
		const isFailed = tx.status === 'failed';
		const isIncoming = tx.direction === 'in';
		const isOutgoing = tx.direction === 'out';

		const formattedAmount = `${isOutgoing ? '-' : '+'} ${tx.amount} ${tx.unit}`;

		const relativeTime = formatRelativeTime(tx.timestamp);

		return {
			...tx,
			isPending,
			isFailed,
			isIncoming,
			isOutgoing,
			formattedAmount,
			relativeTime,
		};
	}

	function formatRelativeTime(timestamp: number): string {
		const now = Date.now();
		const diff = now - timestamp;
		const seconds = Math.floor(diff / 1000);
		const minutes = Math.floor(seconds / 60);
		const hours = Math.floor(minutes / 60);
		const days = Math.floor(hours / 24);

		if (seconds < 60) return 'just now';
		if (minutes < 60) return `${minutes}m ago`;
		if (hours < 24) return `${hours}h ago`;
		if (days < 7) return `${days}d ago`;
		return new Date(timestamp).toLocaleDateString();
	}
</script>

<div class="transaction-list">
	{#if reactiveTxs.length === 0}
		<div class="empty">
			<span class="icon">💸</span>
			<p>No transactions yet</p>
			<p class="hint">Your payment activity will appear here</p>
		</div>
	{:else}
		{#each reactiveTxs as tx (tx.id)}
			<div
				class="tx-item"
				class:pending={tx.isPending}
				class:failed={tx.isFailed}
			>
				<div
					class="tx-icon"
					class:incoming={tx.isIncoming}
					class:outgoing={tx.isOutgoing}
				>
					{tx.isIncoming ? '↓' : '↑'}
				</div>

				<div class="tx-info">
					<div class="tx-type">
						{tx.isIncoming ? 'Received' : 'Sent'}
						{#if tx.comment}
							<span class="comment">· {tx.comment}</span>
						{/if}
					</div>
					<div class="tx-time">{tx.relativeTime}</div>
				</div>

				<div
					class="tx-amount"
					class:incoming={tx.isIncoming}
					class:outgoing={tx.isOutgoing}
				>
					{tx.formattedAmount}
				</div>

				{#if tx.isPending}
					<div class="tx-status">⏳</div>
				{/if}
				{#if tx.isFailed}
					<div class="tx-status">❌</div>
				{/if}
			</div>
		{/each}
	{/if}
</div>

<style>
	.transaction-list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.75rem;
		padding: 3rem 1rem;
		background: rgba(255, 255, 255, 0.02);
		border: 1px dashed rgba(255, 255, 255, 0.1);
		border-radius: 16px;
		text-align: center;
	}

	.empty .icon {
		font-size: 3rem;
		opacity: 0.5;
	}

	.empty p {
		margin: 0;
		color: rgba(255, 255, 255, 0.6);
	}

	.empty .hint {
		font-size: 0.875rem;
		color: rgba(255, 255, 255, 0.4);
	}

	.tx-item {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 1rem;
		background: rgba(255, 255, 255, 0.03);
		border: 1px solid rgba(255, 255, 255, 0.06);
		border-radius: 12px;
		transition: all 0.2s;
	}

	.tx-item.pending {
		opacity: 0.7;
	}

	.tx-item:hover {
		background: rgba(255, 255, 255, 0.05);
		border-color: rgba(255, 255, 255, 0.1);
	}

	.tx-icon {
		width: 40px;
		height: 40px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.25rem;
		font-weight: 600;
		flex-shrink: 0;
	}

	.tx-icon.incoming {
		background: linear-gradient(
			135deg,
			rgba(16, 185, 129, 0.2) 0%,
			rgba(5, 150, 105, 0.2) 100%
		);
		color: #10b981;
	}

	.tx-icon.outgoing {
		background: linear-gradient(
			135deg,
			rgba(249, 115, 22, 0.2) 0%,
			rgba(234, 88, 12, 0.2) 100%
		);
		color: #f97316;
	}

	.tx-info {
		flex: 1;
		min-width: 0;
	}

	.tx-type {
		font-weight: 600;
		font-size: 0.9375rem;
		color: rgba(255, 255, 255, 0.9);
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.comment {
		font-weight: 400;
		color: rgba(255, 255, 255, 0.6);
		font-size: 0.875rem;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.tx-time {
		font-size: 0.8125rem;
		color: rgba(255, 255, 255, 0.5);
		margin-top: 0.125rem;
	}

	.tx-amount {
		font-weight: 700;
		font-size: 0.9375rem;
		white-space: nowrap;
	}

	.tx-amount.incoming {
		color: #10b981;
	}

	.tx-amount.outgoing {
		color: #f97316;
	}

	.tx-status {
		font-size: 1.25rem;
	}
</style>
