<script lang="ts">
	import Demo from '$site-components/Demo.svelte';
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { NDKArticle, NDKKind } from '@nostr-dev-kit/ndk';
  import { EditProps } from '$lib/site-components/edit-props';
  import ComponentAPI from '$site-components/component-api.svelte';

  // Import examples
  import BasicExample from './examples/basic.svelte';
  import BasicCodeRaw from './examples/basic-code.svelte?raw';
  import WithClickExample from './examples/with-click.svelte';
  import WithClickRaw from './examples/with-click.svelte?raw';

  let article = $state<NDKArticle | null | undefined>();
</script>

<div class="container mx-auto p-8 max-w-7xl">
  <!-- Header -->
  <div class="mb-12">
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
    <!-- Usage Examples Section -->
    <section class="mb-16">
      <h2 class="text-3xl font-bold mb-2">Examples</h2>
      <p class="text-muted-foreground mb-8">
        Different ways to use the ArticleContent component.
      </p>

      <div class="space-y-8">
        <!-- Basic Usage -->
        <Demo
          title="Basic Usage"
          description="Render article content with automatic highlight subscription. Select text to create highlights."
          code={BasicCodeRaw}
        >
          <div class="max-h-[min(500px,80vh)] overflow-y-auto">
            <BasicExample article={article} />
          </div>
        </Demo>

        <!-- With Click Handler -->
        <Demo
          title="With Click Handler"
          description="Handle highlight clicks to show details, open drawers, etc. You can also filter highlights using the highlightFilter callback."
          code={WithClickRaw}
        >
          <div class="max-h-[min(500px,80vh)] overflow-y-auto">
            <WithClickExample article={article} />
          </div>
        </Demo>
      </div>
    </section>

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

    <!-- API Section -->
    <section class="mb-16">
      <h2 class="text-3xl font-bold mb-4">Component API</h2>
      <ComponentAPI
        componentName="ArticleContent"
        props={[
          {
            name: 'ndk',
            type: 'NDKSvelte',
            required: false,
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
            required: false,
            description: 'Optional filter function to control which highlights are displayed'
          },
          {
            name: 'onHighlightClick',
            type: '(highlight: NDKHighlight) => void',
            required: false,
            description: 'Callback when a highlight is clicked'
          },
          {
            name: 'class',
            type: 'string',
            required: false,
            description: 'Additional CSS classes'
          }
        ]}
      />
    </section>
  {/if}
</div>
