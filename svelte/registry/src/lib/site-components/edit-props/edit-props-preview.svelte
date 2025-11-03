<script lang="ts">
	import type { NDKArticle, NDKEvent, NDKUser } from '@nostr-dev-kit/ndk';
	import { getContext } from 'svelte';
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import type { PropType } from './edit-props-context.svelte';
	import { User } from '$lib/registry/ui';

	interface Props {
		type: PropType;
		value: NDKUser | NDKEvent | NDKArticle | string;
	}

	let { type, value }: Props = $props();

	const ndk = getContext<NDKSvelte>('ndk');

	function formatTimestamp(timestamp: number): string {
		return new Date(timestamp * 1000).toLocaleDateString();
	}
</script>

<div class="preview">
	{#if type === 'user' && value instanceof Object && 'profile' in value}
		{@const user = value as NDKUser}
		<User.Root {ndk} pubkey={user.pubkey}>
			<div class="preview-user">
				<User.Avatar size={40} />
				<div class="preview-user-info">
					<div class="preview-user-name">
						<User.Name field="displayName" />
					</div>
					<User.Nip05 class="preview-user-nip05" />
				</div>
			</div>
		</User.Root>
	{:else if type === 'article' && value instanceof Object && 'title' in value}
		{@const article = value as NDKArticle}
		<div class="preview-article">
			<div class="preview-article-title">{article.title || 'Untitled'}</div>
			{#if article.summary}
				<div class="preview-article-summary">{article.summary.slice(0, 100)}...</div>
			{/if}
			{#if article.published_at}
				<div class="preview-article-date">{formatTimestamp(article.published_at)}</div>
			{/if}
		</div>
	{:else if type === 'event' && value instanceof Object && 'content' in value}
		{@const event = value as NDKEvent}
		<div class="preview-event">
			<div class="preview-event-kind">Kind {event.kind}</div>
			<div class="preview-event-content">{event.content.slice(0, 150)}...</div>
			{#if event.created_at}
				<div class="preview-event-date">{formatTimestamp(event.created_at)}</div>
			{/if}
		</div>
	{:else if type === 'hashtag' || type === 'text'}
		<div class="preview-text">
			<div class="preview-text-value">"{value}"</div>
		</div>
	{:else}
		<div class="preview-unknown">Preview not available</div>
	{/if}
</div>

<style>
	.preview {
		font-size: 0.875rem;
	}

	.preview-user {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}


	.preview-user-info {
		flex: 1;
		min-width: 0;
	}

	.preview-user-name {
		font-weight: 500;
		color: var(--color-foreground);
	}

	.preview-user-nip05 {
		font-size: 0.75rem;
		color: var(--color-muted-foreground);
	}

	.preview-article,
	.preview-event {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.preview-article-title {
		font-weight: 500;
		color: var(--color-foreground);
	}

	.preview-article-summary,
	.preview-event-content {
		font-size: 0.75rem;
		color: var(--color-muted-foreground);
		line-height: 1.4;
	}

	.preview-article-date,
	.preview-event-date {
		font-size: 0.75rem;
		color: var(--color-muted-foreground);
	}

	.preview-event-kind {
		font-size: 0.75rem;
		font-weight: 500;
		color: var(--primary);
	}

	.preview-text-value {
		color: var(--color-foreground);
		font-family: monospace;
	}

	.preview-unknown {
		color: var(--color-muted-foreground);
		font-style: italic;
	}
</style>
