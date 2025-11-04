<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import ComponentsShowcaseGrid from '$site-components/ComponentsShowcaseGrid.svelte';
  import ComponentPageSectionTitle from '$site-components/ComponentPageSectionTitle.svelte';
  import ComponentCard from '$site-components/ComponentCard.svelte';
  import ComponentAPI from '$site-components/component-api.svelte';

  // Import examples
  import UiBasic from './examples/ui-basic.svelte';
  import UiComposition from './examples/ui-composition.svelte';
  import UiPopover from './examples/ui-popover.svelte';
  import UiAutocomplete from './examples/ui-autocomplete.svelte';

  const ndk = getContext<NDKSvelte>('ndk');

  const basicCardData = {
    name: 'emoji-picker-list',
    title: 'EmojiPicker.List',
    description: 'Basic emoji list primitive',
    richDescription: 'A primitive component that renders a grid of clickable emojis. Perfect for custom layouts when you need full control over the emoji picker behavior.',
    command: 'npx shadcn@latest add emoji-picker',
    apiDocs: [
      {
        name: 'EmojiPicker.List',
        description: 'Primitive emoji list component',
        importPath: "import { EmojiPicker } from '$lib/registry/ui/emoji-picker'",
        props: [
          { name: 'emojis', type: 'EmojiData[]', required: true, description: 'Array of emojis to display' },
          { name: 'onSelect', type: '(emoji: EmojiData) => void', required: true, description: 'Callback when emoji is clicked' },
          { name: 'columns', type: 'number', default: '6', description: 'Number of columns in grid' },
          { name: 'class', type: 'string', description: 'Additional CSS classes' }
        ]
      }
    ]
  };

  const contentCardData = {
    name: 'emoji-picker-content',
    title: 'EmojiPicker.Content',
    description: 'Complete emoji picker with builder integration',
    richDescription: 'An opinionated component that integrates with the createEmojiPicker builder to show user\'s custom emojis and defaults in organized sections.',
    command: 'npx shadcn@latest add emoji-picker',
    apiDocs: [
      {
        name: 'EmojiPicker.Content',
        description: 'Complete emoji picker component',
        importPath: "import { EmojiPicker } from '$lib/registry/ui/emoji-picker'",
        props: [
          { name: 'ndk', type: 'NDKSvelte', description: 'NDK instance (optional, falls back to context)' },
          { name: 'onSelect', type: '(emoji: EmojiData) => void', required: true, description: 'Callback when emoji is selected' },
          { name: 'defaults', type: 'EmojiData[]', description: 'Default emojis to show (can be overridden)' },
          { name: 'columns', type: 'number', default: '6 (5 on mobile)', description: 'Number of columns in grid' },
          { name: 'class', type: 'string', description: 'Additional CSS classes' }
        ]
      }
    ]
  };

  const popoverCardData = {
    name: 'emoji-picker-popover',
    title: 'EmojiPicker in Popover',
    description: 'Emoji picker in a dropdown popover',
    richDescription: 'Use EmojiPicker.Content with bits-ui Popover for a dropdown picker. This is how ReactionAction uses it internally.',
    command: 'npx shadcn@latest add emoji-picker',
    apiDocs: []
  };

  const autocompleteCardData = {
    name: 'emoji-picker-autocomplete',
    title: 'Textarea Autocomplete',
    description: 'Emoji autocomplete in textarea',
    richDescription: 'Type : followed by text to autocomplete with your custom emojis. Supports keyboard navigation (arrows, tab/enter to select, escape to close).',
    command: 'npx shadcn@latest add emoji-picker',
    apiDocs: []
  };
</script>

