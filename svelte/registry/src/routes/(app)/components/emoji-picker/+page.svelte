<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import ComponentPageTemplate from '$lib/templates/ComponentPageTemplate.svelte';
  import {
    emojiPickerMetadata,
    emojiPickerListCard,
    emojiPickerContentCard
  } from '$lib/component-registry/emoji-picker';
  import type { ShowcaseBlock } from '$lib/templates/types';

  // Import examples
  import UiBasic from './examples/ui-basic.example.svelte';
  import UiComposition from './examples/ui-composition.example.svelte';

  // Import code examples
  import emojiPickerListCode from './emoji-picker-list.example?raw';
  import emojiPickerContentCode from './emoji-picker-content.example?raw';

  const ndk = getContext<NDKSvelte>('ndk');

  // Showcase blocks
  const showcaseBlocks: ShowcaseBlock[] = [
    {
      name: 'List',
      description: 'Grid of clickable emojis',
      command: 'npx jsrepo add emoji-picker',
      preview: basicPreview,
      cardData: emojiPickerListCard
    },
    {
      name: 'Content',
      description: 'Complete picker with builder',
      command: 'npx jsrepo add emoji-picker',
      preview: contentPreview,
      cardData: emojiPickerContentCard
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
    cards: [
      { ...emojiPickerListCard, code: emojiPickerListCode },
      { ...emojiPickerContentCard, code: emojiPickerContentCode }
    ],
    previews: {
      'emoji-picker-list': basicPreview,
      'emoji-picker-content': contentPreview
    }
  }}
  apiDocs={emojiPickerMetadata.apiDocs}
/>
