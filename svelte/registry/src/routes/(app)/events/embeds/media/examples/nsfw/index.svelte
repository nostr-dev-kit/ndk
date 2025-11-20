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
	import type { NDKEvent } from '@nostr-dev-kit/ndk';
	import MediaBasic from '$lib/registry/components/media-basic';

	interface Props {
		event?: NDKEvent;
	}

	let { event }: Props = $props();

	// Sample image URL (marked as NSFW via event tags)
	const imageUrl = 'https://images.unsplash.com/photo-1517849845537-4d257902454a?w=800&h=600';
</script>

<div class="w-full max-w-2xl">
	<div class="mb-2 px-3 py-1 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 rounded-lg text-sm">
		⚠️ This example simulates NSFW content with a content-warning tag
	</div>
	<MediaBasic url={[imageUrl]} {event} />
</div>