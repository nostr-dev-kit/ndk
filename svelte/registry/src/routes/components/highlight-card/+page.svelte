<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { NDKEvent } from '@nostr-dev-kit/ndk';
  import CodePreview from '$lib/components/code-preview.svelte';
  import InstallCommand from '$lib/components/install-command.svelte';

  // Import examples
  import FeedVariantExample from '$lib/ndk/highlight-card/examples/feed-variant.svelte';
  import FeedVariantExampleRaw from '$lib/ndk/highlight-card/examples/feed-variant.svelte?raw';
  import CompactVariantExample from '$lib/ndk/highlight-card/examples/compact-variant.svelte';
  import CompactVariantExampleRaw from '$lib/ndk/highlight-card/examples/compact-variant.svelte?raw';
  import GridVariantExample from '$lib/ndk/highlight-card/examples/grid-variant.svelte';
  import GridVariantExampleRaw from '$lib/ndk/highlight-card/examples/grid-variant.svelte?raw';
  import CustomCompositionExample from '$lib/ndk/highlight-card/examples/custom-composition.svelte';
  import CustomCompositionExampleRaw from '$lib/ndk/highlight-card/examples/custom-composition.svelte?raw';

  const ndk = getContext<NDKSvelte>('ndk');

  // Create a mock highlight event for demo purposes
  const mockHighlightEvent = $state(
    new NDKEvent(ndk, {
      kind: 9802,
      pubkey: 'fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52', // pablo
      created_at: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago
      content:
        'The most important thing is to keep the most important thing the most important thing.',
      tags: [
        [
          'context',
          'In productivity, we often get distracted by urgent but unimportant tasks. The most important thing is to keep the most important thing the most important thing. This requires constant vigilance and prioritization.',
        ],
        ['r', 'https://example.com/article-about-productivity'],
      ],
    })
  );

  // Create a mock highlight with article reference
  const mockArticleHighlightEvent = $state(
    new NDKEvent(ndk, {
      kind: 9802,
      pubkey: 'fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52',
      created_at: Math.floor(Date.now() / 1000) - 7200, // 2 hours ago
      content: 'Nostr is a simple, open protocol that enables global, decentralized social media.',
      tags: [
        [
          'context',
          'What is Nostr? Nostr is a simple, open protocol that enables global, decentralized social media. The protocol is based on very simple events that are passed around.',
        ],
        ['a', '30023:fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52:nostr-intro'],
      ],
    })
  );

  // Short highlight for grid demo
  const mockShortHighlight = $state(
    new NDKEvent(ndk, {
      kind: 9802,
      pubkey: 'fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52',
      created_at: Math.floor(Date.now() / 1000) - 86400, // 1 day ago
      content: 'Freedom of speech is essential for innovation.',
      tags: [['r', 'https://example.com/freedom-of-speech']],
    })
  );
</script>

