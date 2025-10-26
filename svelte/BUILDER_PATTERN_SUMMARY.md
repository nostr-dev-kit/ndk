# Event Content Builder Pattern - Final Summary

## What Was Done

Successfully migrated the event content rendering system to follow the **builder pattern** (melt-ui/bits-ui style) with shadcn-style copyable components.

## Key Simplifications

### 1. NDK Integration
- **Uses `ndk.fetchEvent(bech32)` directly** - No manual decoding needed
- NDK handles all bech32 formats: note1, nevent1, naddr1
- Removed unnecessary nip19 decoding logic

### 2. Separation of Concerns
- **Builders don't fetch profiles** - That's the UI component's job
- `createEmbeddedEvent` just fetches the event
- Preview components fetch their own author profiles when needed

## Architecture

### Builders (Exported from `@nostr-dev-kit/svelte`)

**`createEventContent({ ndk, event, content, emojiTags })`**
- Parses content into segments
- Returns: `{ segments, content, emojiMap }`

**`createMention({ ndk, bech32 })`**
- Fetches user profile
- Returns: `{ user, profile, displayName }`

**`createEmbeddedEvent({ ndk, bech32 })`**
- Fetches event via `ndk.fetchEvent(bech32)`
- Returns: `{ event, loading, error }`

### Components (Registry - User Copies)

All in `registry/ndk/`:
- `event-content/` - Main content renderer
- `mention-preview/` - User mentions
- `embedded-event/` - Event dispatcher
- `*-preview/` - Various event type renderers

## Usage Examples

### Direct Builder Usage

```svelte
<script>
  import { createEventContent } from '@nostr-dev-kit/svelte';
  
  const content = createEventContent({ ndk, event });
</script>

{#each content.segments as segment}
  {#if segment.type === 'text'}
    <span>{segment.content}</span>
  {:else if segment.type === 'npub'}
    <!-- Custom mention rendering -->
  {/if}
{/each}
```

### Component Usage

```bash
npx shadcn-svelte add event-content
```

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

## Code Quality Improvements

### Before
```ts
// Manual decoding, complex branching
const decoded = nip19.decode(bech32);
if (decoded.type === 'note') {
  const eventId = decoded.data;
  ndk.fetchEvent(eventId).then(...);
} else if (decoded.type === 'nevent') {
  const pointer = decoded.data;
  ndk.fetchEvent(pointer.id).then(...);
} // ... more branches
```

### After
```ts
// One line!
ndk.fetchEvent(bech32).then(...);
```

### Before
```ts
// Builder fetches author profile (coupling)
async function fetchAuthorProfile(event) {
  const user = ndk.getUser({ pubkey: event.pubkey });
  await user.fetchProfile();
  author = user.profile;
}
```

### After
```ts
// Preview components fetch their own profiles
// Builder just returns the event
// Each component handles its own data needs
```

## File Structure

```
src/lib/
├── builders/
│   └── event-content/
│       ├── index.ts          # Builders export
│       └── utils.ts          # Parsing utilities
└── index.ts                  # Public API

registry/ndk/
├── event-content/
│   ├── event-content.svelte
│   └── README.md
├── mention-preview/
├── embedded-event/
├── article-preview/
├── note-preview/
├── generic-preview/
└── hashtag-preview/
```

## Benefits

1. **Cleaner Code** - Leverages NDK's built-in bech32 handling
2. **Better Separation** - Builders do logic, components do UI
3. **More Flexible** - Each component manages its own data
4. **Easier to Customize** - Copy and modify components freely
5. **Tree-shakeable** - Import only what you need

## Migration

**Old way:**
```svelte
import EventContent from '@nostr-dev-kit/svelte/components/EventContent.svelte';
```

**New way (Option 1 - Use builder):**
```svelte
import { createEventContent } from '@nostr-dev-kit/svelte';
```

**New way (Option 2 - Copy component):**
```bash
npx shadcn-svelte add event-content
```

## No Backward Compatibility

This is a clean break - no legacy code, no deprecated methods, just modern Svelte 5 with clean APIs.

---

Perfect example of following best practices from:
- **melt-ui** - Builder pattern for logic
- **bits-ui** - Svelte 5 runes
- **shadcn** - Copyable components
