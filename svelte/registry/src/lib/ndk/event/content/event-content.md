---
title: EventContent
description: Renders Nostr event content with rich parsing and entity detection
---

<script>
  import { NDKEvent, NDKKind } from '@nostr-dev-kit/ndk';
  import NDKSvelte from '$lib/ndk-svelte.svelte';
  import EventContent from './event-content.svelte';

  // Create a mock NDK instance
  const ndk = new NDKSvelte({
    explicitRelayUrls: ['wss://relay.damus.io', 'wss://nos.lol'],
  });

  // Helper to create mock events
  function createMockEvent(content, tags = []) {
    const event = new NDKEvent(ndk);
    event.kind = NDKKind.Text;
    event.content = content;
    event.tags = tags;
    event.pubkey = '3bf0c63fcb93463407af97a5e5ee64fa883d107ef9e558472c4eb9aaaefa459d';
    event.created_at = Math.floor(Date.now() / 1000);
    return event;
  }
</script>

# EventContent

Renders Nostr event content with automatic detection and rendering of:

- **User mentions** (npub, nprofile) with avatars
- **Event references** (note, nevent, naddr)
- **Media** (images, videos, YouTube embeds)
- **Custom emojis**
- **Hashtags**
- **Links**

## Installation

```bash
npx shadcn-svelte@latest add https://nostr-dev-kit.github.io/ndk/registry/event-content
```

This will automatically install the following dependencies:
- `mention-preview` - For rendering user mentions
- `hashtag-preview` - For rendering hashtags
- `embedded-event` - For rendering event references

## Usage

### Basic Example

<EventContent
  {ndk}
  event={createMockEvent('This is a simple text note without any special formatting.')}
/>

```svelte
<script>
  import EventContent from '$lib/components/ui/event-content/event-content.svelte';
  import { NDKEvent } from '@nostr-dev-kit/ndk';

  export let ndk;
  export let event; // NDKEvent
</script>

<EventContent {ndk} {event} />
```

### With Mentions

<EventContent
  {ndk}
  event={createMockEvent('Hey nostr:npub180cvv07tjdrrgpa0j7j7tmnyl2yr6yr7l8j4s3evf6u64th6gkwsyjh6w6 check this out!')}
/>

### With Hashtags

<EventContent
  {ndk}
  event={createMockEvent('Love building on #nostr! The #decentralized future is here. #bitcoin #freedom')}
/>

### With Links

<EventContent
  {ndk}
  event={createMockEvent('Check out this awesome article: https://example.com/article and this site https://nostr.com')}
/>

### With Images

<EventContent
  {ndk}
  event={createMockEvent('Beautiful sunset today! https://images.unsplash.com/photo-1506905925346-21bda4d32df4')}
/>

### With Multiple Images (Grid Layout)

<EventContent
  {ndk}
  event={createMockEvent(`Check out these photos!
https://images.unsplash.com/photo-1506905925346-21bda4d32df4
https://images.unsplash.com/photo-1518837695005-2083093ee35b`)}
/>

### With YouTube

<EventContent
  {ndk}
  event={createMockEvent('Must watch: https://www.youtube.com/watch?v=dQw4w9WgXcQ')}
/>

### With Custom Emojis

<EventContent
  {ndk}
  event={createMockEvent('This is :fire: awesome :rocket:', [
    ['emoji', 'fire', 'https://em.wfr.su/em/fire.webp'],
    ['emoji', 'rocket', 'https://em.wfr.su/em/rocket.webp'],
  ])}
/>

### With Event References

<EventContent
  {ndk}
  event={createMockEvent('Great note! nostr:note1sg88cmynmh7qw28hd4k4efnhzwzkkc88c2ck8sh6r6alh9s2g00s0swmxe')}
/>

### Complex Content

<EventContent
  {ndk}
  event={createMockEvent(`Hey nostr:npub180cvv07tjdrrgpa0j7j7tmnyl2yr6yr7l8j4s3evf6u64th6gkwsyjh6w6!

Check out this #nostr client: https://snort.social

Here's a cool photo:
https://images.unsplash.com/photo-1506905925346-21bda4d32df4

#decentralized #freedom :fire:`, [
    ['emoji', 'fire', 'https://em.wfr.su/em/fire.webp'],
  ])}
/>

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `ndk` | `NDKSvelte` | **required** | NDKSvelte instance for fetching profiles and data |
| `event` | `NDKEvent` | `undefined` | NDKEvent to render. If provided, content and emojiTags are extracted from it |
| `content` | `string` | `''` | Raw content to render (ignored if event is provided) |
| `emojiTags` | `string[][]` | `[]` | Emoji tags from the event (ignored if event is provided) |
| `class` | `string` | `''` | Additional CSS classes |
| `onMentionClick` | `(bech32: string) => void` | `undefined` | Handler when a user mention is clicked |
| `onEventClick` | `(bech32: string, event: NDKEvent) => void` | `undefined` | Handler when an event reference is clicked |
| `onHashtagClick` | `(tag: string) => void` | `undefined` | Handler when a hashtag is clicked |
| `onLinkClick` | `(url: string) => void` | `undefined` | Handler when a regular URL is clicked |

## Event Handlers

You can provide custom handlers for user interactions:

```svelte
<EventContent
  {ndk}
  {event}
  onMentionClick={(bech32) => goto(`/p/${bech32}`)}
  onHashtagClick={(tag) => goto(`/t/${tag}`)}
  onEventClick={(bech32, event) => goto(`/e/${event.id}`)}
  onLinkClick={(url) => window.open(url, '_blank')}
/>
```

## Styling

The component uses CSS custom properties for theming:

```css
.content-renderer {
  --link-color: #3b82f6;
  --accent-color: #8b5cf6;
  --border-color: #e5e7eb;
  --card-background: #ffffff;
  --text-muted: #6b7280;
}
```

## Architecture

EventContent uses the **builder pattern** with Svelte 5 runes:

1. **Builder** (`createEventContent`) - Handles content parsing logic with reactive state
2. **Component** (EventContent.svelte) - Renders the parsed content
3. **Sub-components** - MentionPreview, HashtagPreview, EmbeddedEvent are auto-installed

The builder is imported from `@nostr-dev-kit/svelte` and can be used standalone:

```svelte
<script>
  import { createEventContent } from '@nostr-dev-kit/svelte';

  const contentState = createEventContent({
    ndk,
    event,
    content: 'optional raw content',
    emojiTags: []
  });

  // Access parsed segments
  $effect(() => {
    console.log(contentState.segments);
  });
</script>

{#each contentState.segments as segment}
  <!-- Custom rendering logic -->
{/each}
```

## Customization

Since this component is installed locally via the registry, you can fully customize:

- Modify the rendering of specific segment types
- Add support for new content types
- Change the styling
- Customize sub-components (Avatar, MentionPreview, etc.)

All changes stay in your codebase and won't be overwritten by updates.
