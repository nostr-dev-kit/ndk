<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import ComponentPageTemplate from '$lib/templates/ComponentPageTemplate.svelte';
  import { nip05Metadata, nip05DefaultCard, nip05StandaloneCard } from '$lib/component-registry/nip05';
  import { EditProps } from '$lib/site-components/edit-props';
  import type { ShowcaseBlock } from '$lib/templates/types';

  // Import examples
  import DefaultExample from './examples/default.svelte';
  import StandaloneExample from './examples/standalone.svelte';

  const ndk = getContext<NDKSvelte>('ndk');

  let examplePubkey = $state<string>('fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52');
</script>

<!-- EditProps snippet -->
{#snippet editPropsSection()}
  <EditProps.Root>
    <EditProps.Prop name="User pubkey" type="text" bind:value={examplePubkey} />
    <EditProps.Button>Edit Examples</EditProps.Button>
  </EditProps.Root>
{/snippet}

<!-- Preview snippets for showcase -->
{#snippet defaultPreview()}
  <DefaultExample {ndk} pubkey={examplePubkey} />
{/snippet}

{#snippet standalonePreview()}
  <StandaloneExample {ndk} pubkey={examplePubkey} />
{/snippet}

<!-- Preview snippets for components section -->
{#snippet defaultComponentPreview()}
  <DefaultExample {ndk} pubkey={examplePubkey} />
{/snippet}

{#snippet standaloneComponentPreview()}
  <StandaloneExample {ndk} pubkey={examplePubkey} />
{/snippet}

<!-- Showcase blocks with preview snippets -->
{@const showcaseBlocks: ShowcaseBlock[] = [
  {
    name: 'Default',
    description: 'With verification badge',
    command: 'npx shadcn@latest add user',
    preview: defaultPreview,
    cardData: nip05DefaultCard
  },
  {
    name: 'Standalone',
    description: 'Without User.Root context',
    command: 'npx shadcn@latest add user',
    preview: standalonePreview,
    cardData: nip05StandaloneCard
  }
]}

<!-- Additional features section -->
{#snippet afterComponents()}
  <section class="mt-16">
    <h2 class="text-3xl font-bold mb-4">Features</h2>
    <ul class="space-y-2 text-muted-foreground list-disc list-inside">
      <li><strong>Actual Verification:</strong> Fetches from the domain to verify the NIP-05 pubkey matches (using <code class="px-2 py-1 bg-muted rounded text-sm">user.validateNip05()</code>)</li>
      <li><strong>Verification States:</strong> Shows different indicators for verifying (⋯), verified (✓), or invalid (✗)</li>
      <li><strong>Smart Formatting:</strong> Always hides username for default identifiers (_@domain shows as just domain)</li>
      <li><strong>Simple API:</strong> Just two props - showNip05 and showVerified (both default to true)</li>
      <li><strong>Dual Mode:</strong> Works in context mode (within User.Root) or standalone</li>
    </ul>
  </section>
{/snippet}

<!-- Use the template -->
<ComponentPageTemplate
  metadata={nip05Metadata}
  {ndk}
  {showcaseBlocks}
  {editPropsSection}
  {afterComponents}
  componentsSection={{
    cards: nip05Metadata.cards,
    previews: {
      'user-nip05': defaultComponentPreview,
      'user-nip05-standalone': standaloneComponentPreview
    }
  }}
  apiDocs={nip05Metadata.apiDocs}
/>
