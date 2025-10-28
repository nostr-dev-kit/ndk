<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { createRepostAction } from '@nostr-dev-kit/svelte';
  import { NDKEvent, NDKKind } from '@nostr-dev-kit/ndk';
  import RepostAction from '$lib/ndk/actions/repost-action.svelte';
  import CodePreview from '$lib/components/code-preview.svelte';

  const ndk = getContext<NDKSvelte>('ndk');

  // Fetch a real event for demonstration
  let sampleEvent = $state<NDKEvent | undefined>();

  $effect(() => {
    ndk.fetchEvent('nevent1qqsqqe0hd9e2y5mf7qffkfv4w4rxcv63rj458fqj9hn08cwrn23wnvgwrvg7j')
      .then(event => {
        if (event) sampleEvent = event;
      })
      .catch(err => console.error('Failed to fetch sample event:', err));
  });

  const repostState = $derived(sampleEvent ? createRepostAction(() => ({ ndk, event: sampleEvent! })) : null);
</script>

<div class="component-page">
  <header>
    <h1>RepostAction</h1>
    <p>Repost button with count display. Tracks both regular reposts and quote posts.</p>
  </header>

  {#if sampleEvent && repostState}
    <section class="demo">
      <h2>Basic Usage</h2>
      <CodePreview
        title="Basic RepostAction"
        description="Simple repost button with automatic count tracking (includes quotes)"
        code={`<RepostAction {ndk} event={event} />`}
      >
        <div class="demo-event-card">
          <div class="event-content">
            <p>{sampleEvent.content}</p>
          </div>
          <div class="event-actions">
            <RepostAction {ndk} event={sampleEvent} />
            <div class="count-display">
              {repostState.count} repost{repostState.count === 1 ? '' : 's'}
            </div>
          </div>
        </div>
      </CodePreview>
    </section>

    <section class="demo">
      <h2>Using the Builder with Count</h2>
      <CodePreview
        title="Custom Implementation with Count"
        description="Build your own repost button showing the count"
        code={`const repost = createRepostAction(() => ({ ndk, event }));

<button onclick={repost.repost} class:active={repost.hasReposted}>
  🔄 Repost ({repost.count})
</button>

<!-- For quote posts with commentary -->
<button onclick={() => repost.quote("Great insight!")}>
  💬 Quote
</button>`}
      >
        <div class="demo-event-card">
          <div class="event-content">
            <p>{sampleEvent.content}</p>
          </div>
          <div class="event-actions">
            <button class="custom-btn" class:active={repostState.hasReposted} onclick={repostState.repost}>
              🔄 Repost ({repostState.count})
            </button>
          </div>
        </div>
      </CodePreview>
    </section>

    <section class="demo">
      <h2>Count Only Display</h2>
      <CodePreview
        title="Just Show the Count"
        description="Display repost count without interaction"
        code={`const repost = createRepostAction(() => ({ ndk, event }));

<div class="stat">
  {repost.count} reposts & quotes
</div>`}
      >
        <div class="demo-event-card">
          <div class="event-content">
            <p>{sampleEvent.content}</p>
          </div>
          <div class="event-actions">
            <div class="stat-display">
              {repostState.count} repost{repostState.count === 1 ? '' : 's'} & quote{repostState.count === 1 ? '' : 's'}
            </div>
          </div>
        </div>
      </CodePreview>
    </section>

    <section class="demo">
      <h2>Features</h2>
      <div class="feature-box">
        <h3>What's Counted</h3>
        <ul>
          <li><strong>Regular reposts:</strong> Kind 6 and Kind 16 events with #e tag</li>
          <li><strong>Quote posts:</strong> Events with #q tag referencing this event</li>
          <li><strong>All combined:</strong> Total shows both types together</li>
        </ul>
      </div>
    </section>
  {:else}
    <section class="demo">
      <p>Loading event...</p>
    </section>
  {/if}
</div>

<style>
  .component-page { max-width: 1200px; }
  header { margin-bottom: 3rem; }
  header h1 { font-size: 2.5rem; font-weight: 700; margin: 0 0 0.5rem 0; }
  header p { font-size: 1.125rem; color: hsl(var(--color-muted-foreground)); margin: 0; }
  .demo { margin-bottom: 3rem; padding-bottom: 3rem; border-bottom: 1px solid hsl(var(--color-border)); }
  .demo:last-child { border-bottom: none; }
  h2 { font-size: 1.5rem; font-weight: 600; margin: 0 0 1.5rem 0; color: hsl(var(--color-foreground)); }
  h3 { font-size: 1.25rem; font-weight: 600; margin: 0 0 0.75rem 0; color: hsl(var(--color-foreground)); }
  .demo-event-card { background: hsl(var(--color-card)); border: 1px solid hsl(var(--color-border)); border-radius: 0.75rem; padding: 1.5rem; }
  .event-content { margin-bottom: 1rem; }
  .event-content p { margin: 0; line-height: 1.6; color: hsl(var(--color-foreground)); }
  .event-actions { display: flex; gap: 1rem; align-items: center; padding-top: 1rem; border-top: 1px solid hsl(var(--color-border)); }
  .custom-btn { padding: 0.5rem 1rem; background: hsl(var(--color-card)); border: 1px solid hsl(var(--color-border)); border-radius: 0.5rem; cursor: pointer; transition: all 0.2s; }
  .custom-btn:hover { background: hsl(var(--color-muted)); }
  .custom-btn.active { color: #10b981; border-color: #10b981; }
  .count-display {
    font-size: 0.875rem;
    font-weight: 500;
    color: hsl(var(--color-muted-foreground));
    padding: 0.5rem 0.75rem;
    background: hsl(var(--color-muted) / 0.5);
    border-radius: 0.375rem;
  }
  .stat-display {
    font-size: 1rem;
    font-weight: 600;
    color: hsl(var(--color-foreground));
  }
  .feature-box {
    background: hsl(var(--color-muted) / 0.3);
    border: 1px solid hsl(var(--color-border));
    border-radius: 0.5rem;
    padding: 1.5rem;
  }
  .feature-box ul {
    margin: 0;
    padding-left: 1.5rem;
    color: hsl(var(--color-foreground));
  }
  .feature-box li {
    margin-bottom: 0.5rem;
    line-height: 1.6;
  }
  .feature-box strong {
    color: hsl(var(--color-primary));
  }
</style>
