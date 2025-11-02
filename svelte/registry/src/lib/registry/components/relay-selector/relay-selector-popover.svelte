<!-- @ndk-version: relay-selector-popover@0.2.0 -->
<!--
  @component RelaySelectorPopover
  Popover block for relay selection using bits-ui

  @example
  ```svelte
  <RelaySelectorPopover {ndk} bind:selected={selectedRelays} />
  ```
-->
<script lang="ts">
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import { Relay } from '../../ui/relay/index.js';
	import { Popover } from 'bits-ui';
	import { cn } from '../../utils/index.js';
	import type { Snippet } from 'svelte';

	interface Props {
		/** NDK instance */
		ndk?: NDKSvelte;

		/** Selected relay URLs (two-way binding) */
		selected?: string[];

		/** Allow multiple selection */
		multiple?: boolean;

		/** Show add relay form */
		showAddRelay?: boolean;

		/** Custom trigger snippet */
		trigger?: Snippet;

		/** Button variant for default trigger */
		variant?: 'default' | 'secondary' | 'outline' | 'ghost';

		/** Button size for default trigger */
		size?: 'sm' | 'md' | 'lg';

		/** Popover placement */
		placement?: 'top' | 'bottom' | 'left' | 'right';

		/** Additional CSS classes */
		class?: string;
	}

	let {
		ndk,
		selected = $bindable([]),
		multiple = true,
		showAddRelay = true,
		trigger,
		variant = 'outline',
		size = 'md',
		placement = 'bottom',
		class: className = ''
	}: Props = $props();

	let isOpen = $state(false);

	const buttonClasses = $derived.by(() => {
		const baseClasses =
			'inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';

		const variantClasses = {
			default: 'bg-primary text-primary-foreground hover:bg-primary/90',
			secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
			outline: 'border border-input bg-transparent hover:bg-accent hover:text-accent-foreground',
			ghost: 'hover:bg-accent hover:text-accent-foreground'
		};

		const sizeClasses = {
			sm: 'h-8 px-3 text-xs rounded-md gap-1',
			md: 'h-10 px-4 py-2 text-sm rounded-md gap-2',
			lg: 'h-11 px-8 text-base rounded-md gap-2'
		};

		return cn(baseClasses, variantClasses[variant], sizeClasses[size]);
	});
</script>

