# EventContent Component System

The `EventContent` component provides a flexible, extensible system for rendering Nostr event content with rich parsing and entity detection. It includes built-in renderers for common content types and allows full customization of how different content segments are displayed.

## Table of Contents

- [Overview](#overview)
- [Built-in Components](#built-in-components)
- [Component Customization](#component-customization)
- [Event Handlers](#event-handlers)
- [Component Props Interfaces](#component-props-interfaces)
- [Examples](#examples)

## Overview

The EventContent component parses event content and breaks it down into typed segments:

- **Text** - Plain text segments
- **Mentions** - User references (npub, nprofile)
- **Event References** - Event references (note, nevent, naddr)
- **Hashtags** - Hashtags with #
- **Links** - URLs
- **Media** - Images, videos, YouTube embeds
- **Custom Emojis** - Emoji tags from events

Each segment type can be rendered using either:
1. **Built-in default components** (provided by NDK)
2. **Global custom components** (set once for your entire app)
3. **Instance-specific components** (passed as props to EventContent)

## Built-in Components

### MentionPreview

The default renderer for user mentions (npub/nprofile references).

**Features:**
- Displays user avatar and display name
- Automatically fetches user profile from relays
- Two display modes: `inline` (compact) and `card` (detailed)
- Shows truncated bech32 if profile is not yet loaded
- Automatically decodes bech32 to extract pubkey
- Supports click handlers for navigation

**Location:** `embedded-event/MentionPreview.svelte`

**Example Usage:**
```svelte
<MentionPreview
  {ndk}
  bech32="npub1..."
  format="inline"
  onClick={(bech32) => goto(`/p/${bech32}`)}
/>
```

### EmbeddedEvent

The default renderer for embedded event references (note, nevent, naddr).

**Features:**
- Automatically fetches events from relays based on bech32 reference
- Dispatches to specialized renderers based on event kind:
  - `NotePreview` - Text notes (kind 1, 1111)
  - `ArticlePreview` - Long-form articles (kind 30023)
  - `GenericPreview` - All other event kinds
- Handles loading states and errors
- Fetches and displays author information
- Supports note1, nevent1, and naddr1 references
- Decodes bech32 automatically to determine fetch strategy

**Location:** `embedded-event/EmbeddedEvent.svelte`

**Example Usage:**
```svelte
<EmbeddedEvent
  {ndk}
  bech32="note1..."
  onEventClick={(bech32, event) => goto(`/e/${event.id}`)}
/>
```

### HashtagPreview

The default renderer for hashtags.

**Features:**
- Two display modes: `inline` (compact link) and `pill` (badge style)
- Customizable colors via CSS variables
- Click handlers for navigation
- Hover effects and transitions

**Location:** `embedded-event/HashtagPreview.svelte`

**Example Usage:**
```svelte
<HashtagPreview
  hashtag="nostr"
  format="inline"
  onClick={(tag) => goto(`/hashtag/${tag}`)}
/>
```

### Inline Renderers

Some segment types are rendered inline within `EventContent.svelte`:

- **Text** - Rendered as styled `<span>` with pre-wrap whitespace handling
- **Links** - Rendered as anchor tags with external link behavior
- **Custom Emojis** - Rendered as inline images
- **Media** - Rendered based on type (image, video, or YouTube iframe)
- **Image Grids** - Consecutive images grouped into responsive grids

## Component Customization

You can customize how content segments are rendered at three levels:

### 1. Default Components (Built-in)

These are the components that ship with NDK and are used by default:

```ts
import { defaultComponents } from '@nostr-dev-kit/ndk-svelte';

// defaultComponents includes:
// {
//   mention: MentionPreview,
//   embeddedEvent: EmbeddedEvent,
//   hashtag: HashtagPreview
// }
```

### 2. Global Component Override

Set custom components once for your entire application:

```ts
import { setEventContentComponents } from '@nostr-dev-kit/ndk-svelte';
import MyCustomMention from './MyCustomMention.svelte';
import MyCustomEmbeddedEvent from './MyCustomEmbeddedEvent.svelte';

// Override globally - affects all EventContent instances
setEventContentComponents({
  mention: MyCustomMention,
  embeddedEvent: MyCustomEmbeddedEvent
});
```

**Available functions:**

```ts
// Set global components (merges with existing)
setEventContentComponents(components: Partial<EventContentComponents>): void

// Get current global components
getEventContentComponents(): EventContentComponents

// Reset to built-in defaults
resetEventContentComponents(): void
```

### 3. Instance-Level Override

Pass custom components directly to a specific `EventContent` instance:

```svelte
<script>
  import { EventContent } from '@nostr-dev-kit/ndk-svelte';
  import MyCustomMention from './MyCustomMention.svelte';
</script>

<EventContent
  {ndk}
  {event}
  components={{
    mention: MyCustomMention
  }}
/>
```

### Component Resolution Order

Components are resolved in this order (later takes precedence):

1. Built-in defaults (`defaultComponents`)
2. Global overrides (set via `setEventContentComponents`)
3. Instance props (passed to `<EventContent components={...} />`)

## Event Handlers

EventContent provides a flexible handler system for responding to user interactions with content. You can set handlers globally or per-instance.

### Handler Types

```ts
interface EventContentHandlers {
  /** Handler when a user mention (npub/nprofile) is clicked */
  onMentionClick?: (bech32: string) => void;
  /** Handler when an event reference (note1/nevent1/naddr1) is clicked */
  onEventClick?: (bech32: string, event: NDKEvent) => void;
  /** Handler when a hashtag is clicked */
  onHashtagClick?: (tag: string) => void;
  /** Handler when a regular URL link is clicked */
  onLinkClick?: (url: string) => void;
}
```

### Setting Global Handlers

Set handlers once for your entire application:

```ts
import { setEventContentHandlers } from '@nostr-dev-kit/ndk-svelte';

// Set global handlers
setEventContentHandlers({
  onMentionClick: (bech32) => navigate(`/p/${bech32}`),
  onEventClick: (bech32, event) => navigate(`/e/${event.id}`),
  onHashtagClick: (tag) => navigate(`/hashtag/${tag}`),
  onLinkClick: (url) => window.open(url, '_blank')
});

// Now all EventContent instances use these handlers automatically
```

### Instance-Level Handlers

Override handlers for specific instances:

```svelte
<EventContent
  {ndk}
  {event}
  handlers={{
    onMentionClick: (bech32) => console.log('Custom mention handler', bech32),
    onEventClick: (bech32, event) => showEventModal(event)
  }}
/>
```

### Backwards Compatibility

Individual handler props are still supported but deprecated:

```svelte
<!-- Still works, but use `handlers` prop instead -->
<EventContent
  {ndk}
  {event}
  onMentionClick={(bech32) => goto(`/p/${bech32}`)}
  onEventClick={(bech32, event) => goto(`/e/${event.id}`)}
/>
```

### Handler Resolution Order

Handlers are resolved in this order (later takes precedence):

1. Global handlers (set via `setEventContentHandlers`)
2. Instance `handlers` prop
3. Individual handler props (deprecated, for backwards compatibility)

**Available functions:**

```ts
// Set global handlers (merges with existing)
setEventContentHandlers(handlers: Partial<EventContentHandlers>): void

// Get current global handlers
getEventContentHandlers(): EventContentHandlers

// Reset to defaults (all undefined)
resetEventContentHandlers(): void
```

## Component Props Interfaces

### MentionComponentProps

Required props for custom mention components:

```ts
interface MentionComponentProps {
  ndk: NDKSvelte;                    // NDK instance
  bech32: string;                    // The bech32-encoded reference (npub1/nprofile1)
  onClick?: (bech32: string) => void;  // Click handler receives bech32
  class?: string;                    // Additional CSS classes
}
```

**Note:** The component receives the full bech32 string and is responsible for decoding it. This allows custom components to access relay hints from nprofile references.

### EmbeddedEventComponentProps

Required props for custom embedded event components:

```ts
interface EmbeddedEventComponentProps {
  ndk: NDKSvelte;                    // NDK instance
  bech32: string;                    // The bech32-encoded reference (note1/nevent1/naddr1)
  onEventClick?: (bech32: string, event: NDKEvent) => void;  // Click handler receives both
  class?: string;                    // Additional CSS classes
}
```

**Note:** The callback receives both the original bech32 string and the fetched event, allowing you to preserve the original reference for routing.

### HashtagComponentProps

Required props for custom hashtag components:

```ts
interface HashtagComponentProps {
  hashtag: string;                   // The hashtag text without the # prefix
  onClick?: (tag: string) => void;   // Click handler
  class?: string;                    // Additional CSS classes
}
```

### Other Component Props

For future extensibility, the following interfaces are defined:

```ts
// Custom emoji renderer
interface EmojiComponentProps {
  url: string;
  name: string;
  class?: string;
}

// Custom link renderer
interface LinkComponentProps {
  url: string;
  onClick?: (url: string) => void;
  class?: string;
}

// Custom media renderer
interface MediaComponentProps {
  url: string;
  type: 'image' | 'video' | 'youtube';
  videoId?: string;  // For YouTube
  class?: string;
}

// Custom image grid renderer
interface ImageGridComponentProps {
  images: string[];
  maxImages?: number;
  class?: string;
}
```

## Examples

### Example 1: Setting Up Global Handlers

Configure handlers once for your entire application:

```ts
// src/lib/setup.ts
import { setEventContentHandlers } from '@nostr-dev-kit/ndk-svelte';
import { goto } from '$app/navigation';

// Set global handlers for all EventContent instances
setEventContentHandlers({
  onMentionClick: (bech32) => {
    goto(`/p/${bech32}`);
  },
  onEventClick: (bech32, event) => {
    // You have both the reference and the event
    goto(`/e/${event.id}`);
  },
  onHashtagClick: (tag) => {
    goto(`/t/${tag}`);
  },
  onLinkClick: (url) => {
    // Custom link handling
    if (url.includes('youtube.com')) {
      // Handle YouTube links specially
      const videoId = extractYouTubeId(url);
      goto(`/watch/${videoId}`);
    } else {
      // Default behavior
      window.open(url, '_blank');
    }
  }
});
```

Then use EventContent without repeating handler props:

```svelte
<script>
  import { EventContent } from '@nostr-dev-kit/ndk-svelte';
</script>

<!-- Handlers work automatically -->
<EventContent {ndk} event={post} />
```

### Example 2: Custom Mention Component

Create a custom mention component with hover cards:

```svelte
<!-- CustomMention.svelte -->
<script lang="ts">
  import { nip19 } from 'nostr-tools';
  import type { MentionComponentProps } from '@nostr-dev-kit/ndk-svelte';
  import { Avatar } from '@nostr-dev-kit/ndk-svelte';

  let {
    ndk,
    bech32,
    onClick,
    class: className = ''
  }: MentionComponentProps = $props();

  // Decode bech32 to get pubkey
  const pubkey = $derived(() => {
    try {
      const decoded = nip19.decode(bech32);
      if (decoded.type === 'npub') return decoded.data as string;
      if (decoded.type === 'nprofile') return decoded.data.pubkey;
      return '';
    } catch {
      return '';
    }
  });

  let showHoverCard = $state(false);
  let profile = $state(undefined);

  $effect(() => {
    const pk = pubkey();
    if (!pk) return;

    const user = ndk.getUser({ pubkey: pk });
    profile = user.profile;
    if (!profile) {
      user.fetchProfile().then(() => {
        profile = user.profile;
      });
    }
  });

  function handleClick(e: MouseEvent) {
    if (onClick) {
      e.preventDefault();
      e.stopPropagation();
      onClick(bech32);
    }
  }
</script>

<span
  class="custom-mention {className}"
  onmouseenter={() => showHoverCard = true}
  onmouseleave={() => showHoverCard = false}
>
  <a href="#" onclick={handleClick}>
    <Avatar {ndk} pubkey={pubkey()} size={20} />
    @{profile?.name || profile?.displayName || bech32.slice(0, 12)}
  </a>

  {#if showHoverCard && profile}
    <div class="hover-card">
      <Avatar {ndk} pubkey={pubkey()} size={48} />
      <h3>{profile.name || profile.displayName}</h3>
      {#if profile.about}
        <p>{profile.about.slice(0, 200)}</p>
      {/if}
    </div>
  {/if}
</span>

<style>
  .custom-mention {
    position: relative;
    display: inline-flex;
    align-items: center;
  }

  .hover-card {
    position: absolute;
    top: 100%;
    left: 0;
    z-index: 1000;
    width: 300px;
    padding: 1rem;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  }
</style>
```

**Register globally:**

```ts
import { setEventContentComponents } from '@nostr-dev-kit/ndk-svelte';
import CustomMention from './CustomMention.svelte';

setEventContentComponents({
  mention: CustomMention
});
```

### Example 3: Minimal Embedded Event

Create a simpler embedded event renderer with just content preview:

```svelte
<!-- MinimalEmbeddedEvent.svelte -->
<script lang="ts">
  import type { EmbeddedEventComponentProps } from '@nostr-dev-kit/ndk-svelte';
  import { nip19 } from 'nostr-tools';

  let {
    ndk,
    bech32,
    onEventClick,
    class: className = ''
  }: EmbeddedEventComponentProps = $props();

  let event = $state(null);
  let loading = $state(true);

  $effect(() => {
    loading = true;
    try {
      const decoded = nip19.decode(bech32);

      if (decoded.type === 'note') {
        ndk.fetchEvent(decoded.data).then(e => {
          event = e;
          loading = false;
        });
      } else if (decoded.type === 'nevent') {
        ndk.fetchEvent(decoded.data.id).then(e => {
          event = e;
          loading = false;
        });
      } else if (decoded.type === 'naddr') {
        const { kind, pubkey, identifier } = decoded.data;
        ndk.fetchEvent({
          kinds: [kind],
          authors: [pubkey],
          '#d': [identifier]
        }, { closeOnEose: true }).then(e => {
          event = e;
          loading = false;
        });
      }
    } catch (err) {
      console.error('Failed to decode or fetch event:', err);
      loading = false;
    }
  });

  function handleClick() {
    if (onEventClick && event) {
      onEventClick(bech32, event);
    }
  }
</script>

{#if loading}
  <div class="loading {className}">Loading...</div>
{:else if event}
  <div class="minimal-event {className}" onclick={handleClick}>
    <div class="event-content">
      {event.content.slice(0, 100)}...
    </div>
    <div class="event-meta">
      Kind {event.kind} by {event.author?.profile?.name || event.pubkey.slice(0, 8)}
    </div>
  </div>
{:else}
  <div class="error {className}">Event not found</div>
{/if}

<style>
  .minimal-event {
    padding: 0.5rem;
    border-left: 3px solid #8b5cf6;
    background: #f9fafb;
    cursor: pointer;
    margin: 0.5rem 0;
  }

  .minimal-event:hover {
    background: #f3f4f6;
  }

  .event-content {
    font-size: 0.9rem;
    color: #374151;
  }

  .event-meta {
    font-size: 0.75rem;
    color: #6b7280;
    margin-top: 0.25rem;
  }
</style>
```

**Use for a specific instance:**

```svelte
<EventContent
  {ndk}
  {event}
  components={{
    embeddedEvent: MinimalEmbeddedEvent
  }}
/>
```

### Example 4: Custom Hashtag Component

Create a custom hashtag component with trending indicators:

```svelte
<!-- TrendingHashtag.svelte -->
<script lang="ts">
  import type { HashtagComponentProps } from '@nostr-dev-kit/ndk-svelte';

  let {
    hashtag,
    onClick,
    class: className = ''
  }: HashtagComponentProps = $props();

  // This could fetch trending data from a service
  let trendingCount = $state<number | null>(null);

  function handleClick(e: MouseEvent) {
    if (onClick) {
      e.preventDefault();
      e.stopPropagation();
      onClick(hashtag);
    }
  }
</script>

<button
  class="trending-hashtag {className}"
  onclick={handleClick}
  type="button"
>
  <span class="tag-icon">#</span>
  <span class="tag-text">{hashtag}</span>
  {#if trendingCount}
    <span class="trending-badge">{trendingCount}</span>
  {/if}
</button>

<style>
  .trending-hashtag {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.375rem 0.75rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
    border-radius: 9999px;
    color: white;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.2s;
    margin: 0.125rem;
  }

  .trending-hashtag:hover {
    transform: translateY(-2px) scale(1.05);
  }

  .tag-icon {
    opacity: 0.8;
  }

  .trending-badge {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 1.25rem;
    padding: 0.125rem 0.375rem;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 700;
  }
</style>
```

### Example 5: Different Themes for Different Contexts

```svelte
<script>
  import { EventContent } from '@nostr-dev-kit/ndk-svelte';
  import CompactMention from './CompactMention.svelte';
  import DetailedMention from './DetailedMention.svelte';
  import TrendingHashtag from './TrendingHashtag.svelte';
</script>

<!-- In a feed view: use compact mentions -->
<div class="feed">
  <EventContent
    {ndk}
    event={feedEvent}
    components={{
      mention: CompactMention,
      hashtag: TrendingHashtag
    }}
  />
</div>

<!-- In a detail view: use detailed mentions -->
<div class="event-detail">
  <EventContent
    {ndk}
    event={detailEvent}
    components={{ mention: DetailedMention }}
  />
</div>
```

### Example 6: Completely Custom Rendering System

You can replace all components at once:

```ts
import { setEventContentComponents } from '@nostr-dev-kit/ndk-svelte';
import MyMention from './MyMention.svelte';
import MyEmbeddedEvent from './MyEmbeddedEvent.svelte';
import MyHashtag from './MyHashtag.svelte';

// Set your entire custom rendering system
setEventContentComponents({
  mention: MyMention,
  embeddedEvent: MyEmbeddedEvent,
  hashtag: MyHashtag
});

// Now all EventContent instances use your custom components
```

## Important Notes

### Bech32 vs Decoded Values

Components now receive **bech32-encoded strings** rather than decoded values. This design choice:

- Preserves the original reference format for routing and deep linking
- Allows access to relay hints from nprofile and nevent references
- Enables better error handling and user feedback
- Maintains consistency across all callback signatures

**Example:**
```svelte
<!-- Components receive bech32 strings -->
<EventContent
  {ndk}
  {event}
  onMentionClick={(bech32) => {
    // bech32 is "npub1..." or "nprofile1..."
    // You can decode it to get pubkey if needed
    const decoded = nip19.decode(bech32);
    // Or use it directly for routing
    goto(`/p/${bech32}`);
  }}
  onEventClick={(bech32, event) => {
    // You have both the reference and the fetched event
    console.log('Reference:', bech32);
    console.log('Event:', event);
  }}
/>
```

### Other Notes

- Components are lazily loaded - they only render when their segment type appears in content
- All components receive an optional `class` prop for styling customization
- The component system uses Svelte 5's `$props()` rune for type-safe props
- Built-in components handle loading states, errors, and profile fetching automatically
- Custom components should follow the same props interfaces for compatibility
- Hashtags can be rendered inline or as pills by setting the `format` prop
