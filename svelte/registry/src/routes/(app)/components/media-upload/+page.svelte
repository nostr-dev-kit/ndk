<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import ComponentPageTemplate from '$lib/site/templates/ComponentPageTemplate.svelte';
  import ComponentsShowcaseGrid from '$site-components/ComponentsShowcaseGrid.svelte';
  import SectionTitle from '$site-components/SectionTitle.svelte';  import type { ShowcaseComponent } from '$lib/site/templates/types';
  import type { MediaUploadResult } from '$lib/registry/ui/media-upload';

  // Import code examples
  import uploadButtonCode from './upload-button.example?raw';
  import mediaUploadCarouselCode from './media-upload-carousel.example?raw';

  import UploadButton from '$lib/registry/components/media/upload/button/upload-button.svelte';
  import MediaUploadCarousel from '$lib/registry/components/media/upload/carousel/media-upload-carousel.svelte';

  // Get page data
  let { data } = $props();
  const { metadata } = data;

  const ndk = getContext<NDKSvelte>('ndk');

  let buttonUploads = $state<MediaUploadResult[]>([]);
  let carouselUploads = $state<MediaUploadResult[]>([]);

  // Showcase blocks
    const showcaseComponents: ShowcaseComponent[] = [
    {
      cardData: metadata.cards[0],
      preview: uploadButtonPreview
    },
    {
      cardData: metadata.cards[1],
      preview: carouselPreview
    }
  ];
</script>

<!-- Preview snippets for Blocks -->
{#snippet uploadButtonPreview()}
  <div class="flex flex-col gap-4">
    <UploadButton {ndk} bind:uploads={buttonUploads} />
    {#if buttonUploads.length > 0}
      <div class="text-sm text-muted-foreground">
        {buttonUploads.length} file{buttonUploads.length === 1 ? '' : 's'} uploaded
      </div>
    {/if}
  </div>
{/snippet}

{#snippet carouselPreview()}
  <MediaUploadCarousel {ndk} bind:uploads={carouselUploads} accept="image/*,video/*" />
{/snippet}

<!-- Custom Builder API section -->
{#snippet customSections()}
  <section class="mb-16">
    <h2 class="text-3xl font-bold mb-2">Builder API</h2>

    <div class="space-y-6">
      <div class="border border-border rounded-lg p-6">
        <h3 class="text-xl font-semibold mb-4">createMediaUpload</h3>
        <p class="text-muted-foreground mb-4">
          Creates a reactive media upload manager with state tracking and upload queue management.
        </p>

        <div class="space-y-4">
          <div>
            <h4 class="text-sm font-semibold mb-2">Signature</h4>
            <pre
              class="bg-muted p-3 rounded text-sm overflow-x-auto"><code>function createMediaUpload(
  ndk: NDKSvelte,
  options?: MediaUploadOptions
): MediaUploadManager</code></pre>
          </div>

          <div>
            <h4 class="text-sm font-semibold mb-2">Options</h4>
            <ul class="space-y-2 text-sm">
              <li>
                <code class="bg-muted px-1 py-0.5 rounded">fallbackServer</code>: Blossom server URL
                (default: 'https://blossom.primal.net')
              </li>
              <li><code class="bg-muted px-1 py-0.5 rounded">accept</code>: Accepted file types</li>
              <li>
                <code class="bg-muted px-1 py-0.5 rounded">maxFiles</code>: Maximum number of files
              </li>
            </ul>
          </div>

          <div>
            <h4 class="text-sm font-semibold mb-2">Returns</h4>
            <ul class="space-y-2 text-sm">
              <li>
                <code class="bg-muted px-1 py-0.5 rounded">uploads</code>: Reactive array of
                MediaUploadResult objects
              </li>
              <li>
                <code class="bg-muted px-1 py-0.5 rounded">uploadFile(file: File)</code>: Upload
                single file
              </li>
              <li>
                <code class="bg-muted px-1 py-0.5 rounded">uploadFiles(files: FileList)</code>:
                Upload multiple files
              </li>
              <li>
                <code class="bg-muted px-1 py-0.5 rounded">removeUpload(index: number)</code>: Remove
                upload at index
              </li>
              <li>
                <code class="bg-muted px-1 py-0.5 rounded"
                  >reorderUpload(from: number, to: number)</code
                >: Reorder uploads
              </li>
              <li>
                <code class="bg-muted px-1 py-0.5 rounded">clearUploads()</code>: Clear all uploads
              </li>
              <li>
                <code class="bg-muted px-1 py-0.5 rounded">isUploading</code>: Boolean indicating
                upload in progress
              </li>
              <li>
                <code class="bg-muted px-1 py-0.5 rounded">progress</code>: Map of file upload
                progress
              </li>
              <li>
                <code class="bg-muted px-1 py-0.5 rounded">errors</code>: Map of file upload errors
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </section>
{/snippet}

<ComponentPageTemplate
  metadata={metadata}
  {ndk}
  showcaseComponents={showcaseComponents}
  componentsSection={{
    cards: [
      { ...metadata.cards[0], code: uploadButtonCode },
      { ...metadata.cards[1], code: mediaUploadCarouselCode }
    ],
    previews: {
      'upload-button': uploadButtonPreview,
      'media-upload-carousel': carouselPreview
    }
  }}
  apiDocs={metadata.apiDocs}
  {customSections}
/>
