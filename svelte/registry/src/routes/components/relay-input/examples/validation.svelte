<script lang="ts">
	import { getContext } from 'svelte';
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import { Relay } from '$lib/registry/components/relay';

	const ndk = getContext<NDKSvelte>('ndk');

	let relayUrl = $state('');

	const isValid = $derived(() => {
		if (!relayUrl) return true; // Empty is ok
		try {
			const url = new URL(relayUrl);
			return url.protocol === 'wss:' || url.protocol === 'ws:';
		} catch {
			return false;
		}
	});

	const error = $derived(() => {
		if (!relayUrl) return null;
		if (!isValid()) {
			return 'Please enter a valid WebSocket URL (ws:// or wss://)';
		}
		return null;
	});
</script>

<div class="w-full max-w-md space-y-2">
	<label for="relay-validation" class="text-sm font-medium">
		Add Relay
	</label>
	<Relay.Input
		id="relay-validation"
		{ndk}
		bind:value={relayUrl}
		class={error() ? 'border-destructive focus-visible:ring-destructive' : ''}
	/>
	{#if error()}
		<p class="text-sm text-destructive">
			{error()}
		</p>
	{/if}
	{#if relayUrl && isValid()}
		<p class="text-sm text-green-600">
			✓ Valid relay URL
		</p>
	{/if}
</div>

<style>
	:global(.dark) {
		--destructive: 0deg 62.8% 30.6%;
	}

	:global(.light) {
		--destructive: 0deg 84.2% 60.2%;
	}
</style>