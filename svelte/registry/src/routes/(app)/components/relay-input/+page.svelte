<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import ComponentPageTemplate from '$lib/site/templates/ComponentPageTemplate.svelte';  import type { ShowcaseComponent } from '$lib/site/templates/types';

  // Import code examples
  import relayInputBasicCode from './relay-input-basic.example?raw';
  import relayInputLabelCode from './relay-input-label.example?raw';
  import relayInputErrorCode from './relay-input-error.example?raw';
  import relayInputDisabledCode from './relay-input-disabled.example?raw';

  import RelayInputBlock from '$lib/registry/components/relay/inputs/basic/relay-input.svelte';

  // Get page data
  let { data } = $props();
  const { metadata } = data;

  const ndk = getContext<NDKSvelte>('ndk');

  let basicBlockUrl = $state<string>('');
  let labelBlockUrl = $state<string>('');
  let errorBlockUrl = $state<string>('');

  // Showcase blocks
    const showcaseComponents: ShowcaseComponent[] = [
    {
      cardData: metadata.cards[0],
      preview: basicBlockPreview
    },
    {
      cardData: metadata.cards[1],
      preview: labelBlockPreview
    },
    {
      cardData: metadata.cards[2],
      preview: errorBlockPreview
    },
    {
      cardData: metadata.cards[3],
      preview: disabledBlockPreview
    }
  ];
</script>

<!-- Block Presets preview snippets -->
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

<!-- Custom sections for Features -->
{#snippet customSections()}
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
{/snippet}

<ComponentPageTemplate
  metadata={metadata}
  {ndk}
  showcaseComponents={showcaseComponents}
  componentsSection={{
    cards: [
      { ...metadata.cards[0], code: relayInputBasicCode },
      { ...metadata.cards[1], code: relayInputLabelCode },
      { ...metadata.cards[2], code: relayInputErrorCode },
      { ...metadata.cards[3], code: relayInputDisabledCode }
    ],
    previews: {
      'relay-input-basic': basicBlockPreview,
      'relay-input-label': labelBlockPreview,
      'relay-input-error': errorBlockPreview,
      'relay-input-disabled': disabledBlockPreview
    }
  }}
  {customSections}
  apiDocs={metadata.apiDocs}
/>
