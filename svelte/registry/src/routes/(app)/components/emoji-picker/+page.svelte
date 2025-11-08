<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import ComponentPageTemplate from '$lib/site/templates/ComponentPageTemplate.svelte';
  import ComponentCard from '$site-components/ComponentCard.svelte';
  import type { ShowcaseComponent } from '$lib/site/templates/types';

  // Import code examples
  import emojiPickerListCode from './examples/list/index.txt?raw';
  import emojiPickerContentCode from './examples/content/index.txt?raw';

  // Import registry metadata
  import emojiPickerBaseCard from '$lib/registry/components/misc/emoji-picker/registry.json';

  // Page metadata
  const metadata = {
    title: 'Emoji Picker',
    description: 'Emoji selection components with search, categories, and smart aggregation'
  };

  // Component cards
  const emojiPickerListCard = {
    ...emojiPickerBaseCard,
    name: 'emoji-picker-list',
    title: 'Emoji Picker List',
    description: 'Simple emoji list with selection',
  };

  const emojiPickerContentCard = {
    ...emojiPickerBaseCard,
    name: 'emoji-picker-content',
    title: 'Emoji Picker Content',
    description: 'Full emoji picker with categories and composition',
  };

  const ndk = getContext<NDKSvelte>('ndk');

  // Showcase blocks
    const showcaseComponents: ShowcaseComponent[] = [
    {
      cardData: emojiPickerListCard,
      preview: basicPreview
    },
    {
      cardData: emojiPickerContentCard,
      preview: contentPreview
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

<!-- Components snippet -->
{#snippet components()}
  <ComponentCard data={{...emojiPickerListCard, code: emojiPickerListCode}}>
    {#snippet preview()}
      {@render basicPreview()}
    {/snippet}
  </ComponentCard>

  <ComponentCard data={{...emojiPickerContentCard, code: emojiPickerContentCode}}>
    {#snippet preview()}
      {@render contentPreview()}
    {/snippet}
  </ComponentCard>
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
  {metadata}
  showcaseTitle="Emoji Picker Variants"
  showcaseDescription="Explore different emoji picker layouts and compositions"
  {ndk}
  {showcaseComponents}
  {components}
  {customSections}
/>
