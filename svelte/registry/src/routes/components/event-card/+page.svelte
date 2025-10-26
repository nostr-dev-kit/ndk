<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { NDKEvent, NDKKind } from '@nostr-dev-kit/ndk';
  import { EventCard, ReplyAction, RepostAction, ReactionAction } from '$lib/ndk/event-card';
  import type { ThreadingMetadata } from '$lib/ndk/event-card';

  const ndk = getContext<NDKSvelte>('ndk');

  // Create example events
  const exampleNote = new NDKEvent(ndk, {
    kind: NDKKind.Text,
    content: 'This is an example Nostr note! 🎉\n\nThe EventCard component can display any event type and is fully composable. You can mix and match the Header, Content, and Actions components however you like.',
    pubkey: 'fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52',
    created_at: Math.floor(Date.now() / 1000) - 3600,
    tags: []
  } as any);

  const threadNote = new NDKEvent(ndk, {
    kind: NDKKind.Text,
    content: 'This is part of a thread with vertical lines showing the connection.',
    pubkey: 'fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52',
    created_at: Math.floor(Date.now() / 1000) - 7200,
    tags: [
      ['e', 'parent-event-id', '', 'reply']
    ]
  } as any);

  const selfThreadNote = new NDKEvent(ndk, {
    kind: NDKKind.Text,
    content: 'When the same author replies to themselves, the thread line is styled differently.',
    pubkey: 'fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52',
    created_at: Math.floor(Date.now() / 1000) - 1800,
    tags: [
      ['e', threadNote.id, '', 'reply']
    ]
  } as any);

  // Threading metadata examples
  const threadingMetadata: ThreadingMetadata = {
    showLineToNext: true,
    isSelfThread: false,
    depth: 0,
    isMainChain: true
  };

  const selfThreadingMetadata: ThreadingMetadata = {
    showLineToNext: true,
    isSelfThread: true,
    depth: 1,
    isMainChain: true
  };
</script>

