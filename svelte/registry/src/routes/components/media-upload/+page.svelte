<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import type { MediaUploadResult } from '$lib/registry/ui/media-upload';
  import UploadButton from '$lib/registry/components/actions/upload-button.svelte';
  import MediaUploadCarousel from '$lib/registry/components/media-upload-carousel/media-upload-carousel.svelte';
  import { EditProps } from '$lib/site-components/edit-props';
  import ComponentsShowcaseGrid from '$site-components/ComponentsShowcaseGrid.svelte';
  import ComponentCard from '$site-components/ComponentCard.svelte';
  import ComponentPageSectionTitle from '$site-components/ComponentPageSectionTitle.svelte';
  import ComponentAPI from '$site-components/component-api.svelte';

  import UIBasic from './examples/ui-basic.svelte';
  import UIFull from './examples/ui-full.svelte';

  const ndk = getContext<NDKSvelte>('ndk');

  let buttonUploads = $state<MediaUploadResult[]>([]);
  let carouselUploads = $state<MediaUploadResult[]>([]);

  const uploadButtonData = {
    name: 'upload-button',
    title: 'Upload Button',
    description: 'Simple file uploads without previews.',
    richDescription: 'Use for simple file uploads without showing previews. Perfect for forms where uploaded files are managed elsewhere.',
    command: 'npx shadcn@latest add upload-button',
    apiDocs: []
  };

  const carouselData = {
    name: 'media-upload-carousel',
    title: 'Media Upload Carousel',
    description: 'Upload with visual previews.',
    richDescription: 'Use for uploading and managing multiple media files with visual previews. Shows a + button that expands into a carousel as files are uploaded.',
    command: 'npx shadcn@latest add media-upload-carousel',
    apiDocs: []
  };

  const basicUIData = {
    name: 'media-upload-basic',
    title: 'Basic Usage',
    description: 'Minimal upload primitives.',
    richDescription: 'Minimal example with MediaUpload.Root, Button, and Preview components.',
    command: 'npx shadcn@latest add media-upload',
    apiDocs: []
  };

  const fullUIData = {
    name: 'media-upload-full',
    title: 'Full Composition',
    description: 'All primitives together.',
    richDescription: 'All available primitives composed together with carousel, drag-to-reorder, and remove capabilities.',
    command: 'npx shadcn@latest add media-upload',
    apiDocs: []
  };
</script>

