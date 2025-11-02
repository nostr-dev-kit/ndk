<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import Demo from '$site-components/Demo.svelte';
  import ApiTable from '$site-components/api-table.svelte';

  // Import examples
  import Basic from './examples/basic.svelte';
  import BasicRaw from './examples/basic.svelte?raw';
  import Composition from './examples/composition.svelte';
  import CompositionRaw from './examples/composition.svelte?raw';

  const ndk = getContext<NDKSvelte>('ndk');
</script>

<svelte:head>
  <title>Article Primitives - NDK Svelte</title>
  <meta name="description" content="Headless, composable primitives for displaying long-form articles (NIP-23)." />
</svelte:head>

<div class="component-page">
  <header>
    <div class="header-badge">
      <span class="badge">UI Primitive</span>
      <span class="badge badge-nip">NIP-23</span>
    </div>
    <div class="header-title">
      <h1>Article</h1>
    </div>
    <p class="header-description">
      Headless, composable primitives for displaying long-form articles (NIP-23). Complete control over styling and layout.
    </p>
    <div class="header-info">
      <div class="info-card">
        <strong>Headless</strong>
        <span>No styling opinions - bring your own CSS</span>
      </div>
      <div class="info-card">
        <strong>Composable</strong>
        <span>Mix and match primitives as needed</span>
      </div>
      <div class="info-card">
        <strong>Reactive</strong>
        <span>Automatically updates with article data</span>
      </div>
    </div>
  </header>

  <section class="installation">
    <h2>Installation</h2>
    <pre><code>import &#123; Article &#125; from '$lib/registry/ui';</code></pre>
  </section>

  <section class="demo space-y-8">
    <h2 class="text-2xl font-semibold mb-4">Examples</h2>

    <Demo
      title="Basic Usage"
      description="Minimal example showing how to compose Article primitives. Each primitive can be styled independently."
      code={BasicRaw}
    >
      <Basic />
    </Demo>

    <Demo
      title="Composed Layout"
      description="Build a complete article card by composing primitives with custom styling. This example shows a hero image layout with metadata."
      code={CompositionRaw}
    >
      <Composition />
    </Demo>
  </section>

  <section class="info">
    <h2>Available Components</h2>
    <p class="section-intro">The Article namespace provides the following primitives:</p>

    <div class="components-grid">
      <div class="component-item">
        <code>Article.Root</code>
        <p>Context provider for all article primitives. Must wrap other Article components.</p>
      </div>
      <div class="component-item">
        <code>Article.Image</code>
        <p>Displays the article's cover image.</p>
      </div>
      <div class="component-item">
        <code>Article.Title</code>
        <p>Displays the article title.</p>
      </div>
      <div class="component-item">
        <code>Article.Summary</code>
        <p>Displays the article summary/description.</p>
      </div>
      <div class="component-item">
        <code>Article.ReadingTime</code>
        <p>Estimates and displays reading time.</p>
      </div>
    </div>
  </section>

  <section class="info">
    <h2>Article.Root</h2>
    <p class="mb-4">
      Root component that provides context to all child Article primitives. Required wrapper for all other Article components.
    </p>
    <ApiTable
      rows={[
        { name: 'ndk', type: 'NDKSvelte', default: 'from context', description: 'NDK instance (optional if provided via Svelte context)' },
        { name: 'article', type: 'NDKArticle', default: 'required', description: 'The article event to display' },
        { name: 'onclick', type: '(event: MouseEvent) => void', default: 'undefined', description: 'Click handler for the root element' },
        { name: 'class', type: 'string', default: "''", description: 'Additional CSS classes' },
        { name: 'children', type: 'Snippet', default: 'required', description: 'Child components (Article primitives)' }
      ]}
    />
  </section>

  <section class="info">
    <h2>Article.Image</h2>
    <p class="mb-4">Displays the article's cover image from the `image` tag.</p>
    <ApiTable
      rows={[
        { name: 'class', type: 'string', default: "''", description: 'Additional CSS classes' },
        { name: 'alt', type: 'string', default: 'article title', description: 'Image alt text' },
        { name: 'fallback', type: 'string', default: 'undefined', description: 'Fallback image URL if article has no image' }
      ]}
    />
  </section>

  <section class="info">
    <h2>Article.Title</h2>
    <p class="mb-4">Displays the article title from the `title` tag.</p>
    <ApiTable
      rows={[
        { name: 'class', type: 'string', default: "''", description: 'Additional CSS classes' }
      ]}
    />
  </section>

  <section class="info">
    <h2>Article.Summary</h2>
    <p class="mb-4">Displays the article summary from the `summary` tag.</p>
    <ApiTable
      rows={[
        { name: 'class', type: 'string', default: "''", description: 'Additional CSS classes' }
      ]}
    />
  </section>

  <section class="info">
    <h2>Article.ReadingTime</h2>
    <p class="mb-4">Calculates and displays estimated reading time based on article content length.</p>
    <ApiTable
      rows={[
        { name: 'class', type: 'string', default: "''", description: 'Additional CSS classes' },
        { name: 'wordsPerMinute', type: 'number', default: '200', description: 'Reading speed for calculation' }
      ]}
    />
  </section>

  <section class="info">
    <h2>Context</h2>
    <p class="mb-4">
      Article.Root provides context to all child components. You can access this context in your own custom components:
    </p>
    <pre><code>import &#123; getContext &#125; from 'svelte';
