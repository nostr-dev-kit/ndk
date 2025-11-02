<script lang="ts">
	import { getContext } from 'svelte';
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import { Relay } from '$lib/registry/ui/relay';

	const ndk = getContext<NDKSvelte>('ndk');

	let selected = $state<string[]>([]);
</script>

<div class="w-full max-w-md">
	<Relay.Selector.Root {ndk} bind:selected>
		{#snippet children(context)}
			<div class="border rounded-md p-4 space-y-4">
				<div class="flex items-center justify-between">
					<h3 class="font-semibold">Select Relays</h3>
					{#if context.hasSelection}
						<button
							type="button"
							onclick={() => context.clearSelection()}
							class="text-xs text-muted-foreground hover:text-foreground"
						>
							Clear ({context.selectionCount})
						</button>
					{/if}
				</div>
				<div class="space-y-1">
					{#each context.connectedRelays as relay}
						<div
							class="relative cursor-pointer transition-colors p-2 rounded-md hover:bg-accent"
							class:bg-accent={context.isSelected(relay)}
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
									class="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4"
								>
									<path d="M20 6 9 17l-5-5"></path>
								</svg>
							{/if}
						</div>
					{/each}
				</div>
				<div class="border-t pt-4">
					<Relay.Selector.AddForm showAsButton={true} />
				</div>
			</div>
		{/snippet}
	</Relay.Selector.Root>
</div>

<style>
	:global(.dark) {
		--muted: 217.2deg 32.6% 17.5%;
		--muted-foreground: 215deg 20.2% 65.1%;
		--border: 217.2deg 32.6% 17.5%;
		--foreground: 210deg 40% 98%;
	}

	:global(.light) {
		--muted: 210deg 40% 96.1%;
		--muted-foreground: 215.4deg 16.3% 46.9%;
		--border: 214.3deg 31.8% 91.4%;
		--foreground: 222.2deg 84% 4.9%;
	}
</style>