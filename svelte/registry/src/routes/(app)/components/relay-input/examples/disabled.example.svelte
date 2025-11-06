<script lang="ts">
	import { getContext } from 'svelte';
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import { Relay } from '$lib/registry/ui/relay';

	const ndk = getContext<NDKSvelte>('ndk');
</script>

<div class="w-full max-w-md space-y-2">
	<label for="relay-disabled" class="text-sm font-medium">
		System Relay
	</label>
	<Relay.Input
		id="relay-disabled"
		{ndk}
		value="wss://relay.damus.io"
		disabled
	/>
	<p class="text-xs text-muted-foreground">
		This relay is configured by your system administrator
	</p>
</div>