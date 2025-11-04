<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import { EditProps } from '$lib/site-components/edit-props';
  import Demo from '$site-components/Demo.svelte';
  import ApiTable from '$site-components/api-table.svelte';

  import Basic from './examples/basic.example.svelte';
  import BasicRaw from './examples/basic.example.svelte?raw';
  import Variants from './examples/variants.example.svelte';
  import VariantsRaw from './examples/variants.example.svelte?raw';

  const ndk = getContext<NDKSvelte>('ndk');

  let event = $state<NDKEvent | undefined>();

  const eventBech32 = $derived(event?.encode() || 'nevent1qqsqqe0hd9e2y5mf7qffkfv4w4rxcv63rj458fqj9hn08cwrn23wnvgwrvg7j');
</script>

<svelte:head>
  <title>Embedded Event Primitives - NDK Svelte</title>
  <meta name="description" content="Standalone component for loading and displaying embedded Nostr event references with customizable handlers." />
</svelte:head>

<div class="component-page">
  <header>
    <EditProps.Root>
      <EditProps.Prop name="Event" type="event" bind:value={event} default="nevent1qqsqqe0hd9e2y5mf7qffkfv4w4rxcv63rj458fqj9hn08cwrn23wnvgwrvg7j" />
      <EditProps.Button>Change Sample Event</EditProps.Button>
    </EditProps.Root>
    <div class="header-badge">
      <span class="badge">UI Primitive</span>
    </div>
    <div class="header-title">
      <h1>Embedded Event</h1>
    </div>
    <p class="header-description">
      Standalone component for loading and displaying embedded Nostr event references (nevent, note1). Automatically fetches events from relays and renders them using registered handlers from the ContentRenderer, with fallback display for unknown event kinds.
    </p>
    <div class="header-info">
      <div class="info-card">
        <strong>Auto-Loading</strong>
        <span>Fetches events from bech32 references</span>
      </div>
      <div class="info-card">
        <strong>Custom Handlers</strong>
        <span>Register components by event kind</span>
      </div>
      <div class="info-card">
        <strong>Multiple Variants</strong>
        <span>Card, compact, inline display modes</span>
      </div>
    </div>
  </header>

  <section class="installation">
    <h2>Installation</h2>
    <pre><code>import &#123; EmbeddedEvent &#125; from '$lib/registry/ui';</code></pre>
  </section>

  <section class="demo space-y-8">
    <h2>Examples</h2>

    <Demo
      title="Basic Usage"
      description="EmbeddedEvent loads and displays events from bech32 references (nevent, note1)."
      code={BasicRaw}
    >
      <Basic {ndk} {eventBech32} />
    </Demo>

    <Demo
      title="Display Variants"
      description="EmbeddedEvent supports three display variants: card (default), compact, and inline."
      code={VariantsRaw}
    >
      <Variants {ndk} {eventBech32} />
    </Demo>
  </section>

  <section class="info">
    <h2>EmbeddedEvent Component</h2>
    <p class="mb-4">Standalone component that loads an event from a bech32 reference and renders it using registered handlers.</p>
    <ApiTable
      rows={[
        { name: 'ndk', type: 'NDKSvelte', default: 'from context', description: 'NDK instance for fetching the event' },
        { name: 'bech32', type: 'string', default: 'required', description: 'Event reference (nevent, note1, naddr)' },
        { name: 'variant', type: "'card' | 'compact' | 'inline'", default: "'card'", description: 'Display variant' },
        { name: 'renderer', type: 'ContentRenderer', default: 'defaultContentRenderer', description: 'Content renderer with registered handlers' },
        { name: 'class', type: 'string', default: "''", description: 'Additional CSS classes' }
      ]}
    />
  </section>

  <section class="info">
    <h2>Display Variants</h2>
    <div class="variants-grid">
      <div class="variant-item">
        <strong>card (default)</strong>
        <p>Full event display with padding and borders, suitable for standalone embedded events.</p>
      </div>
      <div class="variant-item">
        <strong>compact</strong>
        <p>Condensed display with reduced padding and smaller text, ideal for lists or sidebars.</p>
      </div>
      <div class="variant-item">
        <strong>inline</strong>
        <p>Inline display suitable for embedding within text content or paragraphs.</p>
      </div>
    </div>
  </section>

  <section class="info">
    <h2>Registering Event Handlers</h2>
    <p class="mb-4">Use ContentRenderer to register custom components for specific event kinds:</p>
    <pre><code>import &#123; ContentRenderer, EmbeddedEvent &#125; from '$lib/registry/ui';
import NoteCard from './NoteCard.svelte';
import ArticleCard from './ArticleCard.svelte';

const renderer = new ContentRenderer();

// Register handlers by kind
renderer.addKind([1, 1111], NoteCard);      // Notes and comments
renderer.addKind([30023], ArticleCard);     // Long-form articles

