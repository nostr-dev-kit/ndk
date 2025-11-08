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
  import type { MediaUploadResult } from '$lib/registry/ui/media-upload';
  import { MediaUpload } from '$lib/registry/ui/media-upload';

  const ndk = getContext<NDKSvelte>('ndk');

  let uploads = $state<MediaUploadResult[]>([]);
</script>

<div class="border border-gray-200 rounded-xl p-6 bg-white">
  <MediaUpload.Root {ndk} bind:uploads>
    <div class="mb-4">
      <MediaUpload.Button class="px-5 py-2.5 bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-none rounded-lg cursor-pointer font-semibold shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg">
        Upload Media
      </MediaUpload.Button>
    </div>

    {#if uploads.length > 0}
      <MediaUpload.Carousel class="rounded-lg overflow-hidden">
        {#each uploads as upload (upload.url)}
          <MediaUpload.Preview {upload} class="w-32 h-32 rounded-md overflow-hidden" />
        {/each}
      </MediaUpload.Carousel>
    {/if}
  </MediaUpload.Root>
</div>
