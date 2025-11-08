<script lang="ts">
	import { getContext } from 'svelte';
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import EventContent from '$lib/registry/ui/event-rendering.svelte'; import { ContentRenderer } from '$lib/registry/ui/content-renderer.svelte.js';
	import MediaCarousel from './media-carousel.example.svelte';

	const ndk = getContext<NDKSvelte>('ndk');

	// Create custom renderer with carousel
	const customRenderer = new ContentRenderer();
	customRenderer.mediaComponent = MediaCarousel;

	const sampleContent = `Check out these amazing photos!

https://picsum.photos/800/600?random=1
https://picsum.photos/800/600?random=2

https://picsum.photos/800/600?random=3

All from the same collection!`;
</script>

<EventContent {ndk} content={sampleContent} renderer={customRenderer} />
