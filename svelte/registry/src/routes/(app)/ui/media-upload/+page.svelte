<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import UIPrimitivePageTemplate from '$lib/site/templates/UIPrimitivePageTemplate.svelte';
  import Preview from '$site-components/preview.svelte';
  import CodeBlock from '$site-components/CodeBlock.svelte';
  import * as ComponentAnatomy from '$site-components/component-anatomy';
  import { MediaUpload } from '$lib/registry/ui/media-upload';

  import Basic from './examples/basic-usage/index.svelte';
  import BasicRaw from './examples/basic-usage/index.txt?raw';
  import Carousel from './examples/carousel/index.svelte';
  import CarouselRaw from './examples/carousel/index.txt?raw';

  const ndk = getContext<NDKSvelte>('ndk');

  // Mock upload data for anatomy visualization
  let mockUploads = $state([
    { url: 'https://example.com/image1.jpg', file: new File([], 'image1.jpg'), progress: 100, uploading: false },
    { url: 'https://example.com/image2.jpg', file: new File([], 'image2.jpg'), progress: 100, uploading: false }
  ]);

  // Page metadata
  const metadata = {
    title: 'Media Upload',
    description: 'Headless, composable primitives for uploading media files to Blossom servers. Supports multiple files, progress tracking, previews, and carousel display with automatic server selection and fallback.',
    importPath: 'ui/media-upload',
    nips: [],
    primitives: [
      {
        name: 'MediaUpload.Root',
        title: 'MediaUpload.Root',
        description: 'Context provider that manages file uploads and upload state. Handles Blossom server selection, authentication, and upload coordination.',
        apiDocs: [
          { name: 'ndk', type: 'NDKSvelte', default: 'from context', description: 'NDK instance for auth and server selection' },
          { name: 'fallbackServer', type: 'string', default: "'https://blossom.primal.net'", description: 'Fallback Blossom server URL when auto-discovery fails' },
          { name: 'accept', type: 'string', default: 'optional', description: 'Accepted file types (e.g., "image/*,video/*")' },
          { name: 'maxFiles', type: 'number', default: 'optional', description: 'Maximum number of files allowed' },
          { name: 'uploads', type: 'MediaUploadResult[]', default: '[]', description: 'Bindable array of upload results' },
          { name: 'class', type: 'string', default: "''", description: 'Additional CSS classes' },
          { name: 'children', type: 'Snippet', default: 'required', description: 'Child components' }
        ]
      },
      {
        name: 'MediaUpload.Button',
        title: 'MediaUpload.Button',
        description: 'File selection button that triggers the native file picker. Respects accept and maxFiles constraints from Root.',
        apiDocs: [
          { name: 'class', type: 'string', default: "''", description: 'Additional CSS classes' },
          { name: 'children', type: 'Snippet', default: 'required', description: 'Button content' }
        ]
      },
      {
        name: 'MediaUpload.Preview',
        title: 'MediaUpload.Preview',
        description: 'Preview component for individual uploads with progress indicator. Shows uploading state, progress bar, and error messages.',
        apiDocs: [
          { name: 'upload', type: 'MediaUploadResult', default: 'required', description: 'Upload result object containing file, URL, and progress' },
          { name: 'class', type: 'string', default: "''", description: 'Additional CSS classes' }
        ]
      },
      {
        name: 'MediaUpload.Carousel',
        title: 'MediaUpload.Carousel',
        description: 'Carousel component for navigating through uploaded media. Automatically renders all uploaded items in a swipeable carousel.',
        apiDocs: [
          { name: 'class', type: 'string', default: "''", description: 'Additional CSS classes' }
        ]
      },
      {
        name: 'MediaUpload.Item',
        title: 'MediaUpload.Item',
        description: 'Individual carousel item with navigation controls. Displays media content with next/previous buttons.',
        apiDocs: [
          { name: 'upload', type: 'MediaUploadResult', default: 'required', description: 'Upload result object' },
          { name: 'class', type: 'string', default: "''", description: 'Additional CSS classes' }
        ]
      }
    ],
    anatomyLayers: [
      {
        id: 'root',
        label: 'MediaUpload.Root',
        description: 'Container that manages upload state and Blossom server selection.',
        props: ['ndk', 'fallbackServer', 'accept', 'maxFiles', 'uploads', 'class']
      },
      {
        id: 'button',
        label: 'MediaUpload.Button',
        description: 'File selection button triggering native picker.',
        props: ['class', 'children']
      },
      {
        id: 'preview',
        label: 'MediaUpload.Preview',
        description: 'Individual upload preview with progress tracking.',
        props: ['upload', 'class']
      },
      {
        id: 'carousel',
        label: 'MediaUpload.Carousel',
        description: 'Navigable carousel for uploaded media.',
        props: ['class']
      },
      {
        id: 'item',
        label: 'MediaUpload.Item',
        description: 'Individual carousel item with controls.',
        props: ['upload', 'class']
      }
    ]
  };
