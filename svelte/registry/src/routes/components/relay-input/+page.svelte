<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import RelayInputBlock from '$lib/registry/components/relay-input/relay-input.svelte';
  import ComponentsShowcaseGrid from '$site-components/ComponentsShowcaseGrid.svelte';
  import ComponentPageSectionTitle from '$site-components/ComponentPageSectionTitle.svelte';
  import ComponentCard from '$site-components/ComponentCard.svelte';
  import ComponentAPI from '$site-components/component-api.svelte';

  // Examples
  import BasicExample from './examples/basic.svelte';
  import WithLabelExample from './examples/with-label.svelte';
  import ValidationExample from './examples/validation.svelte';
  import DisabledExample from './examples/disabled.svelte';

  const ndk = getContext<NDKSvelte>('ndk');

  let blockDemoUrl = $state<string>('');

  const basicBlockCardData = {
    name: 'relay-input-basic',
    title: 'Basic Input Block',
    description: 'Simple relay input with NIP-11.',
    richDescription: 'Pre-configured relay input block with NIP-11 autocomplete ready for use.',
    command: 'npx shadcn@latest add relay-input',
    apiDocs: []
  };

  const labelBlockCardData = {
    name: 'relay-input-label',
    title: 'With Label and Helper',
    description: 'Input with label and helper text.',
    richDescription: 'Relay input block with label and helper text for better UX.',
    command: 'npx shadcn@latest add relay-input',
    apiDocs: []
  };

  const errorBlockCardData = {
    name: 'relay-input-error',
    title: 'With Validation Error',
    description: 'Input showing validation error.',
    richDescription: 'Relay input block displaying validation error state.',
    command: 'npx shadcn@latest add relay-input',
    apiDocs: []
  };

  const disabledBlockCardData = {
    name: 'relay-input-disabled',
    title: 'Disabled Input',
    description: 'Disabled relay input state.',
    richDescription: 'Relay input block in disabled state for read-only scenarios.',
    command: 'npx shadcn@latest add relay-input',
    apiDocs: []
  };

  const basicCardData = {
    name: 'relay-input-component-basic',
    title: 'Basic Component',
    description: 'Basic relay input component.',
    richDescription: 'Use individual components to build custom relay input experiences.',
    command: 'npx shadcn@latest add relay-input',
    apiDocs: []
  };

  const withLabelCardData = {
    name: 'relay-input-component-label',
    title: 'With Label',
    description: 'Component with label.',
    richDescription: 'Relay input component with custom label implementation.',
    command: 'npx shadcn@latest add relay-input',
    apiDocs: []
  };

  const validationCardData = {
    name: 'relay-input-component-validation',
    title: 'With Validation',
    description: 'Component with validation.',
    richDescription: 'Relay input component with custom validation logic.',
    command: 'npx shadcn@latest add relay-input',
    apiDocs: []
  };

  const disabledComponentCardData = {
    name: 'relay-input-component-disabled',
    title: 'Disabled State',
    description: 'Disabled component state.',
    richDescription: 'Relay input component in disabled state.',
    command: 'npx shadcn@latest add relay-input',
    apiDocs: []
  };
</script>

