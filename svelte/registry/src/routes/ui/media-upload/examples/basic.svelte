<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import type { MediaUploadResult } from '$lib/registry/ui';
  import { MediaUpload } from '$lib/registry/ui';

  const ndk = getContext<NDKSvelte>('ndk');

  let uploads = $state<MediaUploadResult[]>([]);
</script>

<div class="media-upload-demo">
  <MediaUpload.Root {ndk} bind:uploads>
    <MediaUpload.Button class="upload-button">
      Select Files
    </MediaUpload.Button>

    {#if uploads.length > 0}
      <div class="preview-grid">
        {#each uploads as upload (upload.url)}
          <MediaUpload.Preview {upload} class="preview-item" />
        {/each}
      </div>
    {/if}
  </MediaUpload.Root>
</div>

<style>
  .media-upload-demo {
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    padding: 1rem;
    background: white;
  }

  .media-upload-demo :global(.upload-button) {
    padding: 0.5rem 1rem;
    background: #3b82f6;
    color: white;
    border: none;
    border-radius: 0.375rem;
    cursor: pointer;
    font-weight: 500;
  }

  .media-upload-demo :global(.upload-button:hover) {
    background: #2563eb;
  }

  .preview-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.5rem;
    margin-top: 1rem;
  }

  .media-upload-demo :global(.preview-item) {
    width: 100%;
    height: 100px;
    border-radius: 0.375rem;
    overflow: hidden;
  }
</style>
