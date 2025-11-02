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
  <title>Emoji Picker Primitives - NDK Svelte</title>
  <meta name="description" content="Headless, composable primitives for emoji selection with support for custom emoji sets." />
</svelte:head>

<div class="component-page">
  <header>
    <div class="header-badge">
      <span class="badge">UI Primitive</span>
      <span class="badge badge-nip">NIP-30</span>
      <span class="badge badge-nip">NIP-51</span>
    </div>
    <div class="header-title">
      <h1>Emoji Picker</h1>
    </div>
    <p class="header-description">
      Headless, composable primitives for emoji selection. Supports user's custom emojis from Nostr (NIP-51 kind:10030) and aggregated emojis from specified pubkeys.
    </p>
    <div class="header-info">
      <div class="info-card">
        <strong>Headless</strong>
        <span>Completely unstyled primitives</span>
      </div>
      <div class="info-card">
        <strong>Custom Emojis</strong>
        <span>Load from user's NIP-51 lists</span>
      </div>
      <div class="info-card">
        <strong>Aggregation</strong>
        <span>Combine emojis from multiple users</span>
      </div>
    </div>
  </header>

  <section class="installation">
    <h2>Installation</h2>
    <pre><code>import &#123; EmojiPicker &#125; from '$lib/registry/ui';</code></pre>
  </section>

  <section class="demo space-y-8">
    <h2>Examples</h2>

    <Demo
      title="Basic List"
      description="EmojiPicker.List is a primitive component that renders a grid of clickable emojis. Perfect for custom layouts when you need full control."
      code={BasicRaw}
    >
      <Basic />
    </Demo>

    <Demo
      title="Content with Builder"
      description="EmojiPicker.Content integrates with the createEmojiPicker builder to show user's custom emojis and defaults in sections."
      code={CompositionRaw}
    >
      <Composition />
    </Demo>
  </section>

  <section class="info">
    <h2>Available Components</h2>
    <div class="components-grid">
      <div class="component-item">
        <code>EmojiPicker.List</code>
        <p>Primitive grid of emoji buttons. Manual emoji data.</p>
      </div>
      <div class="component-item">
        <code>EmojiPicker.Content</code>
        <p>Opinionated component with sections and builder integration.</p>
      </div>
      <div class="component-item">
        <code>EmojiPicker.Item</code>
        <p>Individual clickable emoji item.</p>
      </div>
    </div>
  </section>

  <section class="info">
    <h2>EmojiPicker.List</h2>
    <p class="mb-4">Primitive component for rendering a grid of emojis. Gives you full control over layout and behavior.</p>
    <ApiTable
      rows={[
        { name: 'emojis', type: 'EmojiData[]', default: 'required', description: 'Array of emoji objects to display' },
        { name: 'onSelect', type: '(emoji: EmojiData) => void', default: 'required', description: 'Callback when an emoji is clicked' },
        { name: 'columns', type: 'number', default: '6', description: 'Number of columns in the grid' },
        { name: 'class', type: 'string', default: "''", description: 'Additional CSS classes' }
      ]}
    />

    <h3 class="mt-4 mb-2">EmojiData</h3>
    <ApiTable
      rows={[
        { name: 'emoji', type: 'string', default: 'required', description: 'The emoji character or shortcode' },
        { name: 'url', type: 'string', default: 'optional', description: 'Custom emoji image URL (for NIP-30)' },
        { name: 'shortcode', type: 'string', default: 'optional', description: 'Emoji shortcode (e.g. :smile:)' }
      ]}
    />
  </section>

  <section class="info">
    <h2>EmojiPicker.Content</h2>
    <p class="mb-4">Opinionated component that integrates with createEmojiPicker builder. Automatically displays user's custom emojis (NIP-51) in sections with fallbacks to defaults.</p>
    <ApiTable
      rows={[
        { name: 'ndk', type: 'NDKSvelte', default: 'from context', description: 'NDK instance for fetching custom emojis' },
        { name: 'onSelect', type: '(emoji: EmojiData) => void', default: 'required', description: 'Callback when emoji is selected' },
        { name: 'defaults', type: 'EmojiData[]', default: 'hardcoded defaults', description: 'Default emojis to show (overrides built-in list)' },
        { name: 'columns', type: 'number', default: '6 (5 on mobile)', description: 'Number of columns in grid' },
        { name: 'class', type: 'string', default: "''", description: 'Additional CSS classes' }
      ]}
    />
  </section>

  <section class="info">
    <h2>EmojiPicker.Item</h2>
    <p class="mb-4">Individual emoji item component. Used internally by List and Content, but can be used standalone.</p>
    <ApiTable
      rows={[
        { name: 'emoji', type: 'EmojiData', default: 'required', description: 'Emoji data object' },
        { name: 'onclick', type: '() => void', default: 'required', description: 'Click handler' },
        { name: 'class', type: 'string', default: "''", description: 'Additional CSS classes' }
      ]}
    />
  </section>

  <section class="info">
    <h2>Builder: createEmojiPicker</h2>
    <p class="mb-4">For advanced use cases, use the builder directly to aggregate emojis from multiple sources:</p>
    <pre><code>import &#123; createEmojiPicker &#125; from '$lib/registry/components/emoji-picker';

const emojiPicker = createEmojiPicker(() => (&#123;
  defaults: [&#123; emoji: '❤️' &#125;, &#123; emoji: '👍' &#125;],
  from: ['pubkey1', 'pubkey2'] // Aggregate from these users
&#125;), ndk);

// Access aggregated emojis
$effect(() => &#123;
  console.log(emojiPicker.emojis); // Sorted by frequency
&#125;);</code></pre>
  </section>

  <section class="info">
    <h2>Custom Emojis (NIP-30, NIP-51)</h2>
    <p class="mb-4">EmojiPicker.Content automatically fetches user's custom emoji sets from NIP-51 kind:10030 events:</p>
    <pre><code>// Users can define custom emoji sets in their kind:10030 events
// Format: ["emoji", "&lt;shortcode&gt;", "&lt;image-url&gt;"]

// Example event tags:
["emoji", "party", "https://example.com/party.gif"]
["emoji", "bitcoin", "https://example.com/bitcoin.png"]</code></pre>
  </section>

  <section class="info">
    <h2>Related</h2>
    <div class="related-grid">
      <a href="/components/emoji-picker" class="related-card">
        <strong>Emoji Picker Component</strong>
        <span>Styled emoji picker with popover</span>
      </a>
      <a href="/ui/reaction" class="related-card">
        <strong>Reaction Primitives</strong>
        <span>For displaying reactions with emojis</span>
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

  section h3 {
    font-size: 1.125rem;
    font-weight: 600;
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
