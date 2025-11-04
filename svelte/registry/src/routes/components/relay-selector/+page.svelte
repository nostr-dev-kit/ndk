<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import RelaySelectorPopover from '$lib/registry/components/relay-selector/relay-selector-popover.svelte';
  import RelaySelectorInline from '$lib/registry/components/relay-selector/relay-selector.svelte';
  import ComponentsShowcaseGrid from '$site-components/ComponentsShowcaseGrid.svelte';
  import ComponentCard from '$site-components/ComponentCard.svelte';
  import ComponentPageSectionTitle from '$site-components/ComponentPageSectionTitle.svelte';
  import ComponentAPI from '$site-components/component-api.svelte';

  // UI examples
  import UIBasic from './examples/basic.svelte';
  import UIFull from './examples/ui-full.svelte';

  const ndk = getContext<NDKSvelte>('ndk');

  let popoverSelected = $state<string[]>([]);
  let inlineSelected = $state<string[]>([]);

  const popoverData = {
    name: 'relay-selector-popover',
    title: 'Popover',
    description: 'Compact relay selection in dropdown.',
    richDescription: 'Use for compact relay selection in toolbars or settings. Opens in a dropdown.',
    command: 'npx shadcn@latest add relay-selector-popover',
    apiDocs: []
  };

  const inlineData = {
    name: 'relay-selector-inline',
    title: 'Inline',
    description: 'Inline relay selector without popover.',
    richDescription: 'Use for dedicated relay management pages or settings panels. Shows selector inline without popover.',
    command: 'npx shadcn@latest add relay-selector-inline',
    apiDocs: []
  };

  const basicUIData = {
    name: 'relay-selector-basic',
    title: 'Basic Usage',
    description: 'Minimal relay selector primitives.',
    richDescription: 'Minimal example with Relay.Selector.Root and essential primitives.',
    command: 'npx shadcn@latest add relay-selector',
    apiDocs: []
  };

  const fullUIData = {
    name: 'relay-selector-full',
    title: 'Full Composition',
    description: 'All primitives together.',
    richDescription: 'All available primitives composed together with headers, chips, and helper text.',
    command: 'npx shadcn@latest add relay-selector',
    apiDocs: []
  };
</script>

