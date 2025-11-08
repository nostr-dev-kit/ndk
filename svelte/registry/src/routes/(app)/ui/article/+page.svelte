<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { NDKArticle, NDKKind } from '@nostr-dev-kit/ndk';
  import { Article } from '$lib/registry/ui/article';
  import Preview from '$site-components/preview.svelte';
  import ApiTable from '$site-components/api-table.svelte';

  // Import examples
  import Basic from './examples/basic-usage/index.svelte';
  import BasicRaw from './examples/basic-usage/index.txt?raw';
  import Composition from './examples/full-card/index.svelte';
  import CompositionRaw from './examples/full-card/index.txt?raw';

  const ndk = getContext<NDKSvelte>('ndk');
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
          <Preview
            title="Basic Usage"
            code={BasicRaw}
          >
            <Basic />
          </Preview>

          <Preview
            title="Composed Layout"
            code={CompositionRaw}
          >
            <Composition />
          </Preview>
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
