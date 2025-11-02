<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import { EventCard } from '$lib/registry/components/event-card';
  import { EventContent } from '$lib/registry/ui';
  import { EditProps } from '$lib/site-components/edit-props';
  import Demo from '$site-components/Demo.svelte';

  const ndk = getContext<NDKSvelte>('ndk');

  let sampleEvent = $state<NDKEvent | undefined>();

  const eventCardExample = `<script>
  import { EventCard } from '$lib/registry/components/event-card';
  import { EventContent } from '$lib/registry/ui';

  let event; // Your NDKEvent
<\/script>

<EventCard.Root {ndk} {event}>
  <EventCard.Header />
  <EventCard.Content />
  <EventCard.Actions />
</EventCard.Root>`;

  const justContentExample = `<!-- Just the content, no chrome -->
<EventContent {ndk} {event} />`;

  const customChromeExample = `<!-- Custom chrome with content inside -->
<EventCard.Root {ndk} {event}>
  <EventCard.Header />

  <div class="my-custom-content-area">
    <EventCard.Content />
  </div>

  <EventCard.Actions />
</EventCard.Root>`;
</script>

<div class="docs-page">
  <header class="docs-header">
    <div class="flex items-start justify-between gap-4 mb-4">
        <h1>Card Components</h1>
      <EditProps.Root>
        <EditProps.Prop
          name="Sample Event"
          type="event"
          bind:value={sampleEvent}
          default="nevent1qvzqqqqqqypzp75cf0tahv5z7plpdeaws7ex52nmnwgtwfr2g3m37r844evqrr6jqyxhwumn8ghj7e3h0ghxjme0qyd8wumn8ghj7urewfsk66ty9enxjct5dfskvtnrdakj7qpqn35mrh4hpc53m3qge6m0exys02lzz9j0sxdj5elwh3hc0e47v3qqpq0a0n"
        />
        <EditProps.Button>Edit Examples</EditProps.Button>
      </EditProps.Root>
    </div>
    <p class="subtitle">
      Understanding the chrome: consistent visual frames for Nostr events
    </p>
  </header>

  <section class="prose prose-lg max-w-none mb-12">
    <h2>What are Card Components?</h2>
    <p>
      Card components provide the <strong>chrome</strong> — the consistent visual frame around your
      content. Think of it as the picture frame that stays the same while the artwork inside changes.
      The chrome includes the header (avatar, name, timestamp), action buttons (like, reply, repost),
      and the overall container styling that makes an event recognizable as a social media post.
    </p>

    <p>
      The most fundamental card component is <code>EventCard</code>, which provides composable building
      blocks for displaying any NDKEvent type. Other specialized cards like <code>ArticleCard</code>,
      <code>HighlightCard</code>, and <code>VoiceMessageCard</code> extend this pattern for specific
      event kinds, offering optimized layouts and metadata display for their content type.
    </p>

    <h2>The Chrome Components</h2>
    <p>
      EventCard breaks down the chrome into composable pieces:
    </p>
    <ul>
      <li><strong>EventCard.Root</strong> — Container that provides context to child components</li>
      <li><strong>EventCard.Header</strong> — Author avatar, name, and timestamp</li>
      <li><strong>EventCard.Content</strong> — Renders the event content (uses EventContent internally)</li>
      <li><strong>EventCard.Actions</strong> — Action buttons (reply, like, repost, zap)</li>
      <li><strong>EventCard.Dropdown</strong> — Menu for additional actions (mute, copy link, etc.)</li>
    </ul>

    <h2>Cards vs Content: The Separation</h2>
    <p>
      The key insight is that <strong>cards provide the frame, content provides the filling</strong>.
      You can use content components without cards (for focused reading), or combine them (for social feeds):
    </p>
  </section>

  {#if sampleEvent}
    <section class="demo space-y-8">
      <h2 class="text-2xl font-semibold mb-4">Understanding the Pattern</h2>

      <Demo
        title="Full Card with Chrome"
        description="EventCard with header, content, and actions — the complete social media post experience."
        code={eventCardExample}
      >
        <EventCard.Root {ndk} event={sampleEvent}>
          <EventCard.Header />
          <EventCard.Content />
          <EventCard.Actions />
        </EventCard.Root>
      </Demo>

      <Demo
        title="Content Only (No Chrome)"
        description="Just the content renderer without any frame — useful for article pages or focused reading."
        code={justContentExample}
      >
        <div class="p-4 border rounded-lg">
          <EventContent {ndk} event={sampleEvent} />
        </div>
      </Demo>

      <Demo
        title="Custom Chrome"
        description="Mix and match — use the card's frame but customize the layout or add your own elements."
        code={customChromeExample}
      >
        <EventCard.Root {ndk} event={sampleEvent}>
          <EventCard.Header />

          <div class="my-4 p-4 bg-muted/30 rounded-lg border-l-4 border-primary">
            <EventCard.Content />
          </div>

          <EventCard.Actions />
        </EventCard.Root>
      </Demo>
    </section>

    <section class="mt-12">
      <h2 class="text-2xl font-semibold mb-4">Pre-built Block Components</h2>
      <p class="text-muted-foreground mb-6">
        For common use cases, the registry provides pre-built "block" components that combine
        the chrome with specific layouts and styling. These are ready-to-use implementations
        that you can drop into your app.
      </p>

      <div class="grid gap-4 md:grid-cols-2">
        <div class="p-6 border rounded-lg">
          <h3 class="font-semibold mb-2">Generic Event Blocks</h3>
          <p class="text-sm text-muted-foreground mb-3">
            Pre-styled EventCard variations for feeds and social content.
          </p>
          <a href="/components/cards/generic" class="text-primary hover:underline text-sm">
            View Generic Cards →
          </a>
        </div>

        <div class="p-6 border rounded-lg">
          <h3 class="font-semibold mb-2">Specialized Cards</h3>
          <p class="text-sm text-muted-foreground mb-3">
            Article, Highlight, and Voice Message cards with custom layouts.
          </p>
          <div class="space-y-1 text-sm">
            <a href="/components/cards/article" class="text-primary hover:underline block">Article Cards →</a>
            <a href="/components/cards/highlight" class="text-primary hover:underline block">Highlight Cards →</a>
            <a href="/components/cards/voice-message" class="text-primary hover:underline block">Voice Message Cards →</a>
          </div>
        </div>
      </div>
    </section>
  {:else}
    <div class="flex items-center justify-center py-12">
      <div class="text-muted-foreground">Loading sample event...</div>
    </div>
  {/if}

  <section class="mt-12 p-6 bg-blue-500/10 border border-blue-500/20 rounded-lg">
    <h3 class="text-lg font-semibold mb-2">💡 Design Philosophy</h3>
    <p class="text-muted-foreground">
      Card components follow a composable-first approach: use the primitives (EventCard.Root, Header, etc.)
      for full control, or use pre-built blocks for speed. Both use the same underlying components,
      so you can start with blocks and refactor to primitives as your needs evolve.
    </p>
  </section>
</div>

<style>
  .prose :global(code) {
    background: hsl(var(--muted));
    padding: 0.2em 0.4em;
    border-radius: 0.25rem;
    font-size: 0.9em;
  }
</style>