<div class="px-8">
  <!-- Header -->
  <div class="mb-12 pt-8">
    <div class="flex items-start justify-between gap-4 mb-4">
      <h1 class="text-4xl font-bold">Media Upload</h1>
      <EditProps.Button>Edit Examples</EditProps.Button>
    </div>
    <p class="text-lg text-muted-foreground mb-6">
      Upload media files to Blossom servers. Support for images, videos, audio, and other file
      types with progress tracking, drag-to-reorder, and remove capabilities.
    </p>
  </div>

  <!-- Blocks Showcase -->
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

  <ComponentPageSectionTitle
    title="Blocks"
    description="Pre-composed upload components ready to use."
  />

  <ComponentsShowcaseGrid
    blocks={[
      {
        name: 'Upload Button',
        description: 'Simple file uploads',
        command: 'npx shadcn@latest add upload-button',
        preview: uploadButtonPreview,
        cardData: uploadButtonData
      },
      {
        name: 'Media Upload Carousel',
        description: 'With visual previews',
        command: 'npx shadcn@latest add media-upload-carousel',
        preview: carouselPreview,
        cardData: carouselData
      }
    ]}
  />

  <!-- UI Primitives Showcase -->
  {#snippet basicPreview()}
    <UIBasic {ndk} />
  {/snippet}

  {#snippet fullPreview()}
    <UIFull {ndk} />
  {/snippet}

  <ComponentPageSectionTitle
    title="UI Primitives"
    description="Primitive components for building custom upload layouts."
  />

  <ComponentsShowcaseGrid
    blocks={[
      {
        name: 'Basic Usage',
        description: 'Minimal primitives',
        command: 'npx shadcn@latest add media-upload',
        preview: basicPreview,
        cardData: basicUIData
      },
      {
        name: 'Full Composition',
        description: 'All primitives together',
        command: 'npx shadcn@latest add media-upload',
        preview: fullPreview,
        cardData: fullUIData
      }
    ]}
  />

  <!-- Builder Section -->
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

  <!-- Components Section -->
  <ComponentPageSectionTitle title="Components" description="Explore each variant in detail" />

  <section class="py-12 space-y-16">
    <ComponentCard inline data={uploadButtonData}>
      {#snippet preview()}
        <div class="flex flex-col gap-4">
          <UploadButton {ndk} bind:uploads={buttonUploads} />
          {#if buttonUploads.length > 0}
            <div class="text-sm text-muted-foreground">
              {buttonUploads.length} file{buttonUploads.length === 1 ? '' : 's'} uploaded
            </div>
          {/if}
        </div>
      {/snippet}
    </ComponentCard>

    <ComponentCard inline data={carouselData}>
      {#snippet preview()}
        <MediaUploadCarousel {ndk} bind:uploads={carouselUploads} accept="image/*,video/*" />
      {/snippet}
    </ComponentCard>

    <ComponentCard inline data={basicUIData}>
      {#snippet preview()}
        <UIBasic {ndk} />
      {/snippet}
    </ComponentCard>

    <ComponentCard inline data={fullUIData}>
      {#snippet preview()}
        <UIFull {ndk} />
      {/snippet}
    </ComponentCard>
  </section>

  <!-- Component API -->
  <ComponentAPI
    components={[
      {
        name: 'MediaUpload.Root',
        description:
          'Root component that initializes the upload context and manages upload state.',
        importPath: "import { MediaUpload } from '$lib/registry/ui/media-upload'",
        props: [
          {
            name: 'ndk',
            type: 'NDKSvelte',
            description: 'NDK instance (optional if available in context)'
          },
          {
            name: 'fallbackServer',
            type: 'string',
            default: 'https://blossom.primal.net',
            description: 'Blossom server to use for uploads'
          },
          {
            name: 'accept',
            type: 'string',
            description: 'Accepted file types (MIME types or extensions)'
          },
          {
            name: 'maxFiles',
            type: 'number',
            description: 'Maximum number of files allowed'
          },
          {
            name: 'uploads',
            type: 'MediaUploadResult[]',
            required: true,
            description: 'Bindable array of uploaded files'
          }
        ]
      },
      {
        name: 'MediaUpload.Button',
        description: 'File picker button that triggers the upload flow.',
        importPath: "import { MediaUpload } from '$lib/registry/ui/media-upload'",
        props: [
          {
            name: 'multiple',
            type: 'boolean',
            default: 'true',
            description: 'Allow multiple file selection'
          },
          {
            name: 'accept',
            type: 'string',
            default: '*/*',
            description: 'Accepted file types'
          },
          {
            name: 'disabled',
            type: 'boolean',
            default: 'false',
            description: 'Disable the button'
          }
        ]
      },
      {
        name: 'MediaUpload.Preview',
        description: 'Displays preview of uploaded media with appropriate rendering for images, videos, and audio.',
        importPath: "import { MediaUpload } from '$lib/registry/ui/media-upload'",
        props: [
          {
            name: 'upload',
            type: 'MediaUploadResult',
            required: true,
            description: 'Upload result object to preview'
          },
          {
            name: 'showProgress',
            type: 'boolean',
            default: 'true',
            description: 'Show upload progress indicator'
          },
          {
            name: 'showError',
            type: 'boolean',
            default: 'true',
            description: 'Show error states'
          }
        ]
      },
      {
        name: 'MediaUpload.Carousel',
        description: 'Container for displaying multiple media items in a scrollable layout.',
        importPath: "import { MediaUpload } from '$lib/registry/ui/media-upload'",
        props: [
          {
            name: 'itemClass',
            type: 'string',
            description: 'CSS classes to apply to carousel items'
          }
        ]
      },
      {
        name: 'MediaUpload.Item',
        description: 'Individual carousel item with drag-to-reorder and remove capabilities.',
        importPath: "import { MediaUpload } from '$lib/registry/ui/media-upload'",
        props: [
          {
            name: 'upload',
            type: 'MediaUploadResult',
            required: true,
            description: 'Upload result object'
          },
          {
            name: 'index',
            type: 'number',
            required: true,
            description: 'Item index in the carousel'
          },
          {
            name: 'onRemove',
            type: '(index: number) => void',
            description: 'Callback when remove button is clicked'
          },
          {
            name: 'onReorder',
            type: '(fromIndex: number, toIndex: number) => void',
            description: 'Callback when item is dragged to reorder'
          }
        ]
      },
      {
        name: 'UploadButton',
        description: 'Simple upload button block without preview UI.',
        importPath: "import { UploadButton } from '$lib/registry/blocks'",
        props: [
          {
            name: 'ndk',
            type: 'NDKSvelte',
            description: 'NDK instance (optional if provided via context)'
          },
          {
            name: 'uploads',
            type: 'MediaUploadResult[]',
            required: true,
            description: 'Bindable array of uploaded files'
          },
          {
            name: 'fallbackServer',
            type: 'string',
            default: 'https://blossom.primal.net',
            description: 'Blossom server for uploads'
          },
          {
            name: 'accept',
            type: 'string',
            default: '*/*',
            description: 'Accepted file types'
          },
          {
            name: 'buttonText',
            type: 'string',
            default: 'Upload Files',
            description: 'Button text'
          },
          {
            name: 'multiple',
            type: 'boolean',
            default: 'true',
            description: 'Allow multiple files'
          },
          {
            name: 'maxFiles',
            type: 'number',
            description: 'Maximum files allowed'
          }
        ]
      },
      {
        name: 'MediaUploadCarousel',
        description: 'Carousel block with + button, previews, and drag-to-reorder.',
        importPath: "import { MediaUploadCarousel } from '$lib/registry/blocks'",
        props: [
          {
            name: 'ndk',
            type: 'NDKSvelte',
            description: 'NDK instance (optional if provided via context)'
          },
          {
            name: 'uploads',
            type: 'MediaUploadResult[]',
            required: true,
            description: 'Bindable array of uploaded files'
          },
          {
            name: 'fallbackServer',
            type: 'string',
            default: 'https://blossom.primal.net',
            description: 'Blossom server for uploads'
          },
          {
            name: 'accept',
            type: 'string',
            default: '*/*',
            description: 'Accepted file types'
          },
          {
            name: 'maxFiles',
            type: 'number',
            description: 'Maximum files allowed'
          },
          {
            name: 'showProgress',
            type: 'boolean',
            default: 'true',
            description: 'Show upload progress'
          }
        ]
      }
    ]}
  />

  <!-- Builder API -->
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
</div>
