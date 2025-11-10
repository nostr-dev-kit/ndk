<!--
  IMPORTANT: Keep this file in sync with index.txt

  Rules for maintaining sync between index.svelte and index.txt:
  1. Both files must demonstrate the SAME functionality
  2. index.svelte = Full implementation (with TypeScript interfaces, all imports, complete styling)
  3. index.txt = Simplified documentation version with these changes:
     - Remove TypeScript interface definitions
     - Use inline prop destructuring: let { ndk, event } = $props();
     - Keep only essential imports (remove type imports unless needed)
     - Keep inline classes (class="...") but remove <style> blocks
     - Focus on showing component API usage, not implementation details
     - Keep the core component usage identical between both files

  When you modify this file, you MUST update index.txt to reflect the same changes
  following the simplification rules above.
-->

<script lang="ts">
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import type { NDKEvent } from '@nostr-dev-kit/ndk';
	import EventContent from '$lib/registry/ui/event-content.svelte';
	import { ContentRenderer } from '$lib/registry/ui/content-renderer';
	import MediaRenderCarousel from '$lib/registry/components/media-render-carousel';

	interface Props {
		ndk: NDKSvelte;
		event?: NDKEvent;
	}

	let { ndk, event }: Props = $props();

	// Create a custom renderer with carousel layout
	const carouselRenderer = new ContentRenderer();
	carouselRenderer.mediaComponent = MediaRenderCarousel;
</script>

<div class="w-full max-w-2xl">
	{#if event}
		<EventContent {ndk} {event} renderer={carouselRenderer} />
	{/if}
</div>