<div class="px-8">
  <!-- Header -->
  <div class="mb-12 pt-8">
    <div class="flex items-start justify-between gap-4 mb-4">
      <h1 class="text-4xl font-bold">EmojiPicker</h1>
    </div>
    <p class="text-lg text-muted-foreground mb-6">
      Flexible emoji selection components with support for user's custom emojis from Nostr (NIP-51 kind:10030) and aggregated emojis from specified pubkeys.
    </p>
  </div>

  <!-- ComponentsShowcase Section -->
  {#snippet basicPreview()}
    <UiBasic />
  {/snippet}

  {#snippet contentPreview()}
    <UiComposition {ndk} />
  {/snippet}

  {#snippet popoverPreview()}
    <UiPopover {ndk} />
  {/snippet}

  {#snippet autocompletePreview()}
    <UiAutocomplete {ndk} />
  {/snippet}

  <ComponentPageSectionTitle
    title="Showcase"
    description="Emoji picker variants from basic primitives to autocomplete."
  />

  <ComponentsShowcaseGrid
    blocks={[
      {
        name: 'Basic List',
        description: 'Grid of clickable emojis',
        command: 'npx shadcn@latest add emoji-picker',
        preview: basicPreview,
        cardData: basicCardData
      },
      {
        name: 'Content',
        description: 'Complete picker with builder',
        command: 'npx shadcn@latest add emoji-picker',
        preview: contentPreview,
        cardData: contentCardData
      },
      {
        name: 'Popover',
        description: 'Dropdown emoji picker',
        command: 'npx shadcn@latest add emoji-picker',
        preview: popoverPreview,
        cardData: popoverCardData
      },
      {
        name: 'Autocomplete',
        description: 'Textarea emoji autocomplete',
        command: 'npx shadcn@latest add emoji-picker',
        preview: autocompletePreview,
        cardData: autocompleteCardData
      }
    ]}
  />

  <!-- Components Section -->
  <ComponentPageSectionTitle title="Components" description="Explore each emoji picker variant in detail" />

  <section class="py-12 space-y-16">
    <ComponentCard inline data={basicCardData}>
      {#snippet preview()}
        <UiBasic />
      {/snippet}
    </ComponentCard>

    <ComponentCard inline data={contentCardData}>
      {#snippet preview()}
        <UiComposition {ndk} />
      {/snippet}
    </ComponentCard>

    <ComponentCard inline data={popoverCardData}>
      {#snippet preview()}
        <UiPopover {ndk} />
      {/snippet}
    </ComponentCard>

    <ComponentCard inline data={autocompleteCardData}>
      {#snippet preview()}
        <UiAutocomplete {ndk} />
      {/snippet}
    </ComponentCard>
  </section>

  <!-- Component API -->
  <ComponentAPI
    components={[
      {
        name: 'createEmojiPicker',
        description: 'Builder function for aggregating emojis from multiple sources with smart ordering.',
        importPath: "import { createEmojiPicker } from '@nostr-dev-kit/svelte'",
        props: [
          {
            name: 'config',
            type: '() => EmojiPickerConfig',
            required: true,
            description: 'Reactive function returning configuration'
          },
          {
            name: 'ndk',
            type: 'NDKSvelte',
            required: true,
            description: 'NDK instance'
          }
        ],
        returns: {
          name: 'EmojiPickerState',
          properties: [
            {
              name: 'emojis',
              type: 'EmojiData[]',
              description: 'Ordered emojis: user saved, aggregated from pubkeys, then defaults'
            }
          ]
        }
      },
      {
        name: 'EmojiPicker.List',
        description: 'Primitive component for rendering a grid of clickable emojis.',
        importPath: "import { EmojiPicker } from '$lib/registry/ui/emoji-picker'",
        props: [
          {
            name: 'emojis',
            type: 'EmojiData[]',
            required: true,
            description: 'Array of emojis to display'
          },
          {
            name: 'onSelect',
            type: '(emoji: EmojiData) => void',
            required: true,
            description: 'Callback when emoji is clicked'
          },
          {
            name: 'columns',
            type: 'number',
            default: '6',
            description: 'Number of columns in grid'
          },
          {
            name: 'class',
            type: 'string',
            description: 'Additional CSS classes'
          }
        ]
      },
      {
        name: 'EmojiPicker.Content',
        description: 'Complete emoji picker with builder integration and organized sections.',
        importPath: "import { EmojiPicker } from '$lib/registry/ui/emoji-picker'",
        props: [
          {
            name: 'ndk',
            type: 'NDKSvelte',
            description: 'NDK instance (optional, falls back to context)'
          },
          {
            name: 'onSelect',
            type: '(emoji: EmojiData) => void',
            required: true,
            description: 'Callback when emoji is selected'
          },
          {
            name: 'defaults',
            type: 'EmojiData[]',
            description: 'Default emojis to show'
          },
          {
            name: 'columns',
            type: 'number',
            default: '6 (5 on mobile)',
            description: 'Number of columns in grid'
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

  <!-- Builder API -->
  <section class="mt-16">
    <h2 class="text-3xl font-bold mb-4">Builder API</h2>
    <p class="text-muted-foreground mb-6">
      Use <code class="px-2 py-1 bg-muted rounded text-sm">createEmojiPicker()</code> to aggregate emojis from multiple sources.
    </p>

    <div class="bg-muted/50 rounded-lg p-6">
      <h3 class="text-lg font-semibold mb-3">Emoji Order</h3>
      <ol class="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
        <li><strong>User's saved emojis</strong> (NIP-51 kind:10030) - shown first</li>
        <li><strong>Aggregated emojis</strong> from <code>from</code> pubkeys (sorted by frequency) - shown second</li>
        <li><strong>Default emojis</strong> from <code>defaults</code> - shown last</li>
      </ol>
    </div>
  </section>
</div>
