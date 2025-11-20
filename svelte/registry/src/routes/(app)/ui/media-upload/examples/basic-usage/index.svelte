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
    import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { ndk } from '$lib/site/ndk.svelte';
  import type { MediaUploadResult } from '$lib/registry/ui/media-upload';
  import { MediaUpload } from '$lib/registry/ui/media-upload';
  let uploads = $state<MediaUploadResult[]>([]);
</script>

<div class="border border-gray-200 rounded-lg p-4 bg-white">
  <MediaUpload.Root {ndk} bind:uploads>
    <MediaUpload.Button class="px-4 py-2 bg-blue-500 text-white border-none rounded-md cursor-pointer font-medium hover:bg-blue-600">
      Select Files
    </MediaUpload.Button>

    {#if uploads.length > 0}
      <div class="grid grid-cols-3 gap-2 mt-4">
        {#each uploads as upload (upload.url)}
          <MediaUpload.Preview {upload} class="w-full h-[100px] rounded-md overflow-hidden" />
        {/each}
      </div>
    {/if}
  </MediaUpload.Root>
</div>
