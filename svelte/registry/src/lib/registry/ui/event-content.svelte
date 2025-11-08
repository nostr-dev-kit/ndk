<script lang="ts">
	import { getContext, setContext } from 'svelte';
	import type { NDKEvent } from '@nostr-dev-kit/ndk';
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import { createEventContent } from '../builders/event-content/event-content.svelte.js';
	import { defaultContentRenderer, type ContentRenderer } from './content-renderer';
	import { CONTENT_RENDERER_CONTEXT_KEY, type ContentRendererContext } from './content-renderer/content-renderer.context.js';
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

<div class="whitespace-pre-wrap break-words leading-relaxed {className}">
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
				<a href={segment.content} target="_blank" rel="noopener noreferrer" class="text-primary underline break-all hover:opacity-80">
					{segment.content}
				</a>
			{/if}
		{:else if segment.type === 'media'}
			{#if renderer.mediaComponent}
				{@const Component = renderer.mediaComponent}
				<Component url={segment.content} />
			{:else}
				{#if segment.content.match(/\.(jpg|jpeg|png|gif|webp|svg)(\?|$)/i)}
					<img src={segment.content} alt="" class="max-w-full h-auto rounded-lg my-2" />
				{:else if segment.content.match(/\.(mp4|webm|mov)(\?|$)/i)}
					<!-- svelte-ignore a11y_media_has_caption -->
					<video src={segment.content} controls class="max-w-full rounded-lg my-2"></video>
				{:else if segment.content.match(/youtube\.com|youtu\.be/i)}
					{@const videoId = segment.content.match(
						/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/
					)?.[1]}
					{#if videoId}
						<iframe
							src="https://www.youtube.com/embed/{videoId}"
							title="YouTube video"
							class="w-full aspect-video rounded-lg my-2"
							frameborder="0"
							allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
							allowfullscreen
						></iframe>
					{/if}
				{/if}
			{/if}
		{:else if segment.type === 'emoji'}
			{#if typeof segment.data === 'string'}
				<img src={segment.data} alt=":{segment.content}:" class="inline-block w-[1.25em] h-[1.25em] align-middle mx-[0.1em]" />
			{/if}
		{:else if segment.type === 'image-grid'}
			{#if segment.data && Array.isArray(segment.data)}
				{#if renderer.mediaComponent}
					{@const Component = renderer.mediaComponent}
					<Component url={segment.data} />
				{:else}
					<div class="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-2 my-2">
						{#each segment.data as url, j (j)}
							<img src={url} alt="" class="w-full h-auto object-cover rounded-lg aspect-square" />
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
					<div class="flex flex-col gap-1 my-2">
						{#each segment.data as url, j (j)}
							<!-- svelte-ignore a11y_invalid_attribute -->
							<a href={url} target="_blank" rel="noopener noreferrer" class="text-primary underline break-all hover:opacity-80">
								{url}
							</a>
						{/each}
					</div>
				{/if}
			{/if}
		{/if}
	{/each}
</div>
