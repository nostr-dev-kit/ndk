<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { NDKEvent } from '@nostr-dev-kit/ndk';
  import { EditProps } from '$lib/ndk/edit-props';
  import CodePreview from '$site-components/code-preview.svelte';
  import InstallCommand from '$site-components/install-command.svelte';

  // Import examples
  import FeedVariantExample from './examples/feed-variant.svelte';
  import FeedVariantExampleRaw from './examples/feed-variant.svelte?raw';
  import CustomCompositionExample from './examples/custom-composition.svelte';
  import CustomCompositionExampleRaw from './examples/custom-composition.svelte?raw';

  const ndk = getContext<NDKSvelte>('ndk');

  let highlightContent = $state<string>(
    'The most important thing is to keep the most important thing the most important thing.'
  );
  let highlightContext = $state<string>(
    'In productivity, we often get distracted by urgent but unimportant tasks. The most important thing is to keep the most important thing the most important thing. This requires constant vigilance and prioritization.'
  );
  let highlightUrl = $state<string>('https://example.com/article-about-productivity');

  const mockHighlightEvent = $derived(
    new NDKEvent(ndk, {
      kind: 9802,
      pubkey: 'fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52',
      created_at: Math.floor(Date.now() / 1000) - 3600,
      content: highlightContent,
      tags: [
        ['context', highlightContext],
        ['r', highlightUrl],
      ],
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

    <EditProps.Root>
      <EditProps.Prop name="Highlight content" type="text" bind:value={highlightContent} />
      <EditProps.Prop name="Context text" type="text" bind:value={highlightContext} />
      <EditProps.Prop name="Source URL" type="text" bind:value={highlightUrl} />
    </EditProps.Root>

    <div class="border border-border rounded-lg p-6 bg-card mt-6">
      <h2 class="text-xl font-semibold mb-3">Installation</h2>
      <InstallCommand
        componentName="highlight-card"
        note="This installs all HighlightCard variants (Feed, Compact, Grid) and composable components (Root, Content, Actions, Source, Meta)."
      />
    </div>
  </header>

  <section class="demo space-y-8">
    <h2 class="text-2xl font-semibold mb-4">Examples</h2>

    <CodePreview
      title="Feed Variant"
      description="Full-width card with header, large highlighted text in a book-page style, source badge, and action buttons. Best for main feed displays."
      code={FeedVariantExampleRaw}
    >
      <FeedVariantExample {ndk} event={mockHighlightEvent} />
    </CodePreview>

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
  import { HighlightCardFeed, HighlightCardCompact, HighlightCardGrid } from '$lib/ndk/blocks';
</script>

<!-- Feed variant -->
<HighlightCardFeed {ndk} event={highlightEvent} />

<!-- Compact variant -->
<HighlightCardCompact {ndk} event={highlightEvent} />

<!-- Grid variant -->
<HighlightCardGrid {ndk} event={highlightEvent} />

<!-- With custom actions -->
<HighlightCardFeed {ndk} event={highlightEvent}>
  {#snippet actions()}
    <ReplyAction {ndk} {event} />
    <ReactionAction {ndk} {event} />
  {/snippet}
</HighlightCardFeed>`}</code></pre>

    <h3>Components</h3>
    <ul>
      <li><code>HighlightCard.Root</code> - Container with context for child components</li>
      <li><code>HighlightCard.Content</code> - Displays highlighted text with context</li>
      <li><code>HighlightCard.Source</code> - Shows source reference badge</li>
      <li><code>HighlightCardFeed</code> - Pre-composed feed layout</li>
      <li><code>HighlightCardCompact</code> - Pre-composed compact layout</li>
      <li><code>HighlightCardGrid</code> - Pre-composed grid layout</li>
    </ul>

    <h3>Props</h3>
    <h4>HighlightCardFeed</h4>
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

    <h4>HighlightCardCompact</h4>
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

    <h4>HighlightCardGrid</h4>
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
