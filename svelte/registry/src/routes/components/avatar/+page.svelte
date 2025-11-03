<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { EditProps } from '$lib/site-components/edit-props';
	import Demo from '$site-components/Demo.svelte';
  import ApiTable from '$site-components/api-table.svelte';

  // Import examples
  import BasicExample from './examples/basic.svelte';
  import BasicExampleRaw from './examples/basic.svelte?raw';
  import FallbackExample from './examples/fallback.svelte';
  import FallbackExampleRaw from './examples/fallback.svelte?raw';

  const ndk = getContext<NDKSvelte>('ndk');

  let examplePubkey = $state<string>('fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52');
  let size = $state<number>(48);
</script>

<div class="component-page">
  <header>
    <EditProps.Root>
      <EditProps.Prop name="User pubkey" type="text" bind:value={examplePubkey} />
      <EditProps.Prop name="Size (pixels)" type="number" bind:value={size} />
    	<EditProps.Button>Edit Examples</EditProps.Button>
    </EditProps.Root>
    <div class="header-title">
      <h1>UserProfile.Avatar</h1>
    </div>
    <p>Display user avatars with automatic fallbacks. Part of the UserProfile component system.</p>
  </header>

  <section class="demo space-y-8">
    <h2 class="text-2xl font-semibold mb-4">Examples</h2>

    <Demo
      title="Basic Usage"
      description="Display user avatars with customizable size in pixels. Use the controls above to adjust the size and try different users."
      code={BasicExampleRaw}
    >
      <BasicExample {ndk} pubkey={examplePubkey} {size} />
    </Demo>

    <Demo
      title="With Fallback"
      description="When no profile picture is available, avatars automatically show initials with a gradient background generated from the pubkey."
      code={FallbackExampleRaw}
    >
      <FallbackExample {ndk} />
    </Demo>
  </section>

  <section class="info">
    <h2>Props</h2>
    <ApiTable
      rows={[
        { name: 'size', type: 'number', default: '48', description: 'Avatar size in pixels' },
        { name: 'fallback', type: 'string', default: 'undefined', description: 'Fallback image URL' },
        { name: 'alt', type: 'string', default: 'undefined', description: 'Alt text for the image' },
        { name: 'class', type: 'string', default: "''", description: 'Additional CSS classes' }
      ]}
    />
  </section>
</div>

<style>
  .header-title {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .info {
    padding: 2rem;
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 0.75rem;
    margin-top: 2rem;
  }

  .info h2 {
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0 0 1rem 0;
    color: var(--foreground);
  }
</style>
