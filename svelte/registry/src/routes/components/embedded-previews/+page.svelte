<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import Demo from '$site-components/Demo.svelte';
  import ComponentAPI from '$site-components/component-api.svelte';

  import HowItWorksCode from './examples/how-it-works-code.svelte?raw';
  import AddingHandlerCode from './examples/adding-handler-code.svelte?raw';
  import InteractiveDemo from './examples/interactive-demo.svelte';
  import VariantComparison from './examples/variant-comparison.svelte';

  const ndk = getContext<NDKSvelte>('ndk');
</script>

<div class="container mx-auto p-8 max-w-7xl">
  <!-- Header -->
  <div class="mb-12">
    <h1 class="text-4xl font-bold mb-4">Embedded Event Previews</h1>
    <p class="text-lg text-muted-foreground mb-6">
      Automatically render rich previews of embedded Nostr events based on their kind.
      When content includes event references (note1, nevent1, naddr1), they are detected
      and displayed with kind-specific UIs.
    </p>
  </div>

  <!-- How It Works Section -->
  <section class="mb-16">
    <h2 class="text-3xl font-bold mb-2">How It Works</h2>
    <p class="text-muted-foreground mb-8">
      The embedded event system uses a simple map-based registry to determine which
      component renders each event kind.
    </p>

    <div class="space-y-8">
      <!-- Architecture Overview -->
      <div class="p-6 border border-border rounded-lg bg-card">
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
              <p class="text-sm">createEmbeddedEvent builder fetches the event from relays using the bech32 identifier</p>
            </div>
          </div>
          <div class="flex items-start gap-3">
            <div class="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold">3</div>
            <div>
              <strong class="text-foreground">Registry Lookup</strong>
              <p class="text-sm">Check KIND_HANDLERS map for a registered handler matching the event's kind</p>
            </div>
          </div>
          <div class="flex items-start gap-3">
            <div class="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold">4</div>
            <div>
              <strong class="text-foreground">Render</strong>
              <p class="text-sm">Render using the kind-specific handler, or fall back to GenericEmbedded for unknown kinds</p>
            </div>
          </div>
        </div>
      </div>

      <!-- KIND_HANDLERS Registry -->
      <Demo
        title="KIND_HANDLERS Registry"
        description="A simple Record<number, Component> map that defines which component renders each kind. No classes, no context, no complexity."
        code={HowItWorksCode}
      >
        <div class="p-6 border border-border rounded-lg bg-muted/30">
          <p class="text-sm text-muted-foreground mb-4">
            The registry lives directly in <code class="px-2 py-1 bg-muted rounded">event/event.svelte</code> as a plain TypeScript object:
          </p>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="p-4 bg-card rounded border border-border">
              <div class="text-sm font-mono mb-2">30023 → ArticleEmbedded</div>
              <p class="text-xs text-muted-foreground">Long-form articles</p>
            </div>
            <div class="p-4 bg-card rounded border border-border">
              <div class="text-sm font-mono mb-2">1, 1111 → NoteEmbedded</div>
              <p class="text-xs text-muted-foreground">Notes and replies</p>
            </div>
            <div class="p-4 bg-card rounded border border-border">
              <div class="text-sm font-mono mb-2">9802 → HighlightEmbedded</div>
              <p class="text-xs text-muted-foreground">Highlights</p>
            </div>
            <div class="p-4 bg-card rounded border border-border">
              <div class="text-sm font-mono mb-2">* → GenericEmbedded</div>
              <p class="text-xs text-muted-foreground">Fallback for unknown kinds</p>
            </div>
          </div>
        </div>
      </Demo>

      <!-- Adding New Handlers -->
      <Demo
        title="Adding New Kind Handlers"
        description="When you install a new kind handler, simply add 2 lines to the KIND_HANDLERS map. No registration API, no complex setup."
        code={AddingHandlerCode}
      >
        <div class="p-6 border border-border rounded-lg bg-muted/30">
          <div class="space-y-4">
            <div>
              <div class="text-sm font-semibold mb-2">Step 1: Install the handler</div>
              <code class="block p-3 bg-card rounded text-sm">
                npx shadcn-svelte@latest add video-embedded
              </code>
            </div>
            <div>
              <div class="text-sm font-semibold mb-2">Step 2: Add to KIND_HANDLERS map</div>
              <p class="text-xs text-muted-foreground mb-2">
                Edit <code class="px-1 py-0.5 bg-muted rounded">event/event.svelte</code>:
              </p>
              <div class="p-3 bg-card rounded text-sm font-mono space-y-1">
                <div class="text-muted-foreground">// 1. Import the component</div>
                <div>import VideoEmbedded from '../kinds/video-embedded.svelte';</div>
                <div class="h-2"></div>
                <div class="text-muted-foreground">// 2. Add to map</div>
                <div>34235: VideoEmbedded,</div>
              </div>
            </div>
            <p class="text-sm text-muted-foreground">
              That's it! The handler is now registered and will render all video events (kind 34235).
            </p>
          </div>
        </div>
      </Demo>

      <!-- Fallback Behavior -->
      <div class="p-6 border border-border rounded-lg bg-card">
        <h3 class="text-xl font-semibold mb-4">Fallback Behavior</h3>
        <p class="text-sm text-muted-foreground mb-4">
          When an event kind has no registered handler, the system automatically falls back
          to <code class="px-2 py-1 bg-muted rounded">GenericEmbedded</code>, which:
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

  <!-- Supported Kinds Section -->
  <section class="mb-16">
    <h2 class="text-3xl font-bold mb-2">Supported Kinds</h2>
    <p class="text-muted-foreground mb-8">
      Each kind has a dedicated handler with optimized UI for that content type.
    </p>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <!-- Note -->
      <a href="/components/note-embedded-preview" class="group block p-6 border border-border rounded-lg bg-card hover:bg-accent/50 transition-colors">
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
      <a href="/components/article-embedded-preview" class="group block p-6 border border-border rounded-lg bg-card hover:bg-accent/50 transition-colors">
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
      <a href="/components/highlight-embedded-preview" class="group block p-6 border border-border rounded-lg bg-card hover:bg-accent/50 transition-colors">
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
      <a href="/components/generic-embedded-preview" class="group block p-6 border border-border rounded-lg bg-card hover:bg-accent/50 transition-colors">
        <div class="flex items-start justify-between mb-3">
          <h3 class="text-lg font-semibold">Generic Fallback</h3>
          <span class="text-xs px-2 py-1 bg-muted rounded">Unknown kinds</span>
        </div>
        <p class="text-sm text-muted-foreground mb-4">
          Default renderer for kinds without specific handlers.
        </p>
        <div class="text-sm text-primary group-hover:underline">
          View documentation →
        </div>
      </a>
    </div>
  </section>

  <!-- Interactive Demo Section -->
  <section class="mb-16">
    <h2 class="text-3xl font-bold mb-2">Interactive Demo</h2>
    <p class="text-muted-foreground mb-8">
      Try pasting any Nostr event reference to see how it renders.
    </p>

    <div class="space-y-8">
      <Demo
        title="Live Preview"
        description="Paste a bech32 event reference (note1, nevent1, naddr1) and see it render in real-time."
      >
        <InteractiveDemo {ndk} />
      </Demo>
    </div>
  </section>

  <!-- Variant Comparison Section -->
  <section class="mb-16">
    <h2 class="text-3xl font-bold mb-2">Variant Support</h2>
    <p class="text-muted-foreground mb-8">
      All embedded event handlers support three display variants for different contexts.
    </p>

    <div class="space-y-8">
      <Demo
        title="Variant Comparison"
        description="Compare card, inline, and compact variants side by side."
      >
        <VariantComparison {ndk} />
      </Demo>
    </div>
  </section>

  <!-- Component API -->
  <section class="mb-16">
    <h2 class="text-3xl font-bold mb-2">Component API</h2>

    <ComponentAPI
      components={[
        {
          name: 'EmbeddedEvent',
          description: 'Main orchestrator component that fetches events and routes to kind-specific handlers.',
          importPath: "import { EmbeddedEvent } from '$lib/ndk/event/content'",
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
              name: 'variant',
              type: "'inline' | 'card' | 'compact'",
              default: "'card'",
              description: 'Display variant - card (default), inline (max-width), or compact (minimal)'
            },
            {
              name: 'class',
              type: 'string',
              description: 'Additional CSS classes to apply'
            }
          ]
        },
        {
          name: 'Kind Handlers',
          description: 'Individual components for each supported kind. Typically not used directly - the EmbeddedEvent orchestrator selects the appropriate handler.',
          importPath: "import { ArticleEmbedded, NoteEmbedded, HighlightEmbedded, GenericEmbedded } from '$lib/ndk/event/content'",
          props: [
            {
              name: 'ndk',
              type: 'NDKSvelte',
              required: true,
              description: 'NDK instance'
            },
            {
              name: 'event',
              type: 'NDKEvent | NDKArticle',
              required: true,
              description: 'The event to render'
            },
            {
              name: 'variant',
              type: "'inline' | 'card' | 'compact'",
              default: "'card'",
              description: 'Display variant'
            }
          ]
        }
      ]}
    />
  </section>
</div>
