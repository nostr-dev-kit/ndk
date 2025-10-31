<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { setContext } from 'svelte';
	import { createNDK } from '@nostr-dev-kit/svelte';

	const ndk = createNDK({
		explicitRelayUrls: ['wss://relay.damus.io', 'wss://relay.primal.net'],
	});

	ndk.connect();

	setContext('ndk', ndk);

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}
