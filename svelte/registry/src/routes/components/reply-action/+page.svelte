<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { createReplyAction } from '@nostr-dev-kit/svelte';
  import { NDKEvent, NDKKind } from '@nostr-dev-kit/ndk';
  import ReplyAction from '$lib/ndk/actions/reply-action.svelte';
  import CodePreview from '$lib/components/code-preview.svelte';

  const ndk = getContext<NDKSvelte>('ndk');

  // Create a sample event for demonstration
  const sampleEvent = new NDKEvent(ndk, {
    kind: NDKKind.Text,
    content: 'This is a sample note to demonstrate replies!',
    pubkey: 'fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52',
    created_at: Math.floor(Date.now() / 1000),
    tags: []
  });
  sampleEvent.id = 'demo-event-reply-showcase';

  const replyState = createReplyAction(ndk, () => sampleEvent);
</script>

<div class="component-page">
  <header>
    <h1>ReplyAction</h1>
    <p>Reply button with count display and reply composer.</p>
  </header>

  <section class="demo">
    <CodePreview
      title="Basic Usage"
      description="Click to open reply composer. The button shows the current reply count."
      code={`<ReplyAction {ndk} event={event} />`}
    >
      <div class="demo-event-card">
        <div class="event-content">
          <p>{sampleEvent.content}</p>
        </div>
        <div class="event-actions">
          <ReplyAction {ndk} event={sampleEvent} />
        </div>
      </div>
    </CodePreview>
  </section>

  <section class="demo">
    <CodePreview
      title="Using the Builder"
      description="Use createReplyAction() for custom UI implementations."
      code={`const reply = createReplyAction(ndk, () => event);

<button>
  💬 {reply.count} {reply.count === 1 ? 'Reply' : 'Replies'}
</button>`}
    >
      <div class="demo-event-card">
        <div class="event-content">
          <p>{sampleEvent.content}</p>
        </div>
        <div class="event-actions">
          <button class="custom-reply-btn">
            💬 {replyState.count} {replyState.count === 1 ? 'Reply' : 'Replies'}
          </button>
        </div>
      </div>
    </CodePreview>
  </section>
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
  }

  .event-actions {
    display: flex;
    gap: 0.5rem;
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
    background: hsl(var(--color-accent));
  }
</style>
