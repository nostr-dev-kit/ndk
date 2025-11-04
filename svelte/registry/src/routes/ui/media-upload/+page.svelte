<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import Demo from '$site-components/Demo.svelte';
  import ApiTable from '$site-components/api-table.svelte';

  import Basic from './examples/basic.example.svelte';
  import BasicRaw from './examples/basic.example.svelte?raw';
  import Carousel from './examples/carousel.example.svelte';
  import CarouselRaw from './examples/carousel.example.svelte?raw';

  const ndk = getContext<NDKSvelte>('ndk');
</script>

<svelte:head>
  <title>Media Upload Primitives - NDK Svelte</title>
  <meta name="description" content="Headless, composable primitives for uploading media files to Blossom servers with previews and progress tracking." />
</svelte:head>

<div class="component-page">
  <header>
    <div class="header-badge">
      <span class="badge">UI Primitive</span>
      <span class="badge badge-protocol">Blossom</span>
    </div>
    <div class="header-title">
      <h1>Media Upload</h1>
    </div>
    <p class="header-description">
      Headless, composable primitives for uploading media files to Blossom servers. Supports multiple files, progress tracking, previews, and carousel display with automatic server selection and fallback.
    </p>
    <div class="header-info">
      <div class="info-card">
        <strong>Headless</strong>
        <span>Fully customizable styling</span>
      </div>
      <div class="info-card">
        <strong>Blossom Protocol</strong>
        <span>Upload to Blossom media servers</span>
      </div>
      <div class="info-card">
        <strong>Progress Tracking</strong>
        <span>Real-time upload progress</span>
      </div>
    </div>
  </header>

  <section class="installation">
    <h2>Installation</h2>
    <pre><code>import &#123; MediaUpload &#125; from '$lib/registry/ui';</code></pre>
  </section>

  <section class="demo space-y-8">
    <h2>Examples</h2>

    <Demo
      title="Basic Upload"
      description="MediaUpload provides file selection and preview functionality with Blossom server integration."
      code={BasicRaw}
    >
      <Basic />
    </Demo>

    <Demo
      title="Carousel Display"
      description="Use MediaUpload.Carousel to display uploaded media in a navigable carousel."
      code={CarouselRaw}
    >
      <Carousel />
    </Demo>
  </section>

  <section class="info">
    <h2>Available Components</h2>
    <div class="components-grid">
      <div class="component-item">
        <code>MediaUpload.Root</code>
        <p>Context provider for media upload state.</p>
      </div>
      <div class="component-item">
        <code>MediaUpload.Button</code>
        <p>File selection button with upload handling.</p>
      </div>
      <div class="component-item">
        <code>MediaUpload.Preview</code>
        <p>Individual media preview with progress.</p>
      </div>
      <div class="component-item">
        <code>MediaUpload.Carousel</code>
        <p>Carousel view for uploaded media.</p>
      </div>
      <div class="component-item">
        <code>MediaUpload.Item</code>
        <p>Individual carousel item with controls.</p>
      </div>
    </div>
  </section>

  <section class="info">
    <h2>MediaUpload.Root</h2>
    <p class="mb-4">Context provider that manages file uploads and upload state.</p>
    <ApiTable
      rows={[
        { name: 'ndk', type: 'NDKSvelte', default: 'from context', description: 'NDK instance for auth and server selection' },
        { name: 'fallbackServer', type: 'string', default: "'https://blossom.primal.net'", description: 'Fallback Blossom server URL' },
        { name: 'accept', type: 'string', default: 'optional', description: 'Accepted file types (e.g., "image/*,video/*")' },
        { name: 'maxFiles', type: 'number', default: 'optional', description: 'Maximum number of files allowed' },
        { name: 'uploads', type: 'MediaUploadResult[]', default: '[]', description: 'Bindable array of upload results' },
        { name: 'class', type: 'string', default: "''", description: 'Additional CSS classes' },
        { name: 'children', type: 'Snippet', default: 'required', description: 'Child components' }
      ]}
    />
  </section>

  <section class="info">
    <h2>MediaUpload.Button</h2>
    <p class="mb-4">File selection button that triggers the native file picker.</p>
    <ApiTable
      rows={[
        { name: 'class', type: 'string', default: "''", description: 'Additional CSS classes' },
        { name: 'children', type: 'Snippet', default: 'required', description: 'Button content' }
      ]}
    />
  </section>

  <section class="info">
    <h2>MediaUpload.Preview</h2>
    <p class="mb-4">Preview component for individual uploads with progress indicator.</p>
    <ApiTable
      rows={[
        { name: 'upload', type: 'MediaUploadResult', default: 'required', description: 'Upload result object' },
        { name: 'class', type: 'string', default: "''", description: 'Additional CSS classes' }
      ]}
    />
  </section>

  <section class="info">
    <h2>MediaUpload.Carousel</h2>
    <p class="mb-4">Carousel component for navigating through uploaded media.</p>
    <ApiTable
      rows={[
        { name: 'class', type: 'string', default: "''", description: 'Additional CSS classes' }
      ]}
    />
  </section>

  <section class="info">
    <h2>MediaUpload.Item</h2>
    <p class="mb-4">Individual carousel item with navigation controls.</p>
    <ApiTable
      rows={[
        { name: 'upload', type: 'MediaUploadResult', default: 'required', description: 'Upload result object' },
        { name: 'class', type: 'string', default: "''", description: 'Additional CSS classes' }
      ]}
    />
  </section>

  <section class="info">
    <h2>MediaUploadResult</h2>
    <p class="mb-4">Upload result object containing file information and upload status:</p>
    <pre><code>interface MediaUploadResult &#123;
  url: string;          // Uploaded file URL (Blossom URL)
  file: File;           // Original File object
  progress: number;     // Upload progress (0-100)
  error?: string;       // Error message if upload failed
  uploading: boolean;   // Whether upload is in progress
