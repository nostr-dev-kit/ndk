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
    components,
    componentsTitle,
    componentsDescription,
    componentsSection,
    beforeShowcase,
    afterComponents,
    recipes,
    primitives,
    customSections,
    showcaseControls,
    emptyState,
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

<!-- Before Showcase Extension Point -->
{#if beforeShowcase}
  {@render beforeShowcase()}
{/if}

<!-- Showcase Section or Empty State -->
{#if showcaseComponents.length > 0}
  {#if showcaseComponents.some(c => c.orientation === 'vertical' || c.orientation === 'horizontal')}
    <!-- Use ComponentsShowcase if orientations are specified -->
    <ComponentsShowcase
      class="-mx-8 px-8"
      components={showcaseComponents}
    />
  {:else}
    <!-- Default to ComponentsShowcaseGrid -->
    <ComponentsShowcaseGrid components={showcaseComponents} />
  {/if}
{:else if emptyState}
  {@render emptyState()}
{/if}

<!-- Components Section (new simplified pattern) -->
{#if components}
  <SectionTitle
    title={componentsTitle || 'Components'}
    description={componentsDescription || 'Explore each variant in detail'}
  />

  <section class="py-12 space-y-16">
    {@render components()}
  </section>
{:else if componentsSection && componentsSection.cards.length > 0}
  <!-- Components Section (old pattern - backward compatibility) -->
  <SectionTitle
    title={componentsSection.title || 'Components'}
    description={componentsSection.description || 'Explore all components in detail'}
  />

  <section class="py-12 space-y-16">
    {#each componentsSection.cards as cardData, index (cardData.name)}
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

<!-- After Components Extension Point -->
{#if afterComponents}
  {@render afterComponents()}
{/if}

<!-- Recipes Section -->
{#if recipes}
  <SectionTitle
    title="Recipes"
    description="Common patterns and combinations using these components"
  />

  <section class="py-12 space-y-8">
    {@render recipes()}
  </section>
{/if}

<!-- Primitives Section -->
{#if primitives}
  {@render primitives()}
{/if}

<!-- Custom Sections (Anatomy, etc.) -->
{#if customSections}
  {@render customSections()}
{/if}