<Relay.Selector.Root {ndk} bind:selected {multiple}>
	{#snippet children(context)}
		<div class={cn('relay-selector-popover', className)}>
			<Popover.Root bind:open={isOpen}>
				<Popover.Trigger>
					{#if trigger}
						{@render trigger()}
					{:else}
						<button type="button" class={buttonClasses}>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="1.5"
								class={cn(
									size === 'sm' && 'w-3.5 h-3.5',
									size === 'md' && 'w-4 h-4',
									size === 'lg' && 'w-5 h-5'
								)}
							>
								<path
									d="M2.5 12C2.5 7.522 2.5 5.282 3.891 3.891C5.282 2.5 7.521 2.5 12 2.5C16.478 2.5 18.718 2.5 20.109 3.891C21.5 5.282 21.5 7.521 21.5 12C21.5 16.478 21.5 18.718 20.109 20.109C18.718 21.5 16.478 21.5 12 21.5C7.521 21.5 5.282 21.5 3.891 20.109C2.5 18.718 2.5 16.478 2.5 12Z"
								></path>
								<path
									d="M11 15.5H12C14.828 15.5 17 13.828 17 11.75C17 9.672 14.828 8 12 8H11C8.172 8 6 9.672 6 11.75C6 13.828 8.172 15.5 11 15.5Z"
								></path>
							</svg>
							<span class="truncate">
								{#if context.selectionCount === 0}
									Select Relays
								{:else if context.selectionCount === 1}
									1 Relay Selected
								{:else}
									{context.selectionCount} Relays Selected
								{/if}
							</span>
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
								class={cn(
									'ml-auto opacity-50',
									size === 'sm' && 'w-3.5 h-3.5',
									size === 'md' && 'w-4 h-4',
									size === 'lg' && 'w-5 h-5'
								)}
							>
								<path d="m6 9 6 6 6-6"></path>
							</svg>
						</button>
					{/if}
				</Popover.Trigger>

				<Popover.Content
					class={cn(
						'z-50 w-[400px] max-h-[400px] overflow-y-auto',
						'rounded-md border bg-popover text-popover-foreground',
						'shadow-md',
						'data-[state=open]:animate-in data-[state=closed]:animate-out',
						'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
						'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95'
					)}
					side={placement}
					sideOffset={5}
				>
					<div class="p-4">
						<div class="flex items-center justify-between mb-4">
							<h3 class="font-semibold">Select Relays</h3>
							{#if context.hasSelection}
								<button
									type="button"
									onclick={() => context.clearSelection()}
									class="text-xs text-muted-foreground hover:text-foreground"
								>
									Clear all
								</button>
							{/if}
						</div>

						<div class="mb-4 space-y-1">
							{#each context.connectedRelays as relay}
								<div
									class={cn(
										'relative cursor-pointer transition-colors p-2 rounded-md',
										context.isSelected(relay) && 'bg-accent'
									)}
									onclick={() => context.toggleRelay(relay)}
								>
									<Relay.Root relayUrl={relay}>
										<div class="flex items-center gap-2">
											<Relay.Icon class="w-8 h-8 flex-shrink-0" />
											<Relay.Name class="font-medium truncate" />
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

						{#if showAddRelay}
							<div class="border-t pt-4">
								<Relay.Selector.AddForm showAsButton={true} class="w-full" />
							</div>
						{/if}
					</div>
				</Popover.Content>
			</Popover.Root>
		</div>
	{/snippet}
</Relay.Selector.Root>

<style>
	:global(.dark) {
		--primary: 210deg 40% 98%;
		--primary-foreground: 222.2deg 47.4% 11.2%;
		--secondary: 217.2deg 32.6% 17.5%;
		--secondary-foreground: 210deg 40% 98%;
		--accent: 217.2deg 32.6% 17.5%;
		--accent-foreground: 210deg 40% 98%;
		--muted-foreground: 215deg 20.2% 65.1%;
		--popover: 222.2deg 84% 4.9%;
		--popover-foreground: 210deg 40% 98%;
		--border: 217.2deg 32.6% 17.5%;
		--input: 217.2deg 32.6% 17.5%;
		--ring: 212.7deg 26.8% 83.9%;
	}

	:global(.light) {
		--primary: 222.2deg 47.4% 11.2%;
		--primary-foreground: 210deg 40% 98%;
		--secondary: 210deg 40% 96.1%;
		--secondary-foreground: 222.2deg 47.4% 11.2%;
		--accent: 210deg 40% 96.1%;
		--accent-foreground: 222.2deg 47.4% 11.2%;
		--muted-foreground: 215.4deg 16.3% 46.9%;
		--popover: 0deg 0% 100%;
		--popover-foreground: 222.2deg 84% 4.9%;
		--border: 214.3deg 31.8% 91.4%;
		--input: 214.3deg 31.8% 91.4%;
		--ring: 222.2deg 84% 4.9%;
	}

	@keyframes fade-in {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	@keyframes fade-out {
		from {
			opacity: 1;
		}
		to {
			opacity: 0;
		}
	}

	@keyframes zoom-in-95 {
		from {
			transform: scale(0.95);
		}
		to {
			transform: scale(1);
		}
	}

	@keyframes zoom-out-95 {
		from {
			transform: scale(1);
		}
		to {
			transform: scale(0.95);
		}
	}

	[data-state='open'] {
		animation:
			fade-in 0.15s ease-out,
			zoom-in-95 0.15s ease-out;
	}

	[data-state='closed'] {
		animation:
			fade-out 0.15s ease-out,
			zoom-out-95 0.15s ease-out;
	}
</style>
