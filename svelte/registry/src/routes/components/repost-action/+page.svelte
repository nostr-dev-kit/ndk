<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { createRepostAction } from '@nostr-dev-kit/svelte';
  import { NDKEvent, NDKKind } from '@nostr-dev-kit/ndk';
  import RepostAction from '$lib/ndk/actions/repost-action.svelte';
  import CodePreview from '$lib/components/code-preview.svelte';

  const ndk = getContext<NDKSvelte>('ndk');

  const sampleEvent = new NDKEvent(ndk, {
    kind: NDKKind.Text,
    content: 'This is a sample note to demonstrate reposts!',
    pubkey: 'fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52',
    created_at: Math.floor(Date.now() / 1000),
    tags: []
  });
  sampleEvent.id = 'demo-event-repost-showcase';

  const repostState = createRepostAction(ndk, () => sampleEvent);
</script>

<div class="component-page">
  <header>
    <h1>RepostAction</h1>
    <p>Repost button with count display.</p>
  </header>

  <section class="demo">
    <h2>Basic Usage</h2>
    <CodePreview
      title="Basic RepostAction"
      description="Simple repost button with automatic count tracking"
      code={`<RepostAction {ndk} event={event} />`}
    >
      <div class="demo-event-card">
        <div class="event-content">
          <p>{sampleEvent.content}</p>
        </div>
        <div class="event-actions">
          <RepostAction {ndk} event={sampleEvent} />
        </div>
      </div>
    </CodePreview>
  </section>

  <section class="demo">
    <h2>Using the Builder</h2>
    <CodePreview
      title="Custom Builder Implementation"
      description="Build your own repost button with full control over the UI"
      code={`const repost = createRepostAction(ndk, () => event);

<button class:active={repost.hasReposted}>
  🔄 {repost.count}
</button>`}
    >
      <div class="demo-event-card">
        <div class="event-content">
          <p>{sampleEvent.content}</p>
        </div>
        <div class="event-actions">
          <button class="custom-btn" class:active={repostState.hasReposted}>
            🔄 {repostState.count}
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
  .demo { margin-bottom: 3rem; padding-bottom: 3rem; border-bottom: 1px solid hsl(var(--color-border)); }
  .demo:last-child { border-bottom: none; }
  h2 { font-size: 1.5rem; font-weight: 600; margin: 0 0 1.5rem 0; }
  .demo-event-card { background: hsl(var(--color-card)); border: 1px solid hsl(var(--color-border)); border-radius: 0.75rem; padding: 1.5rem; }
  .event-content { margin-bottom: 1rem; }
  .event-content p { margin: 0; line-height: 1.6; }
  .event-actions { display: flex; gap: 0.5rem; padding-top: 1rem; border-top: 1px solid hsl(var(--color-border)); }
  .custom-btn { padding: 0.5rem 1rem; background: hsl(var(--color-card)); border: 1px solid hsl(var(--color-border)); border-radius: 0.5rem; cursor: pointer; }
  .custom-btn.active { color: #10b981; }
</style>
