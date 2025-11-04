<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import ComponentsShowcaseGrid from '$site-components/ComponentsShowcaseGrid.svelte';
  import ComponentPageSectionTitle from '$site-components/ComponentPageSectionTitle.svelte';
  import * as ComponentAnatomy from '$site-components/component-anatomy/index.js';
  import ComponentCard from '$site-components/ComponentCard.svelte';
  import type { UIPrimitivePageTemplateProps } from './types';

  let {
    metadata,
    ndk: propNdk,
    anatomyPreview,
    beforeAnatomy,
    afterAnatomy,
    customSections,
    customContent
  }: UIPrimitivePageTemplateProps = $props();

  // Get NDK from context if not provided as prop
  const ndk = propNdk || getContext<NDKSvelte>('ndk');

  // Transform primitives to showcase blocks
  const showcaseBlocks = $derived(metadata.primitives.map(primitive => ({
    name: primitive.name,
    description: primitive.description,
    command: '', // UI primitives don't have install commands
    preview: primitive.preview,
    cardData: {
      name: primitive.name,
      title: primitive.title,
      description: primitive.description,
      apiDocs: primitive.apiDocs || []
    }
  })));
</script>

<!-- If custom content is provided, use that instead of template -->
{#if customContent}
  {@render customContent()}
{:else}
  <div class="max-w-[900px] mx-auto px-8">
    <!-- Header Section -->
    <header class="mb-12 pt-8">
      <div class="flex gap-2 mb-4">
        <span class="px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs font-semibold">
          UI Primitive
        </span>
        {#if metadata.nips && metadata.nips.length > 0}
          {#each metadata.nips as nip}
            <span class="px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
              NIP-{nip}
            </span>
          {/each}
        {/if}
      </div>

      <h1 class="text-5xl font-bold mb-4 bg-gradient-to-br from-primary to-primary/70 bg-clip-text text-transparent">
        {metadata.title}
      </h1>

      <p class="text-lg text-muted-foreground leading-relaxed mb-6">
        {metadata.description}
      </p>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="flex flex-col gap-1 p-4 border border-border rounded-lg bg-background">
          <strong class="font-semibold text-foreground">Headless</strong>
          <span class="text-sm text-muted-foreground">No styling opinions - bring your own CSS</span>
        </div>
        <div class="flex flex-col gap-1 p-4 border border-border rounded-lg bg-background">
          <strong class="font-semibold text-foreground">Composable</strong>
          <span class="text-sm text-muted-foreground">Mix and match primitives as needed</span>
        </div>
        <div class="flex flex-col gap-1 p-4 border border-border rounded-lg bg-background">
          <strong class="font-semibold text-foreground">Reactive</strong>
          <span class="text-sm text-muted-foreground">Automatically updates with data changes</span>
        </div>
      </div>
    </header>

    <!-- Installation Section -->
    <section class="mb-12">
      <h2 class="text-2xl font-semibold mb-4">Installation</h2>
      <pre class="p-4 bg-muted rounded-lg overflow-x-auto"><code class="text-sm font-mono">{metadata.importPath}</code></pre>
    </section>

    <!-- Primitives Grid Showcase -->
    {#if showcaseBlocks.length > 0}
      <ComponentPageSectionTitle
        title="Primitives"
        description="Available components in this primitive namespace"
      />
      <ComponentsShowcaseGrid blocks={showcaseBlocks} />
    {/if}

    <!-- Before Anatomy Extension Point -->
    {#if beforeAnatomy}
      {@render beforeAnatomy()}
    {/if}

    <!-- Anatomy Section (Mandatory) -->
    <section class="mt-16">
      <ComponentPageSectionTitle
        title="Anatomy"
        description="Interactive layer view of the primitive composition"
      />
      <ComponentAnatomy.Root>
        <ComponentAnatomy.Preview>
          {@render anatomyPreview()}
        </ComponentAnatomy.Preview>
        <ComponentAnatomy.DetailPanel layers={metadata.anatomyLayers} />
      </ComponentAnatomy.Root>
    </section>

    <!-- After Anatomy Extension Point -->
    {#if afterAnatomy}
      {@render afterAnatomy()}
    {/if}

    <!-- Detailed Primitives with API docs -->
    {#if metadata.primitives.length > 0}
      <section class="mt-16">
        <ComponentPageSectionTitle
          title="API Reference"
          description="Detailed API documentation for each primitive"
        />
        <div class="py-12 space-y-16">
          {#each metadata.primitives as primitive}
            <ComponentCard inline data={{
              name: primitive.name,
              title: primitive.title,
              description: primitive.description,
              apiDocs: primitive.apiDocs || []
            }}>
              {#snippet preview()}
                {#if primitive.preview}
                  {@render primitive.preview()}
                {:else}
                  <div class="text-muted-foreground text-sm">
                    No preview available for {primitive.title}
                  </div>
                {/if}
              {/snippet}
            </ComponentCard>
          {/each}
        </div>
      </section>
    {/if}

    <!-- Custom Sections Extension Point -->
    {#if customSections}
      {@render customSections()}
    {/if}
  </div>
{/if}
