<script lang="ts">
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import { EventCard } from '$lib/registry/components/event-card';
	import { User } from '$lib/registry/ui/user';
	import type { NDKEvent } from '@nostr-dev-kit/ndk';

	interface Props {
		ndk: NDKSvelte;
	}

	let { ndk }: Props = $props();

	let sortOption = $state<'tag-time' | 'count' | 'time' | 'unique-authors'>('tag-time');

	// Subscribe to repost events from your follows
	// $metaSubscribe automatically fetches the reposted content
	const feed = ndk.$metaSubscribe(() => ({
		filters: [{ kinds: [6, 16], authors: [...ndk.$follows] }],
		sort: sortOption
	}));

	// Derive sorted events for display
	const events = $derived(feed.events.slice(0, 10));

	// Get repost count for an event
	function getRepostCount(event: NDKEvent): number {
		return feed.eventsTagging(event).length;
	}

	// Get unique reposter count
	function getReposterCount(event: NDKEvent): number {
		const reposts = feed.eventsTagging(event);
		const uniqueReposters = new Set(reposts.map((r) => r.pubkey));
		return uniqueReposters.size;
	}

	// Get reposters for display
	function getReposters(event: NDKEvent): NDKEvent[] {
		return feed.eventsTagging(event);
	}
</script>

