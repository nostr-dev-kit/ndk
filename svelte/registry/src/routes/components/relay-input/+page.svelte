<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import ComponentPageTemplate from '$lib/templates/ComponentPageTemplate.svelte';
  import ComponentsShowcaseGrid from '$site-components/ComponentsShowcaseGrid.svelte';
  import SectionTitle from '$site-components/SectionTitle.svelte';
  import ComponentCard from '$site-components/ComponentCard.svelte';
  import { relayInputMetadata } from '$lib/component-registry/relay-input';
  import type { ShowcaseBlock } from '$lib/templates/types';

  import RelayInputBlock from '$lib/registry/components/relay-input/relay-input.svelte';

  // Examples
  import BasicExample from './examples/basic.example.svelte';
  import WithLabelExample from './examples/with-label.example.svelte';
  import ValidationExample from './examples/validation.example.svelte';
  import DisabledExample from './examples/disabled.example.svelte';

  const ndk = getContext<NDKSvelte>('ndk');

  let blockDemoUrl = $state<string>('');

  // Block Presets showcase blocks
  const blockPresetsBlocks: ShowcaseBlock[] = [
    {
      name: 'Basic',
      description: 'Simple input with NIP-11',
      command: 'npx shadcn@latest add relay-input',
      preview: basicBlockPreview,
      cardData: relayInputMetadata.cards[0]
    },
    {
      name: 'With Label',
      description: 'Label and helper text',
      command: 'npx shadcn@latest add relay-input',
      preview: labelBlockPreview,
      cardData: relayInputMetadata.cards[1]
    },
    {
      name: 'With Error',
      description: 'Validation error state',
      command: 'npx shadcn@latest add relay-input',
      preview: errorBlockPreview,
      cardData: relayInputMetadata.cards[2]
    },
    {
      name: 'Disabled',
      description: 'Disabled input state',
      command: 'npx shadcn@latest add relay-input',
      preview: disabledBlockPreview,
      cardData: relayInputMetadata.cards[3]
    }
  ];

  // Component Usage showcase blocks
  const componentUsageBlocks: ShowcaseBlock[] = [
    {
      name: 'Basic',
      description: 'Basic component usage',
      command: 'npx shadcn@latest add relay-input',
      preview: basicComponentPreview,
      cardData: relayInputMetadata.cards[4]
    },
    {
      name: 'With Label',
      description: 'Component with label',
      command: 'npx shadcn@latest add relay-input',
      preview: withLabelPreview,
      cardData: relayInputMetadata.cards[5]
    },
    {
      name: 'With Validation',
      description: 'Component with validation',
      command: 'npx shadcn@latest add relay-input',
      preview: validationPreview,
      cardData: relayInputMetadata.cards[6]
    },
    {
      name: 'Disabled',
      description: 'Disabled component',
      command: 'npx shadcn@latest add relay-input',
      preview: disabledComponentPreview,
      cardData: relayInputMetadata.cards[7]
    }
  ];
</script>