// Use with EmbeddedEvent
&lt;EmbeddedEvent &#123;ndk&#125; bech32=&#123;eventRef&#125; &#123;renderer&#125; /&gt;</code></pre>
  </section>

  <section class="info">
    <h2>Handler Component Interface</h2>
    <p class="mb-4">Handler components receive the following props:</p>
    <pre><code>interface HandlerProps &#123;
  ndk: NDKSvelte;
  event: NDKEvent;           // The loaded event
  variant?: 'card' | 'compact' | 'inline';
&#125;</code></pre>
    <p class="mb-4">Your handler component should respect the variant prop to display content appropriately for each mode.</p>
  </section>

  <section class="info">
    <h2>Event Wrapper Classes</h2>
    <p class="mb-4">Register NDK wrapper classes to automatically wrap events before passing to handlers:</p>
    <pre><code>import &#123; NDKArticle &#125; from '@nostr-dev-kit/ndk';

const renderer = new ContentRenderer();

// Register handler with wrapper
renderer.addKind([30023], ArticleCard, NDKArticle);

// Event will be automatically wrapped:
// const wrappedEvent = NDKArticle.from(event);
// &lt;ArticleCard event=&#123;wrappedEvent&#125; /&gt;</code></pre>
  </section>

  <section class="info">
    <h2>Loading States</h2>
    <p class="mb-4">EmbeddedEvent automatically handles three states:</p>
    <div class="states-grid">
      <div class="state-item">
        <strong>Loading</strong>
        <p>Shows spinner and "Loading event..." message while fetching from relays.</p>
      </div>
      <div class="state-item">
        <strong>Error</strong>
        <p>Displays "Failed to load event" if the event cannot be fetched.</p>
      </div>
      <div class="state-item">
        <strong>Loaded</strong>
        <p>Renders using registered handler or shows fallback for unknown kinds.</p>
      </div>
    </div>
  </section>

  <section class="info">
    <h2>Fallback Display</h2>
    <p class="mb-4">When no handler is registered for an event kind, EmbeddedEvent shows a minimal fallback:</p>
    <ul class="ml-6 mb-4 space-y-2">
      <li>Event kind badge</li>
      <li>Truncated event ID (bech32)</li>
      <li>First 200 characters of content (if available)</li>
    </ul>
    <p class="mb-4">This ensures graceful degradation for unsupported event kinds while still providing context.</p>
  </section>

  <section class="info">
    <h2>Bech32 Reference Types</h2>
    <p class="mb-4">EmbeddedEvent supports the following Nostr bech32 reference formats:</p>
    <ul class="ml-6 mb-4 space-y-2">
      <li><strong>nevent:</strong> Event reference with relay hints</li>
      <li><strong>note1:</strong> Event ID reference</li>
      <li><strong>naddr:</strong> Replaceable event address reference</li>
    </ul>
  </section>

  <section class="info">
    <h2>Integration with EventContent</h2>
    <p class="mb-4">EmbeddedEvent is automatically used by EventContent when it encounters event references:</p>
    <pre><code>import &#123; EventContent, ContentRenderer &#125; from '$lib/registry/ui';

const renderer = new ContentRenderer();
renderer.addKind([1, 1111], NoteCard);

// When content contains nevent references, they're automatically
// embedded using EmbeddedEvent with the same renderer
&lt;EventContent &#123;ndk&#125; &#123;event&#125; &#123;renderer&#125; /&gt;</code></pre>
  </section>

  <section class="info">
    <h2>Builder Access</h2>
    <p class="mb-4">For advanced use cases, access the underlying builder directly:</p>
    <pre><code>import &#123; createEmbeddedEvent &#125; from '@nostr-dev-kit/svelte';

const embedded = createEmbeddedEvent(
  () => (&#123; bech32: 'nevent1...' &#125;),
  ndk
);

// Access reactive properties:
embedded.loading  // boolean
embedded.error    // Error | null
embedded.event    // NDKEvent | null</code></pre>
  </section>

  <section class="info">
    <h2>Related</h2>
    <div class="related-grid">
      <a href="/ui/event-content" class="related-card">
        <strong>Event Content Primitives</strong>
        <span>For parsing and rendering event content</span>
      </a>
      <a href="/components/event-card" class="related-card">
        <strong>Event Card Component</strong>
        <span>Complete event display with header</span>
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

  .variants-grid,
  .states-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
  }

  .variant-item,
  .state-item {
    padding: 1rem;
    border: 1px solid var(--border);
    border-radius: 0.5rem;
  }

  .variant-item strong,
  .state-item strong {
    font-weight: 600;
    color: var(--primary);
    display: block;
    margin-bottom: 0.25rem;
  }

  .variant-item p,
  .state-item p {
    font-size: 0.875rem;
    color: var(--muted-foreground);
    margin: 0;
    line-height: 1.5;
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

  ul {
    list-style: disc;
  }

  ul li {
    color: var(--muted-foreground);
    line-height: 1.6;
  }
</style>