&#125;</code></pre>
  </section>

  <section class="info">
    <h2>Blossom Protocol</h2>
    <p class="mb-4">MediaUpload uses the Blossom protocol for decentralized media storage:</p>
    <ul class="ml-6 mb-4 space-y-2">
      <li>Automatically discovers Blossom servers from user's NIP-65 relay list</li>
      <li>Falls back to configured fallback server if needed</li>
      <li>Uses Nostr auth (NIP-98) for authenticated uploads</li>
      <li>Returns permanent content-addressed URLs (SHA-256 hash)</li>
    </ul>
  </section>

  <section class="info">
    <h2>File Restrictions</h2>
    <p class="mb-4">Control which files can be uploaded:</p>
    <pre><code>// Accept only images
&lt;MediaUpload.Root &#123;ndk&#125; accept="image/*"&gt;

// Accept images and videos
&lt;MediaUpload.Root &#123;ndk&#125; accept="image/*,video/*"&gt;

// Limit to 5 files
&lt;MediaUpload.Root &#123;ndk&#125; maxFiles=&#123;5&#125;&gt;</code></pre>
  </section>

  <section class="info">
    <h2>Upload State Management</h2>
    <p class="mb-4">Access and manage uploads with the bindable uploads prop:</p>
    <pre><code>import type &#123; MediaUploadResult &#125; from '$lib/registry/ui';

let uploads = $state&lt;MediaUploadResult[]&gt;([]);

&lt;MediaUpload.Root &#123;ndk&#125; bind:uploads&gt;
  &lt;!-- ... --&gt;
&lt;/MediaUpload.Root&gt;

// Access upload URLs
&#123;#each uploads as upload&#125;
  &#123;#if !upload.uploading && !upload.error&#125;
    &lt;img src=&#123;upload.url&#125; alt="" /&gt;
  &#123;/if&#125;
&#123;/each&#125;</code></pre>
  </section>

  <section class="info">
    <h2>Progress Tracking</h2>
    <p class="mb-4">MediaUpload.Preview automatically displays upload progress. For custom progress UI:</p>
    <pre><code>&#123;#each uploads as upload&#125;
  &#123;#if upload.uploading&#125;
    &lt;div class="progress-bar"&gt;
      &lt;div style="width: &#123;upload.progress&#125;%"&gt;&lt;/div&gt;
    &lt;/div&gt;
  &#123;/if&#125;
&#123;/each&#125;</code></pre>
  </section>

  <section class="info">
    <h2>Error Handling</h2>
    <p class="mb-4">Handle upload errors with the error property:</p>
    <pre><code>&#123;#each uploads as upload&#125;
  &#123;#if upload.error&#125;
    &lt;div class="error"&gt;
      Failed to upload: &#123;upload.error&#125;
    &lt;/div&gt;
  &#123;/if&#125;
