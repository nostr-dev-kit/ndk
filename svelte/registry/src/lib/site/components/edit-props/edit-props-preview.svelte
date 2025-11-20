<script lang="ts">
	import type { NDKArticle, NDKEvent, NDKUser } from '@nostr-dev-kit/ndk';
	import { getContext } from 'svelte';
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import type { PropType } from './edit-props-context.svelte';
	import { User } from '$lib/registry/ui/user';

	interface Props {
		type: PropType;
		value: NDKUser | NDKEvent | NDKArticle | string | number | boolean;
	}

	let { type, value }: Props = $props();

	const ndk = getContext<NDKSvelte>('ndk');

	function formatTimestamp(timestamp: number): string {
		return new Date(timestamp * 1000).toLocaleDateString();
	}
</script>

<div class="text-sm">
	{#if type === 'user' && value instanceof Object && 'profile' in value}
		{@const user = value as NDKUser}
		<User.Root {ndk} pubkey={user.pubkey}>
			<div class="flex items-center gap-3">
				<User.Avatar class="w-10 h-10" />
				<div class="flex-1 min-w-0">
					<div class="font-medium text-foreground">
						<User.Name field="displayName" />
					</div>
					<User.Nip05 />
				</div>
			</div>
		</User.Root>
	{:else if type === 'article' && value instanceof Object && 'title' in value}
		{@const article = value as NDKArticle}
		<div class="flex flex-col gap-1">
			<div class="font-medium text-foreground">{article.title || 'Untitled'}</div>
			{#if article.summary}
				<div class="text-xs text-muted-foreground leading-normal">{article.summary.slice(0, 100)}...</div>
			{/if}
			{#if article.published_at}
				<div class="text-xs text-muted-foreground">{formatTimestamp(article.published_at)}</div>
			{/if}
		</div>
	{:else if type === 'event' && value instanceof Object && 'content' in value}
		{@const event = value as NDKEvent}
		<div class="flex flex-col gap-1">
			<div class="text-xs font-medium text-primary">Kind {event.kind}</div>
			<div class="text-xs text-muted-foreground leading-normal">{event.content.slice(0, 150)}...</div>
			{#if event.created_at}
				<div class="text-xs text-muted-foreground">{formatTimestamp(event.created_at)}</div>
			{/if}
		</div>
	{:else if type === 'hashtag' || type === 'text'}
		<div>
			<div class="text-foreground font-mono">"{value}"</div>
		</div>
	{:else}
		<div class="text-muted-foreground italic">Preview not available</div>
	{/if}
</div>
