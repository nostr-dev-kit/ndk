<!-- @ndk-version: image-card@0.1.0 -->
<!--
  @component ImageCard
  An optimized card for displaying image events (NIP-68).
  Features prominent image display with metadata and interactions.

  @example
  ```svelte
  <ImageCard {ndk} {image} />
  <ImageCard {ndk} {image} showActions={false} />
  <ImageCard {ndk} {image} imageHeight="h-96" />
  ```
-->
<script lang="ts">
	import type { NDKImage } from '@nostr-dev-kit/ndk';
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import { EventCard, ReactionAction } from '../../components/event-card/index.js';
	import { ImageContent } from '../../components/image-content/index.js';
	import RepostButton from './repost-button.svelte';
	import { cn } from '../../utils/index.js';

	interface Props {
		/** NDK instance */
		ndk: NDKSvelte;

		/** The image event to display */
		image: NDKImage;

		/** Make card clickable to navigate */
		interactive?: boolean;

		/** Show action buttons (repost, reaction) */
		showActions?: boolean;

		/** Show dropdown menu */
		showDropdown?: boolean;

		/** Show image metadata (dimensions, size, type) */
		showImageMeta?: boolean;

		/** Show image alt text */
		showAlt?: boolean;

		/** Custom image height class */
		imageHeight?: string;

		/** Additional CSS classes */
		class?: string;
	}

	let {
		ndk,
		image,
		interactive = false,
		showActions = true,
		showDropdown = true,
		showImageMeta = true,
		showAlt = true,
		imageHeight = 'max-h-[600px]',
		class: className = ''
	}: Props = $props();
</script>

<EventCard.Root
	{ndk}
	event={image}
	{interactive}
	class={cn(
		'overflow-hidden rounded-xl border border-border bg-card',
		'hover:shadow-lg transition-all duration-200',
		className
	)}
>
	<div class="p-4">
		<div class="flex items-start justify-between gap-2 mb-3">
			<EventCard.Header />
			{#if showDropdown}
				<EventCard.Dropdown />
			{/if}
		</div>

		{#if image.content}
			<p class="text-sm text-foreground mb-3 whitespace-pre-wrap">{image.content}</p>
		{/if}
	</div>

	<ImageContent {ndk} {image} showMeta={showImageMeta} showAlt={showAlt} imageClass={imageHeight} />

	{#if showActions}
		<div class="px-4 pb-4 pt-2">
			<EventCard.Actions>
				<RepostButton {ndk} event={image} />
				<ReactionAction />
			</EventCard.Actions>
		</div>
	{/if}
</EventCard.Root>
