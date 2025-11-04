<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import ComponentPageTemplate from '$lib/templates/ComponentPageTemplate.svelte';
  import { nameMetadata, nameBasicCard, nameCustomizationCard } from '$lib/component-registry/name';
  import { EditProps } from '$lib/site-components/edit-props';
  import type { ShowcaseBlock } from '$lib/templates/types';

  // Import examples
  import BasicExample from './examples/basic.svelte';
  import CustomizationExample from './examples/customization.svelte';

  const ndk = getContext<NDKSvelte>('ndk');

  let examplePubkey = $state<string>('fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52');
  let size = $state<'sm' | 'md' | 'lg' | 'xl'>('md');
  let truncate = $state<boolean>(false);
</script>

<!-- EditProps snippet -->
{#snippet editPropsSection()}
  <EditProps.Root>
    <EditProps.Prop name="User pubkey" type="text" bind:value={examplePubkey} />
    <EditProps.Prop
      name="Size"
      type="text"
      value={size}
      onchange={(v) => size = (v as 'sm' | 'md' | 'lg' | 'xl')}
    />
    <EditProps.Prop
      name="Truncate"
      type="text"
      value={truncate.toString()}
      onchange={(v) => truncate = v === 'true'}
    />
    <EditProps.Button>Edit Examples</EditProps.Button>
  </EditProps.Root>
{/snippet}

<!-- Preview snippets for showcase -->
{#snippet basicPreview()}
  <BasicExample {ndk} pubkey={examplePubkey} />
{/snippet}

{#snippet customizationPreview()}
  <CustomizationExample {ndk} pubkey={examplePubkey} {size} {truncate} />
{/snippet}

<!-- Preview snippets for components section -->
{#snippet basicComponentPreview()}
  <BasicExample {ndk} pubkey={examplePubkey} />
{/snippet}

{#snippet customizationComponentPreview()}
  <CustomizationExample {ndk} pubkey={examplePubkey} {size} {truncate} />
{/snippet}

<!-- Showcase blocks with preview snippets -->
{@const showcaseBlocks: ShowcaseBlock[] = [
  {
    name: 'Basic',
    description: 'Display name, username, or both',
    command: 'npx shadcn@latest add user',
    preview: basicPreview,
    cardData: nameBasicCard
  },
  {
    name: 'Customization',
    description: 'Size variants and truncation',
    command: 'npx shadcn@latest add user',
    preview: customizationPreview,
    cardData: nameCustomizationCard
  }
]}

<!-- Use the template -->
<ComponentPageTemplate
  metadata={nameMetadata}
  {ndk}
  {showcaseBlocks}
  {editPropsSection}
  componentsSection={{
    cards: nameMetadata.cards,
    previews: {
      'user-name': basicComponentPreview,
      'user-name-customization': customizationComponentPreview
    }
  }}
  apiDocs={nameMetadata.apiDocs}
/>
