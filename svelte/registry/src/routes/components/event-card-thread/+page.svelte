<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { createThreadView } from '@nostr-dev-kit/svelte';
  import { EventCard, ReplyAction, ReactionAction, RepostAction } from '$lib/ndk/event-card';
  import CodePreview from '$lib/components/code-preview.svelte';

  const ndk = getContext<NDKSvelte>('ndk');

  // Default nevent from the user
  const DEFAULT_NEVENT = 'nevent1qvzqqqqqqypzqzw53gd9m0sngp98993578tt5u3dgpgng6xawy7gaguv4xmmduk8qyg8wumn8ghj7mn0wd68ytnddakj7qghwaehxw309aex2mrp0yhxummnw3ezucnpdejz7qpqghp3frrq7j7ja6xqj40x4yrwvux7ymev27e2pvrgjd4gvzj7maassk7g7w';

  // Create thread view builder - handles everything automatically
  // This needs to be at the top level because it uses $state internally
  const thread = createThreadView({
    ndk,
    focusedEvent: DEFAULT_NEVENT
  });
</script>

<div class="container mx-auto p-8 max-w-7xl">
  <div class="mb-12">
    <h1 class="text-4xl font-bold mb-4">EventCard Thread View</h1>
    <p class="text-lg text-muted-foreground mb-6">
      Composable event cards for displaying Nostr threads with proper context, parent chain, and replies.
    </p>
  </div>

  {#if !thread.focusedEventId}
    <div class="flex items-center justify-center py-12">
      <div class="text-muted-foreground">Loading thread...</div>
    </div>
  {:else}
    <!-- Thread View Example -->
    <section class="mb-16">
      <CodePreview
        title="Complete Thread View"
        description="Full thread view showing parent context, main event (highlighted), and replies. Uses EventCard components with threading metadata."
        code={`<script lang="ts">
  import { getContext } from 'svelte';
  import { createThreadView } from '@nostr-dev-kit/svelte';
  import { EventCard, ReplyAction, ReactionAction, RepostAction } from '$lib/ndk/event-card';

  const ndk = getContext<NDKSvelte>('ndk');

  // Create thread view builder - handles everything automatically
  const thread = createThreadView({
    ndk,
    focusedEvent: 'nevent1...'  // Can be nevent string or NDKEvent
  });
</script>

<!-- Linear Thread Chain -->
{#each thread.events as node}
  {#if node.event}
    <EventCard.Root
      {ndk}
      event={node.event}
      threading={node.threading}
    >
      <!-- Highlight the focused event -->
      {#if node.event.id === thread.focusedEventId}
        <div class="focused-event">
          <EventCard.Header variant="default" />
          <EventCard.Content />
          <EventCard.Actions>
            <ReplyAction />
            <RepostAction />
            <ReactionAction />
          </EventCard.Actions>
        </div>
      {:else}
        <EventCard.ThreadLine />
        <EventCard.Header variant="compact" />
        <EventCard.Content />
      {/if}
    </EventCard.Root>
  {:else}
    <!-- Missing event placeholder -->
    <div class="missing-event">
      Event {node.id} not found
      {#if node.relayHint}(hint: {node.relayHint}){/if}
    </div>
  {/if}
{/each}

<!-- Replies to Focused Event -->
{#each thread.replies as reply}
  <EventCard.Root {ndk} event={reply}>
    <EventCard.Header variant="compact" />
    <EventCard.Content />
    <EventCard.Actions>
      <ReplyAction />
      <RepostAction />
      <ReactionAction />
    </EventCard.Actions>
  </EventCard.Root>
{/each}

<!-- Replies to Other Events in Thread -->
{#each thread.otherReplies as reply}
  <EventCard.Root {ndk} event={reply}>
    <EventCard.Header variant="compact" />
    <EventCard.Content />
    <EventCard.Actions>
      <ReplyAction />
      <RepostAction />
      <ReactionAction />
    </EventCard.Actions>
  </EventCard.Root>
{/each}`}
      >
        <div class="border border-border rounded-lg overflow-hidden">
          <!-- Linear Thread Chain -->
          {#each thread.events as node, index}
            {#if node.event}
            {#key node.event.id}
              <!-- Check if this is the focused event -->
              {#if node.event.id === thread.focusedEventId}
                <!-- Focused Event (Highlighted) -->
                <div class="bg-accent/10 border-l-4 border-primary">
                  <EventCard.Root {ndk} event={node.event}>
                    <div
                      class="bg-background cursor-pointer"
                      onclick={() => thread.focusOn(node.event)}
                      role="button"
                      tabindex="0"
                    >
                      <EventCard.Header variant="default" />
                      <div class="text-lg">
                        <EventCard.Content class="text-xl" />
                      </div>
                      <EventCard.Actions>
                        <ReplyAction />
                        <RepostAction />
                        <ReactionAction />
                      </EventCard.Actions>
                    </div>
                  </EventCard.Root>
                </div>
              {:else}
                <!-- Thread Event (Parent or Continuation) -->
                <EventCard.Root
                  {ndk}
                  event={node.event}
                  threading={node.threading}
                >
                  <div
                    class="relative border-b border-border bg-background hover:bg-accent/5 transition-colors cursor-pointer"
                    onclick={() => thread.focusOn(node.event)}
                    role="button"
                    tabindex="0"
                  >
                    <EventCard.ThreadLine />
                    <div class="p-4">
                      <EventCard.Header variant="compact" />
                      <EventCard.Content />
                    </div>
                  </div>
                </EventCard.Root>
              {/if}
              {/key}
            {:else}
              <div class="border-b border-border p-4 bg-background text-muted-foreground text-sm">
                Missing event: {node.id.slice(0, 8)}...
                {#if node.relayHint}(hint: {node.relayHint}){/if}
              </div>
            {/if}
          {/each}

          <!-- Replies to Focused Event -->
          {#if thread.replies.length > 0}
            <div class="border-t border-border bg-purple-50 px-4 py-3">
              <h3 class="text-sm font-semibold text-purple-700">
                {thread.replies.length} {thread.replies.length === 1 ? 'Reply' : 'Replies'} to Focused Event
              </h3>
            </div>
            {#each thread.replies as reply}
              <EventCard.Root {ndk} event={reply}>
                <div
                  class="border-t border-border bg-background hover:bg-accent/5 transition-colors p-4 cursor-pointer"
                  onclick={() => thread.focusOn(reply)}
                  role="button"
                  tabindex="0"
                >
                  <EventCard.Header variant="compact" />
                  <EventCard.Content />
                  <EventCard.Actions>
                    <ReplyAction />
                    <RepostAction />
                    <ReactionAction />
                  </EventCard.Actions>
                </div>
              </EventCard.Root>
            {/each}
          {/if}

          <!-- Replies to Other Events in Thread -->
          {#if thread.otherReplies.length > 0}
            <div class="border-t border-border bg-orange-50 px-4 py-3">
              <h3 class="text-sm font-semibold text-orange-700">
                {thread.otherReplies.length} {thread.otherReplies.length === 1 ? 'Reply' : 'Replies'} to Other Thread Events
              </h3>
            </div>
            {#each thread.otherReplies as reply}
              <EventCard.Root {ndk} event={reply}>
                <div
                  class="border-t border-border bg-background hover:bg-accent/5 transition-colors p-4 cursor-pointer"
                  onclick={() => thread.focusOn(reply)}
                  role="button"
                  tabindex="0"
                >
                  <EventCard.Header variant="compact" />
                  <EventCard.Content />
                  <EventCard.Actions>
                    <ReplyAction />
                    <RepostAction />
                    <ReactionAction />
                  </EventCard.Actions>
                </div>
              </EventCard.Root>
            {/each}
          {/if}
        </div>
      </CodePreview>
    </section>

    <!-- Thread Line Example -->
    <section class="mb-16">
      <CodePreview
        title="Thread Lines"
        description="EventCard.ThreadLine component shows visual connection between events in a thread."
        code={`<EventCard.Root {ndk} {event} threading={{ showLineToNext: true }}>
  <EventCard.ThreadLine />
  <EventCard.Header />
  <EventCard.Content />
</EventCard.Root>`}
      >
        <div class="border border-border rounded-lg overflow-hidden">
          {#each thread.events as node}
            {#if node.event}
              <EventCard.Root
                {ndk}
                event={node.event}
                threading={node.threading}
                class="!rounded-none !shadow-none !overflow-visible border-b border-border last:border-b-0"
              >
                <div class="relative bg-background hover:bg-accent/5 transition-colors p-4">
                  <EventCard.ThreadLine />
                  <EventCard.Header variant="compact" class="!p-0 !border-0 !mb-2" />
                  <EventCard.Content />
                </div>
              </EventCard.Root>
            {/if}
          {/each}
        </div>
      </CodePreview>
    </section>

    <!-- Compact Thread View -->
    <section class="mb-16">
      <CodePreview
        title="Compact Thread View"
        description="Space-efficient thread view with compact headers, perfect for mobile or sidebar views."
        code={`<EventCard.Root {ndk} {event}>
  <EventCard.Header variant="compact" />
  <EventCard.Content />
  <EventCard.Actions variant="compact" />
</EventCard.Root>`}
      >
        <div class="border border-border rounded-lg overflow-hidden max-w-md">
          {#each thread.events as node}
            {#if node.event}
              <EventCard.Root {ndk} event={node.event}>
                <div class="border-b border-border last:border-b-0 bg-background hover:bg-accent/5 transition-colors p-3">
                  <EventCard.Header variant="compact" />
                  <EventCard.Content />
                  <EventCard.Actions variant="compact">
                    <ReplyAction />
                    <ReactionAction />
                  </EventCard.Actions>
                </div>
              </EventCard.Root>
            {/if}
          {/each}
        </div>
      </CodePreview>
    </section>
  {/if}

  <!-- Component API -->
  <section class="mb-16">
    <h2 class="text-2xl font-bold mb-4">Threading API</h2>

    <div class="space-y-6">
      <div class="border border-border rounded-lg p-6">
        <h3 class="text-xl font-semibold mb-3">createThreadView()</h3>
        <p class="text-muted-foreground mb-4">
          Reactive thread builder from @nostr-dev-kit/svelte that handles everything automatically.
        </p>
        <div class="bg-muted p-4 rounded-lg">
          <code class="text-sm">
            const thread = createThreadView(&#123;<br/>
            &nbsp;&nbsp;ndk,<br/>
            &nbsp;&nbsp;focusedEvent: 'nevent1...' | NDKEvent,<br/>
            &nbsp;&nbsp;maxDepth?: 20,<br/>
            &nbsp;&nbsp;kinds?: [1, 9802]<br/>
            &#125;);<br/><br/>
            // Returns:<br/>
            thread.events          // ThreadNode[] - complete linear chain<br/>
            thread.replies         // NDKEvent[] - replies to focused event only<br/>
            thread.otherReplies    // NDKEvent[] - replies to other thread events<br/>
            thread.allReplies      // NDKEvent[] - all replies (replies + otherReplies)<br/>
            thread.focusedEventId  // string | null - ID of focused event<br/>
            thread.focusOn(event)  // Navigate to different event<br/>
            // Cleanup is automatic when component unmounts
          </code>
        </div>
      </div>

      <div class="border border-border rounded-lg p-6">
        <h3 class="text-xl font-semibold mb-3">ThreadNode Structure</h3>
        <p class="text-muted-foreground mb-4">
          Each parent in the chain includes event data and threading metadata.
        </p>
        <div class="bg-muted p-4 rounded-lg">
          <code class="text-sm">
            id: string - Event ID<br/>
            event: NDKEvent | null - Event if loaded, null if missing<br/>
            relayHint?: string - Relay hint from e-tag<br/>
            threading?: &#123;<br/>
            &nbsp;&nbsp;isSelfThread: boolean - Same author chain<br/>
            &nbsp;&nbsp;showLineToNext: boolean - Show vertical line<br/>
            &nbsp;&nbsp;depth: number - Nesting depth<br/>
            &nbsp;&nbsp;isMainChain: boolean - Main vs branch<br/>
            &#125;
          </code>
        </div>
      </div>

      <div class="border border-border rounded-lg p-6">
        <h3 class="text-xl font-semibold mb-3">Automatic Features</h3>
        <p class="text-muted-foreground mb-4">
          The builder automatically handles complex threading scenarios.
        </p>
        <div class="bg-muted p-4 rounded-lg">
          <code class="text-sm">
            ✓ Multiple tag convention support (NIP-10 + legacy)<br/>
            ✓ Missing event detection and fetching<br/>
            ✓ Relay hints from e-tags<br/>
            ✓ Recursive descendant fetching (finds all thread events)<br/>
            ✓ Thread continuation detection (same-author linear chains)<br/>
            ✓ Direct reply filtering (excludes continuation events)<br/>
            ✓ Reactive updates as events stream in<br/>
            ✓ Parent chain with loop protection<br/>
            ✓ Self-thread detection
          </code>
        </div>
      </div>

      <div class="border border-border rounded-lg p-6">
        <h3 class="text-xl font-semibold mb-3">Event Tag Structure (NIP-10)</h3>
        <p class="text-muted-foreground mb-4">
          Nostr event tags for threading (automatically parsed by createThreadView).
        </p>
        <div class="bg-muted p-4 rounded-lg">
          <code class="text-sm">
            ["e", &lt;event-id&gt;, &lt;relay-url&gt;, "root"] - Root of thread<br/>
            ["e", &lt;event-id&gt;, &lt;relay-url&gt;, "reply"] - Direct reply to<br/>
            ["e", &lt;event-id&gt;, &lt;relay-url&gt;, "mention"] - Mentioned event
          </code>
        </div>
      </div>
    </div>
  </section>
</div>