<div class="px-8">
  <!-- Header -->
  <div class="mb-12 pt-8">
    <h1 class="text-4xl font-bold mb-4">Relay Selector</h1>
    <p class="text-lg text-muted-foreground mb-6">
      Choose relays from your connected pool or add new ones. Supports both popover and inline
      layouts with multi-select and single-select modes.
    </p>
  </div>

  <!-- Blocks Showcase -->
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

  <ComponentPageSectionTitle
    title="Blocks"
    description="Pre-composed layouts ready to use."
  />

  <ComponentsShowcaseGrid
    blocks={[
      {
        name: 'Popover',
        description: 'Compact dropdown selector',
        command: 'npx shadcn@latest add relay-selector-popover',
        preview: popoverPreview,
        cardData: popoverData
      },
      {
        name: 'Inline',
        description: 'Inline without popover',
        command: 'npx shadcn@latest add relay-selector-inline',
        preview: inlinePreview,
        cardData: inlineData
      }
    ]}
  />

  <!-- UI Primitives Showcase -->
  {#snippet basicPreview()}
    <UIBasic />
  {/snippet}

  {#snippet fullPreview()}
    <UIFull />
  {/snippet}

  <ComponentPageSectionTitle
    title="UI Primitives"
    description="Primitive components for building custom relay selector layouts."
  />

  <ComponentsShowcaseGrid
    blocks={[
      {
        name: 'Basic Usage',
        description: 'Essential primitives',
        command: 'npx shadcn@latest add relay-selector',
        preview: basicPreview,
        cardData: basicUIData
      },
      {
        name: 'Full Composition',
        description: 'All primitives together',
        command: 'npx shadcn@latest add relay-selector',
        preview: fullPreview,
        cardData: fullUIData
      }
    ]}
  />

  <!-- Components Section -->
  <ComponentPageSectionTitle title="Components" description="Explore each variant in detail" />

  <section class="py-12 space-y-16">
    <ComponentCard inline data={popoverData}>
      {#snippet preview()}
        <div class="flex flex-wrap gap-4">
          <RelaySelectorPopover {ndk} bind:selected={popoverSelected} />
        </div>
      {/snippet}
    </ComponentCard>

    <ComponentCard inline data={inlineData}>
      {#snippet preview()}
        <RelaySelectorInline
          {ndk}
          bind:selected={inlineSelected}
          label="Active Relays"
          showSelectedChips={true}
          helperText="Selected relays will be used for fetching and publishing"
        />
      {/snippet}
    </ComponentCard>

    <ComponentCard inline data={basicUIData}>
      {#snippet preview()}
        <UIBasic />
      {/snippet}
    </ComponentCard>

    <ComponentCard inline data={fullUIData}>
      {#snippet preview()}
        <UIFull />
      {/snippet}
    </ComponentCard>
  </section>

  <!-- Component API -->
  <ComponentAPI
    components={[
      {
        name: 'Relay.Selector.Root',
        description:
          'Context provider that manages relay selection state. Wraps all relay selector primitives.',
        importPath: "import { Relay } from '$lib/registry/ui/relay'",
        props: [
          {
            name: 'ndk',
            type: 'NDKSvelte',
            description: 'NDK instance (optional, falls back to context)'
          },
          {
            name: 'selected',
            type: 'string[]',
            description: 'Selected relay URLs (two-way binding)',
            default: '[]'
          },
          {
            name: 'multiple',
            type: 'boolean',
            description: 'Allow multiple relay selection',
            default: 'true'
          }
        ],
        slots: [
          {
            name: 'children',
            description: 'Child components (Relay.Selector primitives)'
          }
        ]
      },
      {
        name: 'Relay.Selector.List',
        description:
          'Displays list of connected relays from NDK pool. Shows checkmarks for selected relays.',
        importPath: "import { Relay } from '$lib/registry/ui/relay'",
        props: [
          {
            name: 'compact',
            type: 'boolean',
            description: 'Use compact layout',
            default: 'false'
          },
          {
            name: 'class',
            type: 'string',
            description: 'Additional CSS classes'
          }
        ]
      },
      {
        name: 'Relay.Selector.Item',
        description:
          'Individual selectable relay item. Use for custom relay list implementations.',
        importPath: "import { Relay } from '$lib/registry/ui/relay'",
        props: [
          {
            name: 'relayUrl',
            type: 'string',
            required: true,
            description: 'Relay URL to display'
          },
          {
            name: 'class',
            type: 'string',
            description: 'Additional CSS classes'
          }
        ]
      },
      {
        name: 'RelaySelectorPopover',
        description: 'Popover block for relay selection with customizable trigger button.',
        importPath: "import { RelaySelectorPopover } from '$lib/registry/blocks'",
        props: [
          {
            name: 'ndk',
            type: 'NDKSvelte',
            description: 'NDK instance (optional, falls back to context)'
          },
          {
            name: 'selected',
            type: 'string[]',
            description: 'Selected relay URLs (two-way binding)',
            default: '[]'
          },
          {
            name: 'multiple',
            type: 'boolean',
            description: 'Allow multiple relay selection',
            default: 'true'
          },
          {
            name: 'showAddRelay',
            type: 'boolean',
            description: 'Show add relay form',
            default: 'true'
          },
          {
            name: 'trigger',
            type: 'Snippet',
            description: 'Custom trigger element'
          },
          {
            name: 'variant',
            type: "'default' | 'secondary' | 'outline' | 'ghost'",
            description: 'Button variant for default trigger',
            default: "'outline'"
          },
          {
            name: 'size',
            type: "'sm' | 'md' | 'lg'",
            description: 'Button size for default trigger',
            default: "'md'"
          },
          {
            name: 'placement',
            type: "'top' | 'bottom' | 'left' | 'right'",
            description: 'Popover placement direction',
            default: "'bottom'"
          },
          {
            name: 'class',
            type: 'string',
            description: 'Additional CSS classes'
          }
        ]
      },
      {
        name: 'RelaySelectorInline',
        description: 'Inline block for relay selection without popover trigger.',
        importPath: "import { RelaySelectorInline } from '$lib/registry/blocks'",
        props: [
          {
            name: 'ndk',
            type: 'NDKSvelte',
            description: 'NDK instance (optional, falls back to context)'
          },
          {
            name: 'selected',
            type: 'string[]',
            description: 'Selected relay URLs (two-way binding)',
            default: '[]'
          },
          {
            name: 'multiple',
            type: 'boolean',
            description: 'Allow multiple relay selection',
            default: 'true'
          },
          {
            name: 'showAddRelay',
            type: 'boolean',
            description: 'Show add relay form',
            default: 'true'
          },
          {
            name: 'label',
            type: 'string',
            description: 'Label text above selector'
          },
          {
            name: 'helperText',
            type: 'string',
            description: 'Helper text below selector'
          },
          {
            name: 'showSelectedChips',
            type: 'boolean',
            description: 'Display selected relays as removable chips',
            default: 'false'
          },
          {
            name: 'class',
            type: 'string',
            description: 'Additional CSS classes'
          }
        ]
      }
    ]}
  />
</div>