<div class="px-8">
  <!-- Header -->
  <div class="mb-12 pt-8">
    <div class="flex items-start justify-between gap-4 mb-4">
      <h1 class="text-4xl font-bold">Relay Input</h1>
    </div>
    <p class="text-lg text-muted-foreground mb-6">
      Input field for Nostr relay URLs with NIP-11 autocomplete and relay information display.
    </p>
  </div>

  <!-- Block Presets Showcase -->
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

  <ComponentPageSectionTitle
    title="Block Presets"
    description="Pre-configured relay input blocks ready for use."
  />

  <ComponentsShowcaseGrid
    blocks={[
      {
        name: 'Basic',
        description: 'Simple input with NIP-11',
        command: 'npx shadcn@latest add relay-input',
        preview: basicBlockPreview,
        cardData: basicBlockCardData
      },
      {
        name: 'With Label',
        description: 'Label and helper text',
        command: 'npx shadcn@latest add relay-input',
        preview: labelBlockPreview,
        cardData: labelBlockCardData
      },
      {
        name: 'With Error',
        description: 'Validation error state',
        command: 'npx shadcn@latest add relay-input',
        preview: errorBlockPreview,
        cardData: errorBlockCardData
      },
      {
        name: 'Disabled',
        description: 'Disabled input state',
        command: 'npx shadcn@latest add relay-input',
        preview: disabledBlockPreview,
        cardData: disabledBlockCardData
      }
    ]}
  />

  <!-- Components Section -->
  <ComponentPageSectionTitle title="Block Variants" description="Explore each relay input block variant in detail" />

  <section class="py-12 space-y-16">
    <ComponentCard inline data={basicBlockCardData}>
      {#snippet preview()}
        <RelayInputBlock {ndk} bind:value={blockDemoUrl} />
      {/snippet}
    </ComponentCard>

    <ComponentCard inline data={labelBlockCardData}>
      {#snippet preview()}
        <RelayInputBlock
          {ndk}
          bind:value={blockDemoUrl}
          label="Primary Relay"
          helperText="Enter the WebSocket URL of your preferred relay"
        />
      {/snippet}
    </ComponentCard>

    <ComponentCard inline data={errorBlockCardData}>
      {#snippet preview()}
        <RelayInputBlock
          {ndk}
          bind:value={blockDemoUrl}
          label="Relay URL"
          error="Invalid relay URL format"
        />
      {/snippet}
    </ComponentCard>

    <ComponentCard inline data={disabledBlockCardData}>
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

  <!-- Component Usage Showcase -->
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

  <ComponentPageSectionTitle
    title="Component Usage"
    description="Use individual components to build custom relay input experiences."
  />

  <ComponentsShowcaseGrid
    blocks={[
      {
        name: 'Basic',
        description: 'Basic component usage',
        command: 'npx shadcn@latest add relay-input',
        preview: basicComponentPreview,
        cardData: basicCardData
      },
      {
        name: 'With Label',
        description: 'Component with label',
        command: 'npx shadcn@latest add relay-input',
        preview: withLabelPreview,
        cardData: withLabelCardData
      },
      {
        name: 'With Validation',
        description: 'Component with validation',
        command: 'npx shadcn@latest add relay-input',
        preview: validationPreview,
        cardData: validationCardData
      },
      {
        name: 'Disabled',
        description: 'Disabled component',
        command: 'npx shadcn@latest add relay-input',
        preview: disabledComponentPreview,
        cardData: disabledComponentCardData
      }
    ]}
  />

  <!-- Component Variants Section -->
  <ComponentPageSectionTitle title="Component Variants" description="Explore each component variant in detail" />

  <section class="py-12 space-y-16">
    <ComponentCard inline data={basicCardData}>
      {#snippet preview()}
        <BasicExample />
      {/snippet}
    </ComponentCard>

    <ComponentCard inline data={withLabelCardData}>
      {#snippet preview()}
        <WithLabelExample />
      {/snippet}
    </ComponentCard>

    <ComponentCard inline data={validationCardData}>
      {#snippet preview()}
        <ValidationExample />
      {/snippet}
    </ComponentCard>

    <ComponentCard inline data={disabledComponentCardData}>
      {#snippet preview()}
        <DisabledExample />
      {/snippet}
    </ComponentCard>
  </section>

  <!-- Features Section -->
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

  <!-- Component API -->
  <ComponentAPI
    components={[
      {
        name: 'Relay.Input',
        description: 'Input field for relay URLs with NIP-11 autocomplete',
        importPath: "import { Relay } from '$lib/registry/ui/relay'",
        props: [
          { name: 'ndk', type: 'NDKSvelte', description: 'NDK instance (optional, falls back to context)' },
          { name: 'value', type: 'string', description: 'Relay URL value (two-way binding)' },
          { name: 'placeholder', type: 'string', default: 'wss://relay.example.com', description: 'Placeholder text' },
          { name: 'iconSize', type: 'number', default: '24', description: 'Icon size in pixels' },
          { name: 'showRelayInfo', type: 'boolean', default: 'true', description: 'Show relay info on the right side' },
          { name: 'debounceMs', type: 'number', default: '300', description: 'Debounce delay in milliseconds' },
          { name: 'disabled', type: 'boolean', default: 'false', description: 'Disable the input' },
          { name: 'class', type: 'string', description: 'Additional CSS classes' }
        ]
      },
      {
        name: 'RelayInputBlock',
        description: 'Opinionated relay input with label and helper text',
        importPath: "import RelayInputBlock from '$lib/registry/components/relay-input/relay-input.svelte'",
        props: [
          { name: 'ndk', type: 'NDKSvelte', description: 'NDK instance (optional)' },
          { name: 'value', type: 'string', description: 'Relay URL value (two-way binding)' },
          { name: 'label', type: 'string', description: 'Label for the input' },
          { name: 'helperText', type: 'string', description: 'Helper text below the input' },
          { name: 'error', type: 'string', description: 'Error message to display' },
          { name: 'disabled', type: 'boolean', default: 'false', description: 'Disable the input' },
          { name: 'showRelayInfo', type: 'boolean', default: 'true', description: 'Show relay info' },
          { name: 'placeholder', type: 'string', description: 'Placeholder text' },
          { name: 'class', type: 'string', description: 'Additional CSS classes' }
        ]
      }
    ]}
  />
</div>
