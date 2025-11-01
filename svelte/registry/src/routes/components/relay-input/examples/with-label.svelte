<script lang="ts">
	import { getContext } from 'svelte';
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import { Relay } from '$lib/registry/components/relay';

	const ndk = getContext<NDKSvelte>('ndk');

	let relayUrl = $state('');
</script>

<div class="w-full max-w-md space-y-2">
	<label for="relay-input" class="text-sm font-medium">
		Primary Relay
	</label>
	<Relay.Input
		id="relay-input"
		{ndk}
		bind:value={relayUrl}
		placeholder="Enter your preferred relay"
	/>
	<p class="text-xs text-muted-foreground">
		This will be your primary connection point to the Nostr network
	</p>
</div>