<script lang="ts">
  import { getContext, type Snippet } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import PageTitle from '$site-components/PageTitle.svelte';
  import ComponentsShowcaseGrid from '$site-components/ComponentsShowcaseGrid.svelte';
  import ComponentsShowcase from '$site-components/ComponentsShowcase.svelte';
  import SectionTitle from '$site-components/SectionTitle.svelte';
  import ComponentCard from '$site-components/ComponentCard.svelte';
  import type { ComponentPageTemplateProps } from './types';

  let {
    metadata,
    ndk: propNdk,
    showcaseComponents = [],
    emptyState,
    overview,
    componentsSection,
    recipes,
    anatomy,
    primitives,
    children
  }: ComponentPageTemplateProps = $props();

  // Get NDK from context if not provided as prop
  const ndk = propNdk || getContext<NDKSvelte>('ndk');
</script>

<!-- Header Section -->
<PageTitle title={metadata.title} subtitle={metadata.description}>
  {#if children}
    {@render children()}
  {/if}
</PageTitle>

<div class="flex flex-col w-full divide-y divide-border">
  <!-- Showcase Section -->
  {#if showcaseComponents.length > 0}
    {#if showcaseComponents.some(c => c.orientation === 'vertical' || c.orientation === 'horizontal')}
      <ComponentsShowcase
        class="-mx-8 px-8"
        components={showcaseComponents}
      />
    {:else}
      <ComponentsShowcaseGrid components={showcaseComponents} />
    {/if}
  {:else if emptyState}
    {@render emptyState()}
  {/if}

  <!-- Overview Section -->
  {#if overview}
    <section class="py-8">
      <SectionTitle title="Overview" />
      {@render overview()}
    </section>
  {/if}

  <!-- Components Section -->
  {#if componentsSection?.cards.length}
    <section class="py-8">
      <SectionTitle title="Components" />
      {#each componentsSection.cards as cardData (cardData.name)}
        <ComponentCard data={cardData}>
          {#snippet preview()}
            {#if componentsSection.previews?.[cardData.name]}
              {@render componentsSection.previews[cardData.name]()}
            {:else}
              <div class="text-muted-foreground">
                Preview not defined for {cardData.name}
              </div>
            {/if}
          {/snippet}
        </ComponentCard>
      {/each}
    </section>
  {/if}

  <!-- Recipes Section -->
  {#if recipes}
    <section class="py-8">
      <SectionTitle title="Recipes" />
      {@render recipes()}
    </section>
  {/if}

  <!-- Anatomy Section -->
  {#if anatomy}
    <section class="py-8">
      <SectionTitle title="Anatomy" />
      {@render anatomy()}
    </section>
  {/if}

  <!-- Primitives Section -->
  {#if primitives}
    <section class="py-8">
      <SectionTitle title="Primitives" />
      {@render primitives()}
    </section>
  {/if}
</div>
