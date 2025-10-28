# Thread View Builder

A reactive Nostr thread builder that handles the complexity of thread reconstruction, missing events, and UI rendering hints.

## Features

- 🔍 **Smart tag parsing** - Automatically handles NIP-10 markers and legacy tag conventions
- 🔄 **Reactive updates** - Thread structure updates automatically as events stream in
- 🧵 **Thread continuation detection** - Separates same-author linear threads from other replies
- 🌲 **Recursive descendant fetching** - Automatically discovers all thread events, even without root markers
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
thread.events         // ThreadNode[] - complete linear thread chain
thread.replies        // NDKEvent[] - replies to focused event only
thread.otherReplies   // NDKEvent[] - replies to other events in thread
thread.allReplies     // NDKEvent[] - all replies (replies + otherReplies)
thread.focusedEventId // string | null - ID of the focused event

// Navigate to different event
await thread.focusOn(replyEvent);

// Cleanup is automatic when component unmounts
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
<!-- Linear thread chain -->
{#each thread.events as node}
  {#if node.event}
    <div class="relative">
      <!-- Check if this is the focused event -->
      {#if node.event.id === thread.focusedEventId}
        <NoteCard event={node.event} variant="focused" />
      {:else}
        <NoteCard event={node.event} />
      {/if}

      <!-- Vertical thread line -->
      {#if node.threading?.showLineToNext}
        <div class="thread-line"
             class:self-thread={node.threading.isSelfThread} />
      {/if}
    </div>
  {:else}
    <MissingEventCard id={node.id} relayHint={node.relayHint} />
  {/if}
{/each}

<!-- Replies to focused event -->
{#each thread.replies as reply}
  <NoteCard event={reply} variant="reply" />
{/each}

<!-- Replies to other events in thread (optional) -->
{#each thread.otherReplies as reply}
  <NoteCard event={reply} variant="other-reply" />
{/each}
```

## Implementation Benefits

**Before**: ~244 lines of subscription management, tag parsing, and state handling

**After**: ~20 lines using `createThreadView`

The builder handles:
- Multiple tag convention detection
- Parent chain walking with loop protection
- Thread continuation detection (same-author linear chains)
- Recursive descendant fetching (discovers full thread tree)
- Missing event fetching with relay hints
- Direct reply filtering (excluding continuation events)
- Reactive state management
- Subscription lifecycle

## Files

- `types.ts` - Type definitions (ThreadNode, ThreadView, ThreadingMetadata)
- `utils.ts` - Thread utilities (tag parsing, chain building, reply filtering)
- `index.ts` - Main createThreadView function with reactive state management