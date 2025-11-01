<script lang="ts">
	import { getContext } from 'svelte';
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import { RelaySelectorPopover } from '$lib/registry/components/blocks';

	const ndk = getContext<NDKSvelte>('ndk');

	let selected = $state<string[]>([]);
</script>

<div class="w-full max-w-md space-y-2">
	<label class="text-sm font-medium">
		Choose Primary Relay
	</label>
	<RelaySelectorPopover {ndk} bind:selected multiple={false} variant="outline" size="md" />
	{#if selected.length > 0}
		<p class="text-sm text-muted-foreground">
			Primary relay: {selected[0]}
		</p>
	{/if}
</div>

<style>
	:global(.dark) {
		--muted-foreground: 215deg 20.2% 65.1%;
	}

	:global(.light) {
		--muted-foreground: 215.4deg 16.3% 46.9%;
	}
</style>