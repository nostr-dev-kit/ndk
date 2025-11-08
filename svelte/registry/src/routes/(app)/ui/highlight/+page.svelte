<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import Preview from '$site-components/preview.svelte';
  import ApiTable from '$site-components/api-table.svelte';

  import Basic from './examples/basic-usage/index.svelte';
  import BasicRaw from './examples/basic-usage/index.txt?raw';
  import Composition from './examples/styled-card/index.svelte';
  import CompositionRaw from './examples/styled-card/index.txt?raw';

  const ndk = getContext<NDKSvelte>('ndk');
</script>

<svelte:head>
  <title>Highlight Primitives - NDK Svelte</title>
  <meta name="description" content="Headless, composable primitives for displaying text highlights (NIP-84)." />
</svelte:head>

<div class="component-page">
  <header>
    <div class="header-badge">
      <span class="badge">UI Primitive</span>
      <span class="badge badge-nip">NIP-84</span>
    </div>
    <div class="header-title">
      <h1>Highlight</h1>
    </div>
    <p class="header-description">
      Headless, composable primitives for displaying text highlights (NIP-84). Perfect for building custom highlight displays.
    </p>
    <div class="header-info">
      <div class="info-card">
        <strong>Headless</strong>
        <span>No styling - full design control</span>
      </div>
      <div class="info-card">
        <strong>Composable</strong>
        <span>Mix primitives to build your UI</span>
      </div>
      <div class="info-card">
        <strong>NIP-84</strong>
        <span>Text highlight events</span>
      </div>
    </div>
  </header>

  <section class="installation">
    <h2>Installation</h2>
    <pre><code>import &#123; Highlight &#125; from '$lib/registry/ui/embedded-event.svelte';</code></pre>
  </section>

  <section class="demo space-y-8">
    <h2>Examples</h2>

    <Preview
      title="Basic Usage"
      code={BasicRaw}
    >
      <Basic />
    </Preview>

    <Preview
      title="Styled Highlight Card"
      code={CompositionRaw}
    >
      <Composition />
    </Preview>
  </section>

  <section class="info">
    <h2>Available Components</h2>
    <div class="components-grid">
      <div class="component-item">
        <code>Highlight.Root</code>
        <p>Context provider for highlight primitives.</p>
      </div>
      <div class="component-item">
        <code>Highlight.Content</code>
        <p>The highlighted text content.</p>
      </div>
      <div class="component-item">
        <code>Highlight.Source</code>
        <p>Link to the source of the highlight.</p>
      </div>
    </div>
  </section>

  <section class="info">
    <h2>Highlight.Root</h2>
    <ApiTable
      rows={[
        { name: 'ndk', type: 'NDKSvelte', default: 'from context', description: 'NDK instance' },
        { name: 'highlight', type: 'NDKHighlight', default: 'required', description: 'The highlight event to display' },
        { name: 'onclick', type: '(event: MouseEvent) => void', default: 'undefined', description: 'Click handler' },
        { name: 'class', type: 'string', default: "''", description: 'Additional CSS classes' },
        { name: 'children', type: 'Snippet', default: 'required', description: 'Child components' }
      ]}
    />
  </section>

  <section class="info">
    <h2>Highlight.Content</h2>
    <p class="mb-4">Displays the highlighted text from the event content.</p>
    <ApiTable
      rows={[
        { name: 'class', type: 'string', default: "''", description: 'Additional CSS classes' }
      ]}
    />
  </section>

  <section class="info">
    <h2>Highlight.Source</h2>
    <p class="mb-4">Displays a link to the source article or context tag.</p>
    <ApiTable
      rows={[
        { name: 'class', type: 'string', default: "''", description: 'Additional CSS classes' }
      ]}
    />
  </section>

  <section class="info">
    <h2>Context</h2>
    <p class="mb-4">Access highlight context in custom components:</p>
    <pre><code>import &#123; getContext &#125; from 'svelte';
import &#123; HIGHLIGHT_CONTEXT_KEY, type HighlightContext &#125; from '$lib/registry/ui/highlight';

const context = getContext&lt;HighlightContext&gt;(HIGHLIGHT_CONTEXT_KEY);
// Access: context.highlight, context.ndk, context.onclick</code></pre>
  </section>

  <section class="info">
    <h2>Related</h2>
    <div class="related-grid">
      <a href="/components/cards/highlight" class="related-card">
        <strong>Highlight Blocks</strong>
        <span>Pre-styled highlight card layouts</span>
      </a>
      <a href="/components/previews/highlights" class="related-card">
        <strong>Highlight Embedded</strong>
        <span>For embedding highlights in content</span>
      </a>
      <a href="/ui/article" class="related-card">
        <strong>Article Primitives</strong>
        <span>For source articles</span>
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
  }

  .badge {
    padding: 0.25rem 0.75rem;
    border-radius: 9999px;
    background: var(--muted);
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--muted-foreground);
  }

  .badge-nip {
    background: var(--primary);
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
</style>
