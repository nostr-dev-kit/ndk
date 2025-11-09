<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import ComponentPageTemplate from '$lib/site/templates/ComponentPageTemplate.svelte';
  import Preview from '$site-components/preview.svelte';
  import type { ShowcaseComponent } from '$lib/site/templates/types';

  // Import code examples
  import emojiPickerListCode from './examples/list/index.txt?raw';
  import emojiPickerContentCode from './examples/content/index.txt?raw';

  // Import example components
  import UiBasic from './examples/list/index.svelte';
  import UiComposition from './examples/content/index.svelte';

  // Import registry metadata
  import emojiPickerBaseCard from '$lib/registry/components/emoji-picker/metadata.json';

  // Page metadata
  const metadata = {
    title: 'Emoji Picker',
    description: 'Emoji selection components with search, categories, and smart aggregation'
  };

  const ndk = getContext<NDKSvelte>('ndk');
</script>

<!-- Composition examples -->
{#snippet compositionExamples()}
  <section class="mt-16">
    <h2 class="text-3xl font-bold mb-4">Composition Examples</h2>
    <p class="text-muted-foreground mb-6">
      These examples show how to compose the emoji picker using the <code class="px-2 py-1 bg-muted rounded text-sm">createEmojiPicker()</code> builder.
      These are teaching examples, not installable components.
    </p>

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
  </section>
{/snippet}

<!-- Custom sections for Builder API -->
{#snippet customSections()}
  {@render compositionExamples()}

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
  {ndk}
  {customSections}
/>
