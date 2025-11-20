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

	// Get parent context for renderer
	const parentContext = getContext<ContentRendererContext | undefined>(CONTENT_RENDERER_CONTEXT_KEY);
	const renderer = $derived(rendererProp ?? parentContext?.renderer ?? defaultContentRenderer);

	// Set ContentRendererContext for nested components
	setContext(CONTENT_RENDERER_CONTEXT_KEY, {
		get renderer() { return renderer; }
	});

	const parsed = createEventContent(
		() => ({
			event,
			content: contentProp,
			emojiTags
		})
	);
</script>

<div class="whitespace-pre-wrap wrap-break-all break-all  leading-relaxed {className}">
	{#each parsed.segments as segment, i (i)}
		{#if segment.type === 'text'}
			{segment.content}
		{:else if segment.type === 'npub' || segment.type === 'nprofile'}
			{#if segment.data && typeof segment.data === 'string'}
				{#if renderer.mentionComponent}
					{@const Component = renderer.mentionComponent}
					<Component {ndk} bech32={segment.data} onclick={renderer.onUserClick} />
				{:else}
					{segment.content}
				{/if}
			{/if}
		{:else if segment.type === 'event-ref'}
			{#if segment.data && typeof segment.data === 'string'}
				<EmbeddedEvent {ndk} bech32={segment.data} onclick={renderer.onEventClick} />
			{/if}
		{:else if segment.type === 'hashtag'}
			{#if segment.data && typeof segment.data === 'string'}
				{#if renderer.hashtagComponent}
					{@const Component = renderer.hashtagComponent}
					<Component {ndk} tag={segment.data} onclick={renderer.onHashtagClick} />
				{:else}
					#{segment.data}
				{/if}
			{/if}
		{:else if segment.type === 'link'}
			{#if renderer.linkComponent}
				{@const Component = renderer.linkComponent}
				<Component url={segment.content} onclick={renderer.onLinkClick} />
			{:else}
				{segment.content}
			{/if}
		{:else if segment.type === 'media'}
			{#if renderer.mediaComponent}
				{@const Component = renderer.mediaComponent}
				<Component url={[segment.content]} onclick={renderer.onMediaClick} />
			{:else}
				{segment.content}
			{/if}
		{:else if segment.type === 'emoji'}
			{#if typeof segment.data === 'string'}
				<img src={segment.data} alt=":{segment.content}:" class="inline-block w-[1.25em] h-[1.25em] align-middle mx-[0.1em]" />
			{/if}
		{:else if segment.type === 'image-grid'}
			{#if segment.data && Array.isArray(segment.data)}
				{#if renderer.mediaComponent}
					{@const Component = renderer.mediaComponent}
					<Component url={segment.data} onclick={renderer.onMediaClick} />
				{:else}
					{#each segment.data as url, j (j)}
						<img src={url} alt="" class="w-full h-auto object-cover rounded-lg aspect-square" />
					{/each}
				{/if}
			{/if}
		{:else if segment.type === 'link-group'}
			{#if segment.data && Array.isArray(segment.data)}
				{#if renderer.linkComponent}
					{@const Component = renderer.linkComponent}
					{#each segment.data as url, j (j)}
						<Component {url} onclick={renderer.onLinkClick} />
					{/each}
				{:else}
					{#each segment.data as url, j (j)}
						{url}
					{/each}
				{/if}
			{/if}
		{/if}
	{/each}
</div>
