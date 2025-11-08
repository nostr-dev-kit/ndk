<!--
  IMPORTANT: Keep this file in sync with index.txt

  Rules for maintaining sync between index.svelte and index.txt:
  1. Both files must demonstrate the SAME functionality
  2. index.svelte = Full implementation (with TypeScript interfaces, all imports, complete styling)
  3. index.txt = Simplified documentation version with these changes:
     - Remove TypeScript interface definitions
     - Use inline prop destructuring: let { ndk, userPubkey } = $props();
     - Keep only essential imports (remove type imports unless needed)
     - Keep inline classes (class="...") but remove <style> blocks
     - Focus on showing component API usage, not implementation details
     - Keep the core component usage identical between both files

  When you modify this file, you MUST update index.txt to reflect the same changes
  following the simplification rules above.
-->
<script lang="ts">
	import { getContext } from 'svelte';
	import type { NDKSvelte } from '@nostr-dev-kit/svelte';
	import EventContent from '$lib/registry/ui/event-content.svelte'; import { ContentRenderer } from '$lib/registry/ui/content-renderer';
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
