<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import Demo from '$site-components/Demo.svelte';
  import ApiTable from '$site-components/api-table.svelte';

  import Basic from './examples/basic.svelte';
  import BasicRaw from './examples/basic.svelte?raw';
  import Composition from './examples/composition.svelte';
  import CompositionRaw from './examples/composition.svelte?raw';

  const ndk = getContext<NDKSvelte>('ndk');
</script>

<svelte:head>
  <title>Relay Primitives - NDK Svelte</title>
  <meta name="description" content="Headless, composable primitives for displaying relay information and controls." />
</svelte:head>

<div class="component-page">
  <header>
    <div class="header-badge">
      <span class="badge">UI Primitive</span>
      <span class="badge badge-nip">NIP-11</span>
      <span class="badge badge-nip">NIP-65</span>
    </div>
    <div class="header-title">
      <h1>Relay</h1>
    </div>
    <p class="header-description">
      Headless, composable primitives for displaying relay information (NIP-11), connection status, and bookmark functionality (NIP-65).
    </p>
    <div class="header-info">
      <div class="info-card">
        <strong>Headless</strong>
        <span>Complete styling freedom</span>
      </div>
      <div class="info-card">
        <strong>NIP-11 Integration</strong>
        <span>Fetches relay metadata automatically</span>
      </div>
      <div class="info-card">
        <strong>Selector Included</strong>
        <span>Relay.Selector namespace for dropdowns</span>
      </div>
    </div>
  </header>

  <section class="installation">
    <h2>Installation</h2>
    <pre><code>import &#123; Relay &#125; from '$lib/registry/ui';</code></pre>
  </section>

  <section class="demo space-y-8">
    <h2>Examples</h2>

    <Demo
      title="Basic Usage"
      description="Display relay information with icon, name, and URL."
      code={BasicRaw}
    >
      <Basic />
    </Demo>

    <Demo
      title="Full Relay Card"
      description="Complete relay card with all metadata, connection status, and bookmark button."
      code={CompositionRaw}
    >
      <Composition />
    </Demo>
  </section>

  <section class="info">
    <h2>Available Components</h2>
    <div class="components-grid">
      <div class="component-item">
        <code>Relay.Root</code>
        <p>Context provider for relay primitives. Fetches NIP-11 data.</p>
      </div>
      <div class="component-item">
        <code>Relay.Icon</code>
        <p>Relay icon from NIP-11 metadata.</p>
      </div>
      <div class="component-item">
        <code>Relay.Name</code>
        <p>Relay name from NIP-11.</p>
      </div>
      <div class="component-item">
        <code>Relay.Url</code>
        <p>Relay WebSocket URL.</p>
      </div>
      <div class="component-item">
        <code>Relay.Description</code>
        <p>Relay description from NIP-11.</p>
      </div>
      <div class="component-item">
        <code>Relay.ConnectionStatus</code>
        <p>Live connection status indicator.</p>
      </div>
      <div class="component-item">
        <code>Relay.BookmarkButton</code>
        <p>Add/remove relay from bookmarks (NIP-65).</p>
      </div>
      <div class="component-item">
        <code>Relay.BookmarkedBy</code>
        <p>Show who bookmarked this relay.</p>
      </div>
      <div class="component-item">
        <code>Relay.Input</code>
        <p>Input field for relay URLs with autocomplete.</p>
      </div>
    </div>
  </section>

  <section class="info">
    <h2>Relay.Selector Namespace</h2>
    <p class="mb-4">The Relay.Selector namespace provides components for building relay selection dropdowns:</p>
    <div class="components-grid">
      <div class="component-item">
        <code>Relay.Selector.Root</code>
        <p>Dropdown root with relay list state.</p>
      </div>
      <div class="component-item">
        <code>Relay.Selector.List</code>
        <p>List of selectable relays.</p>
      </div>
      <div class="component-item">
        <code>Relay.Selector.Item</code>
        <p>Individual relay list item.</p>
      </div>
    </div>
  </section>

  <section class="info">
    <h2>Relay.Root</h2>
    <p class="mb-4">Context provider that fetches NIP-11 metadata and provides it to child components.</p>
    <ApiTable
      rows={[
        { name: 'ndk', type: 'NDKSvelte', default: 'from context', description: 'NDK instance' },
        { name: 'relayUrl', type: 'string', default: 'required', description: 'Relay WebSocket URL (wss://...)' },
        { name: 'class', type: 'string', default: "''", description: 'Additional CSS classes' },
        { name: 'children', type: 'Snippet', default: 'required', description: 'Child components' }
      ]}
    />
  </section>

  <section class="info">
    <h2>Relay.Icon</h2>
    <ApiTable
      rows={[
        { name: 'class', type: 'string', default: "''", description: 'Additional CSS classes' },
        { name: 'fallback', type: 'string', default: 'undefined', description: 'Fallback icon URL' }
      ]}
    />
  </section>

  <section class="info">
    <h2>Relay.Name</h2>
    <ApiTable
      rows={[
        { name: 'class', type: 'string', default: "''", description: 'Additional CSS classes' }
      ]}
    />
  </section>

  <section class="info">
    <h2>Relay.Url</h2>
    <ApiTable
      rows={[
        { name: 'class', type: 'string', default: "''", description: 'Additional CSS classes' }
      ]}
    />
  </section>

  <section class="info">
    <h2>Relay.Description</h2>
    <ApiTable
      rows={[
        { name: 'class', type: 'string', default: "''", description: 'Additional CSS classes' }
      ]}
    />
  </section>

  <section class="info">
    <h2>Relay.ConnectionStatus</h2>
    <p class="mb-4">Shows live connection status (connected, connecting, disconnected).</p>
    <ApiTable
      rows={[
        { name: 'showLabel', type: 'boolean', default: 'false', description: 'Show text label with status' },
        { name: 'class', type: 'string', default: "''", description: 'Additional CSS classes' }
      ]}
    />
  </section>

  <section class="info">
    <h2>Relay.BookmarkButton</h2>
    <p class="mb-4">Toggle bookmark status for the relay (NIP-65 relay list).</p>
    <ApiTable
      rows={[
        { name: 'bookmarks', type: 'BookmarkedRelayList', default: 'undefined', description: 'Bookmarked relay list builder instance' },
        { name: 'class', type: 'string', default: "''", description: 'Additional CSS classes' }
      ]}
    />
  </section>

  <section class="info">
    <h2>Relay.BookmarkedBy</h2>
    <p class="mb-4">Display list of users who bookmarked this relay.</p>
    <ApiTable
      rows={[
        { name: 'bookmarks', type: 'BookmarkedRelayList', default: 'required', description: 'Bookmarked relay list builder instance' },
        { name: 'class', type: 'string', default: "''", description: 'Additional CSS classes' }
      ]}
    />
  </section>

  <section class="info">
    <h2>Relay.Input</h2>
    <p class="mb-4">Input field for relay URLs with NIP-11 autocomplete.</p>
    <ApiTable
      rows={[
        { name: 'ndk', type: 'NDKSvelte', default: 'from context', description: 'NDK instance' },
        { name: 'value', type: 'string', default: "''", description: 'Bound input value' },
        { name: 'placeholder', type: 'string', default: "'wss://...'", description: 'Input placeholder' },
        { name: 'class', type: 'string', default: "''", description: 'Additional CSS classes' }
      ]}
    />
  </section>

  <section class="info">
    <h2>Context</h2>
    <p class="mb-4">Access relay context in custom components:</p>
    <pre><code>import &#123; getContext &#125; from 'svelte';
import &#123; type RelayContext &#125; from '$lib/registry/ui/relay';

const context = getContext&lt;RelayContext&gt;('relay');
// Access: context.relayInfo (NIP-11), context.relayUrl, context.ndk</code></pre>
  </section>

  <section class="info">
    <h2>Related</h2>
    <div class="related-grid">
      <a href="/components/relay-card" class="related-card">
        <strong>Relay Card Blocks</strong>
        <span>Pre-styled relay card layouts</span>
      </a>
      <a href="/components/relay-input" class="related-card">
        <strong>Relay Input Component</strong>
        <span>Styled relay URL input</span>
      </a>
      <a href="/components/relay-selector" class="related-card">
        <strong>Relay Selector Component</strong>
        <span>Styled relay dropdown selector</span>
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
  }

  .info-card strong {
    font-weight: 600;
    color: var(--color-foreground);
  }

  .info-card span {
    font-size: 0.875rem;
    color: var(--color-muted-foreground);
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
    border: 1px solid var(--color-border);
    border-radius: 0.5rem;
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
    text-decoration: none;
    transition: all 0.2s;
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