<div class="repost-feed">
	<div class="sort-controls">
		<label class="sort-button" class:active={sortOption === 'tag-time'}>
			<input type="radio" name="sort" value="tag-time" bind:group={sortOption} />
			<span class="sort-label">
				<strong>Most Recent</strong>
				<small>Newest reposts first</small>
			</span>
		</label>
		<label class="sort-button" class:active={sortOption === 'count'}>
			<input type="radio" name="sort" value="count" bind:group={sortOption} />
			<span class="sort-label">
				<strong>Most Popular</strong>
				<small>Most reposted first</small>
			</span>
		</label>
		<label class="sort-button" class:active={sortOption === 'time'}>
			<input type="radio" name="sort" value="time" bind:group={sortOption} />
			<span class="sort-label">
				<strong>Newest Content</strong>
				<small>By creation time</small>
			</span>
		</label>
		<label class="sort-button" class:active={sortOption === 'unique-authors'}>
			<input type="radio" name="sort" value="unique-authors" bind:group={sortOption} />
			<span class="sort-label">
				<strong>Most Diverse</strong>
				<small>Unique reposters</small>
			</span>
		</label>
	</div>

	{#if !feed.eosed && events.length === 0}
		<div class="loading">
			<div class="spinner"></div>
			<p>Loading reposted content from your network...</p>
		</div>
	{:else if events.length === 0}
		<div class="empty-state">
			<p class="empty-title">No reposts yet</p>
			<p class="empty-description">
				Content reposted by people you follow will appear here. Follow more people or wait for them
				to repost content!
			</p>
		</div>
	{:else}
		<div class="feed-header">
			<h4 class="feed-title">Reposted by Your Network</h4>
			<div class="feed-stats">
				<span class="stat">{feed.count} events</span>
				<span class="separator">•</span>
				<span class="stat">{feed.eosed ? 'Live' : 'Loading...'}</span>
			</div>
		</div>

		<div class="events-list">
			{#each events as event (event.id)}
				{@const repostCount = getRepostCount(event)}
				{@const reposterCount = getReposterCount(event)}
				{@const reposters = getReposters(event)}

				<EventCard.Root {ndk} {event}>
					<EventCard.Header variant="compact" />

					<EventCard.Content truncate={280} />

					<div class="repost-info">
						<div class="repost-stats">
							<div class="repost-badge">
								<span class="repost-emoji">🔁</span>
								<span class="repost-count">{repostCount} {repostCount === 1 ? 'repost' : 'reposts'}</span>
							</div>
							<span class="reposter-count">
								from {reposterCount} {reposterCount === 1 ? 'person' : 'people'}
							</span>
						</div>
						<div class="reposters-avatars">
							{#each reposters.slice(0, 5) as reposter (reposter.pubkey)}
								<div class="avatar-wrapper">
									<User.Root {ndk} pubkey={reposter.pubkey}>
										<User.Avatar class="w-7 h-7" />
									</User.Root>
								</div>
							{/each}
							{#if reposters.length > 5}
								<div class="avatar-more">+{reposters.length - 5}</div>
							{/if}
						</div>
					</div>
				</EventCard.Root>
			{/each}
		</div>

		{#if feed.count > 10}
			<div class="more-indicator">
				<p>+{feed.count - 10} more reposted events</p>
			</div>
		{/if}
	{/if}
</div>

<style>
	.repost-feed {
		width: 100%;
		min-height: 300px;
	}

	.sort-controls {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
		gap: 0.5rem;
		margin-bottom: 1.5rem;
		padding: 1rem;
		background: var(--muted);
		border-radius: 0.5rem;
	}

	.sort-button {
		cursor: pointer;
		display: block;
	}

	.sort-button input[type='radio'] {
		display: none;
	}

	.sort-label {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		padding: 0.75rem;
		background: var(--background);
		border: 2px solid var(--border);
		border-radius: 0.5rem;
		transition: all 0.2s;
	}

	.sort-button.active .sort-label {
		background: var(--primary);
		border-color: var(--primary);
		color: var(--primary-foreground);
	}

	.sort-button:hover .sort-label {
		border-color: var(--primary);
	}

	.sort-label strong {
		font-size: 0.875rem;
	}

	.sort-label small {
		font-size: 0.75rem;
		opacity: 0.8;
	}

	.sort-button.active .sort-label strong,
	.sort-button.active .sort-label small {
		color: var(--primary-foreground);
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
		border: 3px solid var(--border);
		border-top-color: var(--primary);
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
		color: var(--muted-foreground);
		margin: 0;
	}

	.empty-state {
		padding: 3rem 2rem;
		text-align: center;
		border: 1px dashed var(--border);
		border-radius: 0.5rem;
	}

	.empty-title {
		font-size: 1.125rem;
		font-weight: 600;
		color: var(--foreground);
		margin: 0 0 0.5rem 0;
	}

	.empty-description {
		font-size: 0.875rem;
		color: var(--muted-foreground);
		margin: 0;
	}

	.feed-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem 0;
		border-bottom: 1px solid var(--border);
		margin-bottom: 1rem;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.feed-title {
		font-size: 1rem;
		font-weight: 600;
		color: var(--foreground);
		margin: 0;
	}

	.feed-stats {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.875rem;
		color: var(--muted-foreground);
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

	.repost-info {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
		padding: 0.75rem 0 0 0;
		border-top: 1px solid var(--border);
		margin-top: 0.75rem;
		flex-wrap: wrap;
	}

	.repost-stats {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.repost-badge {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.375rem 0.75rem;
		background: linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary) / 0.8) 100%);
		border-radius: 1rem;
		font-weight: 600;
		font-size: 0.875rem;
		color: var(--primary-foreground);
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.repost-emoji {
		font-size: 1rem;
		line-height: 1;
	}

	.repost-count {
		line-height: 1;
	}

	.reposter-count {
		font-size: 0.8125rem;
		color: var(--muted-foreground);
	}

	.reposters-avatars {
		display: flex;
		align-items: center;
		gap: 0.25rem;
	}

	.avatar-wrapper {
		position: relative;
		border: 2px solid var(--background);
		border-radius: 50%;
		transition: transform 0.2s;
	}

	.avatar-wrapper:hover {
		transform: scale(1.15);
		z-index: 10;
	}

	.avatar-more {
		background: var(--muted);
		color: var(--muted-foreground);
		font-size: 0.75rem;
		font-weight: 600;
		padding: 0.25rem 0.5rem;
		border-radius: 1rem;
		min-width: 28px;
		height: 28px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.more-indicator {
		text-align: center;
		padding: 1.5rem 0 0.5rem;
		border-top: 1px dashed var(--border);
		margin-top: 1.5rem;
	}

	.more-indicator p {
		font-size: 0.875rem;
		color: var(--muted-foreground);
		margin: 0;
		font-weight: 500;
	}
</style>
