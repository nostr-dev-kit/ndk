<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import ComponentPageTemplate from '$lib/templates/ComponentPageTemplate.svelte';
  import {
    emojiPickerMetadata,
    emojiPickerListCard,
    emojiPickerContentCard,
    emojiPickerPopoverCard,
    emojiPickerAutocompleteCard
  } from '$lib/component-registry/emoji-picker';
  import type { ShowcaseBlock } from '$lib/templates/types';

  // Import examples
  import UiBasic from './examples/ui-basic.svelte';
  import UiComposition from './examples/ui-composition.svelte';
  import UiPopover from './examples/ui-popover.svelte';
  import UiAutocomplete from './examples/ui-autocomplete.svelte';

  const ndk = getContext<NDKSvelte>('ndk');

  // Showcase blocks
  const showcaseBlocks: ShowcaseBlock[] = [
    {
      name: 'Basic List',
      description: 'Grid of clickable emojis',
      command: 'npx shadcn@latest add emoji-picker',
      preview: basicPreview,
      cardData: emojiPickerListCard
    },
    {
      name: 'Content',
      description: 'Complete picker with builder',
      command: 'npx shadcn@latest add emoji-picker',
      preview: contentPreview,
      cardData: emojiPickerContentCard
    },
    {
      name: 'Popover',
      description: 'Dropdown emoji picker',
      command: 'npx shadcn@latest add emoji-picker',
      preview: popoverPreview,
      cardData: emojiPickerPopoverCard
    },
    {
      name: 'Autocomplete',
      description: 'Textarea emoji autocomplete',
      command: 'npx shadcn@latest add emoji-picker',
      preview: autocompletePreview,
      cardData: emojiPickerAutocompleteCard
    }
  ];
</script>

<!-- Preview snippets for showcase -->
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

<!-- Custom sections for Builder API -->
{#snippet customSections()}
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
{/snippet}

<!-- Use the template -->
<ComponentPageTemplate
  metadata={emojiPickerMetadata}
  {ndk}
  {showcaseBlocks}
  {customSections}
  componentsSection={{
    cards: emojiPickerMetadata.cards,
    previews: {
      'emoji-picker-list': basicPreview,
      'emoji-picker-content': contentPreview,
      'emoji-picker-popover': popoverPreview,
      'emoji-picker-autocomplete': autocompletePreview
    }
  }}
  apiDocs={emojiPickerMetadata.apiDocs}
/>
