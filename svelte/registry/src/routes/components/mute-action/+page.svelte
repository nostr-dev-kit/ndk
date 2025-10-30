<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { NDKUser } from '@nostr-dev-kit/ndk';
  import { EditProps } from '$lib/ndk/edit-props';
	import Demo from '$site-components/Demo.svelte';
  import Alert from '$site-components/alert.svelte';

  import BasicExample from './examples/mute-action-basic.svelte';
  import BasicExampleRaw from './examples/mute-action-basic.svelte?raw';

  import BuilderExample from './examples/mute-action-builder.svelte';
  import BuilderExampleRaw from './examples/mute-action-builder.svelte?raw';

  const ndk = getContext<NDKSvelte>('ndk');

  let sampleUser = $state<NDKUser | undefined>();

  $effect(() => {
    (async () => {
      try {
        const user = await ndk.getUserFromNip05('pablo@nostr.com');
        if (user && !sampleUser) sampleUser = user;
      } catch (err) {
        console.error('Failed to fetch sample user:', err);
      }
    })();
  });
</script>

<div class="component-page">
  <header>
    <h1>MuteAction</h1>
    <p>Mute button for users with multiple implementation options.</p>

    <EditProps.Root>
      <EditProps.Prop name="Sample User" type="user" bind:value={sampleUser} />
    </EditProps.Root>
  </header>

  {#if !ndk.$currentUser}
    <Alert variant="warning" title="Login required">
      <p>You need to be logged in to mute/unmute users. Click "Login" in the sidebar to continue.</p>
    </Alert>
  {/if}

  {#if sampleUser}
    <section class="demo space-y-8">
      <h2 class="text-2xl font-semibold mb-4">Examples</h2>

      <Demo
        title="Basic Mute Action"
        description="Simple mute button component"
        code={BasicExampleRaw}
      >
        <BasicExample {ndk} user={sampleUser} />
      </Demo>

      <Demo
        title="Using the Builder"
        description="Using createMuteAction() for custom implementations with full control"
        code={BuilderExampleRaw}
      >
        <BuilderExample {ndk} user={sampleUser} />
      </Demo>
    </section>
  {/if}

  <section class="demo">
    <h2>API Reference</h2>
    <div class="api-docs">
      <h3>ndk.$mutes API</h3>
      <p>The mutes store provides a Set-like interface with async methods that publish to the network:</p>
      <pre><code>{`// Check if user is muted (use $derived for reactivity)
const isMuted = $derived(ndk.$mutes.has(pubkey));

// Mute a user
await ndk.$mutes.mute(pubkey);

// Unmute a user
await ndk.$mutes.unmute(pubkey);

// Toggle mute status
await ndk.$mutes.toggle(pubkey);

// Iterate over muted users
for (const pubkey of ndk.$mutes) {
  console.log(\`Muted: \${pubkey}\`);
}

// Get count (use $derived for reactivity)
const count = $derived(ndk.$mutes.size);`}</code></pre>
    </div>
  </section>
</div>

<style>
  .api-docs {
    background: color-mix(in srgb, var(--color-muted) calc(0.3 * 100%), transparent);
    border: 1px solid var(--color-border);
    border-radius: 0.5rem;
    padding: 1.5rem;
  }

  .api-docs h3 {
    margin: 0 0 0.5rem 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--color-foreground);
  }

  .api-docs p {
    margin: 0 0 1rem 0;
    color: var(--color-muted-foreground);
  }

  .api-docs pre {
    margin: 0;
    padding: 1rem;
    background: var(--color-background);
    border: 1px solid var(--color-border);
    border-radius: 0.375rem;
    overflow-x: auto;
  }

  .api-docs code {
    font-family: 'Monaco', 'Courier New', monospace;
    font-size: 0.875rem;
    line-height: 1.6;
    color: var(--color-foreground);
  }
</style>