import &#123; ARTICLE_CONTEXT_KEY, type ArticleContext &#125; from '$lib/registry/ui/article';

const context = getContext&lt;ArticleContext&gt;(ARTICLE_CONTEXT_KEY);
// Access: context.article, context.ndk, context.onclick</code></pre>
  </section>

  <section class="info">
    <h2>Styling</h2>
    <p class="mb-4">
      All Article primitives are headless - they have no default styling. Apply your own styles using the `class` prop:
    </p>
    <pre><code>&lt;Article.Title class="text-3xl font-bold text-gray-900" /&gt;
&lt;Article.Summary class="text-base text-gray-600 leading-relaxed" /&gt;</code></pre>
  </section>

  <section class="info">
    <h2>Related</h2>
    <div class="related-grid">
      <a href="/components/cards/article" class="related-card">
        <strong>Article Blocks</strong>
        <span>Pre-styled article card layouts</span>
      </a>
      <a href="/ui/user" class="related-card">
        <strong>User Primitives</strong>
        <span>For displaying article authors</span>
      </a>
      <a href="/components/content/article" class="related-card">
        <strong>Article Content</strong>
        <span>Render article content with markdown</span>
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
    background: var(--color-muted);
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--color-muted-foreground);
  }

  .badge-nip {
    background: var(--color-primary);
    color: white;
  }

  .header-title h1 {
    font-size: 3rem;
    font-weight: 700;
    margin: 0;
    background: linear-gradient(135deg, var(--color-primary) 0%, color-mix(in srgb, var(--color-primary) 70%, transparent) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .header-description {
    font-size: 1.125rem;
    line-height: 1.7;
    color: var(--color-muted-foreground);
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
    border: 1px solid var(--color-border);
    border-radius: 0.5rem;
    background: var(--color-background);
  }

  .info-card strong {
    font-weight: 600;
    color: var(--color-foreground);
  }

  .info-card span {
    font-size: 0.875rem;
    color: var(--color-muted-foreground);
  }

  .installation {
    margin-bottom: 2rem;
  }

  .installation h2 {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 1rem;
  }

  .installation pre {
    padding: 1rem;
    background: var(--color-muted);
    border-radius: 0.5rem;
    overflow-x: auto;
  }

  .installation code {
    font-family: 'Monaco', 'Menlo', monospace;
    font-size: 0.875rem;
  }

  section {
    margin-bottom: 3rem;
  }

  section h2 {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 1rem;
  }

  .section-intro {
    color: var(--color-muted-foreground);
    margin-bottom: 1.5rem;
  }

  .components-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1rem;
  }

  .component-item {
    padding: 1rem;
    border: 1px solid var(--color-border);
    border-radius: 0.5rem;
    background: var(--color-background);
  }

  .component-item code {
    font-family: 'Monaco', 'Menlo', monospace;
    font-size: 0.9375rem;
    font-weight: 600;
    color: var(--color-primary);
    display: block;
    margin-bottom: 0.5rem;
  }

  .component-item p {
    font-size: 0.875rem;
    color: var(--color-muted-foreground);
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
    border: 1px solid var(--color-border);
    border-radius: 0.5rem;
    background: var(--color-background);
    text-decoration: none;
    transition: all 0.2s ease-in-out;
  }

  .related-card:hover {
    border-color: var(--color-primary);
    transform: translateY(-2px);
  }

  .related-card strong {
    font-weight: 600;
    color: var(--color-foreground);
  }

  .related-card span {
    font-size: 0.875rem;
    color: var(--color-muted-foreground);
  }

  pre {
    margin: 1rem 0;
    padding: 1rem;
    background: var(--color-muted);
    border-radius: 0.5rem;
    overflow-x: auto;
  }

  pre code {
    font-family: 'Monaco', 'Menlo', monospace;
    font-size: 0.875rem;
    line-height: 1.6;
  }
</style>
