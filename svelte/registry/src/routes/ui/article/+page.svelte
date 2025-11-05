<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { NDKArticle, NDKKind } from '@nostr-dev-kit/ndk';
  import { Article } from '$lib/registry/ui';
  import UIPrimitivePageTemplate from '$lib/templates/UIPrimitivePageTemplate.svelte';
  import * as ComponentAnatomy from '$site-components/component-anatomy/index.js';
  import { articleMetadata } from '$lib/ui-registry/article';

  // Import examples
  import Basic from './examples/basic.example.svelte';
  import Composition from './examples/composition.example.svelte';

  const ndk = getContext<NDKSvelte>('ndk');

  // Fetch a sample article for anatomy preview
  const articleFetcher = $state(ndk.subscribe({
    kinds: [NDKKind.Article],
    limit: 1
  }));

  let sampleArticle = $state<NDKArticle | null>(null);

  $effect(() => {
    const events = articleFetcher.events as any;
    if (events && events.length > 0) {
      sampleArticle = NDKArticle.from(events[0]);
    }
  });
</script>

<svelte:head>
  <title>Article Primitives - NDK Svelte</title>
  <meta name="description" content="Headless, composable primitives for displaying long-form articles (NIP-23)." />
</svelte:head>

{#if sampleArticle}
  <UIPrimitivePageTemplate metadata={articleMetadata} {ndk}>
    {#snippet anatomyPreview()}
      <Article.Root {ndk} article={sampleArticle!}>
        <ComponentAnatomy.Layer id="root" label="Article.Root">
          <div class="border border-border rounded-lg p-6 bg-background">
            <ComponentAnatomy.Layer id="image" label="Article.Image">
              <Article.Image class="w-full h-48 object-cover rounded-md mb-4" />
            </ComponentAnatomy.Layer>
            <ComponentAnatomy.Layer id="title" label="Article.Title">
              <Article.Title class="text-2xl font-bold mb-2" />
            </ComponentAnatomy.Layer>
            <ComponentAnatomy.Layer id="summary" label="Article.Summary">
              <Article.Summary class="text-muted-foreground mb-4" />
            </ComponentAnatomy.Layer>
            <ComponentAnatomy.Layer id="reading-time" label="Article.ReadingTime">
              <Article.ReadingTime class="text-sm text-muted-foreground" />
            </ComponentAnatomy.Layer>
          </div>
        </ComponentAnatomy.Layer>
      </Article.Root>
    {/snippet}

    {#snippet customSections()}
      <section class="mt-16">
        <h2 class="text-3xl font-bold mb-4">Examples</h2>
        <div class="space-y-8">
          <div class="border border-border rounded-lg p-6">
            <h3 class="text-xl font-semibold mb-3">Basic Usage</h3>
            <p class="text-muted-foreground mb-4">
              Minimal example showing how to compose Article primitives. Each primitive can be styled independently.
            </p>
            <Basic />
          </div>

          <div class="border border-border rounded-lg p-6">
            <h3 class="text-xl font-semibold mb-3">Composed Layout</h3>
            <p class="text-muted-foreground mb-4">
              Build a complete article card by composing primitives with custom styling. This example shows a hero image layout with metadata.
            </p>
            <Composition />
          </div>
        </div>
      </section>

      <section class="mt-16">
        <h2 class="text-3xl font-bold mb-4">Context</h2>
        <p class="text-muted-foreground mb-4">
          Article.Root provides context to all child components. You can access this context in your own custom components:
        </p>
        <pre class="p-4 bg-muted rounded-lg overflow-x-auto"><code class="text-sm font-mono">import &#123; getContext &#125; from 'svelte';
import &#123; ARTICLE_CONTEXT_KEY, type ArticleContext &#125; from '$lib/registry/ui/article';

const context = getContext&lt;ArticleContext&gt;(ARTICLE_CONTEXT_KEY);
// Access: context.article, context.ndk, context.onclick</code></pre>
      </section>

      <section class="mt-16">
        <h2 class="text-3xl font-bold mb-4">Styling</h2>
        <p class="text-muted-foreground mb-4">
          All Article primitives are headless - they have no default styling. Apply your own styles using the `class` prop:
        </p>
        <pre class="p-4 bg-muted rounded-lg overflow-x-auto"><code class="text-sm font-mono">&lt;Article.Title class="text-3xl font-bold text-gray-900" /&gt;
&lt;Article.Summary class="text-base text-gray-600 leading-relaxed" /&gt;</code></pre>
      </section>

      <section class="mt-16">
        <h2 class="text-3xl font-bold mb-4">Related</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a href="/components/cards/article" class="flex flex-col gap-1 p-4 border border-border rounded-lg bg-background hover:border-primary transition-all hover:-translate-y-0.5 no-underline">
            <strong class="font-semibold text-foreground">Article Blocks</strong>
            <span class="text-sm text-muted-foreground">Pre-styled article card layouts</span>
          </a>
          <a href="/ui/user" class="flex flex-col gap-1 p-4 border border-border rounded-lg bg-background hover:border-primary transition-all hover:-translate-y-0.5 no-underline">
            <strong class="font-semibold text-foreground">User Primitives</strong>
            <span class="text-sm text-muted-foreground">For displaying article authors</span>
          </a>
          <a href="/components/content/article" class="flex flex-col gap-1 p-4 border border-border rounded-lg bg-background hover:border-primary transition-all hover:-translate-y-0.5 no-underline">
            <strong class="font-semibold text-foreground">Article Content</strong>
            <span class="text-sm text-muted-foreground">Render article content with markdown</span>
          </a>
        </div>
      </section>
    {/snippet}
  </UIPrimitivePageTemplate>
{:else}
  <div class="max-w-[900px] mx-auto px-8 py-16 text-center text-muted-foreground">
    Loading article data...
  </div>
{/if}
