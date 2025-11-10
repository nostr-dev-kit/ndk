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
	import MediaRender from '$lib/registry/components/media-render';

	interface Props {
		event?: NDKEvent;
	}

	let { event }: Props = $props();

	// Sample image URL (from unfollowed user)
	const imageUrl = 'https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?w=800&h=600';
</script>

<div class="w-full max-w-2xl">
	<div class="mb-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 rounded-lg text-sm">
		👤 This example simulates content from an unfollowed user
	</div>
	<MediaRender url={imageUrl} {event} />
</div>