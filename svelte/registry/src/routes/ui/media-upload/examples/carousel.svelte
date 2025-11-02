<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import type { MediaUploadResult } from '$lib/registry/ui';
  import { MediaUpload } from '$lib/registry/ui';

  const ndk = getContext<NDKSvelte>('ndk');

  let uploads = $state<MediaUploadResult[]>([]);
</script>

<div class="carousel-demo">
  <MediaUpload.Root {ndk} bind:uploads>
    <div class="controls">
      <MediaUpload.Button class="upload-button">
        Upload Media
      </MediaUpload.Button>
    </div>

    {#if uploads.length > 0}
      <MediaUpload.Carousel class="carousel" />
    {/if}
  </MediaUpload.Root>
</div>

<style>
  .carousel-demo {
    border: 1px solid #e5e7eb;
    border-radius: 0.75rem;
    padding: 1.5rem;
    background: white;
  }

  .controls {
    margin-bottom: 1rem;
  }

  .carousel-demo :global(.upload-button) {
    padding: 0.625rem 1.25rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 0.5rem;
    cursor: pointer;
    font-weight: 600;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s, box-shadow 0.2s;
  }

  .carousel-demo :global(.upload-button:hover) {
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  }

  .carousel-demo :global(.carousel) {
    border-radius: 0.5rem;
    overflow: hidden;
  }
</style>
