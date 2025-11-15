<script lang="ts">
    import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { ndk } from '$lib/site/ndk.svelte';</script>

<div class="px-8">
  <!-- Header -->
  <div class="mb-12 pt-8">
    <h1 class="text-4xl font-bold mb-4">ContentRenderer System</h1>
    <p class="text-lg text-muted-foreground max-w-3xl">
      Customize how inline content elements are rendered within event text.
      Override default rendering for mentions, hashtags, links, and media with your own components.
    </p>
  </div>

  <!-- What It Is -->
  <section class="mb-16">
    <h2 class="text-2xl font-bold mb-4">Overview</h2>
    <p class="text-muted-foreground mb-6 max-w-3xl">
      ContentRenderer is a registry that controls how inline content is displayed when parsing event content.
      By default, EventContent components render mentions, hashtags, links, and media with basic styling.
      You can replace these defaults with your own components for custom behavior and styling.
    </p>

    <div class="p-6 bg-muted rounded-lg max-w-3xl">
      <h3 class="text-lg font-semibold mb-3">Basic Usage</h3>
      <pre class="text-sm bg-card p-4 rounded overflow-x-auto"><code>import &#123; ContentRenderer &#125; from '$lib/registry/ui/content-renderer';
import MyCustomMention from './MyCustomMention.svelte';

const renderer = new ContentRenderer();

// Set custom component for mentions
renderer.mentionComponent = MyCustomMention;

// Use in EventContent
&lt;EventContent &#123;ndk&#125; &#123;event&#125; &#123;renderer&#125; /&gt;</code></pre>
    </div>
  </section>

  <!-- Available Handlers -->
  <section class="mb-16">
    <h2 class="text-2xl font-bold mb-4">Customizable Handlers</h2>
    <p class="text-muted-foreground mb-8 max-w-3xl">
      Each handler type has example implementations you can use or learn from:
    </p>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
      <!-- Mention -->
      <a href="/events/embeds/mention" class="group block p-6 border border-border rounded-lg bg-card hover:bg-accent/50 transition-colors">
        <div class="flex items-start justify-between mb-3">
          <h3 class="text-lg font-semibold">Mention</h3>
          <span class="text-xs px-2 py-1 bg-muted rounded">@npub</span>
        </div>
        <p class="text-sm text-muted-foreground mb-2">
          Custom components for rendering user mentions
        </p>
        <code class="text-xs block mb-3">renderer.mentionComponent</code>
        <div class="text-sm text-primary group-hover:underline">
          View examples →
        </div>
      </a>

      <!-- Hashtag -->
      <a href="/events/embeds/hashtag" class="group block p-6 border border-border rounded-lg bg-card hover:bg-accent/50 transition-colors">
        <div class="flex items-start justify-between mb-3">
          <h3 class="text-lg font-semibold">Hashtag</h3>
          <span class="text-xs px-2 py-1 bg-muted rounded">#topic</span>
        </div>
        <p class="text-sm text-muted-foreground mb-2">
          Custom components for rendering hashtags
        </p>
        <code class="text-xs block mb-3">renderer.hashtagComponent</code>
        <div class="text-sm text-primary group-hover:underline">
          View examples →
        </div>
      </a>

      <!-- Media -->
      <a href="/events/embeds/media" class="group block p-6 border border-border rounded-lg bg-card hover:bg-accent/50 transition-colors">
        <div class="flex items-start justify-between mb-3">
          <h3 class="text-lg font-semibold">Media</h3>
          <span class="text-xs px-2 py-1 bg-muted rounded">Images/Videos</span>
        </div>
        <p class="text-sm text-muted-foreground mb-2">
          Carousels, grids, and custom media displays
        </p>
        <code class="text-xs block mb-3">renderer.mediaComponent</code>
        <div class="text-sm text-primary group-hover:underline">
          View examples →
        </div>
      </a>

      <!-- Links -->
      <a href="/events/embeds/links" class="group block p-6 border border-border rounded-lg bg-card hover:bg-accent/50 transition-colors">
        <div class="flex items-start justify-between mb-3">
          <h3 class="text-lg font-semibold">Links</h3>
          <span class="text-xs px-2 py-1 bg-muted rounded">URLs</span>
        </div>
        <p class="text-sm text-muted-foreground mb-2">
          Link previews with OpenGraph metadata
        </p>
        <code class="text-xs block mb-3">renderer.linkComponent</code>
        <div class="text-sm text-primary group-hover:underline">
          View examples →
        </div>
      </a>
    </div>
  </section>

  <!-- Context vs Prop -->
  <section class="mb-16">
    <h2 class="text-2xl font-bold mb-4">Context vs Prop</h2>
    <p class="text-muted-foreground mb-6 max-w-3xl">
      You can provide a renderer globally via context or pass it directly as a prop to specific components.
    </p>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
      <div class="p-6 border border-border rounded-lg bg-card">
        <h3 class="text-lg font-semibold mb-3">Via Context (Global)</h3>
        <p class="text-sm text-muted-foreground mb-4">
          Set once at app/page level, all nested components inherit automatically:
        </p>
        <pre class="text-xs bg-muted p-3 rounded overflow-x-auto"><code>import &#123; setContext &#125; from 'svelte';
import &#123; CONTENT_RENDERER_CONTEXT_KEY &#125; from '$lib/registry/ui/content-renderer';

setContext(CONTENT_RENDERER_CONTEXT_KEY, &#123; renderer &#125;);

// All EventContent components automatically use it
&lt;EventContent &#123;ndk&#125; &#123;event&#125; /&gt;</code></pre>
      </div>

      <div class="p-6 border border-border rounded-lg bg-card">
        <h3 class="text-lg font-semibold mb-3">Via Prop (Override)</h3>
        <p class="text-sm text-muted-foreground mb-4">
          Pass directly to override context for specific use:
        </p>
        <pre class="text-xs bg-muted p-3 rounded overflow-x-auto"><code>// Different renderer for this component only
&lt;EventContent
  &#123;ndk&#125;
  &#123;event&#125;
  renderer=&#123;customRenderer&#125;
/&gt;</code></pre>
      </div>
    </div>
  </section>

  <!-- Related -->
  <section class="mb-16">
    <h2 class="text-2xl font-bold mb-4">Related</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
      <a href="/ui/event-rendering" class="group block p-6 border border-border rounded-lg bg-card hover:bg-accent/50 transition-colors">
        <h3 class="text-lg font-semibold mb-2">Event Rendering</h3>
        <p class="text-sm text-muted-foreground mb-4">
          EventContent, EmbeddedEvent, and MarkdownEventContent components
        </p>
        <div class="text-sm text-primary group-hover:underline">
          View documentation →
        </div>
      </a>

      <a href="/events/cards/fallback-card" class="group block p-6 border border-border rounded-lg bg-card hover:bg-accent/50 transition-colors">
        <h3 class="text-lg font-semibold mb-2">Fallback Event Card</h3>
        <p class="text-sm text-muted-foreground mb-4">
          Fallback chrome for unknown event kinds
        </p>
        <div class="text-sm text-primary group-hover:underline">
          View documentation →
        </div>
      </a>
    </div>
  </section>
</div>

<style>
  code {
    background: hsl(var(--muted));
    padding: 0.2em 0.4em;
    border-radius: 0.25rem;
    font-size: 0.9em;
  }
</style>
