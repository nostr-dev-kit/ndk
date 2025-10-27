<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { createZapAction } from '@nostr-dev-kit/svelte';
  import { NDKEvent, NDKKind } from '@nostr-dev-kit/ndk';
  import ZapAction from '$lib/ndk/actions/zap-action.svelte';
  import CodePreview from '$lib/components/code-preview.svelte';

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
    <CodePreview
      title="Basic Usage"
      description="Simple zap button with automatic amount tracking"
      code={`<ZapAction {ndk} event={event} />`}
    >
      <div class="demo-event-card">
        <div class="event-content">
          <p>{sampleEvent.content}</p>
        </div>
        <div class="event-actions">
          <ZapAction {ndk} event={sampleEvent} />
        </div>
      </div>
    </CodePreview>
  </section>

  <section class="demo">
    <CodePreview
      title="Custom Amount"
      description="Specify a custom zap amount in satoshis"
      code={`<ZapAction {ndk} event={event} amount={5000} />`}
    >
      <div class="demo-event-card">
        <div class="event-content">
          <p>{sampleEvent.content}</p>
        </div>
        <div class="event-actions">
          <ZapAction {ndk} event={sampleEvent} amount={5000} />
        </div>
      </div>
    </CodePreview>
  </section>

  <section class="demo">
    <CodePreview
      title="Using the Builder"
      description="Create custom zap UI using the builder pattern"
      code={`const zap = createZapAction(ndk, () => event);

<button class:zapped={zap.hasZapped}>
  ⚡ {zap.totalAmount} sats
</button>`}
    >
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
    </CodePreview>
  </section>
</div>

<style>
  .component-page { max-width: 1200px; }
  header { margin-bottom: 3rem; }
  header h1 { font-size: 2.5rem; font-weight: 700; margin: 0 0 0.5rem 0; }
  header p { font-size: 1.125rem; color: hsl(var(--color-muted-foreground)); margin: 0; }
  .demo { margin-bottom: 2rem; }
  .demo:last-child { margin-bottom: 0; }
  .demo-event-card { background: hsl(var(--color-card)); border: 1px solid hsl(var(--color-border)); border-radius: 0.75rem; padding: 1.5rem; }
  .event-content { margin-bottom: 1rem; }
  .event-content p { margin: 0; line-height: 1.6; }
  .event-actions { display: flex; gap: 0.5rem; padding-top: 1rem; border-top: 1px solid hsl(var(--color-border)); }
  .custom-btn { padding: 0.5rem 1rem; background: hsl(var(--color-card)); border: 1px solid hsl(var(--color-border)); border-radius: 0.5rem; cursor: pointer; }
  .custom-btn.zapped { color: #f59e0b; }
</style>