<div class="component-page">
  <header>
    <h1>HighlightCard</h1>
    <p>
      Display Nostr highlight events (kind 9802) with support for feed, compact, and grid
      layouts. Automatically extracts and displays source references.
    </p>

    <div class="border border-border rounded-lg p-6 bg-card mt-6">
      <h2 class="text-xl font-semibold mb-3">Installation</h2>
      <InstallCommand
        componentName="highlight-card"
        note="This installs all HighlightCard variants (Feed, Compact, Grid) and composable components (Root, Content, Actions, Source, Meta)."
      />
    </div>
  </header>

  <section class="demo">
    <CodePreview
      title="Feed Variant"
      description="Full-width card with header, large highlighted text in a book-page style, source badge, and action buttons. Best for main feed displays."
      code={FeedVariantExampleRaw}
    >
      <FeedVariantExample {ndk} event={mockHighlightEvent} />
    </CodePreview>
  </section>

  <section class="demo">
    <CodePreview
      title="Compact Variant"
      description="Streamlined layout with left marker line and inline metadata. Good for sidebars or dense list views."
      code={CompactVariantExampleRaw}
    >
      <CompactVariantExample {ndk} event={mockArticleHighlightEvent} />
    </CodePreview>
  </section>

  <section class="demo">
    <CodePreview
      title="Grid Variant"
      description="Square aspect ratio card with icon and source badge. Perfect for grid layouts and discovery views."
      code={GridVariantExampleRaw}
    >
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <GridVariantExample {ndk} event={mockShortHighlight} />
        <GridVariantExample {ndk} event={mockArticleHighlightEvent} />
        <GridVariantExample {ndk} event={mockHighlightEvent} />
      </div>
    </CodePreview>
  </section>

  <section class="demo">
    <CodePreview
      title="Custom Composition"
      description="Build your own layout using HighlightCard.Root and child components."
      code={CustomCompositionExampleRaw}
    >
      <CustomCompositionExample {ndk} event={mockHighlightEvent} />
    </CodePreview>
  </section>

  <section class="usage">
    <h2>Usage</h2>
    <h3>Basic Usage</h3>
    <pre><code>{`<script>
  import { HighlightCard } from '$lib/components/ui/highlight-card';

  const highlightEvent = ndk.getEvent({ kind: 9802, ... });
</script>

<!-- Feed variant -->
<HighlightCard.Feed {ndk} event={highlightEvent} />

<!-- Compact variant -->
<HighlightCard.Compact {ndk} event={highlightEvent} />

<!-- Grid variant -->
<HighlightCard.Grid {ndk} event={highlightEvent} />

<!-- With custom actions -->
<HighlightCard.Feed {ndk} event={highlightEvent}>
  {#snippet actions()}
    <ReplyAction {ndk} {event} />
    <ReactionAction {ndk} {event} />
  {/snippet}
</HighlightCard.Feed>`}</code></pre>

    <h3>Components</h3>
    <ul>
      <li><code>HighlightCard.Root</code> - Container with context for child components</li>
      <li><code>HighlightCard.Content</code> - Displays highlighted text with context</li>
      <li><code>HighlightCard.Source</code> - Shows source reference badge</li>
      <li><code>HighlightCard.Feed</code> - Pre-composed feed layout</li>
      <li><code>HighlightCard.Compact</code> - Pre-composed compact layout</li>
      <li><code>HighlightCard.Grid</code> - Pre-composed grid layout</li>
    </ul>

    <h3>Props</h3>
    <h4>HighlightCard.Feed</h4>
    <table>
      <thead>
        <tr>
          <th>Prop</th>
          <th>Type</th>
          <th>Default</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><code>ndk</code></td>
          <td><code>NDKSvelte</code></td>
          <td>-</td>
          <td>NDK instance (required)</td>
        </tr>
        <tr>
          <td><code>event</code></td>
          <td><code>NDKEvent</code></td>
          <td>-</td>
          <td>Highlight event kind 9802 (required)</td>
        </tr>
        <tr>
          <td><code>showHeader</code></td>
          <td><code>boolean</code></td>
          <td><code>true</code></td>
          <td>Show author header</td>
        </tr>
        <tr>
          <td><code>showActions</code></td>
          <td><code>boolean</code></td>
          <td><code>true</code></td>
          <td>Show action buttons</td>
        </tr>
      </tbody>
    </table>

    <h4>HighlightCard.Compact</h4>
    <table>
      <thead>
        <tr>
          <th>Prop</th>
          <th>Type</th>
          <th>Default</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><code>ndk</code></td>
          <td><code>NDKSvelte</code></td>
          <td>-</td>
          <td>NDK instance (required)</td>
        </tr>
        <tr>
          <td><code>event</code></td>
          <td><code>NDKEvent</code></td>
          <td>-</td>
          <td>Highlight event kind 9802 (required)</td>
        </tr>
        <tr>
          <td><code>showAuthor</code></td>
          <td><code>boolean</code></td>
          <td><code>true</code></td>
          <td>Show author name</td>
        </tr>
        <tr>
          <td><code>showTimestamp</code></td>
          <td><code>boolean</code></td>
          <td><code>true</code></td>
          <td>Show timestamp</td>
        </tr>
        <tr>
          <td><code>showSource</code></td>
          <td><code>boolean</code></td>
          <td><code>true</code></td>
          <td>Show source info</td>
        </tr>
      </tbody>
    </table>

    <h4>HighlightCard.Grid</h4>
    <table>
      <thead>
        <tr>
          <th>Prop</th>
          <th>Type</th>
          <th>Default</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><code>ndk</code></td>
          <td><code>NDKSvelte</code></td>
          <td>-</td>
          <td>NDK instance (required)</td>
        </tr>
        <tr>
          <td><code>event</code></td>
          <td><code>NDKEvent</code></td>
          <td>-</td>
          <td>Highlight event kind 9802 (required)</td>
        </tr>
        <tr>
          <td><code>showAuthor</code></td>
          <td><code>boolean</code></td>
          <td><code>true</code></td>
          <td>Show author info below card</td>
        </tr>
      </tbody>
    </table>

    <h3>Builder</h3>
    <p>The component uses the <code>createHighlight</code> builder internally:</p>
    <pre><code>{`import { createHighlight } from '@nostr-dev-kit/svelte';

const highlight = createHighlight(() => ({
  event: highlightEvent
}), ndk);

// Access state
highlight.content       // The highlight text
highlight.context       // Full context text
highlight.position      // { before, highlight, after }
highlight.source        // Source info (web/article/event)
highlight.article       // Referenced NDKArticle (if any)
highlight.urlMetadata   // URL metadata (if web source)
highlight.loading       // Loading state`}</code></pre>

    <h3>Source Types</h3>
    <p>HighlightCard automatically detects and displays source references from event tags:</p>
    <ul>
      <li><code>r</code> tag - Web URL with metadata fetching</li>
      <li><code>a</code> tag - Nostr article reference (kind 30023)</li>
      <li><code>e</code> tag - Nostr event reference</li>
    </ul>

    <h3>Context Tag</h3>
    <p>
      The <code>context</code> tag provides surrounding text for the highlight. The builder
      automatically calculates and displays the highlight position within the context.
    </p>

    <h3>Styling</h3>
    <p>Components use CSS custom properties for theming:</p>
    <ul>
      <li><code>--card</code> - Card background color</li>
      <li><code>--card-foreground</code> - Card text color</li>
      <li><code>--primary</code> - Primary accent color (marker, icon)</li>
      <li><code>--muted-foreground</code> - Secondary text color</li>
      <li><code>--border</code> - Border color</li>
    </ul>
  </section>
