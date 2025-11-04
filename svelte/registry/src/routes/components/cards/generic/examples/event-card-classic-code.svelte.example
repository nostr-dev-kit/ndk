<script lang="ts">
	import type { NDKEvent } from '@nostr-dev-kit/ndk';
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import { EventCard } from '$lib/registry/components/event-card';
	import { ReactionAction } from '$lib/registry/components/reaction';
	import RepostButton from '$lib/registry/components/actions/repost-button.svelte';
	import { cn } from '$lib/registry/utils/index.js';

	interface Props {
		ndk: NDKSvelte;
		event: NDKEvent;
		interactive?: boolean;
		showActions?: boolean;
		showDropdown?: boolean;
		truncate?: number;
	}

	let {
		ndk,
		event,
		interactive = false,
		showActions = true,
		showDropdown = true,
		truncate
	}: Props = $props();
</script>

<EventCard.Root
	{ndk}
	{event}
	{interactive}
	class={cn(
		'p-4 rounded-lg border border-border bg-card',
		'hover:bg-accent/50 transition-colors'
	)}
>
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
