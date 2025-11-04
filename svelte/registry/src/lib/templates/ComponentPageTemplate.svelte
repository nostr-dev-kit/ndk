<script lang="ts">
  import { getContext, type Snippet } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import PageTitle from '$site-components/PageTitle.svelte';
  import ComponentsShowcaseGrid from '$site-components/ComponentsShowcaseGrid.svelte';
  import ComponentsShowcase from '$site-components/ComponentsShowcase.svelte';
  import ComponentPageSectionTitle from '$site-components/ComponentPageSectionTitle.svelte';
  import ComponentCard from '$site-components/ComponentCard.svelte';
  import ComponentAPI from '$site-components/component-api.svelte';
  import type { ComponentPageTemplateProps } from './types';

  let {
    metadata,
    ndk: propNdk,
    showcaseBlocks = [],
    showcaseComponent,
    componentsSection,
    apiDocs = [],
    beforeShowcase,
    afterShowcase,
    beforeComponents,
    afterComponents,
    customSections,
    showcaseControls,
    emptyState,
    children
  }: ComponentPageTemplateProps = $props();

  // Get NDK from context if not provided as prop
  const ndk = propNdk || getContext<NDKSvelte>('ndk');
</script>

<div class="px-8">
  <!-- Header Section -->
  <PageTitle title={metadata.title} subtitle={metadata.description}>
    {#if children}
      {@render children()}
    {/if}
  </PageTitle>

  <!-- Before Showcase Extension Point -->
  {#if beforeShowcase}
    {@render beforeShowcase()}
  {/if}

  <!-- Showcase Section or Empty State -->
  {#if showcaseBlocks.length > 0}
    <ComponentPageSectionTitle
      title={metadata.showcaseTitle || 'Showcase'}
      description={metadata.showcaseDescription}
    />

    {#if showcaseComponent}
      {@const Component = showcaseComponent}
      <Component blocks={showcaseBlocks} />
    {:else if showcaseBlocks.some(b => b.orientation === 'vertical' || b.orientation === 'horizontal')}
      <!-- Use ComponentsShowcase if orientations are specified -->
      <ComponentsShowcase
        class="-mx-8 px-8"
        blocks={showcaseBlocks}
      />
    {:else}
      <!-- Default to ComponentsShowcaseGrid -->
      <ComponentsShowcaseGrid blocks={showcaseBlocks}>
        {#if showcaseControls}
          {#snippet control(block)}
            {@render showcaseControls(block)}
          {/snippet}
        {/if}
      </ComponentsShowcaseGrid>
    {/if}
  {:else if emptyState}
    {@render emptyState()}
  {/if}

  <!-- After Showcase Extension Point -->
  {#if afterShowcase}
    {@render afterShowcase()}
  {/if}

  <!-- Before Components Extension Point -->
  {#if beforeComponents}
    {@render beforeComponents()}
  {/if}

  <!-- Components Section -->
  {#if componentsSection && componentsSection.cards.length > 0}
    <ComponentPageSectionTitle
      title={componentsSection.title || 'Components'}
      description={componentsSection.description || 'Explore each variant in detail'}
    />

    <section class="py-12 space-y-16">
      {#each componentsSection.cards as cardData, index (cardData.name)}
        <ComponentCard inline data={cardData}>
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

  <!-- After Components Extension Point -->
  {#if afterComponents}
    {@render afterComponents()}
  {/if}

  <!-- Custom Sections (Anatomy, Primitives, etc.) -->
  {#if customSections}
    {@render customSections()}
  {/if}
</div>