<script lang="ts">
	import type { NDKEvent } from '@nostr-dev-kit/ndk';
	import type { NDKSvelte, ThreadingMetadata } from '@nostr-dev-kit/svelte';
	import { EventCard, ReactionAction } from '$lib/ndk/event-card';
	import { RepostButton } from '$lib/ndk/blocks';
	import { cn } from '$lib/utils';

	interface Props {
		ndk: NDKSvelte;
		event: NDKEvent;
		threading?: ThreadingMetadata;
		interactive?: boolean;
		showActions?: boolean;
		showDropdown?: boolean;
		truncate?: number;
	}

	let {
		ndk,
		event,
		threading,
		interactive = false,
		showActions = true,
		showDropdown = true,
		truncate
	}: Props = $props();
</script>

<EventCard.Root
	{ndk}
	{event}
	{threading}
	{interactive}
	class={cn(
		'p-4 rounded-lg border border-border bg-card',
		'hover:bg-accent/50 transition-colors'
	)}
>
	{#if threading?.showLineToNext}
		<EventCard.ThreadLine />
	{/if}

	<div class="flex items-start justify-between gap-2">
		<EventCard.Header />
		{#if showDropdown}
			<EventCard.Dropdown />
		{/if}
	</div>

	<EventCard.Content {truncate} />

	{#if showActions}
		<EventCard.Actions>
			<RepostButton {ndk} {event} />
			<ReactionAction />
		</EventCard.Actions>
	{/if}
</EventCard.Root>
