<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { NDKArticle, NDKKind } from '@nostr-dev-kit/ndk';
  import { ArticleCard } from '$lib/ndk/article-card';
  import { EditProps } from '$lib/ndk/edit-props';
  import CodePreview from '$site-components/code-preview.svelte';

  const ndk = getContext<NDKSvelte>('ndk');

  let articles = $state<NDKArticle[]>([]);
  let loading = $state(true);
  let sampleArticle = $state<NDKArticle | undefined>();

  $effect(() => {
    (async () => {
      try {
        // Fetch some real articles from Nostr
        const events = await ndk.fetchEvents({
          kinds: [NDKKind.Article],
          authors: [
            "6e468422dfb74a5738702a8823b9b28168abab8655faacb6853cd0ee15deee93",
            ...(ndk.$follows)
          ],
          limit: 10
        });

        articles = Array.from(events)
          .map(event => NDKArticle.from(event))
          .filter(a => a.title); // Only articles with titles

        // Set initial sample article if not already set by EditProps
        if (!sampleArticle && articles.length > 0) {
          sampleArticle = articles[0];
        }

        loading = false;
      } catch (error) {
        console.error('Failed to fetch articles:', error);
        loading = false;
      }
    })();
  });

  const displayArticle = $derived(sampleArticle);
</script>

