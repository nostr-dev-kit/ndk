<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { EditProps } from '$lib/site-components/edit-props';
  import ComponentsShowcaseGrid from '$site-components/ComponentsShowcaseGrid.svelte';
  import ComponentPageSectionTitle from '$site-components/ComponentPageSectionTitle.svelte';
  import ComponentCard from '$site-components/ComponentCard.svelte';
  import ComponentAPI from '$site-components/component-api.svelte';

  // Import examples
  import BasicExample from './examples/basic.svelte';
  import FallbackExample from './examples/fallback.svelte';

  const ndk = getContext<NDKSvelte>('ndk');

  let examplePubkey = $state<string>('fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52');
  let size = $state<number>(48);

  const basicCardData = {
    name: 'user-avatar',
    title: 'User.Avatar',
    description: 'Display user avatars with customizable size.',
    richDescription: 'Images load in the background without showing broken states. The deterministic gradient fallback (based on pubkey) is displayed until the image loads, or when no image is available.',
    command: 'npx shadcn@latest add user',
    apiDocs: [
      {
        name: 'User.Avatar',
        description: 'User avatar component with background loading and automatic fallbacks',
        importPath: "import { User } from '$lib/registry/ui/user'",
        props: [
          { name: 'size', type: 'number', default: '48', description: 'Avatar size in pixels' },
          { name: 'fallback', type: 'string', description: 'Fallback image URL' },
          { name: 'alt', type: 'string', description: 'Alt text for the image' },
          { name: 'class', type: 'string', description: 'Additional CSS classes' },
          { name: 'customFallback', type: 'Snippet', description: 'Custom fallback snippet to replace the default gradient' }
        ]
      }
    ]
  };

  const fallbackCardData = {
    name: 'user-avatar-fallback',
    title: 'Avatar with Fallback',
    description: 'Avatars with deterministic gradient fallback.',
    richDescription: 'When no profile picture is available, avatars automatically show initials with a gradient background generated from the pubkey. The gradient is deterministic - the same pubkey always produces the same gradient.',
    command: 'npx shadcn@latest add user',
    apiDocs: []
  };
</script>

<div class="px-8">
  <!-- Header -->
  <div class="mb-12 pt-8">
    <div class="flex items-start justify-between gap-4 mb-4">
      <h1 class="text-4xl font-bold">User.Avatar</h1>
    </div>
    <p class="text-lg text-muted-foreground mb-6">
      Display user avatars with background image loading and automatic fallbacks. Part of the UserProfile component system.
    </p>

    <EditProps.Root>
      <EditProps.Prop name="User pubkey" type="text" bind:value={examplePubkey} />
      <EditProps.Prop name="Size (pixels)" type="number" bind:value={size} />
      <EditProps.Button>Edit Examples</EditProps.Button>
    </EditProps.Root>
  </div>

  <!-- ComponentsShowcase Section -->
  {#snippet basicPreview()}
    <BasicExample {ndk} pubkey={examplePubkey} {size} />
  {/snippet}

  {#snippet fallbackPreview()}
    <FallbackExample {ndk} />
  {/snippet}

  <ComponentPageSectionTitle
    title="Showcase"
    description="User avatar variants with background loading and fallback states."
  />

  <ComponentsShowcaseGrid
    blocks={[
      {
        name: 'Basic',
        description: 'Avatar with customizable size',
        command: 'npx shadcn@latest add user',
        preview: basicPreview,
        cardData: basicCardData
      },
      {
        name: 'Fallback',
        description: 'Deterministic gradient fallback',
        command: 'npx shadcn@latest add user',
        preview: fallbackPreview,
        cardData: fallbackCardData
      }
    ]}
  />

  <!-- Components Section -->
  <ComponentPageSectionTitle title="Components" description="Explore each avatar variant in detail" />

  <section class="py-12 space-y-16">
    <ComponentCard inline data={basicCardData}>
      {#snippet preview()}
        <BasicExample {ndk} pubkey={examplePubkey} {size} />
      {/snippet}
    </ComponentCard>

    <ComponentCard inline data={fallbackCardData}>
      {#snippet preview()}
        <FallbackExample {ndk} />
      {/snippet}
    </ComponentCard>
  </section>

  <!-- Component API -->
  <ComponentAPI
    components={[
      {
        name: 'User.Avatar',
        description: 'Display user avatars with background loading and automatic fallbacks.',
        importPath: "import { User } from '$lib/registry/ui/user'",
        props: [
          { name: 'size', type: 'number', default: '48', description: 'Avatar size in pixels' },
          { name: 'fallback', type: 'string', description: 'Fallback image URL' },
          { name: 'alt', type: 'string', description: 'Alt text for the image' },
          { name: 'class', type: 'string', description: 'Additional CSS classes' },
          { name: 'customFallback', type: 'Snippet', description: 'Custom fallback snippet to replace the default gradient' }
        ]
      }
    ]}
  />

  <!-- Additional Info -->
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
</div>
