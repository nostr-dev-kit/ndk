<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import ComponentPageTemplate from '$lib/site/templates/ComponentPageTemplate.svelte';
  import Preview from '$site-components/preview.svelte';

  // Import code examples
  import emojiPickerCode from './examples/content/index.txt?raw';
  import emojiPickerListCode from './examples/list/index.txt?raw';
  import emojiPickerContentCode from './examples/content/index.txt?raw';

  // Import example components
  import UiBasic from './examples/list/index.svelte';
  import UiComposition from './examples/content/index.svelte';
  import { EmojiPicker } from '$lib/registry/components/emoji-picker';

  // Import registry metadata
  import emojiPickerCard from '$lib/registry/components/emoji-picker/metadata.json';
  import emojiPickerBuilder from '$lib/registry/builders/emoji-picker/metadata.json';

  // Page metadata
  const metadata = {
    title: 'Emoji Picker',
    description: 'Emoji selection components with search, categories, and smart aggregation'
  };

  const ndk = getContext<NDKSvelte>('ndk');

  let selectedEmoji = $state<string>('');

  // Components section configuration
  const componentsSection = {
    title: 'Components',
    description: 'Explore each variant in detail',
    cards: [
      {...emojiPickerCard, code: emojiPickerCode}
    ],
    previews: {
      'emoji-picker': emojiPickerComponentPreview
    }
  };
</script>

<!-- Showcase preview -->
{#snippet showcasePreview()}
  <div class="flex flex-col gap-4">
    <EmojiPicker.Content
      {ndk}
      onSelect={(emoji) => selectedEmoji = emoji.emoji}
    />
    {#if selectedEmoji}
      <div class="text-center text-4xl p-4 bg-muted/50 rounded-lg">
        Selected: {selectedEmoji}
      </div>
    {/if}
  </div>
{/snippet}

{#snippet emojiPickerComponentPreview()}
  {@render showcasePreview()}
{/snippet}

<!-- Overview section -->
{#snippet overview()}
  <div class="text-lg text-muted-foreground space-y-4">
    <p>
      The Emoji Picker provides smart emoji selection with aggregation from multiple sources. It displays emojis in priority order: user's saved custom emojis (NIP-51 kind 10030), aggregated emojis from followed users sorted by frequency, and default emoji sets.
    </p>

    <p>
      The picker supports both standard Unicode emojis and custom emojis with shortcodes and image URLs (NIP-30). It features customizable grid layouts, emoji sections, and selection callbacks for seamless integration into reactions, comments, and messaging interfaces.
    </p>

    <p>
      Multiple variants are available including Content (full picker with sections), List (simple emoji grid), Dropdown (popover trigger), and Item (individual emoji button) for flexible composition.
    </p>
  </div>
{/snippet}

<!-- Recipes section -->
{#snippet recipes()}
  <div class="space-y-8">
    <div>
      <h3 class="text-xl font-semibold mb-3">Simple List</h3>
      <p class="text-muted-foreground mb-4">Basic emoji list with selection.</p>
      <Preview code={emojiPickerListCode}>
        <UiBasic />
      </Preview>
    </div>

    <div>
      <h3 class="text-xl font-semibold mb-3">Full Picker</h3>
      <p class="text-muted-foreground mb-4">Complete emoji picker with categories and composition.</p>
      <Preview code={emojiPickerContentCode}>
        <UiComposition {ndk} />
      </Preview>
    </div>
  </div>
{/snippet}

<!-- Use the template -->
<ComponentPageTemplate
  {metadata}
  {ndk}
  {overview}
  showcaseComponents={[
    {
      id: "emojiPickerCard",
      cardData: emojiPickerCard,
      preview: showcasePreview,
      orientation: 'horizontal'
    }
  ]}
  {componentsSection}
  buildersSection={{
    builders: [emojiPickerBuilder]
  }}
  {recipes}
/>
