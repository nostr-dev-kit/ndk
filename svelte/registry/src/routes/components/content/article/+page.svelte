<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { NDKArticle, NDKKind } from '@nostr-dev-kit/ndk';
  import { EditProps } from '$lib/site-components/edit-props';
  import ComponentsShowcaseGrid from '$site-components/ComponentsShowcaseGrid.svelte';
  import ComponentCard from '$site-components/ComponentCard.svelte';
  import ComponentPageSectionTitle from '$site-components/ComponentPageSectionTitle.svelte';
  import ComponentAPI from '$site-components/component-api.svelte';

  // Import examples
  import BasicExample from './examples/basic.svelte';
  import WithClickExample from './examples/with-click.svelte';

  const ndk = getContext<NDKSvelte>('ndk');

  let article = $state<NDKArticle | null | undefined>();

  const basicData = {
    name: 'article-content-basic',
    title: 'Basic Usage',
    description: 'Render article with highlights.',
    richDescription: 'Render article content with automatic highlight subscription. Select text to create highlights.',
    command: 'npx shadcn@latest add article-content',
    apiDocs: []
  };

  const withClickData = {
    name: 'article-content-with-click',
    title: 'With Click Handler',
    description: 'Handle highlight clicks.',
    richDescription: 'Handle highlight clicks to show details, open drawers, etc. You can also filter highlights using the highlightFilter callback.',
    command: 'npx shadcn@latest add article-content',
    apiDocs: []
  };
</script>

<div class="px-8">
  <!-- Header -->
  <div class="mb-12 pt-8">
    <div class="flex items-start justify-between gap-4 mb-4">
      <h1 class="text-4xl font-bold">ArticleContent</h1>
      <EditProps.Root>
        <EditProps.Prop name="Sample Article" type="article" bind:value={article} default="naddr1qvzqqqr4gupzpv3hez4ctpnahwghs5jeh2zvyrggw5s4e5p2ct0407l6v58kv87dqyvhwumn8ghj7urjv4kkjatd9ec8y6tdv9kzumn9wshsq9fdfppksd62fpm5zdrntfyywjr4ge0454zx353ujx" />
        <EditProps.Button>Edit Examples</EditProps.Button>
      </EditProps.Root>
    </div>
    <p class="text-lg text-muted-foreground mb-6">
      Render NIP-23 article content with markdown support, inline highlights, text selection, and
      floating avatars. Automatically subscribes to highlights and allows users to create new
      highlights by selecting text.
    </p>
  </div>

  {#if !article}
    <div class="flex items-center justify-center py-12">
      <div class="text-muted-foreground">Loading articles...</div>
    </div>
  {:else}
    <!-- Examples Showcase -->
    {#snippet basicPreview()}
      <div class="max-h-[min(500px,80vh)] overflow-y-auto">
        <BasicExample {article} />
      </div>
    {/snippet}

    {#snippet withClickPreview()}
      <div class="max-h-[min(500px,80vh)] overflow-y-auto">
        <WithClickExample {article} />
      </div>
    {/snippet}

    <ComponentPageSectionTitle
      title="Examples"
      description="Different ways to use the ArticleContent component."
    />

    <ComponentsShowcaseGrid
      blocks={[
        {
          name: 'Basic Usage',
          description: 'With highlight subscription',
          command: 'npx shadcn@latest add article-content',
          preview: basicPreview,
          cardData: basicData
        },
        {
          name: 'With Click Handler',
          description: 'Handle highlight clicks',
          command: 'npx shadcn@latest add article-content',
          preview: withClickPreview,
          cardData: withClickData
        }
      ]}
    />

    <!-- Features Section -->
    <section class="mb-16">
      <h2 class="text-3xl font-bold mb-4">Features</h2>
      <div class="grid gap-4 md:grid-cols-2">
        <div class="border border-border rounded-lg p-6 bg-card">
          <h3 class="text-xl font-semibold mb-2">Markdown Support</h3>
          <p class="text-muted-foreground">
            Automatically detects and renders markdown content with proper typography and styling.
          </p>
        </div>
        <div class="border border-border rounded-lg p-6 bg-card">
          <h3 class="text-xl font-semibold mb-2">Inline Highlights</h3>
          <p class="text-muted-foreground">
            Displays NIP-84 highlights inline within the article text with visual emphasis.
          </p>
        </div>
        <div class="border border-border rounded-lg p-6 bg-card">
          <h3 class="text-xl font-semibold mb-2">Text Selection</h3>
          <p class="text-muted-foreground">
            Select text to create new highlights with a floating toolbar.
          </p>
        </div>
        <div class="border border-border rounded-lg p-6 bg-card">
          <h3 class="text-xl font-semibold mb-2">Floating Avatars</h3>
          <p class="text-muted-foreground">
            Shows avatars of users who highlighted each section.
          </p>
        </div>
      </div>
    </section>

    <!-- Components Section -->
    <ComponentPageSectionTitle title="Components" description="Explore each variant in detail" />

    <section class="py-12 space-y-16">
      <ComponentCard inline data={basicData}>
        {#snippet preview()}
          <div class="max-h-[min(500px,80vh)] overflow-y-auto">
            <BasicExample {article} />
          </div>
        {/snippet}
      </ComponentCard>

      <ComponentCard inline data={withClickData}>
        {#snippet preview()}
          <div class="max-h-[min(500px,80vh)] overflow-y-auto">
            <WithClickExample {article} />
          </div>
        {/snippet}
      </ComponentCard>
    </section>

    <!-- Component API -->
    <ComponentAPI
      components={[
        {
          name: 'ArticleContent',
          description: 'Render NIP-23 article content with markdown support and inline highlights',
          importPath: "import { ArticleContent } from '$lib/registry/ui/article-content'",
          props: [
            {
              name: 'ndk',
              type: 'NDKSvelte',
              description: 'NDK instance (optional, falls back to context)'
            },
            {
              name: 'article',
              type: 'NDKArticle',
              required: true,
              description: 'The article to render'
            },
            {
              name: 'highlightFilter',
              type: '(highlight: NDKHighlight) => boolean',
              description: 'Optional filter function to control which highlights are displayed'
            },
            {
              name: 'onHighlightClick',
              type: '(highlight: NDKHighlight) => void',
              description: 'Callback when a highlight is clicked'
            },
            {
              name: 'class',
              type: 'string',
              default: "''",
              description: 'Additional CSS classes'
            }
          ]
        }
      ]}
    />
  {/if}
</div>
