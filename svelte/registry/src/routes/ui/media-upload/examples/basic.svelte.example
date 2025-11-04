<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import type { MediaUploadResult } from '$lib/registry/ui';
  import { MediaUpload } from '$lib/registry/ui';

  const ndk = getContext<NDKSvelte>('ndk');

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
