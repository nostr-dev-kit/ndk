<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { createMuteAction } from '@nostr-dev-kit/svelte';
  import { NDKUser } from '@nostr-dev-kit/ndk';
  import MuteAction from '$lib/ndk/actions/mute-action.svelte';

  const ndk = getContext<NDKSvelte>('ndk');

  const sampleUser = new NDKUser({ pubkey: 'fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52' });
  sampleUser.ndk = ndk;

  const muteState = createMuteAction(ndk, () => sampleUser);
</script>

<div class="component-page">
  <header>
    <h1>MuteAction</h1>
    <p>Mute button for users.</p>
  </header>

  <section class="demo">
    <h2>Basic Usage</h2>
    <div class="demo-container">
      <div class="demo-card">
        <p>User: {sampleUser.npub.slice(0, 16)}...</p>
        <MuteAction {ndk} user={sampleUser} />
      </div>
    </div>
    <div class="code-block">
      <pre><code>{`<MuteAction {ndk} user={user} />`}</code></pre>
    </div>
  </section>

  <section class="demo">
    <h2>Using the Builder</h2>
    <div class="demo-container">
      <div class="demo-card">
        <p>User: {sampleUser.npub.slice(0, 16)}...</p>
        <button class="custom-btn" class:muted={muteState.isMuted}>
          {muteState.isMuted ? '🔇 Muted' : '🔊 Mute'}
        </button>
      </div>
    </div>
    <div class="code-block">
      <pre><code>{`const mute = createMuteAction(ndk, () => user);

<button class:muted={mute.isMuted}>
  {mute.isMuted ? '🔇 Muted' : '🔊 Mute'}
</button>`}</code></pre>
    </div>
  </section>
</div>

<style>
  .component-page { max-width: 1200px; }
  header { margin-bottom: 3rem; }
  header h1 { font-size: 2.5rem; font-weight: 700; margin: 0 0 0.5rem 0; }
  header p { font-size: 1.125rem; color: hsl(var(--color-muted-foreground)); margin: 0; }
  .demo { margin-bottom: 3rem; padding-bottom: 3rem; border-bottom: 1px solid hsl(var(--color-border)); }
  .demo:last-child { border-bottom: none; }
  h2 { font-size: 1.5rem; font-weight: 600; margin: 0 0 1.5rem 0; }
  .demo-container { margin-bottom: 1.5rem; }
  .demo-card { background: hsl(var(--color-card)); border: 1px solid hsl(var(--color-border)); border-radius: 0.75rem; padding: 1.5rem; display: flex; justify-content: space-between; align-items: center; }
  .demo-card p { margin: 0; }
  .code-block { background: hsl(var(--color-muted)); border-radius: 0.5rem; padding: 1rem; overflow-x: auto; }
  .code-block pre { margin: 0; }
  .code-block code { font-family: 'Monaco', 'Courier New', monospace; font-size: 0.875rem; }
  .custom-btn { padding: 0.5rem 1rem; background: hsl(var(--color-card)); border: 1px solid hsl(var(--color-border)); border-radius: 0.5rem; cursor: pointer; }
  .custom-btn.muted { color: #ef4444; }
</style>
