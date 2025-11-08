<script lang="ts">
	import { getContext } from 'svelte';
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import EventContent from '$lib/registry/ui/event-rendering.svelte'; import { ContentRenderer } from '$lib/registry/ui/content-renderer.svelte.js';
	import LinkPreview from './link-preview.example.svelte';

	const ndk = getContext<NDKSvelte>('ndk');

	// Create custom renderer with link preview
	const customRenderer = new ContentRenderer();
	customRenderer.linkComponent = LinkPreview;

	const sampleContent = `Check out these resources:

https://github.com/nostr-protocol/nips
https://nostr.com

https://njump.me

Great Nostr resources!`;
</script>

<EventContent {ndk} content={sampleContent} renderer={customRenderer} />
