<!-- @ndk-version: relay-selector-item@0.1.0 -->
<!--
  @component Relay.Selector.Item
  Individual selectable relay item

  @example
  ```svelte
  <Relay.Selector.Root {ndk} bind:selected>
    {#each relays as relay}
      <Relay.Selector.Item relayUrl={relay} />
    {/each}
  </Relay.Selector.Root>
  ```
-->
<script lang="ts">
	import { getContext } from 'svelte';
	import { RELAY_SELECTOR_CONTEXT_KEY, type RelaySelectorContext } from './relay-selector-context.svelte.js';
	import RelayCardList from '../blocks/relay-card-list.svelte';
	import { cn } from '../../../utils.js';

	interface Props {
		/** Relay URL */
		relayUrl: string;

		/** Compact variant */
		compact?: boolean;

		/** Show description */
		showDescription?: boolean;

		/** Show checkmark when selected */
		showCheckmark?: boolean;

		/** Additional CSS classes */
		class?: string;

		/** Custom click handler (overrides default toggle behavior) */
		onclick?: (e: MouseEvent) => void;
	}

	let {
		relayUrl,
		compact = false,
		showDescription = !compact,
		showCheckmark = true,
		class: className = '',
		onclick
	}: Props = $props();

	const context = getContext<RelaySelectorContext>(RELAY_SELECTOR_CONTEXT_KEY);
	if (!context) {
		throw new Error('Relay.Selector.Item must be used within Relay.Selector.Root');
	}

	const isSelected = $derived(context.isSelected(relayUrl));

	function handleClick(e: MouseEvent) {
		if (onclick) {
			onclick(e);
		} else {
			context.toggleRelay(relayUrl);
		}
	}

	function handleKeyDown(e: KeyboardEvent) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			handleClick(e as unknown as MouseEvent);
		}
	}
</script>

<div
	class={cn(
		'relay-selector-item relative cursor-pointer transition-colors',
		isSelected && 'bg-accent',
		className
	)}
	onclick={handleClick}
	role="button"
	tabindex="0"
	onkeydown={handleKeyDown}
>
	<RelayCardList
		ndk={context.ndk}
		{relayUrl}
		{compact}
		{showDescription}
		class="pointer-events-none"
	/>
	{#if showCheckmark && isSelected}
		<div class="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="20"
				height="20"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				class="h-4 w-4 text-primary"
			>
				<path d="M20 6 9 17l-5-5"></path>
			</svg>
		</div>
	{/if}
</div>

<style>
	.relay-selector-item:hover {
		background-color: var(--accent);
	}

	:global(.dark) {
		--primary: 210deg 40% 98%;
		--accent: 217.2deg 32.6% 17.5%;
	}

	:global(.light) {
		--primary: 222.2deg 47.4% 11.2%;
		--accent: 210deg 40% 96.1%;
	}
</style>
