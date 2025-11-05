<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import ComponentPageTemplate from '$lib/templates/ComponentPageTemplate.svelte';
  import ComponentsShowcaseGrid from '$site-components/ComponentsShowcaseGrid.svelte';
  import SectionTitle from '$site-components/SectionTitle.svelte';
  import { relaySelectorMetadata } from '$lib/component-registry/relay-selector';
  import type { ShowcaseBlock } from '$lib/templates/types';

  import RelaySelectorPopover from '$lib/registry/components/relay-selector/relay-selector-popover.svelte';
  import RelaySelectorInline from '$lib/registry/components/relay-selector/relay-selector.svelte';

  // UI examples
  import UIBasic from './examples/basic.example.svelte';
  import UIFull from './examples/ui-full.example.svelte';

  const ndk = getContext<NDKSvelte>('ndk');

  let popoverSelected = $state<string[]>([]);
  let inlineSelected = $state<string[]>([]);

  // Blocks showcase
  const blocksShowcaseBlocks: ShowcaseBlock[] = [
    {
      name: 'Popover',
      description: 'Compact dropdown selector',
      command: 'npx shadcn@latest add relay-selector-popover',
      preview: popoverPreview,
      cardData: relaySelectorMetadata.cards[0]
    },
    {
      name: 'Inline',
      description: 'Inline without popover',
      command: 'npx shadcn@latest add relay-selector-inline',
      preview: inlinePreview,
      cardData: relaySelectorMetadata.cards[1]
    }
  ];

  // UI Primitives showcase
  const primitivesShowcaseBlocks: ShowcaseBlock[] = [
    {
      name: 'Basic Usage',
      description: 'Essential primitives',
      command: 'npx shadcn@latest add relay-selector',
      preview: basicPreview,
      cardData: relaySelectorMetadata.cards[2]
    },
    {
      name: 'Full Composition',
      description: 'All primitives together',
      command: 'npx shadcn@latest add relay-selector',
      preview: fullPreview,
      cardData: relaySelectorMetadata.cards[3]
    }
  ];
</script>

<!-- Preview snippets for blocks -->
{#snippet popoverPreview()}
  <div class="flex flex-wrap gap-4">
    <RelaySelectorPopover {ndk} bind:selected={popoverSelected} />
  </div>
{/snippet}

{#snippet inlinePreview()}
  <RelaySelectorInline
    {ndk}
    bind:selected={inlineSelected}
    label="Active Relays"
    showSelectedChips={true}
    helperText="Selected relays will be used for fetching and publishing"
  />
{/snippet}

<!-- Preview snippets for UI Primitives -->
{#snippet basicPreview()}
  <UIBasic />
{/snippet}

{#snippet fullPreview()}
  <UIFull />
{/snippet}

<!-- Additional showcase for UI Primitives -->
{#snippet afterShowcase()}
  <SectionTitle
    title="UI Primitives"
    description="Primitive components for building custom relay selector layouts."
  />

  <ComponentsShowcaseGrid blocks={primitivesShowcaseBlocks} />
{/snippet}

<!-- Component previews for Components section -->
{#snippet popoverComponentPreview()}
  <div class="flex flex-wrap gap-4">
    <RelaySelectorPopover {ndk} bind:selected={popoverSelected} />
  </div>
{/snippet}

{#snippet inlineComponentPreview()}
  <RelaySelectorInline
    {ndk}
    bind:selected={inlineSelected}
    label="Active Relays"
    showSelectedChips={true}
    helperText="Selected relays will be used for fetching and publishing"
  />
{/snippet}

{#snippet basicComponentPreview()}
  <UIBasic />
{/snippet}

{#snippet fullComponentPreview()}
  <UIFull />
{/snippet}

<ComponentPageTemplate
  metadata={relaySelectorMetadata}
  {ndk}
  showcaseBlocks={blocksShowcaseBlocks}
  {afterShowcase}
  componentsSection={{
    cards: relaySelectorMetadata.cards,
    previews: {
      'relay-selector-popover': popoverComponentPreview,
      'relay-selector-inline': inlineComponentPreview,
      'relay-selector-basic': basicComponentPreview,
      'relay-selector-full': fullComponentPreview
    }
  }}
  apiDocs={relaySelectorMetadata.apiDocs}
/>
