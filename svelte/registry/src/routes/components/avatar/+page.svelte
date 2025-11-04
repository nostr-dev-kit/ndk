<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import ComponentPageTemplate from '$lib/templates/ComponentPageTemplate.svelte';
  import { avatarMetadata, avatarBasicCard, avatarFallbackCard } from '$lib/component-registry/avatar';
  import { EditProps } from '$lib/site-components/edit-props';
  import type { ShowcaseBlock } from '$lib/templates/types';

  // Import examples
  import BasicExample from './examples/basic.svelte';
  import FallbackExample from './examples/fallback.svelte';

  const ndk = getContext<NDKSvelte>('ndk');

  // State for examples
  let examplePubkey = $state<string>('fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52');
  let size = $state<number>(48);

  // Showcase blocks with preview snippets
  const showcaseBlocks: ShowcaseBlock[] = [
    {
      name: 'Basic',
      description: 'Avatar with customizable size',
      command: 'npx shadcn@latest add user',
      preview: basicPreview,
      cardData: avatarBasicCard
    },
    {
      name: 'Fallback',
      description: 'Deterministic gradient fallback',
      command: 'npx shadcn@latest add user',
      preview: fallbackPreview,
      cardData: avatarFallbackCard
    }
  ];
</script>

<!-- Preview snippets for showcase -->
{#snippet basicPreview()}
  <BasicExample {ndk} pubkey={examplePubkey} {size} />
{/snippet}

{#snippet fallbackPreview()}
  <FallbackExample {ndk} />
{/snippet}

<!-- Preview snippets for components section -->
{#snippet basicComponentPreview()}
  <BasicExample {ndk} pubkey={examplePubkey} {size} />
{/snippet}

{#snippet fallbackComponentPreview()}
  <FallbackExample {ndk} />
{/snippet}

<!-- EditProps snippet -->
{#snippet editPropsSection()}
  <EditProps.Root>
    <EditProps.Prop name="User pubkey" type="text" bind:value={examplePubkey} />
    <EditProps.Prop
      name="Size (pixels)"
      type="text"
      value={size.toString()}
      onchange={(v) => size = parseInt(v) || 48}
    />
    <EditProps.Button>Edit Examples</EditProps.Button>
  </EditProps.Root>
{/snippet}

<!-- Additional info section -->
{#snippet additionalInfo()}
  <section class="mt-16">
    <h2 class="text-3xl font-bold mb-4">Background Loading</h2>
    <p class="text-muted-foreground mb-6">
      Images load in the background to prevent showing broken image states. The component displays the deterministic gradient fallback until the image successfully loads. If the image fails to load, the fallback remains visible indefinitely.
    </p>

    <h3 class="text-xl font-semibold mb-2">Custom Fallback</h3>
    <p class="text-muted-foreground">
      You can provide a custom fallback snippet using the <code class="px-2 py-1 bg-muted rounded text-sm">customFallback</code> prop to replace the default gradient and initials. The custom fallback will be displayed while the image loads and when no image is available.
    </p>
  </section>
{/snippet}

<!-- Use the template -->
<ComponentPageTemplate
  metadata={avatarMetadata}
  {ndk}
  {showcaseBlocks}
  {editPropsSection}
  componentsSection={{
    cards: avatarMetadata.cards,
    previews: {
      'user-avatar': basicComponentPreview,
      'user-avatar-fallback': fallbackComponentPreview
    }
  }}
  apiDocs={avatarMetadata.apiDocs}
  afterComponents={additionalInfo}
/>