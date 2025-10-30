<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { EditProps } from '$lib/ndk/edit-props';
	import Demo from '$site-components/Demo.svelte';
  import ApiTable from '$site-components/api-table.svelte';

  // Import examples
  import BasicExample from './examples/basic.svelte';
  import BasicExampleRaw from './examples/basic.svelte?raw';
  import CustomizationExample from './examples/customization.svelte';
  import CustomizationExampleRaw from './examples/customization.svelte?raw';

  const ndk = getContext<NDKSvelte>('ndk');

  let examplePubkey = $state<string>('fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52');
  let size = $state<'sm' | 'md' | 'lg' | 'xl'>('md');
  let truncate = $state<boolean>(false);
</script>

<div class="component-page">
  <header>
    <h1>UserProfile.Name</h1>
    <p>Display user names with automatic fallbacks. Part of the UserProfile component system.</p>

    <EditProps.Root>
      <EditProps.Prop name="User pubkey" type="text" bind:value={examplePubkey} />
      <EditProps.Prop name="Size" type="select" bind:value={size} options={['sm', 'md', 'lg', 'xl']} />
      <EditProps.Prop name="Truncate" type="boolean" bind:value={truncate} />
    </EditProps.Root>
  </header>

  <section class="demo space-y-8">
    <h2 class="text-2xl font-semibold mb-4">Examples</h2>

    <Demo
      title="Basic Usage"
      description="Display user names with three field options: displayName (shows display name, falls back to name or pubkey), name (shows username/name), or both (shows 'Display Name (@username)' format)."
      code={BasicExampleRaw}
    >
      <BasicExample {ndk} pubkey={examplePubkey} />
    </Demo>

    <Demo
      title="Customization"
      description="Customize the appearance with size variants (sm, md, lg, xl) and optional truncation for long names. Use the controls above to adjust the settings."
      code={CustomizationExampleRaw}
    >
      <CustomizationExample {ndk} pubkey={examplePubkey} {size} {truncate} />
    </Demo>
  </section>

  <section class="info">
    <h2>Props</h2>
    <ApiTable
      rows={[
        { name: 'field', type: "'name' | 'displayName' | 'both'", default: "'displayName'", description: 'Which name field to display' },
        { name: 'size', type: "'sm' | 'md' | 'lg' | 'xl'", default: "'md'", description: 'Text size' },
        { name: 'truncate', type: 'boolean', default: 'false', description: 'Truncate long names with ellipsis' },
        { name: 'class', type: 'string', default: "''", description: 'Additional CSS classes' }
      ]}
    />
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
</style>