<!-- Block Presets preview snippets -->
{#snippet basicBlockPreview()}
  <RelayInputBlock {ndk} bind:value={blockDemoUrl} />
{/snippet}

{#snippet labelBlockPreview()}
  <RelayInputBlock
    {ndk}
    bind:value={blockDemoUrl}
    label="Primary Relay"
    helperText="Enter the WebSocket URL of your preferred relay"
  />
{/snippet}

{#snippet errorBlockPreview()}
  <RelayInputBlock
    {ndk}
    bind:value={blockDemoUrl}
    label="Relay URL"
    error="Invalid relay URL format"
  />
{/snippet}

{#snippet disabledBlockPreview()}
  <RelayInputBlock
    {ndk}
    value="wss://relay.damus.io"
    label="Default Relay"
    helperText="This relay cannot be changed"
    disabled
  />
{/snippet}

<!-- Component Usage preview snippets -->
{#snippet basicComponentPreview()}
  <BasicExample />
{/snippet}

{#snippet withLabelPreview()}
  <WithLabelExample />
{/snippet}

{#snippet validationPreview()}
  <ValidationExample />
{/snippet}

{#snippet disabledComponentPreview()}
  <DisabledExample />
{/snippet}

<!-- Additional showcases section -->
{#snippet afterShowcase()}
  <SectionTitle
    title="Component Usage"
    description="Use individual components to build custom relay input experiences."
  />

  <ComponentsShowcaseGrid blocks={componentUsageBlocks} />
{/snippet}

<!-- Custom sections for Block Variants, Component Variants, and Features -->
{#snippet customSections()}
  <SectionTitle title="Block Variants" description="Explore each relay input block variant in detail" />

  <section class="py-12 space-y-16">
    <ComponentCard data={relayInputMetadata.cards[0]}>
      {#snippet preview()}
        <RelayInputBlock {ndk} bind:value={blockDemoUrl} />
      {/snippet}
    </ComponentCard>

    <ComponentCard data={relayInputMetadata.cards[1]}>
      {#snippet preview()}
        <RelayInputBlock
          {ndk}
          bind:value={blockDemoUrl}
          label="Primary Relay"
          helperText="Enter the WebSocket URL of your preferred relay"
        />
      {/snippet}
    </ComponentCard>

    <ComponentCard data={relayInputMetadata.cards[2]}>
      {#snippet preview()}
        <RelayInputBlock
          {ndk}
          bind:value={blockDemoUrl}
          label="Relay URL"
          error="Invalid relay URL format"
        />
      {/snippet}
    </ComponentCard>

    <ComponentCard data={relayInputMetadata.cards[3]}>
      {#snippet preview()}
        <RelayInputBlock
          {ndk}
          value="wss://relay.damus.io"
          label="Default Relay"
          helperText="This relay cannot be changed"
          disabled
        />
      {/snippet}
    </ComponentCard>
  </section>

  <SectionTitle title="Component Variants" description="Explore each component variant in detail" />

  <section class="py-12 space-y-16">
    <ComponentCard data={relayInputMetadata.cards[4]}>
      {#snippet preview()}
        <BasicExample />
      {/snippet}
    </ComponentCard>

    <ComponentCard data={relayInputMetadata.cards[5]}>
      {#snippet preview()}
        <WithLabelExample />
      {/snippet}
    </ComponentCard>

    <ComponentCard data={relayInputMetadata.cards[6]}>
      {#snippet preview()}
        <ValidationExample />
      {/snippet}
    </ComponentCard>

    <ComponentCard data={relayInputMetadata.cards[7]}>
      {#snippet preview()}
        <DisabledExample />
      {/snippet}
    </ComponentCard>
  </section>

  <section class="mt-16">
    <h2 class="text-3xl font-bold mb-4">Features</h2>
    <div class="grid gap-4 md:grid-cols-2">
      <div class="border rounded-lg p-4">
        <h3 class="font-semibold mb-2">NIP-11 Autocomplete</h3>
        <p class="text-sm text-muted-foreground">
          Automatically fetches and displays relay metadata including name, icon, and description.
        </p>
      </div>
      <div class="border rounded-lg p-4">
        <h3 class="font-semibold mb-2">Icon Replacement</h3>
        <p class="text-sm text-muted-foreground">
          Replaces the input icon with the relay's icon from NIP-11 data when available.
        </p>
      </div>
      <div class="border rounded-lg p-4">
        <h3 class="font-semibold mb-2">URL Validation</h3>
        <p class="text-sm text-muted-foreground">
          Built-in validation for WebSocket URLs (ws:// and wss://) with visual feedback.
        </p>
      </div>
      <div class="border rounded-lg p-4">
        <h3 class="font-semibold mb-2">Debounced Loading</h3>
        <p class="text-sm text-muted-foreground">
          Intelligent debouncing prevents excessive NIP-11 requests while typing.
        </p>
      </div>
    </div>
  </section>
{/snippet}

<ComponentPageTemplate
  metadata={relayInputMetadata}
  {ndk}
  showcaseBlocks={blockPresetsBlocks}
  {afterShowcase}
  {customSections}
  apiDocs={relayInputMetadata.apiDocs}
/>
