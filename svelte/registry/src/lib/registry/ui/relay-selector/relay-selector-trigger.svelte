<script lang="ts">
	import { getContext } from 'svelte';
	import { RELAY_SELECTOR_CONTEXT_KEY, type RelaySelectorContext } from './relay-selector.context.js';
	import type { Snippet } from 'svelte';

	interface Props {
		/** Render as child component (user provides the element) */
		asChild?: boolean;

		/** Additional CSS classes */
		class?: string;

		/** Child content with context */
		children: Snippet<[RelaySelectorContext]>;
	}

	let {
		asChild = false,
		class: className = '',
		children
	}: Props = $props();

	const context = getContext<RelaySelectorContext>(RELAY_SELECTOR_CONTEXT_KEY);
	if (!context) {
		throw new Error('Relay.Selector.Trigger must be used within Relay.Selector.Root');
	}
</script>

{#if asChild}
	{@render children(context)}
{:else}
	<button
		type="button"
		class={className}
		data-has-selection={context.hasSelection}
		data-count={context.selectionCount}
	>
		{@render children(context)}
	</button>
{/if}
