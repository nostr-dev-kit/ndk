<script lang="ts">
	import type { NDKEvent } from '@nostr-dev-kit/ndk';
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import { createEventContent } from '$lib/registry/builders/event-content/event-content.svelte';
	import { ContentRenderer } from '$lib/registry/ui/content-renderer';
	import ClickableEmbeddedEvent from './clickable-embedded-event.svelte';

	interface Props {
		ndk: NDKSvelte;
		event?: NDKEvent;
		content?: string;
		emojiTags?: string[][];
		renderer: ContentRenderer;
		class?: string;
	}

	let {
		ndk,
		event,
		content: contentProp,
		emojiTags,
		renderer,
		class: className = ''
	}: Props = $props();

	const parsed = createEventContent(
		() => ({
			event,
			content: contentProp,
			emojiTags
		})
	);
</script>

<div class="event-rendering {className}">
	{#each parsed.segments as segment, i (i)}
		{#if segment.type === 'text'}
			{segment.content}
		{:else if segment.type === 'mention'}
			{#if segment.data && typeof segment.data === 'string'}
				{#if renderer.mentionComponent}
					{@const Component = renderer.mentionComponent}
					<Component {ndk} bech32={segment.data} />
				{:else}
					{segment.content}
				{/if}
			{/if}
		{:else if segment.type === 'event-ref'}
			{#if segment.data && typeof segment.data === 'string'}
				<ClickableEmbeddedEvent {ndk} bech32={segment.data} {renderer} />
			{/if}
		{:else if segment.type === 'hashtag'}
			{#if segment.data && typeof segment.data === 'string'}
				{#if renderer.hashtagComponent}
					{@const Component = renderer.hashtagComponent}
					<Component {ndk} tag={segment.data} />
				{:else}
					#{segment.data}
				{/if}
			{/if}
		{:else if segment.type === 'link'}
			{#if segment.data && Array.isArray(segment.data)}
				{#if renderer.linkComponent}
					{@const Component = renderer.linkComponent}
					{#each segment.data as url, j (j)}
						<Component {url} />
					{/each}
				{:else}
					{#each segment.data as url, j (j)}
						<a href={url} target="_blank" rel="noopener noreferrer" class="link">
							{url}
						</a>
					{/each}
				{/if}
			{/if}
		{:else if segment.type === 'media'}
			{#if segment.data && Array.isArray(segment.data)}
				{#if renderer.mediaComponent}
					{@const Component = renderer.mediaComponent}
					<Component url={segment.data} />
				{:else}
				{#each segment.data as url, j (j)}
					{url}
				{/each}
				{/if}
			{/if}
		{:else if segment.type === 'emoji'}
			{#if typeof segment.data === 'string'}
				<img src={segment.data} alt=":{segment.content}:" class="custom-emoji" />
			{/if}
		{/if}
	{/each}
</div>

<style>
	.event-rendering {
		white-space: pre-wrap;
		word-break: break-word;
		line-height: 1.6;
	}

	.link {
		color: var(--primary);
		text-decoration: underline;
		word-break: break-all;
	}

	.link:hover {
		opacity: 0.8;
	}

	.custom-emoji {
		display: inline-block;
		width: 1.25em;
		height: 1.25em;
		vertical-align: middle;
		margin: 0 0.1em;
	}
</style>
