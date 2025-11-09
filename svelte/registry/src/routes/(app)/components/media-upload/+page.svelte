<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import ComponentPageTemplate from '$lib/site/templates/ComponentPageTemplate.svelte';
  import type { MediaUploadResult } from '$lib/registry/ui/media-upload';
  import type { ShowcaseComponent } from '$lib/site/templates/types';

  // Import code examples
  import uploadButtonCode from './examples/button/index.txt?raw';
  import mediaUploadCarouselCode from './examples/carousel/index.txt?raw';

  // Import components
  import UploadButton from '$lib/registry/components/media/upload/button/upload-button.svelte';
  import MediaUploadCarousel from '$lib/registry/components/media/upload/carousel/media-upload-carousel.svelte';

  // Import registry metadata
  import uploadButtonCard from '$lib/registry/components/media/upload/button/metadata.json';
  import mediaUploadCarouselCard from '$lib/registry/components/media/upload/carousel/metadata.json';

  // Page metadata
  const metadata = {
    title: 'Media Upload',
    description: 'Media upload components for Nostr applications'
  };

  const ndk = getContext<NDKSvelte>('ndk');

  let buttonUploads = $state<MediaUploadResult[]>([]);
  let carouselUploads = $state<MediaUploadResult[]>([]);

  // Components section configuration
  const componentsSection = {
    title: 'Components',
    description: 'Explore each variant in detail',
    cards: [
      {...uploadButtonCard, code: uploadButtonCode},
      {...mediaUploadCarouselCard, code: mediaUploadCarouselCode}
    ],
    previews: {
      'upload-button': uploadButtonComponentPreview,
      'media-upload-carousel': carouselComponentPreview
    }
  };

  const showcaseComponents: ShowcaseComponent[] = [
    {
      id: "uploadButtonCard",
      cardData: uploadButtonCard,
      preview: uploadButtonPreview,
      orientation: 'vertical'
    },
    {
      id: "mediaUploadCarouselCard",
      cardData: mediaUploadCarouselCard,
      preview: carouselPreview,
      orientation: 'vertical'
    }
  ];
</script>

<!-- Preview snippets -->
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

<!-- Component preview snippets for componentsSection -->
{#snippet uploadButtonComponentPreview()}
  {@render uploadButtonPreview()}
{/snippet}

{#snippet carouselComponentPreview()}
  {@render carouselPreview()}
{/snippet}

<!-- Overview section -->
{#snippet overview()}
  <div class="text-lg text-muted-foreground space-y-4">
    <p>
      Media Upload components provide file upload functionality for Nostr applications using Blossom servers (NIP-96). Upload images, videos, and other media files with automatic authentication and progress tracking.
    </p>

    <p>
      The Upload Button component offers a simple drag-and-drop or click-to-upload interface, while the Carousel variant provides a visual preview of uploaded files with reordering capabilities. Both components handle authentication via NIP-98, automatically signing requests with the current user's credentials.
    </p>

    <p>
      Built on top of the createMediaUpload builder, which manages upload state, progress tracking, error handling, and file queue management with support for multiple concurrent uploads.
    </p>
  </div>
{/snippet}

<!-- Recipes section (Builder API) -->
{#snippet recipes()}
  <section class="mt-16">
    <h2 class="text-3xl font-bold mb-4">Builder API</h2>

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
  {metadata}
  {ndk}
  {overview}
  {showcaseComponents}
  {componentsSection}
  {recipes}
/>
