<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { EditProps } from '$lib/site-components/edit-props';
  import ComponentsShowcaseGrid from '$site-components/ComponentsShowcaseGrid.svelte';
  import ComponentCard from '$site-components/ComponentCard.svelte';
  import SectionTitle from '$site-components/SectionTitle.svelte';
  import ComponentAPI from '$site-components/component-api.svelte';

  import InteractiveDemo from './examples/interactive-demo.example.svelte';
  import VariantComparison from './examples/variant-comparison.example.svelte';

  const ndk = getContext<NDKSvelte>('ndk');

  const liveDemoData = {
    name: 'embedded-event-live',
    title: 'Live Preview',
    description: 'Paste and see it render.',
    richDescription: 'Paste a bech32 event reference (note1, nevent1, naddr1) and see it render in real-time.',
    command: 'npx jsrepo add embedded-event',
    apiDocs: []
  };

  const variantData = {
    name: 'embedded-event-variants',
    title: 'Variant Comparison',
    description: 'Compare display variants.',
    richDescription: 'Compare card, inline, and compact variants side by side.',
    command: 'npx jsrepo add embedded-event',
    apiDocs: []
  };
</script>

<div class="px-8">
  <!-- Header -->
  <div class="mb-12 pt-8">
    <div class="flex items-start justify-between gap-4 mb-4">
      <h1 class="text-4xl font-bold">Embedded Components</h1>
      <EditProps.Button>Edit Examples</EditProps.Button>
    </div>
    <p class="text-lg text-muted-foreground mb-6">
      Inline components for rendering mentions, hashtags, and embedded Nostr events.
      Automatically detect and display user mentions (@npub), hashtags (#topic), and event references (note1, nevent1, naddr1)
      with rich, interactive UIs optimized for each content type.
    </p>
  </div>

  <!-- How It Works Section -->
  <section class="mb-16 prose prose-lg max-w-none">
    <h2 class="text-3xl font-bold mb-2">How It Works</h2>
    <p class="text-muted-foreground mb-8">
      The embedded event system uses a simple map-based registry to determine which
      component renders each event kind.
    </p>

    <div class="space-y-12">
      <!-- Architecture Overview -->
      <div>
        <h3 class="text-xl font-semibold mb-4">Architecture</h3>
        <div class="space-y-4 text-muted-foreground">
          <div class="flex items-start gap-3">
            <div class="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold">1</div>
            <div>
              <strong class="text-foreground">Event Reference Detected</strong>
              <p class="text-sm">EventContent parser finds a bech32 event reference (note1, nevent1, naddr1) in the content</p>
            </div>
          </div>
          <div class="flex items-start gap-3">
            <div class="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold">2</div>
            <div>
              <strong class="text-foreground">Fetch Event</strong>
              <p class="text-sm">createFetchEvent builder fetches the event from relays using the bech32 identifier</p>
            </div>
          </div>
          <div class="flex items-start gap-3">
            <div class="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold">3</div>
            <div>
              <strong class="text-foreground">Registry Lookup</strong>
              <p class="text-sm">Check ContentRenderer for a registered handler matching the event's kind</p>
            </div>
          </div>
          <div class="flex items-start gap-3">
            <div class="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold">4</div>
            <div>
              <strong class="text-foreground">Render</strong>
              <p class="text-sm">Render using the kind-specific handler, or fall back to GenericCard for unknown kinds</p>
            </div>
          </div>
        </div>
      </div>

      <!-- ContentRenderer System -->
      <div>
        <h3 class="text-xl font-semibold mb-4">ContentRenderer System</h3>
        <p class="text-sm text-muted-foreground mb-4">
          Self-registering handlers using NDK wrapper classes for automatic kind mapping and type-safe event wrapping.
        </p>
        <p class="text-sm text-muted-foreground mb-4">
          Each kind handler self-registers with the <code class="px-2 py-1 bg-muted rounded">defaultContentRenderer</code> via its <code class="px-2 py-1 bg-muted rounded">index.ts</code> file:
        </p>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="p-4 bg-card rounded border border-border">
            <div class="text-sm font-mono mb-2">NDKArticle → ArticleCardMedium</div>
            <p class="text-xs text-muted-foreground">Automatically registers kind 30023 and wraps with NDKArticle.from()</p>
          </div>
          <div class="p-4 bg-card rounded border border-border">
            <div class="text-sm font-mono mb-2">[1, 1111] → NoteCard</div>
            <p class="text-xs text-muted-foreground">Manual kinds (no NDK wrapper class exists)</p>
          </div>
          <div class="p-4 bg-card rounded border border-border">
            <div class="text-sm font-mono mb-2">NDKHighlight → HighlightCardFeed</div>
            <p class="text-xs text-muted-foreground">Automatically registers kind 9802 and wraps with NDKHighlight.from()</p>
          </div>
          <div class="p-4 bg-card rounded border border-border">
            <div class="text-sm font-mono mb-2">* → GenericCard</div>
            <p class="text-xs text-muted-foreground">Fallback for unknown kinds (no wrapping)</p>
          </div>
        </div>
        <div class="mt-4 p-4 bg-card/50 rounded border border-primary/20">
          <p class="text-sm"><strong>Benefits:</strong></p>
          <ul class="text-xs text-muted-foreground list-disc list-inside mt-2 space-y-1">
            <li>Type-safe: Components receive NDKArticle, NDKHighlight, not just NDKEvent</li>
            <li>Automatic: Kind numbers extracted from NDK wrapper classes</li>
            <li>Flexible: Custom registries for variant-specific previews</li>
            <li>Clean: No manual kind number management</li>
          </ul>
        </div>
      </div>

      <!-- Adding New Handlers -->
      <div>
        <h3 class="text-xl font-semibold mb-4">Adding New Kind Handlers</h3>
        <p class="text-sm text-muted-foreground mb-4">
          Kind handlers self-register automatically via side effects. Just install and import - no manual registration needed.
        </p>
        <div class="space-y-4">
          <div>
            <div class="text-sm font-semibold mb-2">Step 1: Install the handler</div>
            <code class="block p-3 bg-card rounded text-sm">
              npx shadcn-svelte@latest add video-embedded
            </code>
          </div>
          <div>
            <div class="text-sm font-semibold mb-2">Step 2: Auto-registration</div>
            <p class="text-xs text-muted-foreground mb-2">
              The component automatically registers itself when imported:
            </p>
            <div class="p-3 bg-card rounded text-sm font-mono">
              <div>// Registration happens via component's index.ts</div>
            </div>
            <p class="text-xs text-muted-foreground mt-2">
              No manual registration required
            </p>
          </div>
          <p class="text-sm text-muted-foreground">
            That's it! The handler automatically registers itself via its index.ts file
            and will render all video events using NDKVideo.kinds and NDKVideo.from().
          </p>
        </div>
      </div>

      <!-- Custom Renderers -->
      <div class="p-6 border border-border rounded-lg bg-primary/5 border-primary/20">
        <h3 class="text-xl font-semibold mb-4">Custom Renderers (Advanced)</h3>
        <p class="text-sm text-muted-foreground mb-4">
          Create custom renderers to render the same kind differently in different contexts:
        </p>
        <div class="p-4 bg-card rounded text-sm font-mono space-y-2 mb-4">
          <div class="text-muted-foreground">// Create variant-specific renderer</div>
          <div>const compactRenderer = new ContentRenderer();</div>
          <div>compactRenderer.addKind(NDKHighlight, HighlightCompactPreview);</div>
          <div class="h-2"></div>
          <div class="text-muted-foreground">// Use in component</div>
          <div>&lt;EventContent renderer={'{compactRenderer}'} /&gt;</div>
        </div>
        <p class="text-sm text-muted-foreground">
          <strong>Use case:</strong> Show full highlight cards in feeds, but compact previews in sidebars -
          just pass different renderers with different components.
        </p>
      </div>

      <!-- Fallback Behavior -->
      <div>
        <h3 class="text-xl font-semibold mb-4">Fallback Behavior</h3>
        <p class="text-sm text-muted-foreground mb-4">
          When an event kind has no registered handler, the system automatically falls back
          to <code class="px-2 py-1 bg-muted rounded">GenericCard</code>, which:
        </p>
        <ul class="list-disc list-inside space-y-2 text-sm text-muted-foreground">
          <li>Renders using EventCard primitives (universal event display)</li>
          <li>Shows a "Kind X" badge to indicate the event type</li>
          <li>Displays author, content (truncated), and timestamp</li>
          <li>Provides a consistent experience for unknown kinds</li>
        </ul>
      </div>
    </div>
  </section>

  <!-- Inline Embeds Section -->
  <section class="mb-16">
    <h2 class="text-3xl font-bold mb-2">Inline Embeds</h2>
    <p class="text-muted-foreground mb-8">
      Inline components for mentions and hashtags with automatic detection and rich hover cards.
    </p>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <!-- Mention -->
      <a href="/components/embeds/mention" class="group block p-6 border border-border rounded-lg bg-card hover:bg-accent/50 transition-colors">
        <div class="flex items-start justify-between mb-3">
          <h3 class="text-lg font-semibold">Mention</h3>
          <span class="text-xs px-2 py-1 bg-muted rounded">@npub</span>
        </div>
        <p class="text-sm text-muted-foreground mb-4">
          Render user mentions with profile fetching and optional hover cards.
        </p>
        <div class="text-sm text-primary group-hover:underline">
          View documentation →
        </div>
      </a>

      <!-- Hashtag -->
      <a href="/components/embeds/hashtag" class="group block p-6 border border-border rounded-lg bg-card hover:bg-accent/50 transition-colors">
        <div class="flex items-start justify-between mb-3">
          <h3 class="text-lg font-semibold">Hashtag</h3>
          <span class="text-xs px-2 py-1 bg-muted rounded">#topic</span>
        </div>
        <p class="text-sm text-muted-foreground mb-4">
          Render hashtags with stats and optional hover cards showing activity.
        </p>
        <div class="text-sm text-primary group-hover:underline">
          View documentation →
        </div>
      </a>
    </div>
  </section>

  <!-- Event Embeds Section -->
  <section class="mb-16">
    <h2 class="text-3xl font-bold mb-2">Event Embeds</h2>
    <p class="text-muted-foreground mb-8">
      Each event kind has a dedicated handler with optimized UI for that content type.
    </p>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <!-- Note -->
      <a href="/components/embeds/notes" class="group block p-6 border border-border rounded-lg bg-card hover:bg-accent/50 transition-colors">
        <div class="flex items-start justify-between mb-3">
          <h3 class="text-lg font-semibold">Notes</h3>
          <span class="text-xs px-2 py-1 bg-muted rounded">Kind 1, 1111</span>
        </div>
        <p class="text-sm text-muted-foreground mb-4">
          Short text notes and replies rendered with EventCard primitives.
        </p>
        <div class="text-sm text-primary group-hover:underline">
          View documentation →
        </div>
      </a>

      <!-- Article -->
      <a href="/components/embeds/articles" class="group block p-6 border border-border rounded-lg bg-card hover:bg-accent/50 transition-colors">
        <div class="flex items-start justify-between mb-3">
          <h3 class="text-lg font-semibold">Articles</h3>
          <span class="text-xs px-2 py-1 bg-muted rounded">Kind 30023</span>
        </div>
        <p class="text-sm text-muted-foreground mb-4">
          Long-form articles with cover images, titles, and summaries.
        </p>
        <div class="text-sm text-primary group-hover:underline">
          View documentation →
        </div>
      </a>

      <!-- Highlight -->
      <a href="/components/embeds/highlights" class="group block p-6 border border-border rounded-lg bg-card hover:bg-accent/50 transition-colors">
        <div class="flex items-start justify-between mb-3">
          <h3 class="text-lg font-semibold">Highlights</h3>
          <span class="text-xs px-2 py-1 bg-muted rounded">Kind 9802</span>
        </div>
        <p class="text-sm text-muted-foreground mb-4">
          Highlighted text snippets with book-page style display.
        </p>
        <div class="text-sm text-primary group-hover:underline">
          View documentation →
        </div>
      </a>

      <!-- Generic Fallback -->
      <a href="/events/embeds/generic" class="group block p-6 border border-border rounded-lg bg-card hover:bg-accent/50 transition-colors">
        <div class="flex items-start justify-between mb-3">
          <h3 class="text-lg font-semibold">Generic Fallback</h3>
          <span class="text-xs px-2 py-1 bg-muted rounded">Unknown kinds</span>
        </div>
        <p class="text-sm text-muted-foreground mb-4">
          Default renderer with NIP-31 alt tag support for unknown kinds.
        </p>
        <div class="text-sm text-primary group-hover:underline">
          View documentation →
        </div>
      </a>
    </div>
  </section>

  <!-- Interactive Demo Section -->
  {#snippet liveDemoPreview()}
    <InteractiveDemo {ndk} />
  {/snippet}

  <SectionTitle
    title="Interactive Demo"
    description="Try pasting any Nostr event reference."
  />

  <ComponentsShowcaseGrid
    blocks={[
      {
        name: 'Live Preview',
        description: 'Paste and render',
        command: 'npx jsrepo add embedded-event',
        preview: liveDemoPreview,
        cardData: liveDemoData
      }
    ]}
  />

  <!-- Variant Comparison Section -->
  {#snippet variantPreview()}
    <VariantComparison {ndk} />
  {/snippet}

  <SectionTitle
    title="Variant Support"
    description="All handlers support three display variants."
  />

  <ComponentsShowcaseGrid
    blocks={[
      {
        name: 'Variant Comparison',
        description: 'Compare variants',
        command: 'npx jsrepo add embedded-event',
        preview: variantPreview,
        cardData: variantData
      }
    ]}
  />

  <!-- Components Section -->
  <SectionTitle title="Components" description="Explore each variant in detail" />

  <section class="py-12 space-y-16">
    <ComponentCard data={liveDemoData}>
      {#snippet preview()}
        <InteractiveDemo {ndk} />
      {/snippet}
    </ComponentCard>

    <ComponentCard data={variantData}>
      {#snippet preview()}
        <VariantComparison {ndk} />
      {/snippet}
    </ComponentCard>
  </section>

  <!-- Component API -->
  <ComponentAPI
    components={[
      {
        name: 'EmbeddedEvent',
        description: 'Main orchestrator component that fetches events and routes to kind-specific handlers.',
        importPath: "import EmbeddedEvent from '$lib/registry/ui/embedded-event.svelte'",
        props: [
          {
            name: 'ndk',
            type: 'NDKSvelte',
            required: true,
            description: 'NDK instance for fetching events'
          },
          {
            name: 'bech32',
            type: 'string',
            required: true,
            description: 'Bech32-encoded event reference (note1, nevent1, naddr1)'
          },
          {
            name: 'renderer',
            type: 'ContentRenderer',
            description: 'Optional custom ContentRenderer instance. Defaults to defaultContentRenderer'
          },
          {
            name: 'class',
            type: 'string',
            description: 'Additional CSS classes to apply'
          }
        ]
      },
      {
        name: 'Card Components',
        description: 'Card components for each event kind. These auto-register with defaultContentRenderer and are used automatically when rendering embedded references. Can also be imported directly for standalone use. See /components for full documentation.',
        importPath: "import ArticleCardMedium from '$lib/registry/components/article-card/article-card-medium.svelte'; import NoteCard from '$lib/registry/components/note-card/note-card.svelte'; import HighlightCardFeed from '$lib/registry/components/highlight-card/highlight-card-feed.svelte'",
        props: [
          {
            name: 'ndk',
            type: 'NDKSvelte',
            required: true,
            description: 'NDK instance'
          },
          {
            name: 'event',
            type: 'NDKEvent | NDKArticle | NDKHighlight',
            required: true,
            description: 'The event to render'
          }
        ]
      }
    ]}
  />
</div>