<div class="container mx-auto p-8 max-w-7xl">
  <div class="mb-12">
    <h1 class="text-4xl font-bold mb-4">ArticleCard Component</h1>
    <p class="text-lg text-muted-foreground mb-6">
      Composable article card components for displaying NDKArticle content with customizable layouts.
    </p>

    <EditProps.Root>
      <EditProps.Prop name="Sample Article" type="article" bind:value={sampleArticle} />
    </EditProps.Root>
  </div>

  {#if loading}
    <div class="flex items-center justify-center py-12">
      <div class="text-muted-foreground">Loading articles...</div>
    </div>
  {:else if articles.length === 0}
    <div class="flex items-center justify-center py-12">
      <div class="text-muted-foreground">No articles found. Using sample data...</div>
    </div>
  {/if}

  <!-- Portrait Preset -->
  <section class="mb-16">
    <CodePreview
      title="Portrait Layout"
      description="Vertical card layout with image on top. Perfect for grid displays and featured content."
      component="article-card-portrait"
      code={`<ArticleCard.Portrait {ndk} {article} />

<!-- With custom sizing -->
<ArticleCard.Portrait
  {ndk}
  {article}
  width="w-[320px]"
  height="h-[400px]"
  imageHeight="h-56"
/>`}
    >
      <div class="flex gap-6 overflow-x-auto pb-4">
        {#if displayArticle}
          <ArticleCard.Portrait ndk={ndk} article={displayArticle} />
        {/if}
        {#each articles.slice(0, 4) as article}
          <ArticleCard.Portrait ndk={ndk} {article} />
        {/each}
      </div>
    </CodePreview>
  </section>

  <!-- Hero Preset -->
  <section class="mb-16">
    <CodePreview
      title="Hero Layout"
      description="Full-width hero card with gradient background and featured badge. Ideal for featured stories and landing page headers."
      component="article-card-hero"
      code={`<ArticleCard.Hero {ndk} {article} />

<!-- With custom options -->
<ArticleCard.Hero
  {ndk}
  {article}
  height="h-[600px]"
  badgeText="TRENDING NOW"
/>`}
    >
      {#if displayArticle}
        <ArticleCard.Hero ndk={ndk} article={displayArticle} />
      {/if}
    </CodePreview>
  </section>

  <!-- Neon Preset -->
  <section class="mb-16">
    <CodePreview
      title="Neon Layout"
      description="Portrait card with subtle glossy white neon top border, full background image, author info and reading time."
      component="article-card-neon"
      code={`<ArticleCard.Neon {ndk} {article} />

<!-- With custom sizing -->
<ArticleCard.Neon
  {ndk}
  {article}
  width="w-[320px]"
  height="h-[480px]"
/>`}
    >
      <div class="flex gap-6 overflow-x-auto pb-4">
        {#if displayArticle}
          <ArticleCard.Neon ndk={ndk} article={displayArticle} />
        {/if}
        {#each articles.slice(0, 4) as article}
          <ArticleCard.Neon ndk={ndk} {article} />
        {/each}
      </div>
    </CodePreview>
  </section>

  <!-- Medium Preset -->
  <section class="mb-16">
    <CodePreview
      title="Medium Layout"
      description="Horizontal card layout with image on right. Ideal for list views and article feeds."
      component="article-card-medium"
      code={`<ArticleCard.Medium {ndk} {article} />

<!-- With different image sizes -->
<ArticleCard.Medium {ndk} {article} imageSize="small" />
<ArticleCard.Medium {ndk} {article} imageSize="medium" />
<ArticleCard.Medium {ndk} {article} imageSize="large" />`}
    >
      <div class="space-y-0 border border-border rounded-lg overflow-hidden">
        {#if displayArticle}
          <ArticleCard.Medium ndk={ndk} article={displayArticle} />
        {/if}
        {#each articles.slice(0, 3) as article}
          <ArticleCard.Medium ndk={ndk} {article} />
        {/each}
      </div>
    </CodePreview>
  </section>

  <!-- Image Size Variations -->
  <section class="mb-16">
    <CodePreview
      title="Image Size Variations"
      description="Medium layout supports three image size options."
      code={`<ArticleCard.Medium {ndk} {article} imageSize="small" />
<ArticleCard.Medium {ndk} {article} imageSize="medium" />
<ArticleCard.Medium {ndk} {article} imageSize="large" />`}
    >
      <div class="space-y-0 border border-border rounded-lg overflow-hidden">
        {#if displayArticle}
          <ArticleCard.Medium ndk={ndk} article={displayArticle} imageSize="small" />
          <ArticleCard.Medium ndk={ndk} article={displayArticle} imageSize="medium" />
          <ArticleCard.Medium ndk={ndk} article={displayArticle} imageSize="large" />
        {/if}
      </div>
    </CodePreview>
  </section>

  <!-- Composable Example -->
  <section class="mb-16">
    <CodePreview
      title="Composable Mode"
      description="Build custom layouts by composing individual components within ArticleCard.Root."
      code={`<ArticleCard.Root {ndk} {article}>
  <div class="card">
    <ArticleCard.Image class="h-64" showGradient={true} />
    <div class="p-6">
      <ArticleCard.Title class="text-3xl mb-3" />
      <ArticleCard.Summary maxLength={250} lines={4} />
      <ArticleCard.Meta showIcon={true} />
    </div>
  </div>
</ArticleCard.Root>`}
    >
      {#if displayArticle}
        <ArticleCard.Root ndk={ndk} article={displayArticle}>
          <div class="border border-border rounded-xl overflow-hidden bg-card max-w-2xl">
            <ArticleCard.Image class="h-64" showGradient={true} />
            <div class="p-6">
              <ArticleCard.Title class="text-3xl mb-3" lines={3} />
              <ArticleCard.Summary class="text-base mb-4" maxLength={250} lines={4} />
              <div class="flex items-center justify-between pt-4 border-t border-border">
                <ArticleCard.Meta showIcon={true} />
                <button class="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                  Read Article
                </button>
              </div>
            </div>
          </div>
        </ArticleCard.Root>
      {/if}
    </CodePreview>
  </section>

  <!-- Component API -->
  <section class="mb-16">
    <h2 class="text-2xl font-bold mb-4">Component API</h2>

    <div class="space-y-6">
      <div class="border border-border rounded-lg p-6">
        <h3 class="text-xl font-semibold mb-3">ArticleCard.Root</h3>
        <p class="text-muted-foreground mb-4">
          Root container that provides context to child components. Fetches author profile automatically.
        </p>
        <div class="bg-muted p-4 rounded-lg">
          <code class="text-sm">ndk: NDKSvelte, article: NDKArticle, interactive?: boolean</code>
        </div>
      </div>

      <div class="border border-border rounded-lg p-6">
        <h3 class="text-xl font-semibold mb-3">ArticleCard.Image</h3>
        <p class="text-muted-foreground mb-4">
          Display article cover image with fallback icon.
        </p>
        <div class="bg-muted p-4 rounded-lg">
          <code class="text-sm">showGradient?: boolean, iconSize?: string</code>
        </div>
      </div>

      <div class="border border-border rounded-lg p-6">
        <h3 class="text-xl font-semibold mb-3">ArticleCard.Title</h3>
        <p class="text-muted-foreground mb-4">
          Display article title with line clamping.
        </p>
        <div class="bg-muted p-4 rounded-lg">
          <code class="text-sm">lines?: number (default: 2)</code>
        </div>
      </div>

      <div class="border border-border rounded-lg p-6">
        <h3 class="text-xl font-semibold mb-3">ArticleCard.Summary</h3>
        <p class="text-muted-foreground mb-4">
          Display article summary/excerpt with truncation.
        </p>
        <div class="bg-muted p-4 rounded-lg">
          <code class="text-sm">maxLength?: number (default: 150), lines?: number (default: 3)</code>
        </div>
      </div>

      <div class="border border-border rounded-lg p-6">
        <h3 class="text-xl font-semibold mb-3">ArticleCard.Author</h3>
        <p class="text-muted-foreground mb-4">
          Display article author name from profile.
        </p>
        <div class="bg-muted p-4 rounded-lg">
          <code class="text-sm">fallback?: string (default: "Anonymous")</code>
        </div>
      </div>

      <div class="border border-border rounded-lg p-6">
        <h3 class="text-xl font-semibold mb-3">ArticleCard.Date</h3>
        <p class="text-muted-foreground mb-4">
          Display article published date.
        </p>
        <div class="bg-muted p-4 rounded-lg">
          <code class="text-sm">format?: "relative" | "short" | "full" (default: "relative")</code>
        </div>
      </div>

      <div class="border border-border rounded-lg p-6">
        <h3 class="text-xl font-semibold mb-3">ArticleCard.Meta</h3>
        <p class="text-muted-foreground mb-4">
          Combined author + date display.
        </p>
        <div class="bg-muted p-4 rounded-lg">
          <code class="text-sm">showIcon?: boolean (default: false)</code>
        </div>
      </div>

      <div class="border border-border rounded-lg p-6">
        <h3 class="text-xl font-semibold mb-3">ArticleCard.Portrait</h3>
        <p class="text-muted-foreground mb-4">
          Preset: Vertical card with image on top.
        </p>
        <div class="bg-muted p-4 rounded-lg">
          <code class="text-sm">width?: string, height?: string, imageHeight?: string</code>
        </div>
      </div>

      <div class="border border-border rounded-lg p-6">
        <h3 class="text-xl font-semibold mb-3">ArticleCard.Hero</h3>
        <p class="text-muted-foreground mb-4">
          Preset: Full-width hero card with gradient background and optional badge (shown if badgeText provided).
        </p>
        <div class="bg-muted p-4 rounded-lg">
          <code class="text-sm">height?: string, badgeText?: string</code>
        </div>
      </div>

      <div class="border border-border rounded-lg p-6">
        <h3 class="text-xl font-semibold mb-3">ArticleCard.Neon</h3>
        <p class="text-muted-foreground mb-4">
          Preset: Portrait card with subtle glossy white neon top border effect, full background image, author info and reading time.
        </p>
        <div class="bg-muted p-4 rounded-lg">
          <code class="text-sm">width?: string, height?: string</code>
        </div>
      </div>

      <div class="border border-border rounded-lg p-6">
        <h3 class="text-xl font-semibold mb-3">ArticleCard.Medium</h3>
        <p class="text-muted-foreground mb-4">
          Preset: Horizontal card with image on right.
        </p>
        <div class="bg-muted p-4 rounded-lg">
          <code class="text-sm">imageSize?: "small" | "medium" | "large"</code>
        </div>
      </div>
    </div>
  </section>
</div>
