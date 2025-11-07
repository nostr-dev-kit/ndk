<!-- @ndk-version: event-content@0.8.0 -->
<script lang="ts">
	import { getContext, setContext } from 'svelte';
	import type { NDKEvent } from '@nostr-dev-kit/ndk';
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import { createEventContent } from '$lib/registry/builders/event-content/event-content.svelte.js';
	import { defaultContentRenderer, type ContentRenderer } from './content-renderer.svelte.js';
	import { CONTENT_RENDERER_CONTEXT_KEY, type ContentRendererContext } from './content-renderer.context.js';
	import EmbeddedEvent from './embedded-event.svelte';

	interface EventContentProps {
		ndk: NDKSvelte;
		event?: NDKEvent;
		content?: string;
		emojiTags?: string[][];
		renderer?: ContentRenderer;
		class?: string;
	}

	let {
		ndk,
		event,
		content: contentProp,
		emojiTags,
		renderer: rendererProp,
		class: className = ''
	}: EventContentProps = $props();

	// Use renderer from prop, or from context, or fallback to default
	const rendererContext = getContext<ContentRendererContext | undefined>(CONTENT_RENDERER_CONTEXT_KEY);
	const renderer = $derived(rendererProp ?? rendererContext?.renderer ?? defaultContentRenderer);

	// Set renderer in context so nested components (EmbeddedEvent) can access it
	setContext(CONTENT_RENDERER_CONTEXT_KEY, { renderer });

	const parsed = createEventContent(
		() => ({
			event,
			content: contentProp,
			emojiTags
		})
	);
</script>

<div class="event-content {className}">
	{#each parsed.segments as segment, i (i)}
		{#if segment.type === 'text'}
			{segment.content}
		{:else if segment.type === 'npub' || segment.type === 'nprofile'}
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
				<EmbeddedEvent {ndk} bech32={segment.data} />
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
			{#if renderer.linkComponent}
				{@const Component = renderer.linkComponent}
				<Component url={segment.content} />
			{:else}
				<!-- svelte-ignore a11y_invalid_attribute -->
				<a href={segment.content} target="_blank" rel="noopener noreferrer" class="link">
					{segment.content}
				</a>
			{/if}
		{:else if segment.type === 'media'}
			{#if renderer.mediaComponent}
				{@const Component = renderer.mediaComponent}
				<Component url={segment.content} />
			{:else}
				{#if segment.content.match(/\.(jpg|jpeg|png|gif|webp|svg)(\?|$)/i)}
					<img src={segment.content} alt="" class="media-image" />
				{:else if segment.content.match(/\.(mp4|webm|mov)(\?|$)/i)}
					<!-- svelte-ignore a11y_media_has_caption -->
					<video src={segment.content} controls class="media-video"></video>
				{:else if segment.content.match(/youtube\.com|youtu\.be/i)}
					{@const videoId = segment.content.match(
						/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/
					)?.[1]}
					{#if videoId}
						<iframe
							src="https://www.youtube.com/embed/{videoId}"
							title="YouTube video"
							class="media-youtube"
							frameborder="0"
							allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
							allowfullscreen
						></iframe>
					{/if}
				{/if}
			{/if}
		{:else if segment.type === 'emoji'}
			{#if typeof segment.data === 'string'}
				<img src={segment.data} alt=":{segment.content}:" class="custom-emoji" />
			{/if}
		{:else if segment.type === 'image-grid'}
			{#if segment.data && Array.isArray(segment.data)}
				{#if renderer.mediaComponent}
					{@const Component = renderer.mediaComponent}
					<Component url={segment.data} />
				{:else}
					<div class="image-grid">
						{#each segment.data as url, j (j)}
							<img src={url} alt="" class="grid-image" />
						{/each}
					</div>
				{/if}
			{/if}
		{:else if segment.type === 'link-group'}
			{#if segment.data && Array.isArray(segment.data)}
				{#if renderer.linkComponent}
					{@const Component = renderer.linkComponent}
					<Component url={segment.data} />
				{:else}
					<div class="link-group">
						{#each segment.data as url, j (j)}
							<!-- svelte-ignore a11y_invalid_attribute -->
							<a href={url} target="_blank" rel="noopener noreferrer" class="link">
								{url}
							</a>
						{/each}
					</div>
				{/if}
			{/if}
		{/if}
	{/each}
</div>

<style>
	.event-content {
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

	.media-image {
		max-width: 100%;
		height: auto;
		border-radius: 0.5rem;
		margin: 0.5rem 0;
	}

	.media-video {
		max-width: 100%;
		border-radius: 0.5rem;
		margin: 0.5rem 0;
	}

	.media-youtube {
		width: 100%;
		aspect-ratio: 16 / 9;
		border-radius: 0.5rem;
		margin: 0.5rem 0;
	}

	.custom-emoji {
		display: inline-block;
		width: 1.25em;
		height: 1.25em;
		vertical-align: middle;
		margin: 0 0.1em;
	}

	.image-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 0.5rem;
		margin: 0.5rem 0;
	}

	.grid-image {
		width: 100%;
		height: auto;
		object-fit: cover;
		border-radius: 0.5rem;
		aspect-ratio: 1;
	}

	.link-group {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		margin: 0.5rem 0;
	}
</style>