&#123;/each&#125;</code></pre>
  </section>

  <section class="info">
    <h2>Builder Access</h2>
    <p class="mb-4">For advanced use cases, use the builder directly:</p>
    <pre><code>import &#123; createMediaUpload, type MediaUploadOptions &#125; from '$lib/registry/ui';

const options: MediaUploadOptions = &#123;
  fallbackServer: 'https://blossom.primal.net',
  accept: 'image/*',
  maxFiles: 10
&#125;;

const mediaUpload = createMediaUpload(ndk, options);

// Programmatic upload
mediaUpload.selectFiles();

// Access uploads
console.log(mediaUpload.uploads);</code></pre>
  </section>

  <section class="info">
    <h2>Server Selection</h2>
    <p class="mb-4">MediaUpload automatically selects the best Blossom server:</p>
    <ol class="ml-6 mb-4 space-y-2">
      <li>Checks user's NIP-65 relay list for Blossom servers</li>
      <li>Tests server availability and auth support</li>
      <li>Falls back to configured fallbackServer if needed</li>
      <li>Caches server selection for performance</li>
    </ol>
  </section>

  <section class="info">
    <h2>Related</h2>
    <div class="related-grid">
      <a href="/components/media-upload" class="related-card">
        <strong>Media Upload Component</strong>
        <span>Styled media upload with dropzone</span>
      </a>
      <a href="/ui/event-content" class="related-card">
        <strong>Event Content Primitives</strong>
        <span>For displaying uploaded media in events</span>
      </a>
    </div>
  </section>
</div>

<style>
  .component-page {
    max-width: 900px;
  }

  header {
    margin-bottom: 3rem;
  }

  .header-badge {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
    flex-wrap: wrap;
  }

  .badge {
    padding: 0.25rem 0.75rem;
    border-radius: 9999px;
    background: var(--muted);
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--muted-foreground);
  }

  .badge-protocol {
    background: #10b981;
    color: white;
  }

  .header-title h1 {
    font-size: 3rem;
    font-weight: 700;
    margin: 0;
    background: linear-gradient(135deg, var(--primary) 0%, color-mix(in srgb, var(--primary) 70%, transparent) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .header-description {
    font-size: 1.125rem;
    line-height: 1.7;
    color: var(--muted-foreground);
    margin: 1rem 0 1.5rem 0;
  }

  .header-info {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 1rem;
  }

  .info-card {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    padding: 1rem;
    border: 1px solid var(--border);
    border-radius: 0.5rem;
  }

  .info-card strong {
    font-weight: 600;
    color: var(--foreground);
  }

  .info-card span {
    font-size: 0.875rem;
    color: var(--muted-foreground);
  }

  .installation h2 {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 1rem;
  }

  .installation pre {
    padding: 1rem;
    background: var(--muted);
    border-radius: 0.5rem;
  }

  section {
    margin-bottom: 3rem;
  }

  section h2 {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 1rem;
  }

  .components-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1rem;
  }

  .component-item {
    padding: 1rem;
    border: 1px solid var(--border);
    border-radius: 0.5rem;
  }

  .component-item code {
    font-family: 'Monaco', 'Menlo', monospace;
    font-size: 0.9375rem;
    font-weight: 600;
    color: var(--primary);
    display: block;
    margin-bottom: 0.5rem;
  }

  .component-item p {
    font-size: 0.875rem;
    color: var(--muted-foreground);
    margin: 0;
  }

  .related-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
  }

  .related-card {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    padding: 1rem;
    border: 1px solid var(--border);
    border-radius: 0.5rem;
    text-decoration: none;
    transition: all 0.2s;
  }

  .related-card:hover {
    border-color: var(--primary);
    transform: translateY(-2px);
  }

  .related-card strong {
    font-weight: 600;
    color: var(--foreground);
  }

  .related-card span {
    font-size: 0.875rem;
    color: var(--muted-foreground);
  }

  pre {
    margin: 1rem 0;
    padding: 1rem;
    background: var(--muted);
    border-radius: 0.5rem;
    overflow-x: auto;
  }

  pre code {
    font-family: 'Monaco', 'Menlo', monospace;
    font-size: 0.875rem;
    line-height: 1.6;
  }

  ul,
  ol {
    list-style: disc;
  }

  ol {
    list-style: decimal;
  }

  ul li,
  ol li {
    color: var(--muted-foreground);
    line-height: 1.6;
  }
</style>
