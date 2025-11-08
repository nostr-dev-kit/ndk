<script lang="ts">
	import type { NDKImage } from '@nostr-dev-kit/ndk';
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import { EventCard } from '../event-card/index.js';
	import { ReactionAction } from '../reaction/index.js';
	import { ImageContent } from '../image-content/index.js';
	import RepostButton from '../repost-button/repost-button.svelte';
	import { cn } from '../../../utils/cn';

	interface Props {
		ndk: NDKSvelte;

		image: NDKImage;

		interactive?: boolean;

		showActions?: boolean;

		showDropdown?: boolean;

		showImageMeta?: boolean;

		showAlt?: boolean;

		imageHeight?: string;

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
    data-image-card=""
	{ndk}
	event={image}
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
