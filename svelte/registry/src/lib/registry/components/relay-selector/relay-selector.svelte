<!-- @ndk-version: relay-selector-inline@0.2.0 -->
<!--
  @component RelaySelectorInline
  Inline relay selector block (no trigger/popover)

  @example
  ```svelte
  <RelaySelectorInline {ndk} bind:selected={selectedRelays} />
  ```
-->
<script lang="ts">
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import { Relay } from '../../ui/relay/index.js';
	import { cn } from '../../utils/index.js';

	interface Props {
		/** NDK instance */
		ndk?: NDKSvelte;

		/** Selected relay URLs (two-way binding) */
		selected?: string[];

		/** Allow multiple selection */
		multiple?: boolean;

		/** Show add relay form */
		showAddForm?: boolean;

		/** Label for the selector */
		label?: string;

		/** Helper text */
		helperText?: string;

		/** Show selected chips */
		showSelectedChips?: boolean;

		/** Compact list variant */
		compact?: boolean;

		/** Additional CSS classes */
		class?: string;
	}

	let {
		ndk,
		selected = $bindable([]),
		multiple = true,
		showAddForm = true,
		label,
		helperText,
		showSelectedChips = false,
		compact = false,
		class: className = ''
	}: Props = $props();

	function removeRelay(relayUrl: string) {
		selected = selected.filter((url) => url !== relayUrl);
	}
</script>

<Relay.Selector.Root {ndk} bind:selected {multiple}>
	{#snippet children(context)}
		<div class={cn('relay-selector-inline', className)}>
			{#if label}
				<label class="block text-sm font-medium mb-2">
					{label}
				</label>
			{/if}

			<div class="space-y-4">
				{#if showSelectedChips && context.hasSelection}
					<div class="flex flex-wrap gap-2">
						{#each context.selected as relay}
							<div
								class="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-secondary text-secondary-foreground rounded-full"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="1.5"
									class="w-4 h-4 opacity-60"
								>
									<path
										d="M2.5 12C2.5 7.522 2.5 5.282 3.891 3.891C5.282 2.5 7.521 2.5 12 2.5C16.478 2.5 18.718 2.5 20.109 3.891C21.5 5.282 21.5 7.521 21.5 12C21.5 16.478 21.5 18.718 20.109 20.109C18.718 21.5 16.478 21.5 12 21.5C7.521 21.5 5.282 21.5 3.891 20.109C2.5 18.718 2.5 16.478 2.5 12Z"
									></path>
									<path
										d="M11 15.5H12C14.828 15.5 17 13.828 17 11.75C17 9.672 14.828 8 12 8H11C8.172 8 6 9.672 6 11.75C6 13.828 8.172 15.5 11 15.5Z"
									></path>
								</svg>
								<span class="truncate max-w-[150px]">
									{relay.replace(/^wss?:\/\//, '')}
								</span>
								<button
									type="button"
									onclick={() => context.removeRelay(relay)}
									class="ml-1 opacity-60 hover:opacity-100 transition-opacity"
									aria-label="Remove {relay}"
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="14"
										height="14"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="3"
										stroke-linecap="round"
										stroke-linejoin="round"
									>
										<line x1="18" y1="6" x2="6" y2="18"></line>
										<line x1="6" y1="6" x2="18" y2="18"></line>
									</svg>
								</button>
							</div>
						{/each}
					</div>
				{/if}

				<div class="border rounded-md overflow-hidden">
					<div class="space-y-1 p-2">
						{#each context.connectedRelays as relay}
							<div
								class={cn(
									'relative cursor-pointer transition-colors rounded-md',
									compact ? 'p-2' : 'p-3',
									context.isSelected(relay) && 'bg-accent'
								)}
								onclick={() => context.toggleRelay(relay)}
							>
								<Relay.Root relayUrl={relay}>
									<div class="flex items-center gap-2">
										<Relay.Icon class={cn(compact ? 'w-8 h-8' : 'w-12 h-12', 'flex-shrink-0')} />
										<div class="flex-1 min-w-0">
											<Relay.Name class="font-medium truncate" />
											{#if !compact}
												<Relay.Url class="text-sm text-muted-foreground truncate" />
											{/if}
										</div>
									</div>
								</Relay.Root>
								{#if context.isSelected(relay)}
									<svg
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="2"
										class="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary"
									>
										<path d="M20 6 9 17l-5-5"></path>
									</svg>
								{/if}
							</div>
						{/each}
					</div>
				</div>

				{#if showAddForm}
					<Relay.Selector.AddForm showAsButton={false} />
				{/if}
			</div>

			{#if helperText}
				<p class="mt-2 text-sm text-muted-foreground">
					{helperText}
				</p>
			{/if}
		</div>
	{/snippet}
</Relay.Selector.Root>

<style>
	.relay-selector-inline {
		width: 100%;
	}

	:global(.dark) {
		--secondary: 217.2deg 32.6% 17.5%;
		--secondary-foreground: 210deg 40% 98%;
		--muted-foreground: 215deg 20.2% 65.1%;
		--border: 217.2deg 32.6% 17.5%;
	}

	:global(.light) {
		--secondary: 210deg 40% 96.1%;
		--secondary-foreground: 222.2deg 47.4% 11.2%;
		--muted-foreground: 215.4deg 16.3% 46.9%;
		--border: 214.3deg 31.8% 91.4%;
	}
</style>
