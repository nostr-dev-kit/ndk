<script lang="ts">
	import type { Snippet } from 'svelte';
	import { getContext } from 'svelte';
	import type { UnpublishedEventsContext } from './unpublished-events.context.js';
	import { UNPUBLISHED_EVENTS_CONTEXT_KEY } from './unpublished-events.context.js';

	interface Props {
		class?: string;
		children: Snippet;
		emptyState?: Snippet;
	}

	let { class: className = '', children, emptyState }: Props = $props();

	const context = getContext<UnpublishedEventsContext>(UNPUBLISHED_EVENTS_CONTEXT_KEY);

	let hasEvents = $derived(context.events.length > 0);
</script>

<div class={className} data-unpublished-events-list="">
	{#if hasEvents}
		{@render children()}
	{:else if emptyState}
		{@render emptyState()}
	{/if}
</div>