<div class="component-page">
  <header>
    <h1>EventCard</h1>
    <p>Composable event display components for any NDKEvent type.</p>
  </header>

  <section class="demo">
    <h2>Basic EventCard</h2>
    <p class="demo-description">
      A simple event card with header, content, and action buttons.
    </p>
    <div class="demo-container">
      <EventCard.Root {ndk} event={exampleNote}>
        <EventCard.Header />
        <EventCard.Content />
        <EventCard.Actions>
          <ReplyAction />
          <RepostAction />
          <ReactionAction />
        </EventCard.Actions>
      </EventCard.Root>
    </div>
  </section>

  <section class="demo">
    <h2>Compact Variant</h2>
    <p class="demo-description">
      Minimal header with truncated content.
    </p>
    <div class="demo-container">
      <EventCard.Root {ndk} event={exampleNote}>
        <EventCard.Header variant="compact" showMenu={false} />
        <EventCard.Content truncate={100} />
        <EventCard.Actions>
          <ReactionAction emoji="🤙" />
        </EventCard.Actions>
      </EventCard.Root>
    </div>
  </section>

  <section class="demo">
    <h2>Thread View with Lines</h2>
    <p class="demo-description">
      Event cards with thread lines showing conversation flow.
    </p>
    <div class="demo-container">
      <!-- Parent -->
      <EventCard.Root {ndk} event={threadNote} threading={threadingMetadata}>
        <EventCard.ThreadLine />
        <EventCard.Header variant="compact" />
        <EventCard.Content />
        <EventCard.Actions>
          <ReplyAction />
          <ReactionAction />
        </EventCard.Actions>
      </EventCard.Root>

      <!-- Self-thread reply -->
      <EventCard.Root {ndk} event={selfThreadNote} threading={selfThreadingMetadata}>
        <EventCard.ThreadLine />
        <EventCard.Header variant="compact" />
        <EventCard.Content />
        <EventCard.Actions>
          <ReactionAction emoji="❤️" />
        </EventCard.Actions>
      </EventCard.Root>
    </div>
  </section>

  <section class="demo">
    <h2>Custom Composition</h2>
    <p class="demo-description">
      Full control over component arrangement and styling.
    </p>
    <div class="demo-container">
      <EventCard.Root {ndk} event={exampleNote} class="custom-card">
        <div class="custom-layout">
          <EventCard.Header variant="minimal" showTimestamp={false} />
          <EventCard.Content />
          <div class="custom-actions">
            <ReactionAction emoji="🔥" />
            <ReactionAction emoji="💯" />
            <ReactionAction emoji="🚀" />
          </div>
        </div>
      </EventCard.Root>
    </div>
  </section>

  <section class="demo">
    <h2>Interactive Card</h2>
    <p class="demo-description">
      Clickable card that navigates to event page.
    </p>
    <div class="demo-container">
      <EventCard.Root {ndk} event={exampleNote} interactive>
        <EventCard.Header />
        <EventCard.Content truncate={150} />
      </EventCard.Root>
    </div>
  </section>

  <section class="code-examples">
    <h2>Usage Examples</h2>

    <div class="code-block">
      <h3>Basic Usage</h3>
      <pre><code>{`<EventCard.Root {ndk} {event}>
  <EventCard.Header />
  <EventCard.Content />
  <EventCard.Actions>
    <ReplyAction />
    <RepostAction />
    <ReactionAction />
  </EventCard.Actions>
</EventCard.Root>`}</code></pre>
    </div>

    <div class="code-block">
      <h3>Thread View</h3>
      <pre><code>{`<EventCard.Root {event} {threading}>
  <EventCard.ThreadLine />
  <EventCard.Header variant="compact" />
  <EventCard.Content />
  <EventCard.Actions>
    <ReplyAction />
    <ReactionAction />
  </EventCard.Actions>
</EventCard.Root>`}</code></pre>
    </div>

    <div class="code-block">
      <h3>Custom Actions</h3>
      <pre><code>{`<EventCard.Actions>
  <ReactionAction emoji="🔥" />
  <ReactionAction emoji="💯" />
  <ReactionAction emoji="🚀" />
  <CustomShareButton />
</EventCard.Actions>`}</code></pre>
    </div>
  </section>
</div>

<style>
  .component-page {
    max-width: 900px;
  }

  header {
    margin-bottom: 2rem;
  }

  header h1 {
    font-size: 2.5rem;
    font-weight: 800;
    margin: 0 0 0.5rem 0;
    color: #111827;
  }

  header p {
    font-size: 1.125rem;
    color: #6b7280;
    margin: 0;
  }

  section {
    margin-bottom: 3rem;
  }

  section h2 {
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0 0 0.5rem 0;
    color: #111827;
  }

  .demo-description {
    color: #6b7280;
    margin: 0 0 1rem 0;
  }

  .demo {
    padding: 1.5rem;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 0.75rem;
  }

  .demo-container {
    padding: 1.5rem;
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
  }

  .custom-card :global(.custom-layout) {
    padding: 1rem;
  }

  .custom-actions {
    display: flex;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
  }

  .code-examples {
    padding: 1.5rem;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 0.75rem;
  }

  .code-block {
    margin-bottom: 2rem;
  }

  .code-block:last-child {
    margin-bottom: 0;
  }

  .code-block h3 {
    font-size: 1rem;
    font-weight: 600;
    margin: 0 0 0.5rem 0;
    color: #374151;
  }

  .code-block pre {
    margin: 0;
    padding: 1rem;
    background: #1f2937;
    border-radius: 0.5rem;
    overflow-x: auto;
  }

  .code-block code {
    font-family: 'Monaco', 'Menlo', monospace;
    font-size: 0.875rem;
    line-height: 1.5;
    color: #e5e7eb;
  }
</style>