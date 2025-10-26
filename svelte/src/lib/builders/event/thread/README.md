# Thread View Builder

A reactive Nostr thread builder that handles the complexity of thread reconstruction, missing events, and UI rendering hints.

## Features

- 🔍 **Smart tag parsing** - Automatically handles NIP-10 markers and legacy tag conventions
- 🔄 **Reactive updates** - Thread structure updates automatically as events stream in
- 🕳️ **Missing event handling** - Treats missing events as first-class citizens with relay hints
- 🎨 **UI metadata** - Provides hints for rendering vertical thread lines (Twitter/X style)
- 🧭 **Navigation** - Focus on different events without rebuilding everything
- 🧹 **Clean subscriptions** - Single cleanup method handles all resources

## Usage

```typescript
import { createThreadView } from '@nostr-dev-kit/svelte';

const thread = createThreadView({
  ndk,
  focusedEvent: eventIdOrEvent,
  maxDepth: 20,        // Optional: max parent chain depth
  kinds: [1, 9802]     // Optional: event kinds to include
});

// Access reactive data
thread.parents  // ThreadNode[] - parent chain from root to main
thread.main     // NDKEvent - the focused event
thread.replies  // NDKEvent[] - direct replies

// Navigate to different event
await thread.focusOn(replyEvent);

// Cleanup when done
onDestroy(() => thread.cleanup());
```

## ThreadNode Structure

Each node in the parent chain includes:

```typescript
{
  id: string;                    // Event ID
  event: NDKEvent | null;        // Event if loaded, null if missing
  relayHint?: string;            // Relay hint from e-tag
  threading?: {
    isSelfThread: boolean;       // Same author replying to self
    showLineToNext: boolean;     // Show vertical line to next node
    depth: number;               // Nesting depth
    isMainChain: boolean;        // Main chain vs branch
  }
}
```

## UI Implementation Example

```svelte
{#each thread.parents as node}
  <div class="relative">
    {#if node.event}
      <NoteCard event={node.event} />
    {:else}
      <MissingEventCard id={node.id} relayHint={node.relayHint} />
    {/if}

    <!-- Vertical thread line -->
    {#if node.threading?.showLineToNext}
      <div class="thread-line"
           class:self-thread={node.threading.isSelfThread} />
    {/if}
  </div>
{/each}

<NoteCard event={thread.main} variant="focused" />

{#each thread.replies as reply}
  <NoteCard event={reply} />
{/each}
```

## Implementation Benefits

**Before**: ~244 lines of subscription management, tag parsing, and state handling

**After**: ~20 lines using `createThreadView`

The builder handles:
- Multiple tag convention detection
- Parent chain walking with loop protection
- Missing event fetching with relay hints
- Direct reply filtering
- Reactive state management
- Subscription lifecycle

## Files

- `types.ts` - Type definitions (ThreadNode, ThreadView, ThreadingMetadata)
- `utils.ts` - Thread utilities (tag parsing, chain building, reply filtering)
- `index.ts` - Main createThreadView function with reactive state management