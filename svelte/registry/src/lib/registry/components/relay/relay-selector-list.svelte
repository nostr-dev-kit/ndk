<!-- @ndk-version: relay-selector-list@0.1.0 -->
<!--
  @component Relay.Selector.List
  List of connected relays for selection

  @example
  ```svelte
  <Relay.Selector.Root {ndk} bind:selected>
    <Relay.Selector.List compact showEmpty />
  </Relay.Selector.Root>
  ```
-->
<script lang="ts">
	import { getContext } from 'svelte';
	import { RELAY_SELECTOR_CONTEXT_KEY, type RelaySelectorContext } from './relay-selector-context.svelte.js';
	import RelayCardList from '../blocks/relay-card-list.svelte';
	import { cn } from '../../../utils.js';

	interface Props {
		/** Compact variant */
		compact?: boolean;

		/** Show empty message when no relays */
		showEmpty?: boolean;

		/** Custom empty message */
		emptyMessage?: string;

		/** Show relay descriptions */
		showDescription?: boolean;

		/** Additional CSS classes */
		class?: string;
	}

	let {
		compact = false,
		showEmpty = true,
		emptyMessage = 'No relays connected. Add a relay to get started.',
		showDescription = !compact,
		class: className = ''
	}: Props = $props();

	const context = getContext<RelaySelectorContext>(RELAY_SELECTOR_CONTEXT_KEY);
	if (!context) {
		throw new Error('Relay.Selector.List must be used within Relay.Selector.Root');
	}
</script>

<div class={cn('relay-selector-list space-y-1', className)}>
	{#if context.connectedRelays.length > 0}
		{#each context.connectedRelays as relayUrl}
			<div
				class={cn(
					'relay-selector-list-item relative cursor-pointer transition-colors',
					context.isSelected(relayUrl) && 'bg-accent'
				)}
				onclick={() => context.toggleRelay(relayUrl)}
				role="button"
				tabindex="0"
				onkeydown={(e) => {
					if (e.key === 'Enter' || e.key === ' ') {
						e.preventDefault();
						context.toggleRelay(relayUrl);
					}
				}}
			>
				<RelayCardList
					ndk={context.ndk}
					{relayUrl}
					{compact}
					showDescription={showDescription}
					class="pointer-events-none"
				/>
				{#if context.isSelected(relayUrl)}
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
		{/each}
	{:else if showEmpty}
		<p class="text-sm text-muted-foreground text-center py-8">
			{emptyMessage}
		</p>
	{/if}
</div>

<style>
	.relay-selector-list-item:hover {
		background-color: var(--accent);
	}

	:global(.dark) {
		--primary: 210deg 40% 98%;
		--accent: 217.2deg 32.6% 17.5%;
		--muted-foreground: 215deg 20.2% 65.1%;
	}

	:global(.light) {
		--primary: 222.2deg 47.4% 11.2%;
		--accent: 210deg 40% 96.1%;
		--muted-foreground: 215.4deg 16.3% 46.9%;
	}
</style>
