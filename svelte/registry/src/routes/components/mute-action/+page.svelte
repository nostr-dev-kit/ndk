<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { createMuteAction } from '@nostr-dev-kit/svelte';
  import { NDKUser } from '@nostr-dev-kit/ndk';
  import MuteAction from '$lib/ndk/actions/mute-action.svelte';
  import CodePreview from '$lib/components/code-preview.svelte';

  const ndk = getContext<NDKSvelte>('ndk');

  const sampleUser = new NDKUser({ pubkey: 'fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52' });
  sampleUser.ndk = ndk;

  const muteState = createMuteAction(() => ({ ndk, target: sampleUser }));

  // Direct $mutes API usage
  const isMutedDirect = $derived(ndk.$mutes?.has(sampleUser.pubkey) ?? false);

  async function handleDirectToggle() {
    try {
      await ndk.$mutes?.toggle(sampleUser.pubkey);
    } catch (error) {
      console.error('Failed to toggle mute:', error);
    }
  }
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
      code={`<MuteAction {ndk} target={user} />`}
    >
      <div class="demo-card">
        <p>User: {sampleUser.npub.slice(0, 16)}...</p>
        <MuteAction {ndk} target={sampleUser} />
      </div>
    </CodePreview>
  </section>

  <section class="demo">
    <h2>Using the Builder</h2>
    <CodePreview
      title="Builder Pattern"
      description="Using createMuteAction for custom implementations"
      code={`const mute = createMuteAction(() => ({ ndk, target: user }));

<button onclick={mute.mute} class:muted={mute.isMuted}>
  {mute.isMuted ? '🔇 Muted' : '🔊 Mute'}
</button>`}
    >
      <div class="demo-card">
        <p>User: {sampleUser.npub.slice(0, 16)}...</p>
        <button class="custom-btn" class:muted={muteState.isMuted} onclick={muteState.mute}>
          {muteState.isMuted ? '🔇 Muted' : '🔊 Mute'}
        </button>
      </div>
    </CodePreview>
  </section>

  <section class="demo">
    <h2>Direct API Usage</h2>
    <CodePreview
      title="Using ndk.$mutes Directly"
      description="Direct access to the mutes API for maximum flexibility"
      code={`const isMuted = $derived(ndk.$mutes?.has(user.pubkey) ?? false);

async function toggleMute() {
  await ndk.$mutes?.toggle(user.pubkey);
}

<button onclick={toggleMute} class:muted={isMuted}>
  {isMuted ? 'Unmute' : 'Mute'}
</button>`}
    >
      <div class="demo-card">
        <p>User: {sampleUser.npub.slice(0, 16)}...</p>
        <button class="direct-btn" class:muted={isMutedDirect} onclick={handleDirectToggle}>
          {isMutedDirect ? 'Unmute' : 'Mute'}
        </button>
      </div>
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
  .component-page { max-width: 1200px; }
  header { margin-bottom: 3rem; }
  header h1 { font-size: 2.5rem; font-weight: 700; margin: 0 0 0.5rem 0; }
  header p { font-size: 1.125rem; color: hsl(var(--color-muted-foreground)); margin: 0; }

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

  .demo { margin-bottom: 3rem; padding-bottom: 3rem; border-bottom: 1px solid hsl(var(--color-border)); }
  .demo:last-child { border-bottom: none; }
  h2 { font-size: 1.5rem; font-weight: 600; margin: 0 0 1.5rem 0; color: hsl(var(--color-foreground)); }
  .demo-card { background: hsl(var(--color-card)); border: 1px solid hsl(var(--color-border)); border-radius: 0.75rem; padding: 1.5rem; display: flex; justify-content: space-between; align-items: center; }
  .demo-card p { margin: 0; color: hsl(var(--color-foreground)); }

  .custom-btn,
  .direct-btn {
    padding: 0.5rem 1rem;
    background: hsl(var(--color-card));
    border: 1px solid hsl(var(--color-border));
    border-radius: 0.5rem;
    cursor: pointer;
    transition: all 0.2s;
    color: hsl(var(--color-foreground));
  }

  .custom-btn:hover,
  .direct-btn:hover {
    background: hsl(var(--color-muted));
  }

  .custom-btn.muted,
  .direct-btn.muted {
    color: #ef4444;
    border-color: #ef4444;
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
