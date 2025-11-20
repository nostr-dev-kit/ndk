<script lang="ts">
	import { getContext } from 'svelte';
	import type { UnpublishedEventsContext } from './unpublished-events.context.js';
	import { UNPUBLISHED_EVENTS_CONTEXT_KEY } from './unpublished-events.context.js';

	interface Props {
		class?: string;
		showZero?: boolean;
	}

	let { class: className = '', showZero = false }: Props = $props();

	const context = getContext<UnpublishedEventsContext>(UNPUBLISHED_EVENTS_CONTEXT_KEY);

	let count = $derived(context.events.length);
	let shouldShow = $derived(showZero || count > 0);
</script>

{#if shouldShow}
	<span
		class="inline-flex items-center justify-center rounded-full bg-destructive text-destructive-foreground text-xs font-semibold min-w-[1.25rem] h-5 px-1.5 {className}"
		data-unpublished-events-badge=""
	>
		{count}
	</span>
{/if}
