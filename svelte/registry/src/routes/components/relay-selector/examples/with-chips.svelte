<script lang="ts">
	import { getContext } from 'svelte';
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import RelaySelectorInline from '$lib/registry/blocks/relay-selector-inline.svelte';

	const ndk = getContext<NDKSvelte>('ndk');

	let selected = $state<string[]>([]);
</script>

<div class="w-full max-w-md">
	<RelaySelectorInline
		{ndk}
		bind:selected
		label="Active Relays"
		helperText="Select the relays you want to connect to"
		showSelectedChips={true}
	/>
</div>