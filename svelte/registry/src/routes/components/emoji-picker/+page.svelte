<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { EditProps } from '$lib/registry/components/edit-props';
  import Demo from '$site-components/Demo.svelte';
  import ApiTable from '$site-components/api-table.svelte';

  // Import examples
  import UiBasic from './examples/ui-basic.svelte';
  import UiBasicRaw from './examples/ui-basic.svelte?raw';
  import UiComposition from './examples/ui-composition.svelte';
  import UiCompositionRaw from './examples/ui-composition.svelte?raw';
  import UiPopover from './examples/ui-popover.svelte';
  import UiPopoverRaw from './examples/ui-popover.svelte?raw';

  const ndk = getContext<NDKSvelte>('ndk');
</script>

<div class="component-page">
  <header>
    <h1>EmojiPicker</h1>
    <p>Flexible emoji selection components with support for user's custom emojis from Nostr (NIP-51 kind:10030) and aggregated emojis from specified pubkeys.</p>

    <EditProps.Root>
      <EditProps.Prop name="Component" type="text" value="EmojiPicker.List & EmojiPicker.Content" />
    </EditProps.Root>
  </header>

  <section class="demo space-y-8">
    <h2 class="text-2xl font-semibold mb-4">UI Components</h2>

    <Demo
      title="Basic List"
      description="EmojiPicker.List is a primitive component that renders a grid of clickable emojis. Perfect for custom layouts and when you need full control."
      code={UiBasicRaw}
    >
      <UiBasic />
    </Demo>

    <Demo
      title="Content with Builder"
      description="EmojiPicker.Content is an opinionated component that integrates with the createEmojiPicker builder to show user's custom emojis and defaults in sections."
      code={UiCompositionRaw}
    >
      <UiComposition {ndk} />
    </Demo>

    <Demo
      title="In a Popover"
      description="Use EmojiPicker.Content with bits-ui Popover for a dropdown picker. This is how ReactionAction uses it."
      code={UiPopoverRaw}
    >
      <UiPopover {ndk} />
    </Demo>
  </section>

  <section class="info">
    <h2>EmojiPicker.List Props</h2>
    <ApiTable
      rows={[
        { name: 'emojis', type: 'EmojiData[]', default: 'required', description: 'Array of emojis to display' },
        { name: 'onSelect', type: '(emoji: EmojiData) => void', default: 'required', description: 'Callback when emoji is clicked' },
        { name: 'columns', type: 'number', default: '6', description: 'Number of columns in grid' },
        { name: 'class', type: 'string', default: "''", description: 'Additional CSS classes' }
      ]}
    />
  </section>

  <section class="info">
    <h2>EmojiPicker.Content Props</h2>
    <ApiTable
      rows={[
        { name: 'ndk', type: 'NDKSvelte', default: 'required', description: 'NDK instance for fetching custom emojis' },
        { name: 'onSelect', type: '(emoji: EmojiData) => void', default: 'required', description: 'Callback when emoji is selected' },
        { name: 'defaults', type: 'EmojiData[]', default: 'hardcoded 12 emojis', description: 'Default emojis to show (can be overridden)' },
        { name: 'columns', type: 'number', default: '6 (5 on mobile)', description: 'Number of columns in grid' },
        { name: 'class', type: 'string', default: "''", description: 'Additional CSS classes' }
      ]}
    />
  </section>

  <section class="info">
    <h2>Builder: createEmojiPicker</h2>
    <p class="mb-4">For advanced use cases, use the builder directly to aggregate emojis from multiple sources:</p>
    <ApiTable
      rows={[
        { name: 'config', type: '() => EmojiPickerConfig', default: 'required', description: 'Closure returning config with defaults and from pubkeys' },
        { name: 'ndk', type: 'NDKSvelte', default: 'from context', description: 'NDK instance' }
      ]}
    />

    <h3 class="mt-4 mb-2 font-semibold">EmojiPickerConfig</h3>
    <ApiTable
      rows={[
        { name: 'defaults', type: 'EmojiData[]', default: 'undefined', description: 'Default emojis to show last' },
        { name: 'from', type: 'string[]', default: 'undefined', description: 'Pubkeys to aggregate emojis from (sorted by frequency)' }
      ]}
    />

    <h3 class="mt-4 mb-2 font-semibold">Emoji Order</h3>
    <ol class="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
      <li>User's saved emojis (NIP-51 kind:10030) - shown first</li>
      <li>Aggregated emojis from <code>from</code> pubkeys (sorted by frequency) - shown second</li>
      <li>Default emojis from <code>defaults</code> - shown last</li>
    </ol>
  </section>
</div>

<style>
  .info {
    padding: 2rem;
    background: var(--color-card);
    border: 1px solid var(--color-border);
    border-radius: 0.75rem;
    margin-top: 2rem;
  }

  .info h2 {
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0 0 1rem 0;
    color: var(--color-foreground);
  }

  .info h3 {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--color-foreground);
  }

  code {
    background: var(--color-accent);
    padding: 0.125rem 0.375rem;
    border-radius: 0.25rem;
    font-size: 0.875em;
  }
</style>
