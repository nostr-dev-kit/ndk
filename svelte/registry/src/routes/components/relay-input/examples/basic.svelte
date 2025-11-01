<script lang="ts">
	import { getContext } from 'svelte';
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import { Relay } from '$lib/registry/components/relay';

	const ndk = getContext<NDKSvelte>('ndk');

	let relayUrl = $state('');
</script>

<div class="w-full max-w-md">
	<Relay.Input {ndk} bind:value={relayUrl} />
	{#if relayUrl}
		<p class="mt-2 text-sm text-muted-foreground">
			Selected: {relayUrl}
		</p>
	{/if}
</div>