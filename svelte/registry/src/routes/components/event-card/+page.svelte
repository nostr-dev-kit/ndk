<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { EventCard, ReplyAction, RepostAction, ReactionAction } from '$lib/ndk/event-card';
  import type { ThreadingMetadata } from '$lib/ndk/event-card';
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import CodePreview from '$lib/components/code-preview.svelte';

  const ndk = getContext<NDKSvelte>('ndk');

  let neventInput = $state('nevent1qvzqqqqqqypzp75cf0tahv5z7plpdeaws7ex52nmnwgtwfr2g3m37r844evqrr6jqyxhwumn8ghj7e3h0ghxjme0qyd8wumn8ghj7urewfsk66ty9enxjct5dfskvtnrdakj7qpqn35mrh4hpc53m3qge6m0exys02lzz9j0sxdj5elwh3hc0e47v3qqpq0a0n');
  let exampleNote = $state<NDKEvent | undefined>();
  let threadNote = $state<NDKEvent | undefined>();
  let selfThreadNote = $state<NDKEvent | undefined>();

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

  $effect(() => {
    const input = neventInput;

    ndk.fetchEvent(input).then(event => {
      if (event) {
        exampleNote = event;
        threadNote = event;
        selfThreadNote = event;
      }
    });
  });
</script>

<div class="component-page">
  <header>
    <h1>EventCard</h1>
    <p>Composable event display components for any NDKEvent type.</p>
  </header>

  <section class="controls">
    <label>
      <span class="label-text">Test with different event (nevent, note, or event ID):</span>
      <input
        type="text"
        bind:value={neventInput}
        placeholder="nevent1... or note1... or hex event id"
        class="nevent-input"
      />
    </label>
  </section>

  {#if !exampleNote}
    <div class="loading">Loading real events...</div>
  {:else}
    <section class="demo">
      <CodePreview
        title="Basic EventCard"
        description="A simple event card with header, content, and action buttons."
        code={`<EventCard.Root {ndk} {event}>
  <div class="flex items-center justify-between p-4 border-b">
    <div class="flex items-center gap-3 flex-1">
      <EventCard.Header showMenu={false} class="!p-0 !border-0" />
    </div>
    <EventCard.Dropdown />
  </div>
  <EventCard.Content />
  <EventCard.Actions>
    <ReplyAction />
    <RepostAction />
    <ReactionAction />
  </EventCard.Actions>
</EventCard.Root>`}
      >
        <EventCard.Root {ndk} event={exampleNote}>
          <div class="flex items-center justify-between p-4 border-b" style="border-bottom-color: #f0f0f0;">
            <div class="flex items-center gap-3 flex-1">
              <EventCard.Header showMenu={false} class="!p-0 !border-0" />
            </div>
            <EventCard.Dropdown />
          </div>
          <EventCard.Content />
          <EventCard.Actions>
            <ReplyAction />
            <RepostAction />
            <ReactionAction />
          </EventCard.Actions>
        </EventCard.Root>
      </CodePreview>
    </section>

    <section class="demo">
      <CodePreview
        title="Compact Variant"
        description="Minimal header with truncated content."
        code={`<EventCard.Root {ndk} {event}>
  <EventCard.Header variant="compact" showMenu={false} />
  <EventCard.Content truncate={100} />
  <EventCard.Actions>
    <ReactionAction emoji="🤙" />
  </EventCard.Actions>
</EventCard.Root>`}
      >
        <EventCard.Root {ndk} event={exampleNote}>
          <EventCard.Header variant="compact" showMenu={false} />
          <EventCard.Content truncate={100} />
          <EventCard.Actions>
            <ReactionAction emoji="🤙" />
          </EventCard.Actions>
        </EventCard.Root>
      </CodePreview>
    </section>

    <section class="demo">
      <CodePreview
        title="Thread View with Lines"
        description="Event cards with thread lines showing conversation flow."
        code={`<EventCard.Root {event} {threading}>
  <EventCard.ThreadLine />
  <EventCard.Header variant="compact" />
  <EventCard.Content />
  <EventCard.Actions>
    <ReplyAction />
    <ReactionAction />
  </EventCard.Actions>
</EventCard.Root>`}
      >
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
      </CodePreview>
    </section>

    <section class="demo">
      <CodePreview
        title="Custom Composition"
        description="Full control over component arrangement and styling."
        code={`<EventCard.Root {ndk} {event} class="custom-card">
  <div class="custom-layout">
    <EventCard.Header variant="minimal" showTimestamp={false} />
    <EventCard.Content />
    <div class="custom-actions">
      <ReactionAction emoji="🔥" />
      <ReactionAction emoji="💯" />
      <ReactionAction emoji="🚀" />
    </div>
  </div>
</EventCard.Root>`}
      >
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
      </CodePreview>
    </section>

    <section class="demo">
      <CodePreview
        title="Interactive Card"
        description="Clickable card that navigates to event page."
        code={`<EventCard.Root {ndk} {event} interactive>
  <EventCard.Header />
  <EventCard.Content truncate={150} />
</EventCard.Root>`}
      >
        <EventCard.Root {ndk} event={exampleNote} interactive>
          <EventCard.Header />
          <EventCard.Content truncate={150} />
        </EventCard.Root>
      </CodePreview>
    </section>

    <section class="demo">
      <CodePreview
        title="Dropdown Menu"
        description="Self-contained dropdown menu with event options (mute, report, copy, view raw)."
        code={`<EventCard.Root {ndk} {event}>
  <div class="header-with-dropdown">
    <EventCard.Header showMenu={false} />
    <EventCard.Dropdown />
  </div>
  <EventCard.Content />
  <EventCard.Actions>
    <ReplyAction />
    <ReactionAction />
  </EventCard.Actions>
</EventCard.Root>`}
      >
        <EventCard.Root {ndk} event={exampleNote}>
          <div class="header-with-dropdown">
            <EventCard.Header showMenu={false} />
            <EventCard.Dropdown />
          </div>
          <EventCard.Content />
          <EventCard.Actions>
            <ReplyAction />
            <ReactionAction />
          </EventCard.Actions>
        </EventCard.Root>
      </CodePreview>
    </section>
  {/if}
</div>

<style>
  .component-page {
    max-width: 900px;
  }

  .loading {
    padding: 2rem;
    text-align: center;
    color: #6b7280;
    font-size: 1.125rem;
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

  .demo {
    padding: 1.5rem;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 0.75rem;
  }

  .custom-card :global(.custom-layout) {
    padding: 1rem;
  }

  .custom-actions {
    display: flex;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
  }

  .header-with-dropdown {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .controls {
    margin-bottom: 2rem;
    padding: 1.5rem;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 0.75rem;
  }

  .controls label {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .label-text {
    font-size: 0.875rem;
    font-weight: 600;
    color: #374151;
  }

  .nevent-input {
    padding: 0.5rem 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 0.375rem;
    font-family: 'Monaco', 'Menlo', monospace;
    font-size: 0.875rem;
    width: 100%;
    max-width: 600px;
  }

  .nevent-input:focus {
    outline: none;
    border-color: #8b5cf6;
    box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
  }
</style>