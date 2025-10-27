<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { createZapAction } from '@nostr-dev-kit/svelte';
  import { NDKEvent, NDKKind } from '@nostr-dev-kit/ndk';
  import ZapAction from '$lib/ndk/actions/zap-action.svelte';

  const ndk = getContext<NDKSvelte>('ndk');

  const sampleEvent = new NDKEvent(ndk, {
    kind: NDKKind.Text,
    content: 'This is a sample note to demonstrate zaps!',
    pubkey: 'fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52',
    created_at: Math.floor(Date.now() / 1000),
    tags: []
  });
  sampleEvent.id = 'demo-event-zap-showcase';

  const zapState = createZapAction(ndk, () => sampleEvent);
</script>

<div class="component-page">
  <header>
    <h1>ZapAction</h1>
    <p>Zap (lightning payment) button with amount display.</p>
  </header>

  <section class="demo">
    <h2>Basic Usage</h2>
    <div class="demo-container">
      <div class="demo-event-card">
        <div class="event-content">
          <p>{sampleEvent.content}</p>
        </div>
        <div class="event-actions">
          <ZapAction {ndk} event={sampleEvent} />
        </div>
      </div>
    </div>
    <div class="code-block">
      <pre><code>{`<ZapAction {ndk} event={event} />`}</code></pre>
    </div>
  </section>

  <section class="demo">
    <h2>Custom Amount</h2>
    <div class="demo-container">
      <div class="demo-event-card">
        <div class="event-content">
          <p>{sampleEvent.content}</p>
        </div>
        <div class="event-actions">
          <ZapAction {ndk} event={sampleEvent} amount={5000} />
        </div>
      </div>
    </div>
    <div class="code-block">
      <pre><code>{`<ZapAction {ndk} event={event} amount={5000} />`}</code></pre>
    </div>
  </section>

  <section class="demo">
    <h2>Using the Builder</h2>
    <div class="demo-container">
      <div class="demo-event-card">
        <div class="event-content">
          <p>{sampleEvent.content}</p>
        </div>
        <div class="event-actions">
          <button class="custom-btn" class:zapped={zapState.hasZapped}>
            ⚡ {zapState.totalAmount} sats
          </button>
        </div>
      </div>
    </div>
    <div class="code-block">
      <pre><code>{`const zap = createZapAction(ndk, () => event);

<button class:zapped={zap.hasZapped}>
  ⚡ {zap.totalAmount} sats
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
  .demo-event-card { background: hsl(var(--color-card)); border: 1px solid hsl(var(--color-border)); border-radius: 0.75rem; padding: 1.5rem; }
  .event-content { margin-bottom: 1rem; }
  .event-content p { margin: 0; line-height: 1.6; }
  .event-actions { display: flex; gap: 0.5rem; padding-top: 1rem; border-top: 1px solid hsl(var(--color-border)); }
  .code-block { background: hsl(var(--color-muted)); border-radius: 0.5rem; padding: 1rem; overflow-x: auto; }
  .code-block pre { margin: 0; }
  .code-block code { font-family: 'Monaco', 'Courier New', monospace; font-size: 0.875rem; }
  .custom-btn { padding: 0.5rem 1rem; background: hsl(var(--color-card)); border: 1px solid hsl(var(--color-border)); border-radius: 0.5rem; cursor: pointer; }
  .custom-btn.zapped { color: #f59e0b; }
</style>
