<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { NDKEvent } from '@nostr-dev-kit/ndk';
	import { getContext } from 'svelte';
	import type { UnpublishedEventsContext } from './unpublished-events.context.js';
	import { UNPUBLISHED_EVENTS_CONTEXT_KEY } from './unpublished-events.context.js';

	interface ItemData {
		event: NDKEvent;
		relays?: string[];
		lastTryAt?: number;
		retry: () => Promise<void>;
		discard: () => Promise<void>;
	}

	interface Props {
		class?: string;
		children: Snippet<[ItemData]>;
	}

	let { class: className = '', children }: Props = $props();

	const context = getContext<UnpublishedEventsContext>(UNPUBLISHED_EVENTS_CONTEXT_KEY);
</script>

<div class={className} data-unpublished-events-items="">
	{#each context.events as entry (entry.event.id)}
		{@render children({
			event: entry.event,
			relays: entry.relays,
			lastTryAt: entry.lastTryAt,
			retry: async () => await context.retry(entry.event),
			discard: async () => await context.discard(entry.event.id!)
		})}
	{/each}
</div>