</div>

<style>
  .component-page {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
  }

  header {
    margin-bottom: 2rem;
  }

  h1 {
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
  }

  header p {
    font-size: 1.125rem;
    color: var(--muted-foreground, #666);
  }

  .demo {
    margin-bottom: 3rem;
  }

  .usage {
    margin-top: 4rem;
    padding-top: 2rem;
    border-top: 1px solid var(--border, #e5e7eb);
  }

  .usage h2 {
    font-size: 1.875rem;
    font-weight: 700;
    margin-bottom: 1.5rem;
  }

  .usage h3 {
    font-size: 1.5rem;
    font-weight: 600;
    margin-top: 2rem;
    margin-bottom: 1rem;
  }

  .usage h4 {
    font-size: 1.25rem;
    font-weight: 600;
    margin-top: 1.5rem;
    margin-bottom: 0.75rem;
  }

  .usage pre {
    background: var(--muted, #f3f4f6);
    padding: 1rem;
    border-radius: 0.375rem;
    overflow-x: auto;
    margin: 1rem 0;
  }

  .usage code {
    font-family: monospace;
    font-size: 0.875rem;
  }

  .usage ul {
    list-style: disc;
    padding-left: 2rem;
    margin: 1rem 0;
  }

  .usage li {
    margin: 0.5rem 0;
  }

  .usage table {
    width: 100%;
    border-collapse: collapse;
    margin: 1rem 0;
  }

  .usage th,
  .usage td {
    padding: 0.75rem;
    text-align: left;
    border-bottom: 1px solid var(--border, #e5e7eb);
  }

  .usage th {
    font-weight: 600;
    background: var(--muted, #f3f4f6);
  }

  .usage td code {
    background: var(--muted, #f3f4f6);
    padding: 0.125rem 0.375rem;
    border-radius: 0.25rem;
  }

  .usage p {
    margin: 0.5rem 0;
  }
</style>
