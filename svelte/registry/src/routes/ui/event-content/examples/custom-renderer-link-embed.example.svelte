<script lang="ts">
	import { getContext } from 'svelte';
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import { EventContent, ContentRenderer } from '$lib/registry/ui';
	import LinkEmbed from './link-embed.example.svelte';

	const ndk = getContext<NDKSvelte>('ndk');

	// Create custom renderer with embedded link previews
	const customRenderer = new ContentRenderer();
	customRenderer.linkComponent = LinkEmbed;

	const sampleContent = `Must-read articles:

https://github.com/nostr-protocol/nips

https://nostr.how

These will help you learn about Nostr!`;
</script>

<EventContent {ndk} content={sampleContent} renderer={customRenderer} />
