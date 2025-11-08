<script lang="ts">
	import { getContext } from 'svelte';
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import EventContent from '$lib/registry/ui/event-rendering.svelte'; import { ContentRenderer } from '$lib/registry/ui/content-renderer.svelte.js';
	import MediaBento from './media-bento.example.svelte';

	const ndk = getContext<NDKSvelte>('ndk');

	// Create custom renderer with bento grid
	const customRenderer = new ContentRenderer();
	customRenderer.mediaComponent = MediaBento;

	const sampleContent = `Beautiful gallery in bento layout:

https://picsum.photos/800/600?random=10
https://picsum.photos/600/800?random=11
https://picsum.photos/800/800?random=12

https://picsum.photos/600/600?random=13

These photos look great together!`;
</script>

<EventContent {ndk} content={sampleContent} renderer={customRenderer} />
