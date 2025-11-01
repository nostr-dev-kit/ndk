<script lang="ts">
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import { Relay } from '$lib/registry/components/relay';
	import { Popover } from 'bits-ui';

	interface Props {
		ndk?: NDKSvelte;
		selected?: string[];
		multiple?: boolean;
		variant?: 'default' | 'secondary' | 'outline' | 'ghost';
	}

	let { ndk, selected = $bindable([]), multiple = true, variant = 'outline' }: Props = $props();

	let isOpen = $state(false);

	const buttonClasses = $derived.by(() => {
		const baseClasses =
			'inline-flex items-center justify-center gap-2 font-medium transition-colors h-10 px-4 py-2 text-sm rounded-md';

		const variantClasses = {
			default: 'bg-primary text-primary-foreground hover:bg-primary/90',
			secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
			outline: 'border border-input bg-transparent hover:bg-accent hover:text-accent-foreground',
			ghost: 'hover:bg-accent hover:text-accent-foreground'
		};

		return `${baseClasses} ${variantClasses[variant]}`;
	});
</script>

<Relay.Selector.Root {ndk} bind:selected {multiple}>
	<Popover.Root bind:open={isOpen}>
		<Popover.Trigger>
			<button type="button" class={buttonClasses}>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="1.5"
					class="w-4 h-4"
				>
					<path
						d="M2.5 12C2.5 7.522 2.5 5.282 3.891 3.891C5.282 2.5 7.521 2.5 12 2.5C16.478 2.5 18.718 2.5 20.109 3.891C21.5 5.282 21.5 7.521 21.5 12C21.5 16.478 21.5 18.718 20.109 20.109C18.718 21.5 16.478 21.5 12 21.5C7.521 21.5 5.282 21.5 3.891 20.109C2.5 18.718 2.5 16.478 2.5 12Z"
					></path>
					<path
						d="M11 15.5H12C14.828 15.5 17 13.828 17 11.75C17 9.672 14.828 8 12 8H11C8.172 8 6 9.672 6 11.75C6 13.828 8.172 15.5 11 15.5Z"
					></path>
				</svg>
				<span class="truncate">
					{#if selected.length === 0}
						Select Relays
					{:else if selected.length === 1}
						1 Relay Selected
					{:else}
						{selected.length} Relays Selected
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
					class="ml-auto opacity-50 w-4 h-4"
				>
					<path d="m6 9 6 6 6-6"></path>
				</svg>
			</button>
		</Popover.Trigger>

		<Popover.Content
			class="z-50 w-[400px] max-h-[400px] overflow-y-auto rounded-md border bg-popover text-popover-foreground shadow-md"
			sideOffset={5}
		>
			<div class="p-4">
				<div class="flex items-center justify-between mb-4">
					<h3 class="font-semibold">Select Relays</h3>
					{#if selected.length > 0}
						<button
							type="button"
							onclick={() => (selected = [])}
							class="text-xs text-muted-foreground hover:text-foreground"
						>
							Clear all
						</button>
					{/if}
				</div>

				<div class="mb-4">
					<Relay.Selector.List compact />
				</div>

				<div class="border-t pt-4">
					<Relay.Selector.AddForm showAsButton={true} />
				</div>
			</div>
		</Popover.Content>
	</Popover.Root>
</Relay.Selector.Root>
