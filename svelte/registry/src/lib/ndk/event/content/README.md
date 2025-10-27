# Event Content Component

Rich event content rendering with automatic parsing of mentions, hashtags, media, and more.

## Architecture

This follows the **builder pattern** used by melt-ui and bits-ui:

- **Builder** (`createEventContent`) - Exported from `@nostr-dev-kit/svelte` - handles parsing logic
- **Component** - Copyable UI component from the registry (shadcn-style) - handles rendering

The component hierarchy is organized as:
```
event/
├── content/              # Content parsing and inline rendering
│   ├── event-content.svelte   # Main component
│   ├── event/event.svelte     # Embedded event orchestrator
│   ├── mention/mention.svelte # Inline mention rendering
│   └── hashtag/hashtag.svelte # Inline hashtag rendering
└── cards/
    └── preview/          # Reusable event card components
        ├── article-preview/
        ├── note-preview/
        └── generic-preview/
```

## Installation

```bash
npx shadcn-svelte@latest add event/content/event-content
```

This automatically copies:
- `event/content/event-content.svelte` - Main component
- `event/content/mention/mention.svelte` - User mention rendering
- `event/content/hashtag/hashtag.svelte` - Hashtag rendering
- `event/content/event/event.svelte` - Embedded event orchestrator
  - `event/cards/preview/article-preview/article-preview.svelte` - Article card
  - `event/cards/preview/note-preview/note-preview.svelte` - Note card
  - `event/cards/preview/generic-preview/generic-preview.svelte` - Generic fallback

All dependencies are installed automatically via `registryDependencies`.

## Usage

```svelte
<script>
  import EventContent from '$lib/components/event/content/event-content.svelte';

  let { ndk, event } = $props();
</script>

<EventContent
  {ndk}
  {event}
  onMentionClick={(bech32) => goto(`/p/${bech32}`)}
  onHashtagClick={(tag) => goto(`/t/${tag}`)}
  onEventClick={(bech32, event) => goto(`/e/${event.id}`)}
/>
```

## Using Preview Cards Directly

The preview cards can also be used independently in feeds, lists, or search results:

```svelte
<script>
  import ArticlePreview from '$lib/components/event/cards/preview/article-preview/article-preview.svelte';
  import NotePreview from '$lib/components/event/cards/preview/note-preview/note-preview.svelte';

  let { ndk, articles, notes } = $props();
</script>

<!-- Display articles in a feed -->
{#each articles as event}
  <ArticlePreview
    {ndk}
    {event}
    onClick={() => goto(`/a/${event.encode()}`)}
  />
{/each}

<!-- Display notes in a timeline -->
{#each notes as event}
  <NotePreview
    {ndk}
    {event}
    onClick={() => goto(`/n/${event.id}`)}
  />
{/each}
```

## Advanced: Build Your Own

If you need completely custom rendering, use the builder directly:

```svelte
<script>
  import { createEventContent } from '@nostr-dev-kit/svelte';

  let { ndk, event } = $props();
  const content = createEventContent({ ndk, event });
</script>

{#each content.segments as segment}
  {#if segment.type === 'text'}
    <span>{segment.content}</span>
  {:else if segment.type === 'npub' || segment.type === 'nprofile'}
    <!-- Your custom mention rendering -->
    <a href="/p/{segment.data}">@{segment.data.slice(0, 8)}</a>
  {:else if segment.type === 'hashtag'}
    <!-- Your custom hashtag rendering -->
    <button onclick={() => goto(`/t/${segment.content}`)}>
      #{segment.content}
    </button>
  {/if}
{/each}
```

## Customization

Since you copy the components, you have full control:

1. **Styling** - Edit CSS in any of the copied components
2. **Behavior** - Modify click handlers, add animations
3. **Structure** - Change layout, add/remove elements
4. **Sub-components** - Customize `mention`, `hashtag`, preview cards, etc.

Simply edit the files in `$lib/components/event/` directly.

## Component Hierarchy Explained

**Content Components** (`event/content/`):
- `event-content.svelte` - Parses event content and orchestrates rendering
- `event/event.svelte` - Fetches event by bech32 and routes to appropriate preview card
- `mention/mention.svelte` - Renders inline user mentions (npub/nprofile)
- `hashtag/hashtag.svelte` - Renders inline hashtags

**Preview Cards** (`event/cards/preview/`):
- `article-preview/` - Medium-style article cards (kind 30023)
- `note-preview/` - Twitter-style note cards (kind 1, 1111)
- `generic-preview/` - Fallback for unknown event kinds

The preview cards are standalone components that can be used anywhere - in feeds, lists, search results, or embedded in content via the `event/event.svelte` orchestrator.

## API Reference

### Component Props

```ts
interface Props {
  ndk: NDKSvelte;
  event?: NDKEvent;
  content?: string;
  class?: string;
  emojiTags?: string[][];
  onMentionClick?: (bech32: string) => void;
  onEventClick?: (bech32: string, event: NDKEvent) => void;
  onHashtagClick?: (tag: string) => void;
  onLinkClick?: (url: string) => void;
}
```

### Builder API

The component uses `createEventContent` internally:

```ts
function createEventContent(props: {
  ndk: NDKSvelte;
  event?: NDKEvent;
  content?: string;
  emojiTags?: string[][];
}): EventContentState;

interface EventContentState {
  segments: ParsedSegment[];
  content: string;
  emojiMap: Map<string, string>;
}
```

## Parsed Segment Types

The builder automatically detects and parses:

- `text` - Plain text
- `npub` / `nprofile` - User mentions
- `event-ref` - Event references (note1, nevent1, naddr1)
- `hashtag` - Hashtags
- `emoji` - Custom emojis
- `link` - URLs
- `media` - Images, videos, YouTube
- `image-grid` - Multiple consecutive images

## Utilities

Additional utilities are exported for manual parsing:

```ts
import {
  isImage,
  isVideo,
  isYouTube,
  extractYouTubeId,
  parseContentToSegments,
  buildEmojiMap,
} from '@nostr-dev-kit/svelte';
```
