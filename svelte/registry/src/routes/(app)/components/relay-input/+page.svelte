<script lang="ts">
    import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { ndk } from '$lib/site/ndk.svelte';
  import ComponentPageTemplate from '$lib/site/templates/ComponentPageTemplate.svelte';
  import type { ShowcaseComponent } from '$lib/site/templates/types';

  // Import code examples
  import relayInputBasicCode from './examples/basic/index.txt?raw';
  import relayInputLabelCode from './examples/label/index.txt?raw';
  import relayInputErrorCode from './examples/error/index.txt?raw';
  import relayInputDisabledCode from './examples/disabled/index.txt?raw';

  // Import component
  import RelayInputBlock from '$lib/registry/components/relay-input/relay-input.svelte';

  // Import registry metadata
  import relayInputCard from '$lib/registry/components/relay-input/metadata.json';

  // Page metadata
  const metadata = {
    title: 'Relay Input',
    description: 'Input components for relay URLs'
  };

  // Card data for variants
  const relayInputLabelCard = { ...relayInputCard, name: 'relay-input-label', title: 'Relay Input with Label', variant: 'label' };
  const relayInputErrorCard = { ...relayInputCard, name: 'relay-input-error', title: 'Relay Input with Error', variant: 'error' };
  const relayInputDisabledCard = { ...relayInputCard, name: 'relay-input-disabled', title: 'Relay Input Disabled', variant: 'disabled' };
  let basicBlockUrl = $state<string>('');
  let labelBlockUrl = $state<string>('');
  let errorBlockUrl = $state<string>('');

  // Components section configuration
  const componentsSection = {
    title: 'Components',
    description: 'Explore each variant in detail',
    cards: [
      {...relayInputCard, code: relayInputBasicCode},
      {...relayInputLabelCard, code: relayInputLabelCode},
      {...relayInputErrorCard, code: relayInputErrorCode},
      {...relayInputDisabledCard, code: relayInputDisabledCode}
    ],
    previews: {
      'relay-input': basicComponentPreview,
      'relay-input-label': labelComponentPreview,
      'relay-input-error': errorComponentPreview,
      'relay-input-disabled': disabledComponentPreview
    }
  };

  const showcaseComponents: ShowcaseComponent[] = [
    {
      id: "relayInputCard",
      cardData: relayInputCard,
      preview: basicBlockPreview,
      orientation: 'vertical'
    },
    {
      id: "relayInputLabelCard",
      cardData: relayInputLabelCard,
      preview: labelBlockPreview,
      orientation: 'vertical'
    },
    {
      id: "relayInputErrorCard",
      cardData: relayInputErrorCard,
      preview: errorBlockPreview,
      orientation: 'vertical'
    },
    {
      id: "relayInputDisabledCard",
      cardData: relayInputDisabledCard,
      preview: disabledBlockPreview,
      orientation: 'vertical'
    }
  ];
</script>

<!-- Preview snippets -->
{#snippet basicBlockPreview()}
  <RelayInputBlock {ndk} bind:value={basicBlockUrl} />
{/snippet}

{#snippet labelBlockPreview()}
  <RelayInputBlock
    {ndk}
    bind:value={labelBlockUrl}
    label="Primary Relay"
    helperText="Enter the WebSocket URL of your preferred relay"
  />
{/snippet}

{#snippet errorBlockPreview()}
  <RelayInputBlock
    {ndk}
    bind:value={errorBlockUrl}
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

<!-- Component preview snippets for componentsSection -->
{#snippet basicComponentPreview()}
  {@render basicBlockPreview()}
{/snippet}

{#snippet labelComponentPreview()}
  {@render labelBlockPreview()}
{/snippet}

{#snippet errorComponentPreview()}
  {@render errorBlockPreview()}
{/snippet}

{#snippet disabledComponentPreview()}
  {@render disabledBlockPreview()}
{/snippet}

<!-- Overview section -->
{#snippet overview()}
  <div class="text-lg text-muted-foreground space-y-4">
    <p>
      Relay Input provides a specialized text input for entering and validating Nostr relay URLs (WebSocket addresses). It automatically fetches relay metadata via NIP-11 and displays relay information including name, icon, and description.
    </p>

    <p>
      The input features intelligent debouncing to prevent excessive NIP-11 requests while typing, real-time URL validation, and visual feedback for valid/invalid relay addresses. Relay icons from NIP-11 metadata automatically replace the default input icon when available.
    </p>

    <p>
      Supports standard input states including labels, helper text, error states, and disabled mode for locked relay configurations.
    </p>
  </div>
{/snippet}

<!-- Recipes section (Features) -->
{#snippet recipes()}
  <div class="space-y-6">
    <div>
      <h3 class="text-xl font-semibold mb-4">Features</h3>
      <div class="grid gap-4 md:grid-cols-2">
        <div class="border rounded-lg p-4">
          <h4 class="font-semibold mb-2">NIP-11 Autocomplete</h4>
          <p class="text-sm text-muted-foreground">
            Automatically fetches and displays relay metadata including name, icon, and description.
          </p>
        </div>
        <div class="border rounded-lg p-4">
          <h4 class="font-semibold mb-2">Icon Replacement</h4>
          <p class="text-sm text-muted-foreground">
            Replaces the input icon with the relay's icon from NIP-11 data when available.
          </p>
        </div>
        <div class="border rounded-lg p-4">
          <h4 class="font-semibold mb-2">URL Validation</h4>
          <p class="text-sm text-muted-foreground">
            Built-in validation for WebSocket URLs (ws:// and wss://) with visual feedback.
          </p>
        </div>
        <div class="border rounded-lg p-4">
          <h4 class="font-semibold mb-2">Debounced Loading</h4>
          <p class="text-sm text-muted-foreground">
            Intelligent debouncing prevents excessive NIP-11 requests while typing.
          </p>
        </div>
      </div>
    </div>
  </div>
{/snippet}

<ComponentPageTemplate
  {metadata}
  {ndk}
  {overview}
  {showcaseComponents}
  {componentsSection}
  {recipes}
/>
