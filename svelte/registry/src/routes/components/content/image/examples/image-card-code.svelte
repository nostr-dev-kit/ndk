<script lang="ts">
	import type { NDKImage } from '@nostr-dev-kit/ndk';
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import { EventCard, ReactionAction } from '$lib/registry/components/event-card';
	import { ImageContent } from '$lib/registry/components/image-content';
	import RepostButton from '$lib/registry/components/actions/repost-button.svelte';

	interface Props {
		ndk: NDKSvelte;
		image: NDKImage;
	}

	let { ndk, image }: Props = $props();
</script>

<EventCard.Root
	{ndk}
	event={image}
	class="overflow-hidden rounded-xl border border-border bg-card hover:shadow-lg transition-all"
>
	<div class="p-4">
		<div class="flex items-start justify-between gap-2 mb-3">
			<EventCard.Header />
			<EventCard.Dropdown />
		</div>

		{#if image.content}
			<p class="text-sm mb-3">{image.content}</p>
		{/if}
	</div>

	<ImageContent {ndk} {image} imageClass="max-h-[600px]" />

	<div class="px-4 pb-4 pt-2">
		<EventCard.Actions>
			<RepostButton {ndk} event={image} />
			<ReactionAction />
		</EventCard.Actions>
	</div>
</EventCard.Root>
