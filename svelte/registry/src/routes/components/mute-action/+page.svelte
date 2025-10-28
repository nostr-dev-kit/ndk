<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { NDKUser } from '@nostr-dev-kit/ndk';
  import CodePreview from '$lib/components/code-preview.svelte';

  import BasicExample from '$lib/ndk/actions/examples/mute-action-basic.svelte';
  import BasicExampleRaw from '$lib/ndk/actions/examples/mute-action-basic.svelte?raw';

  import BuilderExample from '$lib/ndk/actions/examples/mute-action-builder.svelte';
  import BuilderExampleRaw from '$lib/ndk/actions/examples/mute-action-builder.svelte?raw';

  import DirectAPIExample from '$lib/ndk/actions/examples/mute-action-direct-api.svelte';
  import DirectAPIExampleRaw from '$lib/ndk/actions/examples/mute-action-direct-api.svelte?raw';

  const ndk = getContext<NDKSvelte>('ndk');

  const sampleUser = new NDKUser({ pubkey: 'fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52' });
  sampleUser.ndk = ndk;
</script>

<div class="component-page">
  <header>
    <h1>MuteAction</h1>
    <p>Mute button for users with multiple implementation options.</p>
  </header>

  {#if !ndk.$currentUser}
    <div class="warning-box">
      <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
      <p>
        <strong>Login required:</strong> You need to be logged in to mute/unmute users.
        Click "Login" in the sidebar to continue.
      </p>
    </div>
  {/if}

  <section class="demo">
    <h2>Basic Usage</h2>
    <CodePreview
      title="Basic Mute Action"
      description="Simple mute button component"
      code={BasicExampleRaw}
    >
      <BasicExample {ndk} user={sampleUser} />
    </CodePreview>
  </section>

  <section class="demo">
    <h2>Using the Builder</h2>
    <CodePreview
      title="Builder Pattern"
      description="Using createMuteAction for custom implementations"
      code={BuilderExampleRaw}
    >
      <BuilderExample {ndk} user={sampleUser} />
    </CodePreview>
  </section>

  <section class="demo">
    <h2>Direct API Usage</h2>
    <CodePreview
      title="Using ndk.$mutes Directly"
      description="Direct access to the mutes API for maximum flexibility"
      code={DirectAPIExampleRaw}
    >
      <DirectAPIExample {ndk} user={sampleUser} />
    </CodePreview>
  </section>

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
  .component-page {
    max-width: 1200px;
  }

  .component-page > header {
    margin-bottom: 3rem;
  }

  .component-page > header h1 {
    font-size: 2.5rem;
    font-weight: 700;
    margin: 0 0 0.5rem 0;
  }

  .component-page > header p {
    font-size: 1.125rem;
    color: hsl(var(--color-muted-foreground));
    margin: 0;
  }

  .warning-box {
    padding: 1rem;
    background: hsl(40 100% 50% / 0.1);
    border: 1px solid hsl(40 100% 50% / 0.3);
    border-radius: 0.5rem;
    display: flex;
    gap: 0.75rem;
    margin-bottom: 2rem;
  }

  .warning-box .icon {
    width: 1.25rem;
    height: 1.25rem;
    color: hsl(40 100% 40%);
    flex-shrink: 0;
    margin-top: 0.125rem;
  }

  .warning-box p {
    margin: 0;
    color: hsl(var(--color-foreground));
    font-size: 0.875rem;
  }

  .demo {
    margin-bottom: 3rem;
    padding-bottom: 3rem;
    border-bottom: 1px solid hsl(var(--color-border));
  }

  .demo:last-child {
    border-bottom: none;
  }

  .component-page > section > h2 {
    font-size: 1.5rem;
    font-weight: 600;
    margin: 0 0 1.5rem 0;
    color: hsl(var(--color-foreground));
  }

  .api-docs {
    background: hsl(var(--color-muted) / 0.3);
    border: 1px solid hsl(var(--color-border));
    border-radius: 0.5rem;
    padding: 1.5rem;
  }

  .api-docs h3 {
    margin: 0 0 0.5rem 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: hsl(var(--color-foreground));
  }

  .api-docs p {
    margin: 0 0 1rem 0;
    color: hsl(var(--color-muted-foreground));
  }

  .api-docs pre {
    margin: 0;
    padding: 1rem;
    background: hsl(var(--color-background));
    border: 1px solid hsl(var(--color-border));
    border-radius: 0.375rem;
    overflow-x: auto;
  }

  .api-docs code {
    font-family: 'Monaco', 'Courier New', monospace;
    font-size: 0.875rem;
    line-height: 1.6;
    color: hsl(var(--color-foreground));
  }
</style>
