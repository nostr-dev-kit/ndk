<script lang="ts">
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import { EventCard } from '$lib/ndk/event-card';
	import type { NDKEvent } from '@nostr-dev-kit/ndk';

	interface Props {
		ndk: NDKSvelte;
	}

	let { ndk }: Props = $props();

	// Subscribe to zap events from your follows
	// $metaSubscribe automatically fetches the zapped events
	const feed = ndk.$metaSubscribe(() => ({
		filters: [{ kinds: [9735], authors: [...ndk.$follows] }],
		sort: 'tag-time'
	}));

	// Derive sorted events for display
	const events = $derived(feed.events.slice(0, 10));

	// Format zap amount from millisats
	function formatZapAmount(millisats: number): string {
		const sats = Math.floor(millisats / 1000);
		if (sats >= 1000000) {
			return `${(sats / 1000000).toFixed(1)}M`;
		}
		if (sats >= 1000) {
			return `${(sats / 1000).toFixed(1)}K`;
		}
		return sats.toString();
	}

	// Get total zap amount for an event
	function getTotalZaps(event: NDKEvent): number {
		const zaps = feed.eventsTagging(event);
		return zaps.reduce((total, zap) => {
			const bolt11 = zap.getMatchingTags('bolt11')[0]?.[1];
			if (!bolt11) return total;

			// Extract amount from bolt11 invoice
			const match = bolt11.match(/lnbc(\d+)([munp]?)/i);
			if (!match) return total;

			const amount = parseInt(match[1]);
			const unit = match[2]?.toLowerCase() || '';

			// Convert to millisats
			let millisats = amount;
			if (unit === 'm') millisats = amount * 100000000; // milli-bitcoin
			else if (unit === 'u') millisats = amount * 100000; // micro-bitcoin
			else if (unit === 'n') millisats = amount * 100; // nano-bitcoin
			else if (unit === 'p') millisats = amount / 10; // pico-bitcoin

			return total + millisats;
		}, 0);
	}

	// Get unique zapper count
	function getZapperCount(event: NDKEvent): number {
		const zaps = feed.eventsTagging(event);
		const uniqueZappers = new Set(zaps.map((z) => z.pubkey));
		return uniqueZappers.size;
	}
</script>

<div class="zapped-feed">
	{#if !feed.eosed && events.length === 0}
		<div class="loading">
			<div class="spinner"></div>
			<p>Loading zapped events from your network...</p>
		</div>
	{:else if events.length === 0}
		<div class="empty-state">
			<p class="empty-title">No zaps yet</p>
			<p class="empty-description">
				Events zapped by people you follow will appear here. Follow more people or wait for them to
				zap content!
			</p>
		</div>
	{:else}
		<div class="feed-header">
			<h4 class="feed-title">Recently Zapped by Your Network</h4>
			<div class="feed-stats">
				<span class="stat">{feed.count} events</span>
				<span class="separator">•</span>
				<span class="stat">{feed.eosed ? 'Live' : 'Loading...'}</span>
			</div>
		</div>

		<div class="events-list">
			{#each events as event (event.id)}
				{@const totalSats = getTotalZaps(event)}
				{@const zapperCount = getZapperCount(event)}

				<EventCard.Root {ndk} {event}>
					<EventCard.Header variant="compact" />

					<EventCard.Content truncate={280} />

					<div class="zap-info">
						<div class="zap-badge">
							<span class="zap-emoji">⚡</span>
							<span class="zap-amount">{formatZapAmount(totalSats)} sats</span>
						</div>
						<span class="zap-count">
							from {zapperCount} {zapperCount === 1 ? 'person' : 'people'}
						</span>
					</div>
				</EventCard.Root>
			{/each}
		</div>

		{#if feed.count > 10}
			<div class="more-indicator">
				<p>+{feed.count - 10} more zapped events</p>
			</div>
		{/if}
	{/if}
</div>

<style>
	.zapped-feed {
		width: 100%;
		min-height: 300px;
	}

	.loading {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 3rem;
		gap: 1rem;
	}

	.spinner {
		width: 2rem;
		height: 2rem;
		border: 3px solid var(--color-border);
		border-top-color: var(--color-primary);
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.loading p {
		font-size: 0.875rem;
		color: var(--color-muted-foreground);
		margin: 0;
	}

	.empty-state {
		padding: 3rem 2rem;
		text-align: center;
		border: 1px dashed var(--color-border);
		border-radius: 0.5rem;
	}

	.empty-title {
		font-size: 1.125rem;
		font-weight: 600;
		color: var(--color-foreground);
		margin: 0 0 0.5rem 0;
	}

	.empty-description {
		font-size: 0.875rem;
		color: var(--color-muted-foreground);
		margin: 0;
	}

	.feed-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem 0;
		border-bottom: 1px solid var(--color-border);
		margin-bottom: 1rem;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.feed-title {
		font-size: 1rem;
		font-weight: 600;
		color: var(--color-foreground);
		margin: 0;
	}

	.feed-stats {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.875rem;
		color: var(--color-muted-foreground);
	}

	.stat {
		font-weight: 500;
	}

	.separator {
		opacity: 0.5;
	}

	.events-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.zap-info {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.75rem 0 0 0;
		border-top: 1px solid var(--color-border);
		margin-top: 0.75rem;
	}

	.zap-badge {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.375rem 0.75rem;
		background: linear-gradient(135deg, hsl(45, 100%, 50%) 0%, hsl(35, 100%, 50%) 100%);
		border-radius: 1rem;
		font-weight: 600;
		font-size: 0.875rem;
		color: hsl(25, 40%, 20%);
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.zap-emoji {
		font-size: 1rem;
		line-height: 1;
	}

	.zap-amount {
		line-height: 1;
	}

	.zap-count {
		font-size: 0.8125rem;
		color: var(--color-muted-foreground);
	}

	.more-indicator {
		text-align: center;
		padding: 1.5rem 0 0.5rem;
		border-top: 1px dashed var(--color-border);
		margin-top: 1.5rem;
	}

	.more-indicator p {
		font-size: 0.875rem;
		color: var(--color-muted-foreground);
		margin: 0;
		font-weight: 500;
	}
</style>
