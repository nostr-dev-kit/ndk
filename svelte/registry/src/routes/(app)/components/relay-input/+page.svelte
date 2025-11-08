<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import ComponentPageTemplate from '$lib/site/templates/ComponentPageTemplate.svelte';
  import ComponentCard from '$site-components/ComponentCard.svelte';

  // Import code examples
  import relayInputBasicCode from './examples/basic/index.txt?raw';
  import relayInputLabelCode from './examples/label/index.txt?raw';
  import relayInputErrorCode from './examples/error/index.txt?raw';
  import relayInputDisabledCode from './examples/disabled/index.txt?raw';

  // Import component
  import RelayInputBlock from '$lib/registry/components/relay/inputs/basic/relay-input.svelte';

  // Import registry metadata
  import relayInputCard from '$lib/registry/components/relay/inputs/basic/registry.json';

  // Page metadata
  const metadata = {
    title: 'Relay Input',
    description: 'Input components for relay URLs'
  };

  // Card data for variants
  const relayInputLabelCard = { ...relayInputCard, name: 'relay-input-label', title: 'Relay Input with Label', variant: 'label' };
  const relayInputErrorCard = { ...relayInputCard, name: 'relay-input-error', title: 'Relay Input with Error', variant: 'error' };
  const relayInputDisabledCard = { ...relayInputCard, name: 'relay-input-disabled', title: 'Relay Input Disabled', variant: 'disabled' };

  const ndk = getContext<NDKSvelte>('ndk');

  let basicBlockUrl = $state<string>('');
  let labelBlockUrl = $state<string>('');
  let errorBlockUrl = $state<string>('');
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

<!-- Components snippet -->
{#snippet components()}
  <ComponentCard data={{...relayInputCard, code: relayInputBasicCode}}>
    {#snippet preview()}
      {@render basicBlockPreview()}
    {/snippet}
  </ComponentCard>

  <ComponentCard data={{...relayInputLabelCard, code: relayInputLabelCode}}>
    {#snippet preview()}
      {@render labelBlockPreview()}
    {/snippet}
  </ComponentCard>

  <ComponentCard data={{...relayInputErrorCard, code: relayInputErrorCode}}>
    {#snippet preview()}
      {@render errorBlockPreview()}
    {/snippet}
  </ComponentCard>

  <ComponentCard data={{...relayInputDisabledCard, code: relayInputDisabledCode}}>
    {#snippet preview()}
      {@render disabledBlockPreview()}
    {/snippet}
  </ComponentCard>
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
  {metadata}
  {ndk}
  showcaseComponents={[
    {
      id: "relayInputCard",
      cardData: relayInputCard,
      preview: basicBlockPreview
    },
    {
      id: "relayInputLabelCard",
      cardData: relayInputLabelCard,
      preview: labelBlockPreview
    },
    {
      id: "relayInputErrorCard",
      cardData: relayInputErrorCard,
      preview: errorBlockPreview
    },
    {
      id: "relayInputDisabledCard",
      cardData: relayInputDisabledCard,
      preview: disabledBlockPreview
    }
  ]}
  {components}
  {customSections}
  apiDocs={relayInputCard.apiDocs}
/>
