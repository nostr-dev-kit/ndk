<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { EditProps } from '$lib/site-components/edit-props';
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
    editPropsSection,
    beforeShowcase,
    afterShowcase,
    beforeComponents,
    afterComponents,
    customSections,
    showcaseControls,
    customContent
  }: ComponentPageTemplateProps = $props();

  // Get NDK from context if not provided as prop
  const ndk = propNdk || getContext<NDKSvelte>('ndk');
</script>

<!-- If custom content is provided, use that instead of template -->
{#if customContent}
  {@render customContent()}
{:else}
  <div class="px-8">
    <!-- Header Section -->
    <div class="mb-12 pt-8">
      <div class="flex items-start justify-between gap-4 mb-4">
        <h1 class="text-4xl font-bold">{metadata.title}</h1>
      </div>
      <p class="text-lg text-muted-foreground mb-6">
        {metadata.description}
      </p>

      <!-- EditProps Section -->
      {#if editPropsSection}
        {@render editPropsSection()}
      {:else if metadata.editProps && metadata.editProps.length > 0}
        <EditProps.Root>
          {#each metadata.editProps as prop (prop.name || prop)}
            <EditProps.Prop
              name={prop.name}
              type={prop.type}
              default={prop.default}
              options={prop.options}
              value={prop.bind?.get()}
              onchange={(value) => prop.bind?.set(value)}
            />
          {/each}
          <EditProps.Button>Edit Examples</EditProps.Button>
        </EditProps.Root>
      {/if}
    </div>

    <!-- Before Showcase Extension Point -->
    {#if beforeShowcase}
      {@render beforeShowcase()}
    {/if}

    <!-- Showcase Section -->
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
        {#each componentsSection.cards as cardData, index (cardData.id || index)}
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
{/if}