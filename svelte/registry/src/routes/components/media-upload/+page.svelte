<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import ComponentPageTemplate from '$lib/templates/ComponentPageTemplate.svelte';
  import ComponentsShowcaseGrid from '$site-components/ComponentsShowcaseGrid.svelte';
  import SectionTitle from '$site-components/SectionTitle.svelte';
  import { mediaUploadMetadata } from '$lib/component-registry/media-upload';
  import type { ShowcaseBlock } from '$lib/templates/types';
  import type { MediaUploadResult } from '$lib/registry/ui/media-upload';

  import UploadButton from '$lib/registry/components/actions/upload-button.svelte';
  import MediaUploadCarousel from '$lib/registry/components/media-upload-carousel/media-upload-carousel.svelte';
  import UIBasic from './examples/ui-basic.example.svelte';
  import UIFull from './examples/ui-full.example.svelte';

  const ndk = getContext<NDKSvelte>('ndk');

  let buttonUploads = $state<MediaUploadResult[]>([]);
  let carouselUploads = $state<MediaUploadResult[]>([]);

  // Blocks showcase
  const blocksShowcaseBlocks: ShowcaseBlock[] = [
    {
      name: 'Upload Button',
      description: 'Simple file uploads',
      command: 'npx shadcn@latest add upload-button',
      preview: uploadButtonPreview,
      cardData: mediaUploadMetadata.cards[0]
    },
    {
      name: 'Media Upload Carousel',
      description: 'With visual previews',
      command: 'npx shadcn@latest add media-upload-carousel',
      preview: carouselPreview,
      cardData: mediaUploadMetadata.cards[1]
    }
  ];

  // UI Primitives showcase
  const primitivesShowcaseBlocks: ShowcaseBlock[] = [
    {
      name: 'Basic Usage',
      description: 'Minimal primitives',
      command: 'npx shadcn@latest add media-upload',
      preview: basicPreview,
      cardData: mediaUploadMetadata.cards[2]
    },
    {
      name: 'Full Composition',
      description: 'All primitives together',
      command: 'npx shadcn@latest add media-upload',
      preview: fullPreview,
      cardData: mediaUploadMetadata.cards[3]
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

<!-- Preview snippets for UI Primitives -->
{#snippet basicPreview()}
  <UIBasic {ndk} />
{/snippet}

{#snippet fullPreview()}
  <UIFull {ndk} />
{/snippet}

<!-- Additional showcase for UI Primitives -->
{#snippet afterShowcase()}
  <SectionTitle
    title="UI Primitives"
    description="Primitive components for building custom upload layouts."
  />

  <ComponentsShowcaseGrid blocks={primitivesShowcaseBlocks} />

  <section class="mb-16">
    <h2 class="text-3xl font-bold mb-2">Builder</h2>
    <p class="text-muted-foreground mb-8">
      The <code class="text-sm bg-muted px-1 py-0.5 rounded">createMediaUpload</code> builder provides
      reactive state management for file uploads.
    </p>

    <div class="bg-muted/50 rounded-lg p-6 space-y-4">
      <h3 class="text-lg font-semibold">Basic Usage</h3>
      <pre class="bg-background p-4 rounded-md overflow-x-auto"><code
          class="text-sm">{`import { createMediaUpload } from '$lib/registry/ui/media-upload';

const mediaUpload = createMediaUpload(ndk, {
  fallbackServer: 'https://blossom.primal.net',
  accept: 'image/*,video/*',
  maxFiles: 10
});

// Upload files
await mediaUpload.uploadFiles(fileList);

// Access uploaded files
console.log(mediaUpload.uploads);

// Remove an upload
mediaUpload.removeUpload(0);

// Reorder uploads
mediaUpload.reorderUpload(0, 2);`}</code></pre>
    </div>
  </section>
{/snippet}

<!-- Component previews for Components section -->
{#snippet uploadButtonComponentPreview()}
  <div class="flex flex-col gap-4">
    <UploadButton {ndk} bind:uploads={buttonUploads} />
    {#if buttonUploads.length > 0}
      <div class="text-sm text-muted-foreground">
        {buttonUploads.length} file{buttonUploads.length === 1 ? '' : 's'} uploaded
      </div>
    {/if}
  </div>
{/snippet}

{#snippet carouselComponentPreview()}
  <MediaUploadCarousel {ndk} bind:uploads={carouselUploads} accept="image/*,video/*" />
{/snippet}

{#snippet basicComponentPreview()}
  <UIBasic {ndk} />
{/snippet}

{#snippet fullComponentPreview()}
  <UIFull {ndk} />
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
  metadata={mediaUploadMetadata}
  {ndk}
  showcaseBlocks={blocksShowcaseBlocks}
  {afterShowcase}
  componentsSection={{
    cards: mediaUploadMetadata.cards,
    previews: {
      'upload-button': uploadButtonComponentPreview,
      'media-upload-carousel': carouselComponentPreview,
      'media-upload-basic': basicComponentPreview,
      'media-upload-full': fullComponentPreview
    }
  }}
  apiDocs={mediaUploadMetadata.apiDocs}
  {customSections}
/>
