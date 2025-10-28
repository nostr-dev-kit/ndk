<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { createThreadView } from '@nostr-dev-kit/svelte';
  import CodePreview from '$lib/components/code-preview.svelte';

  import ThreadCompleteExample from '$lib/ndk/event-card/examples/thread-complete.svelte';
  import ThreadCompleteExampleRaw from '$lib/ndk/event-card/examples/thread-complete.svelte?raw';

  import ThreadLinesExample from '$lib/ndk/event-card/examples/thread-lines.svelte';
  import ThreadLinesExampleRaw from '$lib/ndk/event-card/examples/thread-lines.svelte?raw';

  import ThreadCompactExample from '$lib/ndk/event-card/examples/thread-compact.svelte';
  import ThreadCompactExampleRaw from '$lib/ndk/event-card/examples/thread-compact.svelte?raw';

  const ndk = getContext<NDKSvelte>('ndk');

  const DEFAULT_NEVENT = 'nevent1qvzqqqqqqypzqzw53gd9m0sngp98993578tt5u3dgpgng6xawy7gaguv4xmmduk8qyg8wumn8ghj7mn0wd68ytnddakj7qghwaehxw309aex2mrp0yhxummnw3ezucnpdejz7qpqghp3frrq7j7ja6xqj40x4yrwvux7ymev27e2pvrgjd4gvzj7maassk7g7w';

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
    <section class="mb-16">
      <CodePreview
        title="Complete Thread View"
        description="Full thread view showing parent context, main event (highlighted), and replies. Uses EventCard components with threading metadata."
        code={ThreadCompleteExampleRaw}
      >
        <ThreadCompleteExample {ndk} nevent={DEFAULT_NEVENT} />
      </CodePreview>
    </section>

    <section class="mb-16">
      <CodePreview
        title="Thread Lines"
        description="EventCard.ThreadLine component shows visual connection between events in a thread."
        code={ThreadLinesExampleRaw}
      >
        <ThreadLinesExample {ndk} nevent={DEFAULT_NEVENT} />
      </CodePreview>
    </section>

    <section class="mb-16">
      <CodePreview
        title="Compact Thread View"
        description="Space-efficient thread view with compact headers, perfect for mobile or sidebar views."
        code={ThreadCompactExampleRaw}
      >
        <ThreadCompactExample {ndk} nevent={DEFAULT_NEVENT} />
      </CodePreview>
    </section>
  {/if}

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
