<script lang="ts">
	import { getContext } from 'svelte';
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import { Relay } from '$lib/registry/ui/relay';

	const ndk = getContext<NDKSvelte>('ndk');

	let selected = $state<string[]>([]);
</script>

<div class="w-full max-w-md">
	<Relay.Selector.Root {ndk} bind:selected>
		<div class="border rounded-md p-4 space-y-4">
			<div class="flex items-center justify-between">
				<h3 class="font-semibold">Select Relays</h3>
				{#if selected.length > 0}
					<button
						type="button"
						onclick={() => (selected = [])}
						class="text-xs text-muted-foreground hover:text-foreground"
					>
						Clear ({selected.length})
					</button>
				{/if}
			</div>
			<Relay.Selector.List compact />
			<div class="border-t pt-4">
				<Relay.Selector.AddForm showAsButton={true} />
			</div>
		</div>
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