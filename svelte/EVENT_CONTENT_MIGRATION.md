# Event Content Rendering - Migration to Builder Pattern

## Overview

Migrated the event content rendering system from a component-based architecture to a **builder pattern** following melt-ui/bits-ui conventions, with shadcn-style copyable components.

## Architecture

### Before (Component-based)
- Components exported from package
- Tightly coupled to package version
- Hard to customize without forking

### After (Builder pattern)
- **Builders** exported from `@nostr-dev-kit/svelte` (create* functions)
- **Components** available in registry for copying
- Full customization control for users

## What Changed

### 1. Created Builders (src/lib/builders/event-content/)

Three main builders following Svelte 5 runes patterns:

#### `createEventContent({ ndk, event, content, emojiTags })`
- Parses event content into segments
- Returns reactive state with `segments`, `content`, and `emojiMap`
- Automatically detects: mentions, hashtags, emojis, media, links, event refs

#### `createMention({ ndk, bech32 })`
- Fetches user profile for a mention
- Returns reactive state with `user`, `profile`, and `displayName`

#### `createEmbeddedEvent({ ndk, bech32 })`
- Fetches and displays embedded events
- Returns reactive state with `event`, `author`, `loading`, and `error`

### 2. Moved Components to Registry

All UI components moved to `registry/ndk/`:
- `event-content/event-content.svelte` - Main content renderer
- `mention-preview/mention-preview.svelte` - User mention display
- `embedded-event/embedded-event.svelte` - Embedded event display
- `article-preview/article-preview.svelte` - Article preview
- `note-preview/note-preview.svelte` - Note preview
- `generic-preview/generic-preview.svelte` - Fallback preview
- `hashtag-preview/hashtag-preview.svelte` - Hashtag display

### 3. Updated Exports

**Removed:**
- Component registry system (`event-content-components.ts`)
- Handler registry system (`event-content-handlers.ts`)
- All component exports

**Added:**
- Builder functions: `createEventContent`, `createMention`, `createEmbeddedEvent`
- Utility functions: `isImage`, `isVideo`, `isYouTube`, `parseContentToSegments`, etc.
- Type exports for all builder states

### 4. Registry Integration

Added to `registry.json`:
```json
{
  "name": "event-content",
  "type": "registry:component",
  "registryDependencies": ["mention-preview", "embedded-event", "hashtag-preview"],
  "dependencies": ["@nostr-dev-kit/ndk", "@nostr-dev-kit/svelte", "nostr-tools"]
}
```

## Usage

### For Package Users

```svelte
<script>
  import { createEventContent } from '@nostr-dev-kit/svelte';
  
  const content = createEventContent({ ndk, event });
</script>

{#each content.segments as segment}
  <!-- Custom rendering logic -->
{/each}
```

### For Component Users

1. Copy from registry:
```bash
npx shadcn-svelte add event-content
```

2. Use the component:
```svelte
<script>
  import EventContent from '$lib/components/event-content.svelte';
</script>

<EventContent
  {ndk}
  {event}
  onMentionClick={(bech32) => goto(`/p/${bech32}`)}
/>
```

3. Customize as needed - it's your code now!

## Benefits

1. **Separation of Concerns**
   - Logic in builders (maintained by NDK)
   - UI in components (owned by users)

2. **Full Customization**
   - Copy components and modify freely
   - No breaking changes from UI updates
   - Style to match your design system

3. **Tree-shakeable**
   - Import only builders you need
   - Components not in bundle unless copied

4. **Svelte 5 Native**
   - Uses runes ($state, $derived, $effect)
   - Modern reactive patterns
   - Better performance

## Migration Guide

### If you were using EventContent component:

**Before:**
```svelte
import EventContent from '@nostr-dev-kit/svelte/components/EventContent.svelte';
```

**After:**
```bash
npx shadcn-svelte add event-content
```

```svelte
import EventContent from '$lib/components/event-content.svelte';
```

### If you need custom rendering:

**Before:**
Complex component registry system

**After:**
```svelte
import { createEventContent } from '@nostr-dev-kit/svelte';

const content = createEventContent({ ndk, event });
// Full control over rendering
```

## Files

### Builders
- `src/lib/builders/event-content/index.ts` - Main builder exports
- `src/lib/builders/event-content/utils.ts` - Parsing utilities

### Registry Components
- `registry/ndk/event-content/` - Main component + docs
- `registry/ndk/mention-preview/` - Mention display
- `registry/ndk/embedded-event/` - Event embed
- `registry/ndk/*-preview/` - Various preview components

### Exports
- `src/lib/index.ts` - Public API (builders + utils only)

## Notes

- Builders are versioned with the package
- Components are copied and owned by users
- No backward compatibility needed - clean break
- Follows best practices from shadcn-ui, melt-ui, bits-ui
