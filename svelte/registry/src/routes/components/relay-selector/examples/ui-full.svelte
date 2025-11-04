<script lang="ts">
	import { getContext } from 'svelte';
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import { Relay } from '$lib/registry/ui/relay';

	const ndk = getContext<NDKSvelte>('ndk');

	let selected = $state<string[]>([]);
</script>

<div class="w-full max-w-2xl">
	<Relay.Selector.Root {ndk} bind:selected multiple={true}>
		<div class="space-y-6">
			<!-- Header -->
			<div class="flex items-center justify-between">
				<div>
					<h3 class="text-lg font-semibold">Relay Selection</h3>
					<p class="text-sm text-muted-foreground">
						Choose which relays to connect to
					</p>
				</div>
				{#if selected.length > 0}
					<button
						type="button"
						onclick={() => (selected = [])}
						class="text-sm text-muted-foreground hover:text-foreground"
					>
						Clear all ({selected.length})
					</button>
				{/if}
			</div>

			<!-- Selected chips -->
			{#if selected.length > 0}
				<div class="flex flex-wrap gap-2 p-4 bg-muted/50 rounded-lg">
					<span class="text-xs font-medium text-muted-foreground">Selected:</span>
					{#each selected as relayUrl (relayUrl)}
						<div
							class="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-background border"
						>
							<span class="truncate max-w-[200px]">{relayUrl}</span>
							<button
								type="button"
								onclick={() => {
									selected = selected.filter((url) => url !== relayUrl);
								}}
								class="hover:text-foreground"
							>
								×
							</button>
						</div>
					{/each}
				</div>
			{/if}

			<!-- Relay list -->
			<div class="border rounded-lg p-4">
				<h4 class="text-sm font-medium mb-3">Connected Relays</h4>
				<Relay.Selector.List />
			</div>

			<!-- Add relay form -->
			<div class="border rounded-lg p-4">
				<h4 class="text-sm font-medium mb-3">Add New Relay</h4>
				<Relay.Selector.AddForm />
			</div>

			<!-- Helper text -->
			<p class="text-xs text-muted-foreground">
				Selected relays will be used for fetching and publishing events.
			</p>
		</div>
	</Relay.Selector.Root>
</div>

<style>
	:global(.dark) {
		--muted: 217.2deg 32.6% 17.5%;
		--muted-foreground: 215deg 20.2% 65.1%;
		--border: 217.2deg 32.6% 17.5%;
		--foreground: 210deg 40% 98%;
		--background: 222.2deg 84% 4.9%;
	}

	:global(.light) {
		--muted: 210deg 40% 96.1%;
		--muted-foreground: 215.4deg 16.3% 46.9%;
		--border: 214.3deg 31.8% 91.4%;
		--foreground: 222.2deg 84% 4.9%;
		--background: 0deg 0% 100%;
	}
</style>
