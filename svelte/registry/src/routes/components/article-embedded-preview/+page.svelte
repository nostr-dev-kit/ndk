<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import { EditProps } from '$lib/ndk/edit-props';
  import Demo from '$site-components/Demo.svelte';

  import ArticleCardExample from './examples/article-card.svelte';
  import ArticleInlineExample from './examples/article-inline.svelte';
  import ArticleCompactExample from './examples/article-compact.svelte';

  const ndk = getContext<NDKSvelte>('ndk');

  // The sample should be a kind:1 event that EMBEDS a kind:30023 article
  let sampleNote = $state<NDKEvent | undefined>();
</script>

<div class="container mx-auto p-8 max-w-7xl">
  <!-- Header -->
  <div class="mb-12">
    <h1 class="text-4xl font-bold mb-4">Article Embedded Preview</h1>
    <p class="text-lg text-muted-foreground mb-2">
      Embedded preview handler for long-form articles (Kind 30023 / NIP-23).
    </p>
    <p class="text-sm text-muted-foreground mb-6">
      <a href="/components/embedded-previews" class="text-primary hover:underline">
        ← Back to Embedded Previews
      </a>
    </p>

    <EditProps.Root>
      <EditProps.Prop
        name="Sample Note (Kind:1 embedding an article)"
        type="event"
        bind:value={sampleNote}
        default="nevent1qqs20u3darewyx27ltlnw9tuzdd5dlvfujqxkzjdmg3glgcsw6zrc2ql6gzju"
      />
    </EditProps.Root>

    {#if sampleNote}
      <div class="mt-4 p-4 border border-border rounded-lg bg-muted/30">
        <p class="text-sm text-muted-foreground mb-2">
          This note embeds an article (naddr1) in its content. Scroll down to see how the embedded article renders.
        </p>
      </div>
    {/if}
  </div>

  <!-- Overview -->
  <section class="mb-12">
    <div class="p-6 border border-border rounded-lg bg-card">
      <h2 class="text-xl font-semibold mb-3">Overview</h2>
      <p class="text-sm text-muted-foreground mb-4">
        The Article embedded handler uses ArticleCard primitives to display long-form content
        with rich metadata including cover images, titles, summaries, and author information.
      </p>
      <div class="text-sm space-y-2">
        <div><strong>Supported Kinds:</strong> 30023 (Long-form Articles / NIP-23)</div>
        <div><strong>Component:</strong> <code class="px-2 py-1 bg-muted rounded">ArticleEmbedded</code></div>
        <div><strong>Uses:</strong> ArticleCard primitives</div>
      </div>
    </div>
  </section>

  <!-- Visual Examples -->
  <section class="mb-12">
    <h2 class="text-3xl font-bold mb-6">Visual Examples</h2>

    <div class="space-y-8">
      <!-- Card Variant -->
      <Demo
        title="Card Variant"
        description="Full display with cover image, title, summary, and metadata. Default variant for embedded articles."
        component="article-embedded-card"
      >
        {#if sampleNote}
          <ArticleCardExample {ndk} event={sampleNote} />
        {:else}
          <div class="p-12 border border-dashed border-border rounded-lg bg-muted/20 text-center">
            <p class="text-sm text-muted-foreground">Select a sample note above to preview</p>
          </div>
        {/if}
      </Demo>

      <!-- Inline Variant -->
      <Demo
        title="Inline Variant"
        description="Medium-sized display suitable for inline references within content."
        component="article-embedded-inline"
      >
        {#if sampleNote}
          <ArticleInlineExample {ndk} event={sampleNote} />
        {:else}
          <div class="p-12 border border-dashed border-border rounded-lg bg-muted/20 text-center">
            <p class="text-sm text-muted-foreground">Select a sample note above to preview</p>
          </div>
        {/if}
      </Demo>

      <!-- Compact Variant -->
      <Demo
        title="Compact Variant"
        description="Minimal horizontal layout with small image and truncated text."
        component="article-embedded-compact"
      >
        {#if sampleNote}
          <ArticleCompactExample {ndk} event={sampleNote} />
        {:else}
          <div class="p-12 border border-dashed border-border rounded-lg bg-muted/20 text-center">
            <p class="text-sm text-muted-foreground">Select a sample note above to preview</p>
          </div>
        {/if}
      </Demo>
    </div>
  </section>

  <!-- When to Use -->
  <section class="mb-12">
    <h2 class="text-3xl font-bold mb-4">When to Use</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="p-6 border border-border rounded-lg bg-card">
        <h3 class="text-lg font-semibold mb-3">Card Variant</h3>
        <ul class="list-disc list-inside space-y-2 text-sm text-muted-foreground">
          <li>Article feeds and discovery pages</li>
          <li>Related articles sections</li>
          <li>Embedded article references in notes</li>
        </ul>
      </div>

      <div class="p-6 border border-border rounded-lg bg-card">
        <h3 class="text-lg font-semibold mb-3">Inline Variant</h3>
        <ul class="list-disc list-inside space-y-2 text-sm text-muted-foreground">
          <li>Citations within long-form content</li>
          <li>References in article bodies</li>
          <li>Bibliography and reading lists</li>
        </ul>
      </div>

      <div class="p-6 border border-border rounded-lg bg-card">
        <h3 class="text-lg font-semibold mb-3">Compact Variant</h3>
        <ul class="list-disc list-inside space-y-2 text-sm text-muted-foreground">
          <li>Sidebar article suggestions</li>
          <li>Dense lists of related content</li>
          <li>Mobile-optimized article previews</li>
        </ul>
      </div>
    </div>
  </section>

  <!-- How to Register -->
  <section class="mb-12">
    <h2 class="text-3xl font-bold mb-4">How to Register</h2>
    <div class="p-6 border border-border rounded-lg bg-card">
      <h3 class="text-lg font-semibold mb-4">Using Custom Registry</h3>
      <p class="text-sm text-muted-foreground mb-4">
        To use a specific variant, create a custom registry and register the variant component:
      </p>
      <div class="p-4 bg-muted rounded font-mono text-sm space-y-2">
        <div class="text-muted-foreground">// Import the variant component</div>
        <div>import ArticleEmbeddedCompact from './article-embedded-compact.svelte';</div>
        <div>import {'{ KindRegistry }'} from '$lib/ndk/event/content';</div>
        <div>import {'{ NDKArticle }'} from '@nostr-dev-kit/ndk';</div>
        <div class="h-2"></div>
        <div class="text-muted-foreground">// Create custom registry</div>
        <div>const compactRegistry = new KindRegistry();</div>
        <div>compactRegistry.add(NDKArticle, ArticleEmbeddedCompact);</div>
        <div class="h-2"></div>
        <div class="text-muted-foreground">// Pass to EventContent</div>
        <div>&lt;EventContent {'{ndk}'} {'{event}'} kindRegistry={'{compactRegistry}'} /&gt;</div>
      </div>
      <p class="text-sm text-muted-foreground mt-4">
        Now all embedded articles will use the compact variant!
      </p>
    </div>
  </section>
</div>