</script>

<svelte:head>
  <title>Media Upload Primitives - NDK Svelte</title>
  <meta name="description" content="Headless, composable primitives for uploading media files to Blossom servers with previews and progress tracking." />
</svelte:head>

<UIPrimitivePageTemplate {metadata} {ndk}>
  {#snippet topExample()}
    <Preview code={BasicRaw}>
      <Basic />
    </Preview>
  {/snippet}

  {#snippet overview()}
    <section>
      <h2 class="text-2xl font-semibold mb-4">Overview</h2>
      <p class="text-lg leading-relaxed text-muted-foreground mb-8">
        Media Upload primitives provide headless components for uploading media files to Blossom servers.
        They support multiple files, progress tracking, previews, and carousel display with automatic server
        selection and fallback handling.
      </p>

      <h3 class="text-xl font-semibold mt-8 mb-4">When You Need These</h3>
      <p class="leading-relaxed mb-4">
        Use Media Upload primitives when you need to:
      </p>
      <ul class="ml-6 mb-4 list-disc space-y-2">
        <li class="leading-relaxed">Upload images or videos to Blossom servers</li>
        <li class="leading-relaxed">Build custom file upload interfaces with progress tracking</li>
        <li class="leading-relaxed">Create media galleries or carousels</li>
        <li class="leading-relaxed">Handle multiple file uploads with previews</li>
        <li class="leading-relaxed">Integrate decentralized media storage using Blossom protocol</li>
      </ul>
      <p class="leading-relaxed mt-4 text-muted-foreground">
        These primitives use the Blossom protocol for decentralized media storage, with automatic server
        discovery from NIP-65 relay lists and Nostr auth (NIP-98) for authenticated uploads.
      </p>
    </section>
  {/snippet}

  {#snippet anatomyPreview()}
    <MediaUpload.Root {ndk} bind:uploads={mockUploads}>
      <ComponentAnatomy.Layer id="root" label="MediaUpload.Root">
        <div class="border border-border rounded-lg p-6 bg-card max-w-lg space-y-4">
          <ComponentAnatomy.Layer id="button" label="MediaUpload.Button">
            <MediaUpload.Button class="px-4 py-2 bg-primary text-primary-foreground rounded">
              Select Files
            </MediaUpload.Button>
          </ComponentAnatomy.Layer>
          <div class="space-y-2">
            {#each mockUploads as upload}
              <ComponentAnatomy.Layer id="preview" label="MediaUpload.Preview">
                <MediaUpload.Preview {upload} class="border border-border rounded p-2" />
              </ComponentAnatomy.Layer>
            {/each}
          </div>
          <ComponentAnatomy.Layer id="carousel" label="MediaUpload.Carousel">
            <MediaUpload.Carousel class="mt-4 border border-border rounded-lg overflow-hidden" />
          </ComponentAnatomy.Layer>
        </div>
      </ComponentAnatomy.Layer>
    </MediaUpload.Root>
  {/snippet}

  {#snippet examples()}
    <div>
      <h3 class="text-xl font-semibold mb-3">Carousel Display</h3>
      <p class="leading-relaxed text-muted-foreground mb-4">
        Use MediaUpload.Carousel to display uploaded media in a navigable carousel with next/previous controls.
      </p>
      <Preview
        title="Carousel Display"
        code={CarouselRaw}
      >
        <Carousel />
      </Preview>
    </div>

    <div>
      <h3 class="text-xl font-semibold mb-3">File Restrictions</h3>
      <p class="leading-relaxed text-muted-foreground mb-4">
        Control which files can be uploaded using the accept and maxFiles props.
      </p>
      <div class="my-4 bg-muted rounded-lg overflow-hidden">
        <CodeBlock
          lang="svelte"
          code={`<!-- Accept only images -->
<MediaUpload.Root {ndk} accept="image/*">
  <MediaUpload.Button>Upload Images</MediaUpload.Button>
</MediaUpload.Root>

<!-- Accept images and videos -->
<MediaUpload.Root {ndk} accept="image/*,video/*">
  <MediaUpload.Button>Upload Media</MediaUpload.Button>
</MediaUpload.Root>

<!-- Limit to 5 files -->
<MediaUpload.Root {ndk} maxFiles={5}>
  <MediaUpload.Button>Upload (Max 5)</MediaUpload.Button>
</MediaUpload.Root>`}
        />
      </div>
    </div>

    <div>
      <h3 class="text-xl font-semibold mb-3">Upload State Management</h3>
      <p class="leading-relaxed text-muted-foreground mb-4">
        Access and manage uploads with the bindable uploads prop. Use the upload URLs in your application.
      </p>
      <div class="my-4 bg-muted rounded-lg overflow-hidden">
        <CodeBlock
          lang="svelte"
          code={`import type { MediaUploadResult } from '$lib/registry/ui/media-upload';

let uploads = $state<MediaUploadResult[]>([]);

<MediaUpload.Root {ndk} bind:uploads>
  <MediaUpload.Button>Upload Files</MediaUpload.Button>

  <!-- Display uploaded images -->
  {#each uploads as upload}
    {#if !upload.uploading && !upload.error}
      <img src={upload.url} alt="" />
    {/if}
  {/each}
</MediaUpload.Root>`}
        />
      </div>
    </div>

    <div>
      <h3 class="text-xl font-semibold mb-3">Progress Tracking</h3>
      <p class="leading-relaxed text-muted-foreground mb-4">
        MediaUpload.Preview automatically displays upload progress. For custom progress UI, access the progress property.
      </p>
      <div class="my-4 bg-muted rounded-lg overflow-hidden">
        <CodeBlock
          lang="svelte"
          code={`{#each uploads as upload}
  {#if upload.uploading}
    <div class="progress-container">
      <div class="progress-bar" style="width: {upload.progress}%"></div>
      <span>{upload.progress}%</span>
    </div>
  {/if}
{/each}`}
        />
      </div>
    </div>

    <div>
      <h3 class="text-xl font-semibold mb-3">Error Handling</h3>
      <p class="leading-relaxed text-muted-foreground mb-4">
        Handle upload errors with the error property. Display error messages to users when uploads fail.
      </p>
      <div class="my-4 bg-muted rounded-lg overflow-hidden">
        <CodeBlock
          lang="svelte"
          code={`{#each uploads as upload}
  {#if upload.error}
    <div class="error-message">
      <strong>Upload failed:</strong> {upload.error}
      <button onclick={() => retryUpload(upload)}>Retry</button>
    </div>
  {/if}
{/each}`}
        />
      </div>
    </div>

    <div>
      <h3 class="text-xl font-semibold mb-3">Builder Access</h3>
      <p class="leading-relaxed text-muted-foreground mb-4">
        For advanced use cases, use the builder directly for programmatic uploads.
      </p>
      <div class="my-4 bg-muted rounded-lg overflow-hidden">
        <CodeBlock
          lang="typescript"
          code={`import { createMediaUpload, type MediaUploadOptions } from '$lib/registry/ui/media-upload';

const options: MediaUploadOptions = {
  fallbackServer: 'https://blossom.primal.net',
  accept: 'image/*',
  maxFiles: 10
};

const mediaUpload = createMediaUpload(ndk, options);

// Programmatic file selection
mediaUpload.selectFiles();

// Access upload state
console.log(mediaUpload.uploads);
console.log(mediaUpload.uploading);`}
        />
      </div>
    </div>
  {/snippet}

  {#snippet contextSection()}
    <section>
      <h2 class="text-2xl font-semibold mb-4">Blossom Protocol</h2>
      <p class="leading-relaxed text-muted-foreground mb-4">
        MediaUpload uses the Blossom protocol for decentralized media storage. Blossom provides
        content-addressed URLs using SHA-256 hashes, making uploaded media permanent and verifiable.
      </p>
      <div class="my-4">
        <h4 class="font-semibold mb-2">Server Selection Process:</h4>
        <ol class="ml-6 list-decimal space-y-2 text-muted-foreground">
          <li>Checks user's NIP-65 relay list for Blossom servers</li>
          <li>Tests server availability and auth support</li>
          <li>Falls back to configured fallbackServer if needed</li>
          <li>Caches server selection for performance</li>
        </ol>
      </div>
      <div class="my-4">
        <h4 class="font-semibold mb-2">Authentication:</h4>
        <p class="text-muted-foreground">
          Uses Nostr auth (NIP-98) for authenticated uploads. The NDK instance handles signing
          auth challenges from Blossom servers automatically.
        </p>
      </div>

      <h3 class="text-xl font-semibold mt-8 mb-4">MediaUploadResult Type</h3>
      <p class="leading-relaxed text-muted-foreground mb-4">
        Upload results are represented by the MediaUploadResult type, containing file information,
        upload URL, progress, and error state.
      </p>
      <div class="my-4 bg-muted rounded-lg overflow-hidden">
        <CodeBlock
          lang="typescript"
          code={`import type { MediaUploadResult } from '$lib/registry/ui/media-upload';

interface MediaUploadResult {
  url: string;          // Uploaded file URL (Blossom URL)
  file: File;           // Original File object
  progress: number;     // Upload progress (0-100)
  error?: string;       // Error message if upload failed
  uploading: boolean;   // Whether upload is in progress
}`}
        />
      </div>

      <h3 class="text-xl font-semibold mt-8 mb-4">Blossom URLs</h3>
      <p class="leading-relaxed text-muted-foreground mb-4">
        Blossom returns content-addressed URLs based on SHA-256 hashes:
      </p>
      <div class="my-4 bg-muted rounded-lg overflow-hidden">
        <CodeBlock
          lang="text"
          code={`https://blossom.primal.net/[sha256-hash]

Example:
https://blossom.primal.net/a3b2c1d4e5f6...`}
        />
      </div>
      <p class="text-sm text-muted-foreground mt-2">
        These URLs are permanent and can be verified by hashing the content. Any Blossom server
        can serve the content using the same hash.
      </p>
    </section>
  {/snippet}

  {#snippet relatedComponents()}
    <section>
      <h2 class="text-2xl font-semibold mb-4">Related</h2>
      <div class="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
        <a href="/components/media-upload" class="flex flex-col gap-1 p-4 border border-border rounded-lg no-underline transition-all hover:border-primary hover:-translate-y-0.5">
          <strong class="font-semibold text-foreground">Media Upload Component</strong>
          <span class="text-sm text-muted-foreground">Styled media upload with dropzone</span>
        </a>
        <a href="/ui/event-rendering" class="flex flex-col gap-1 p-4 border border-border rounded-lg no-underline transition-all hover:border-primary hover:-translate-y-0.5">
          <strong class="font-semibold text-foreground">Event Content Primitives</strong>
          <span class="text-sm text-muted-foreground">For displaying uploaded media in events</span>
        </a>
      </div>
    </section>
  {/snippet}
</UIPrimitivePageTemplate>
