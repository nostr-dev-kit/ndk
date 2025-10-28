<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { createReplyAction } from '@nostr-dev-kit/svelte';
  import { NDKEvent, NDKKind } from '@nostr-dev-kit/ndk';
  import ReplyAction from '$lib/ndk/actions/reply-action.svelte';
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

  const replyState = $derived(sampleEvent ? createReplyAction(() => ({ ndk, event: sampleEvent! })) : null);
</script>

<div class="component-page">
  <header>
    <h1>ReplyAction</h1>
    <p>Reply button with count display and reply composer.</p>
  </header>

  {#if sampleEvent && replyState}
    <section class="demo">
      <h2>Basic Usage</h2>
      <CodePreview
        title="Basic ReplyAction"
        description="Click to open reply composer. The button shows the current reply count."
        code={`<ReplyAction {ndk} event={event} />`}
      >
        <div class="demo-event-card">
          <div class="event-content">
            <p>{sampleEvent.content}</p>
          </div>
          <div class="event-actions">
            <ReplyAction {ndk} event={sampleEvent} />
            <div class="count-display">
              {replyState.count} {replyState.count === 1 ? 'reply' : 'replies'}
            </div>
          </div>
        </div>
      </CodePreview>
    </section>

    <section class="demo">
      <h2>Using the Builder with Count</h2>
      <CodePreview
        title="Custom Implementation with Count"
        description="Build your own reply button showing the count"
        code={`const reply = createReplyAction(() => ({ ndk, event }));

<button onclick={() => reply.reply("Great post!")}>
  💬 Reply ({reply.count})
</button>`}
      >
        <div class="demo-event-card">
          <div class="event-content">
            <p>{sampleEvent.content}</p>
          </div>
          <div class="event-actions">
            <button class="custom-reply-btn">
              💬 Reply ({replyState.count})
            </button>
          </div>
        </div>
      </CodePreview>
    </section>

    <section class="demo">
      <h2>Count Only Display</h2>
      <CodePreview
        title="Just Show the Count"
        description="Display reply count without interaction"
        code={`const reply = createReplyAction(() => ({ ndk, event }));

<div class="stat">
  {reply.count} {reply.count === 1 ? 'reply' : 'replies'}
</div>`}
      >
        <div class="demo-event-card">
          <div class="event-content">
            <p>{sampleEvent.content}</p>
          </div>
          <div class="event-actions">
            <div class="stat-display">
              {replyState.count} {replyState.count === 1 ? 'reply' : 'replies'}
            </div>
          </div>
        </div>
      </CodePreview>
    </section>
  {:else}
    <section class="demo">
      <p>Loading event...</p>
    </section>
  {/if}
</div>

<style>
  .component-page {
    max-width: 1200px;
  }

  header {
    margin-bottom: 3rem;
  }

  header h1 {
    font-size: 2.5rem;
    font-weight: 700;
    margin: 0 0 0.5rem 0;
  }

  header p {
    font-size: 1.125rem;
    color: hsl(var(--color-muted-foreground));
    margin: 0;
  }

  .demo {
    margin-bottom: 3rem;
    padding-bottom: 3rem;
    border-bottom: 1px solid hsl(var(--color-border));
  }

  .demo:last-child {
    border-bottom: none;
  }

  h2 {
    font-size: 1.5rem;
    font-weight: 600;
    margin: 0 0 1.5rem 0;
    color: hsl(var(--color-foreground));
  }

  .demo-event-card {
    background: hsl(var(--color-card));
    border: 1px solid hsl(var(--color-border));
    border-radius: 0.75rem;
    padding: 1.5rem;
  }

  .event-content {
    margin-bottom: 1rem;
  }

  .event-content p {
    margin: 0;
    line-height: 1.6;
    color: hsl(var(--color-foreground));
  }

  .event-actions {
    display: flex;
    gap: 1rem;
    align-items: center;
    padding-top: 1rem;
    border-top: 1px solid hsl(var(--color-border));
  }

  .custom-reply-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: hsl(var(--color-card));
    border: 1px solid hsl(var(--color-border));
    border-radius: 0.5rem;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s;
  }

  .custom-reply-btn:hover {
    background: hsl(var(--color-muted));
  }

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
</style>
