<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import ComponentPageTemplate from '$lib/templates/ComponentPageTemplate.svelte';
  import ComponentsShowcaseGrid from '$site-components/ComponentsShowcaseGrid.svelte';
  import SectionTitle from '$site-components/SectionTitle.svelte';
  import { inputMetadata } from '$lib/component-registry/input';
  import type { ShowcaseBlock } from '$lib/templates/types';

  // Import code examples
  import userSearchComboboxCode from './user-search-combobox.example?raw';
  import customTextareaCode from './custom-textarea.example?raw';
  import composablePartsCode from './composable-parts.example?raw';
  import builderBasicCode from './builder-basic.example?raw';

  import UserSearchCombobox from '$lib/registry/components/user-search-combobox/user-search-combobox.svelte';
  import CustomTextarea from './examples/custom-textarea.example.svelte';
  import ComposableParts from './examples/composable-parts.example.svelte';
  import BuilderBasic from './examples/builder-basic.example.svelte';

  const ndk = getContext<NDKSvelte>('ndk');

  let useRelaySearch = $state<boolean>(false);
  let relayUrl = $state<string>('wss://relay.nostr.band');

  // Blocks showcase
  const blocksShowcaseBlocks: ShowcaseBlock[] = [
    {
      name: 'Search Combobox',
      description: 'Accessible keyboard nav',
      command: 'npx shadcn@latest add user-search-combobox',
      preview: searchComboboxPreview,
      cardData: inputMetadata.cards[0]
    },
    {
      name: 'Custom Textarea',
      description: 'Custom input snippet',
      command: 'npx shadcn@latest add user-search-combobox',
      preview: customTextareaPreview,
      cardData: inputMetadata.cards[1]
    }
  ];

  // UI Primitives showcase
  const primitivesShowcaseBlocks: ShowcaseBlock[] = [
    {
      name: 'Basic Usage',
      description: 'Minimal primitives',
      command: 'npx shadcn@latest add user-input',
      preview: composablePartsPreview,
      cardData: inputMetadata.cards[2]
    }
  ];

  // Builder showcase
  const builderShowcaseBlocks: ShowcaseBlock[] = [
    {
      name: 'Basic Usage',
      description: 'Full control with builder',
      command: 'npx shadcn@latest add user-input',
      preview: builderBasicPreview,
      cardData: inputMetadata.cards[3]
    }
  ];
</script>

<!-- Preview snippets for Blocks -->
{#snippet searchComboboxPreview()}
  <div class="max-w-md w-full">
    <UserSearchCombobox {ndk} placeholder="Search for a user..." />
  </div>
{/snippet}

{#snippet customTextareaPreview()}
  <CustomTextarea {ndk} />
{/snippet}

<!-- Preview snippet for UI Primitives -->
{#snippet composablePartsPreview()}
  <ComposableParts {ndk} />
{/snippet}

<!-- Preview snippet for Builder -->
{#snippet builderBasicPreview()}
  <div class="space-y-4">
    <div class="flex gap-4 flex-wrap">
      <label class="flex items-center gap-2">
        <input type="checkbox" bind:checked={useRelaySearch} />
        <span>Use Relay Search (NIP-50)</span>
      </label>
      <label class="flex flex-col gap-1">
        <span class="text-sm">Relay URL:</span>
        <input
          type="text"
          bind:value={relayUrl}
          disabled={!useRelaySearch}
          class="px-3 py-1.5 border border-border rounded-md bg-background text-foreground text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          style="min-width: 250px;"
        />
      </label>
    </div>
    <BuilderBasic {ndk} {useRelaySearch} {relayUrl} />
  </div>
{/snippet}

<!-- Additional showcases for UI Primitives and Builder -->
{#snippet afterShowcase()}
  <SectionTitle
    title="UI Primitives"
    description="Primitive components for building custom user input layouts."
  />

  <ComponentsShowcaseGrid blocks={primitivesShowcaseBlocks} />

  <SectionTitle
    title="Builder"
    description="Use createUserInput() builder for full control over rendering."
  />

  <ComponentsShowcaseGrid blocks={builderShowcaseBlocks} />
{/snippet}

<!-- Component previews for Components section -->
{#snippet searchComboboxComponentPreview()}
  <div class="max-w-md w-full">
    <UserSearchCombobox {ndk} placeholder="Search for a user..." />
  </div>
{/snippet}

{#snippet customTextareaComponentPreview()}
  <CustomTextarea {ndk} />
{/snippet}

{#snippet composablePartsComponentPreview()}
  <ComposableParts {ndk} />
{/snippet}

{#snippet builderBasicComponentPreview()}
  <div class="space-y-4">
    <div class="flex gap-4 flex-wrap">
      <label class="flex items-center gap-2">
        <input type="checkbox" bind:checked={useRelaySearch} />
        <span>Use Relay Search (NIP-50)</span>
      </label>
      <label class="flex flex-col gap-1">
        <span class="text-sm">Relay URL:</span>
        <input
          type="text"
          bind:value={relayUrl}
          disabled={!useRelaySearch}
          class="px-3 py-1.5 border border-border rounded-md bg-background text-foreground text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          style="min-width: 250px;"
        />
      </label>
    </div>
    <BuilderBasic {ndk} {useRelaySearch} {relayUrl} />
  </div>
{/snippet}

<ComponentPageTemplate
  metadata={inputMetadata}
  {ndk}
  showcaseBlocks={blocksShowcaseBlocks}
  {afterShowcase}
  componentsSection={{
    cards: [
      { ...inputMetadata.cards[0], code: userSearchComboboxCode },
      { ...inputMetadata.cards[1], code: customTextareaCode },
      { ...inputMetadata.cards[2], code: composablePartsCode },
      { ...inputMetadata.cards[3], code: builderBasicCode }
    ],
    previews: {
      'user-search-combobox': searchComboboxComponentPreview,
      'custom-textarea': customTextareaComponentPreview,
      'composable-parts': composablePartsComponentPreview,
      'builder-basic': builderBasicComponentPreview
    }
  }}
  apiDocs={inputMetadata.apiDocs}
/>
