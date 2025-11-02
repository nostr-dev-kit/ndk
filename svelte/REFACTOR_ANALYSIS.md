# Complete Refactor Analysis & Migration Guide
**Analysis Date:** November 2, 2025
**Commits Analyzed:** 39b2a718 (Nov 1) → 41272466 (Nov 2, HEAD)
**Total Changes:** 4 commits, ~19,000 lines changed, 231 files renamed/added/deleted

---

## Executive Summary

This document captures ALL architectural and functional changes made during the beta.30 reorganization, including hidden logic changes, new systems, deleted functionality, and the complete migration path to properly re-implement these changes.

### Critical Finding
While the surface-level changes appear to be "just reorganization," there were **significant architectural improvements** and **logic changes** hidden within the massive file moves. The primary issue is that many changes were done hastily, leading to back-and-forth moves and potential lost functionality.

---

## Part 1: New Architecture - Content Rendering System

### 1.1 ContentRenderer Class (BRAND NEW)

**Location:** `src/lib/registry/ui/content-renderer.svelte.ts`

**Purpose:** Unified content rendering customization system that replaces the old fragmented approach.

**Key Features:**
- **Single class** for all content rendering customization
- **Global instance** (`defaultContentRenderer`) for app-wide config
- **Per-instance customization** for demos/docs showing multiple styles
- Supports both **kind handlers** AND **inline element components** (mentions, hashtags, links, media)

**API:**
```typescript
class ContentRenderer {
  // Properties (all nullable with fallbacks)
  mentionComponent: MentionComponent | null;
  hashtagComponent: HashtagComponent | null;
  linkComponent: LinkComponent | null;
  mediaComponent: MediaComponent | null;

  // Methods
  addKind(kindsOrClass: NDKClass | number[], component: Component): void;
  getKindHandler(kind: number): KindHandler | undefined;
  hasKindHandler(kind: number): boolean;
  getRegisteredKinds(): number[];
  unregisterKind(kind: number): boolean;
  clear(): void;
}

export const defaultContentRenderer = new ContentRenderer();
```

**Usage Patterns:**
```typescript
// Global customization (affects all content rendering)
import { defaultContentRenderer } from '@nostr/svelte/ui';
import { NDKHighlight } from '@nostr-dev-kit/ndk';
import MyHighlight from './MyHighlight.svelte';

defaultContentRenderer.addKind(NDKHighlight, MyHighlight);
defaultContentRenderer.mentionComponent = MyCustomMention;

// Per-instance customization (for docs/demos)
const customRenderer = new ContentRenderer();
customRenderer.addKind(NDKHighlight, MyHighlight);

// Use in component
<Event.Content renderer={customRenderer} />
```

### 1.2 KindRegistry Class (PRESERVED, but usage changed)

**Location:** `src/lib/registry/components/event/content/registry.svelte.ts`

**Status:** Class definition **unchanged** since 39b2a718, but **usage pattern changed**

**Key Point:** The `KindRegistry` is now used ONLY in `event/content/` for embedded event handlers within event content. The `ContentRenderer` is the NEW system for global content rendering.

**Dual System Rationale:**
- `KindRegistry` = for **embedded events within event content** (nostr: references)
- `ContentRenderer` = for **top-level event rendering** AND **inline elements** (mentions, hashtags, links)

**Current Usage:**
```typescript
// components/event/content/embedded-handlers.ts
import './kinds/article-embedded';  // Self-registers
import './kinds/note-embedded';
import './kinds/highlight-embedded';

// components/event/content/kinds/article-embedded/index.ts
import { NDKArticle } from '@nostr-dev-kit/ndk';
import ArticleEmbedded from './article-embedded.svelte';
import { defaultKindRegistry } from '../../registry.svelte';

defaultKindRegistry.add(NDKArticle, ArticleEmbedded);
```

---

## Part 2: New Components & Features

### 2.1 Embedded Event Components

**Purpose:** Specialized components for rendering embedded/referenced events within content

**Structure:**
```
components/
├── article-embedded/
│   ├── article-embedded.svelte         # Router component (inline|card|compact)
│   ├── article-embedded-card.svelte
│   ├── article-embedded-compact.svelte
│   ├── article-embedded-inline.svelte
│   └── index.ts                        # Self-registers with defaultKindRegistry
├── highlight-embedded/
│   ├── highlight-embedded.svelte
│   ├── highlight-embedded-card.svelte
│   ├── highlight-embedded-compact.svelte
│   ├── highlight-embedded-inline.svelte
│   └── index.ts
└── note-embedded/
    ├── note-embedded.svelte
    ├── note-embedded-card.svelte
    ├── note-embedded-compact.svelte
    ├── note-embedded-inline.svelte
    └── index.ts
```

**Variants:**
- `inline` - Minimal, text-flow integration
- `compact` - Small card, minimal info
- `card` - Full card with all metadata

**Props Interface:**
```typescript
interface EmbeddedProps {
  ndk: NDKSvelte;
  event: NDKArticle | NDKHighlight | NDKEvent;
  variant?: 'inline' | 'card' | 'compact';
}
```

### 2.2 UI Event Content System

**New Files:**
- `ui/event-content.svelte` - Main content renderer using ContentRenderer
- `ui/embedded-event.svelte` - Generic embedded event loader/renderer
- `ui/content-renderer.svelte.ts` - Content rendering system (see Part 1)

**ui/event-content.svelte** replaces old pattern:
```svelte
<EventContent {ndk} {event} renderer={customRenderer}>
  <!-- Automatically handles: -->
  <!-- - Text segments -->
  <!-- - Mentions (npub, nprofile) via renderer.mentionComponent -->
  <!-- - Hashtags via renderer.hashtagComponent -->
  <!-- - Links -->
  <!-- - Media (images, videos, YouTube) -->
  <!-- - Custom emojis -->
  <!-- - Image grids -->
  <!-- - Embedded events (nevent, naddr) -->
</EventContent>
```

**ui/embedded-event.svelte** handles loading and rendering:
```svelte
<EmbeddedEvent {ndk} bech32={noteAddr} variant="card" renderer={customRenderer}>
  <!-- Automatically: -->
  <!-- 1. Fetches event from bech32 -->
  <!-- 2. Looks up handler in renderer.getKindHandler(event.kind) -->
  <!-- 3. Wraps event with NDK class if handler.wrapper exists -->
  <!-- 4. Renders with found handler component -->
  <!-- 5. Shows fallback if no handler -->
</EmbeddedEvent>
```

### 2.3 Default Inline Components

**New Components:**
- `components/mention.svelte` - Default mention renderer (fetches profile, shows @name)
- `components/hashtag.svelte` - Default hashtag renderer (#tag with click handler)
- `components/generic-embedded.svelte` - Fallback for unknown kinds
- `components/event-dropdown.svelte` - Event actions dropdown (NEW)
- `components/zap-button.svelte` - Standalone zap button (NEW)

**mention.svelte:**
```svelte
<script>
  let { ndk, bech32, class: className = '' } = $props();
  const profileFetcher = createProfileFetcher(() => ({ user: bech32 }), ndk);
</script>

<span class="mention {className}">
  @{profile?.name || profile?.displayName || bech32}
</span>
```

**hashtag.svelte:**
```svelte
<script>
  let { tag, class: className = '', onclick } = $props();
</script>

<span class="hashtag {className}" onclick={() => onclick?.(tag)}>
  #{tag}
</span>
```

### 2.4 Zap Architecture Split

**OLD System (pre-refactor):**
```
components/zap/
├── zap-amount.svelte
├── zap-content.svelte
└── index.ts
```

**NEW System:**
```
components/
├── zap-send/              # For SENDING zaps
│   ├── zap-send-root.svelte
│   ├── zap-send-splits.svelte
│   └── index.ts
├── zaps/                  # For DISPLAYING received zaps
│   ├── zaps-root.svelte    # Subscription + stats provider
│   ├── context.svelte.ts
│   └── index.ts
└── zap-button.svelte      # Standalone action button

ui/zap/                    # Display primitives
├── zap-amount.svelte      # Can work standalone or with context
├── zap-content.svelte     # Can work standalone or with context
├── context.svelte.ts
└── index.ts
```

**Key Architectural Change:**
- **BEFORE:** Mixed sending and displaying, causing duplicate computations
- **AFTER:** Clear separation:
  - `ZapSend.Root` + `ZapSend.Splits` = Sending UI
  - `Zaps.Root` = Subscription provider for displaying received zaps
  - `Zap.Amount` + `Zap.Content` = Display primitives (work both ways)

**Core NDK Addition:**
```typescript
// core/src/zap/utils.ts (NEW)
export interface ProcessedZap {
  amount: number;
  sender: NDKUser;
  recipient: NDKUser;
  comment?: string;
  // Access typed instances
  zap?: NDKZap;        // For NIP-57
  nutzap?: NDKNutzap;  // For NIP-61
}
```

**Usage Pattern:**
```svelte
<!-- Sending zaps -->
<ZapSend.Root {ndk} recipient={user} let:send>
  <ZapSend.Splits />
  <button use:send>Send Zap</button>
</ZapSend.Root>

<!-- Displaying received zaps -->
<Zaps.Root {ndk} event={article} let:stats>
  <Zap.Amount /> <!-- Uses context from Zaps.Root -->
  <Zap.Content />
  <div>Total: {stats.total}</div>
</Zaps.Root>

<!-- Standalone display -->
<Zap.Amount {ndk} {zap} />
```

---

## Part 3: UI Primitive Changes

### 3.1 Article Primitives Reorganization

**DELETED (components/article-card/):**
- `article-card-author.svelte` ❌
- `article-card-date.svelte` ❌
- `article-card-meta.svelte` ❌
- `article-card-root.svelte` ❌
- `article-card-image.svelte` → `ui/article/article-image.svelte`
- `article-card-title.svelte` → `ui/article/article-title.svelte`
- `article-card-summary.svelte` → `ui/article/article-summary.svelte`
- `article-card-reading-time.svelte` → `ui/article/article-reading-time.svelte`
- `context.svelte.ts` → `ui/article/context.svelte.ts` (MODIFIED)
- `index.ts` → `ui/article/index.ts` (REWRITTEN)

**ADDED (ui/article/):**
- `article-root.svelte` ✅ (NEW, simpler than old article-card-root)
- `article-meta.svelte` ✅ (NEW, re-created in 41272466)

**KEY CHANGES:**

**Removed author fetching from Root:**
```svelte
<!-- OLD: article-card-root.svelte -->
let authorProfile = $state<ReturnType<typeof createProfileFetcher> | null>(null);

$effect(() => {
  if (article.author) {
    authorProfile = createProfileFetcher(() => ({ user: article.author }), ndk);
  }
});

const context = {
  get authorProfile() { return authorProfile; },
  // ...
};

<!-- NEW: article-root.svelte -->
<!-- No author fetching! -->
const context = {
  get ndk() { return ndk; },
  get article() { return article; },
  get onclick() { return onclick; }
};
```

**Impact:** Author profile fetching is now responsibility of individual primitives or higher-level blocks that need it. Cleaner separation but may cause **duplicate fetches** if multiple primitives need author data.

**Removed `interactive` prop:**
```typescript
// OLD
interface Props {
  interactive?: boolean;  // ❌ Removed
  onclick?: (e: MouseEvent) => void;
}

// NEW
interface Props {
  onclick?: (e: MouseEvent) => void;  // ✅ Simplified
}
```

**Naming Changes:**
- `ARTICLE_CARD_CONTEXT_KEY` → `ARTICLE_CONTEXT_KEY`
- `ArticleCardContext` → `ArticleContext`
- `article-card-*` → `article-*`

### 3.2 User Primitives Reorganization

**DELETED (components/user-profile/):**
- `user-profile-avatar.svelte` ❌ (logic moved to ui/user/user-avatar.svelte)
- `user-profile-bio.svelte` ❌ (simplified version in ui/user/user-bio.svelte)
- `user-profile-field.svelte` ❌ (NEW implementation in ui/user/user-field.svelte)
- `user-profile-name.svelte` ❌ (NEW implementation in ui/user/user-name.svelte)
- `avatar-group.svelte` ❌ (NOT RECOVERED)
- `index.ts` → `ui/user/index.ts` (REWRITTEN)

**NEW ui/user/ Structure:**
```
ui/user/
├── user-root.svelte          # From user-profile-root
├── user-avatar.svelte        # NEW implementation
├── user-name.svelte          # NEW implementation
├── user-bio.svelte           # From user-profile-bio
├── user-field.svelte         # NEW implementation
├── user-handle.svelte        # From user-profile-handle
├── user-nip05.svelte         # From user-profile-nip05
├── user-banner.svelte        # From user-profile-banner
├── user-avatar-name.svelte   # From user-profile-avatar-name
├── context.svelte.ts         # From user-profile/context
└── index.ts
```

**KEY CHANGE - Standalone Avatar:**
```svelte
<!-- NEW: user-avatar.svelte supports standalone mode -->
<script>
  let {
    ndk: standaloneNdk,      // ✅ NEW
    user: standaloneUser,    // ✅ NEW
    size = 48,
    class: className = '',
    fallback,
    alt
  } = $props();

  const context = getContext<UserContext | undefined>(USER_CONTEXT_KEY);

  // ✅ NEW: Standalone mode
  const standaloneProfileFetcher = standaloneNdk && standaloneUser
    ? createProfileFetcher(() => ({ user: standaloneUser }), standaloneNdk)
    : undefined;

  const profile = $derived(
    standaloneProfileFetcher?.profile ?? context?.profile
  );
</script>

<!-- Can now use: -->
<User.Avatar ndk={ndk} user={userPubkey} size={40} />
<!-- WITHOUT needing User.Root wrapper -->
```

**Naming Changes:**
- `user-profile-*` → `user-*`
- `USER_PROFILE_CONTEXT_KEY` → `USER_CONTEXT_KEY`
- `UserProfileContext` → `UserContext`

### 3.3 Voice Message Primitives

**DELETED:**
- `voice-message-card-author.svelte` ❌ (NOT RECOVERED)
- `voice-message-card-root.svelte` ❌ (became voice-message-root)
- `voice-message-card/context.svelte.ts` → `ui/voice-message/context.svelte.ts`
- `voice-message-card/index.ts` ❌ (DELETED, not in ui/voice-message/)

**MOVED TO ui/voice-message/:**
- `voice-message-card-duration.svelte` → `voice-message-duration.svelte`
- `voice-message-card-player.svelte` → `voice-message-player.svelte`
- `voice-message-card-root.svelte` → `voice-message-root.svelte`
- `voice-message-card-waveform.svelte` → `voice-message-waveform.svelte`

**Naming Changes:**
- `voice-message-card-*` → `voice-message-*`
- `VOICE_MESSAGE_CARD_CONTEXT_KEY` → `VOICE_MESSAGE_CONTEXT_KEY`

**Missing Index:** `ui/voice-message/index.ts` was created but needs verification

### 3.4 Highlight Primitives

**MOVED (components/highlight-card/ → ui/highlight/):**
- `highlight-card-content.svelte` → `highlight-content.svelte`
- `highlight-card-root.svelte` → `highlight-root.svelte`
- `highlight-card-source.svelte` → `highlight-source.svelte`
- `context.svelte.ts` (mostly unchanged)
- `index.ts` (rewritten)

**NEW Additions:**
```typescript
// ui/highlight/context.svelte.ts
export const HIGHLIGHT_CONTEXT_KEY = Symbol('highlight');
export const HIGHLIGHT_CARD_CONTEXT_KEY = HIGHLIGHT_CONTEXT_KEY;  // ✅ Alias

// ui/highlight/index.ts
export const Highlight = {
  Root,
  Content,
  Source,
};

export const HighlightCard = Highlight;  // ✅ Backwards compat alias
```

### 3.5 Other UI Primitives

**Relay:**
- Moved from `components/relay/` → `ui/relay/`
- All files preserved, just renamed directory
- Added `relay-list-item.svelte` (from relay-card-list)

**Emoji Picker:**
- Moved from `components/emoji-picker/` → `ui/emoji-picker/`
- No logic changes

**Follow Pack:**
- Moved from `components/follow-pack/` → `ui/follow-pack/`
- No logic changes

**User Input:**
- Moved from `components/input/` → `ui/user-input/`
- Directory renamed, files unchanged

**Media Upload:**
- Moved from `components/media-upload/` → `ui/media-upload/`
- Added `media-upload-carousel.svelte` (re-created in 41272466)

**Reaction:**
- Moved from `components/reaction/` → `ui/reaction/`
- Files unchanged

---

## Part 4: Permanently Deleted Files

### Files Deleted and NOT Recovered:

1. **components/article-card/article-card-author.svelte**
   - **What it did:** Rendered article author with avatar/name
   - **Replacement:** None - users must fetch and display author manually
   - **Migration:** Create custom author display or use `User.Root` + `User.Avatar` + `User.Name`

2. **components/article-card/article-card-date.svelte**
   - **What it did:** Rendered article published date
   - **Replacement:** None
   - **Migration:** Use `article.published_at` directly or create custom date component

3. **components/user-profile/avatar-group.svelte**
   - **What it did:** Displayed multiple user avatars in a group (used in follow packs)
   - **Replacement:** `components/avatar-group/avatar-group.svelte` (different location)
   - **Migration:** Import from `components/avatar-group/` instead

4. **components/voice-message-card/voice-message-card-author.svelte**
   - **What it did:** Rendered voice message author
   - **Replacement:** None
   - **Migration:** Use `User.Root` + `User.Avatar` + `User.Name`

5. **components/event-card/event-card-thread-line.svelte**
   - **What it did:** Rendered thread connection line
   - **Replacement:** Unknown - may need to check if logic moved elsewhere
   - **Migration:** TBD - need to verify if functionality exists elsewhere

6. **components/relay/relay-card.svelte**
   - **What it did:** Monolithic relay card component
   - **Replacement:** Relay primitives (`Relay.Root`, `Relay.Icon`, etc.)
   - **Migration:** Compose using relay primitives

7. **components/blocks/index.ts**
   - **What it did:** Single import point for all block components
   - **Replacement:** Blocks are now in `blocks/` directory without centralized export
   - **Migration:** Import blocks directly from `blocks/component-name.svelte`

8. **components/utils/index.ts**
   - **What it did:** Exported utility functions
   - **Replacement:** `utils/cn.ts` (just cn function)
   - **Migration:** Import from `utils/cn.ts` or inline utilities

9. **ui/input.svelte**
   - **What it did:** Generic input primitive
   - **Replacement:** Unknown
   - **Migration:** Use standard HTML input or create custom

10. **ui/utils/index.ts**
    - **What it did:** UI utilities
    - **Replacement:** None
    - **Migration:** Create as needed

---

## Part 5: Directory Structure Changes

### 5.1 Final Structure (Current)

```
src/lib/registry/
├── blocks/                    # HIGH-LEVEL: Composed, ready-to-use components
│   ├── article-card-hero.svelte
│   ├── article-card-medium.svelte
│   ├── article-card-neon.svelte
│   ├── article-card-portrait.svelte
│   ├── event-card-classic.svelte
│   ├── follow-button-animated.svelte
│   ├── follow-button-pill.svelte
│   ├── follow-button.svelte
│   ├── follow-pack-compact.svelte
│   ├── follow-pack-hero.svelte
│   ├── follow-pack-portrait.svelte
│   ├── highlight-card-*.svelte
│   ├── image-card-*.svelte
│   ├── note-composer-*.svelte
│   ├── reaction-*.svelte
│   ├── relay-*.svelte
│   ├── repost-*.svelte
│   ├── user-card-*.svelte
│   ├── voice-message-card-*.svelte
│   ├── zap-modal-*.svelte
│   ├── zap-pill.svelte
│   └── zap-slider.svelte
│
├── components/                # MID-LEVEL: Styled, opinionated components
│   ├── actions/
│   │   ├── reaction.svelte
│   │   └── zap.svelte
│   ├── article-embedded/      # ✅ NEW
│   ├── event-card/
│   ├── event/content/
│   ├── highlight-embedded/    # ✅ NEW
│   ├── note-composer/
│   ├── note-embedded/         # ✅ NEW
│   ├── zap-send/              # ✅ NEW
│   ├── zaps/                  # ✅ NEW
│   ├── avatar-group/
│   ├── reply-indicator/
│   ├── event-dropdown.svelte  # ✅ NEW
│   ├── generic-embedded.svelte # ✅ NEW
│   ├── hashtag.svelte         # ✅ NEW
│   ├── mention.svelte         # ✅ NEW
│   └── zap-button.svelte      # ✅ NEW
│
├── ui/                        # PRIMITIVES: Unstyled, composable
│   ├── article/               # ✅ NEW (from components/article-card)
│   ├── emoji-picker/
│   ├── follow-pack/
│   ├── highlight/
│   ├── media-upload/
│   ├── reaction/
│   ├── relay/
│   ├── user/                  # ✅ NEW (from components/user-profile)
│   ├── user-input/
│   ├── voice-message/
│   ├── zap/
│   ├── content-renderer.svelte.ts  # ✅ NEW
│   ├── embedded-event.svelte       # ✅ NEW
│   ├── event-content.svelte        # ✅ NEW
│   └── index.ts               # ✅ Main UI exports
│
├── icons/
└── utils/
```

### 5.2 Migration from Old Structure

**OLD (39b2a718):**
```
components/
├── blocks/            # Blocks were INSIDE components
│   └── *.svelte
├── article-card/      # Card primitives
├── highlight-card/
├── user-profile/
├── voice-message-card/
├── input/
├── zap/
└── ...
```

**NEW (41272466/HEAD):**
```
blocks/               # Blocks MOVED OUT to top level
ui/                   # NEW top-level for primitives
components/           # Mid-level only
```

---

## Part 6: Export Changes

### 6.1 New ui/index.ts Exports

```typescript
// ui/index.ts
export { Article } from './article';
export { default as EventContent } from './event-content.svelte';
export { default as EmbeddedEvent } from './embedded-event.svelte';  // ✅ NEW
export { User } from './user';
export { Relay } from './relay';
export { Zap } from './zap';
export { VoiceMessage } from './voice-message';
export { Highlight } from './highlight';
export { VoiceMessage } from './voice-message';
export { MediaUpload } from './media-upload';
export { UserInput } from './user-input';
export { UserInput as Input } from './user-input';  // ✅ Alias
export { EmojiPicker } from './emoji-picker';
export { Reaction } from './reaction';

// Re-export from components for convenience
export { EventCard, ReactionAction } from '../components/event-card';  // ✅ NEW
export { EventCard as Event } from '../components/event-card';  // ✅ Alias
export { default as Mention } from '../components/mention.svelte';  // ✅ NEW
export { KindRegistry } from '../components/event/content/registry.svelte.js';  // ✅ NEW

// Export types
export type { ArticleContext } from './article/context.svelte.js';
export type { UserContext } from './user/context.svelte.js';
export type { HighlightContext } from './highlight/context.svelte.js';
export type { VoiceMessageContext } from './voice-message/context.svelte.js';
export type { EventCardContext } from '../components/event-card/context.svelte.js';  // ✅ NEW
```

### 6.2 Backwards Compatibility Aliases

```typescript
// ui/highlight/index.ts
export const HighlightCard = Highlight;  // ✅ OLD NAME

// ui/user-input/index.ts
export { UserInput as Input };  // ✅ ALIAS

// ui/highlight/context.svelte.ts
export const HIGHLIGHT_CARD_CONTEXT_KEY = HIGHLIGHT_CONTEXT_KEY;  // ✅ OLD NAME
```

---

## Part 7: Detailed Migration Instructions

### 7.1 Phase 1: Prep Work (BEFORE touching code)

**Tasks:**
1. Create branch from 39b2a718: `git checkout -b proper-refactor 39b2a718`
2. Document all current imports in your app
3. Create test coverage for critical components
4. Back up current working state

### 7.2 Phase 2: Create New Architecture

**Order of operations:**

1. **Create ContentRenderer system**
   ```bash
   # Create file structure
   mkdir -p src/lib/registry/ui
   touch src/lib/registry/ui/content-renderer.svelte.ts
   touch src/lib/registry/ui/event-content.svelte
   touch src/lib/registry/ui/embedded-event.svelte
   ```

   Copy implementations from commit a034daad:
   ```bash
   git show a034daad:svelte/registry/src/lib/registry/ui/content-renderer.svelte.ts > src/lib/registry/ui/content-renderer.svelte.ts
   git show a034daad:svelte/registry/src/lib/registry/ui/event-content.svelte > src/lib/registry/ui/event-content.svelte
   git show a034daad:svelte/registry/src/lib/registry/ui/embedded-event.svelte > src/lib/registry/ui/embedded-event.svelte
   ```

2. **Create default inline components**
   ```bash
   touch src/lib/registry/components/mention.svelte
   touch src/lib/registry/components/hashtag.svelte
   ```

   Copy from a034daad and test individually.

3. **Create embedded event handlers**
   ```bash
   mkdir -p src/lib/registry/components/{article-embedded,highlight-embedded,note-embedded}
   ```

   Copy each from a034daad, test individually.

4. **Create zap architecture split**
   ```bash
   mkdir -p src/lib/registry/components/{zap-send,zaps}
   mkdir -p src/lib/registry/ui/zap
   ```

   Copy from 8db28fc9 (zap refactor commit).

5. **Test new systems in isolation**
   - Create test page using ContentRenderer
   - Test each embedded handler
   - Test zap send/display separation

### 7.3 Phase 3: Move Primitives to ui/

**For each primitive group:**

1. **Article**
   ```bash
   mkdir -p src/lib/registry/ui/article

   # Move files (using git mv to preserve history)
   git mv src/lib/registry/components/article-card/article-card-image.svelte \
          src/lib/registry/ui/article/article-image.svelte
   # Repeat for title, summary, reading-time

   # Create new files
   touch src/lib/registry/ui/article/article-root.svelte
   touch src/lib/registry/ui/article/article-meta.svelte
   touch src/lib/registry/ui/article/context.svelte.ts
   touch src/lib/registry/ui/article/index.ts
   ```

   **IMPORTANT:** When creating `article-root.svelte`:
   - Start with OLD `article-card-root.svelte`
   - Remove `authorProfile` fetching logic
   - Remove `interactive` prop
   - Simplify context

2. **User**
   ```bash
   mkdir -p src/lib/registry/ui/user

   # Handle renames
   git mv components/user-profile/user-profile-*.svelte ui/user/user-*.svelte

   # Create NEW implementations
   # - user-avatar.svelte (with standalone mode)
   # - user-name.svelte
   # - user-field.svelte
   # - user-bio.svelte
   ```

   **CRITICAL:** `user-avatar.svelte` must support standalone mode:
   ```svelte
   <User.Avatar ndk={ndk} user={pubkey} size={40} />
   ```

3. **Repeat for:** highlight, voice-message, relay, etc.

### 7.4 Phase 4: Move Blocks Out

```bash
# Move entire blocks directory up one level
git mv src/lib/registry/components/blocks src/lib/registry/blocks

# Update imports in blocks (do NOT move files, just update paths)
find src/lib/registry/blocks -name "*.svelte" -exec sed -i '' 's|from \.\./|from ../components/|g' {} \;
```

### 7.5 Phase 5: Update All Imports

**Systematic approach:**

1. **Find all imports:**
   ```bash
   rg "from.*registry/components/(article-card|highlight-card|user-profile|voice-message-card)" --files-with-matches
   ```

2. **Update patterns:**
   ```typescript
   // OLD
   import { ArticleCard } from '$lib/registry/components/article-card';

   // NEW
   import { Article } from '$lib/registry/ui/article';

   // Usage changes
   <ArticleCard.Root> → <Article.Root>
   <ArticleCard.Title> → <Article.Title>
   ```

3. **Update all example files** (70+ files need updating)

### 7.6 Phase 6: Clean Up & Test

1. Delete old directories
2. Remove temporary files
3. Run full test suite
4. Manual testing of all components
5. Check for broken imports

### 7.7 Phase 7: Version Bump

```bash
# Update package.json versions
# Update dependency versions to beta.30
```

---

## Part 8: Testing Checklist

### 8.1 ContentRenderer System
- [ ] Can register kind handlers globally
- [ ] Can create custom renderer instances
- [ ] Mention component customization works
- [ ] Hashtag component customization works
- [ ] Link/media component customization works
- [ ] Embedded events render correctly
- [ ] Fallback for unknown kinds works

### 8.2 Embedded Event Handlers
- [ ] Article embedded (inline, card, compact)
- [ ] Highlight embedded (inline, card, compact)
- [ ] Note embedded (inline, card, compact)
- [ ] Self-registration with KindRegistry works
- [ ] Loading states work
- [ ] Error states work

### 8.3 UI Primitives
- [ ] Article primitives work (without author display context)
- [ ] User primitives work
- [ ] User.Avatar standalone mode works
- [ ] Highlight primitives work
- [ ] Voice message primitives work
- [ ] All other primitives work

### 8.4 Zap System
- [ ] ZapSend.Root works for sending
- [ ] Zaps.Root works for displaying
- [ ] Zap.Amount/Content work standalone
- [ ] ProcessedZap interface works in core
- [ ] No duplicate subscriptions

### 8.5 Blocks
- [ ] All 50+ blocks still work
- [ ] Import paths updated correctly
- [ ] No circular dependencies

### 8.6 Backwards Compatibility
- [ ] HighlightCard alias works
- [ ] UserInput as Input alias works
- [ ] Old context keys still work

---

## Part 9: Known Risks & Gotchas

### 9.1 Duplicate Profile Fetching
**Issue:** Removed author fetching from Article.Root means each Article primitive that needs author data will fetch independently.

**Solutions:**
1. Re-add author fetching to Article.Root (breaks "primitive" philosophy)
2. Create higher-level "ArticleWithAuthor" component
3. Document that users should fetch author at app level

### 9.2 Missing Avatar Group
**Issue:** `components/user-profile/avatar-group.svelte` deleted, now lives in `components/avatar-group/avatar-group.svelte`

**Solution:** Document new location, update all imports

### 9.3 Blocks Index Removed
**Issue:** No centralized `blocks/index.ts` export

**Solutions:**
1. Re-create blocks/index.ts with all exports
2. Document individual imports required
3. Use barrel exports pattern

### 9.4 Event Thread Line
**Issue:** `event-card-thread-line.svelte` deleted, unclear if functionality preserved

**Solution:** INVESTIGATE where thread line rendering moved to

### 9.5 Voice Message Author
**Issue:** Voice message author component deleted

**Solution:** Use User primitives for author display

---

## Part 10: Commit Strategy

### Recommended Commit Sequence:

```bash
# 1. Add ContentRenderer system
git add src/lib/registry/ui/content-renderer.svelte.ts
git add src/lib/registry/ui/event-content.svelte
git add src/lib/registry/ui/embedded-event.svelte
git commit -m "feat: add ContentRenderer system for unified content customization"

# 2. Add default inline components
git add src/lib/registry/components/mention.svelte
git add src/lib/registry/components/hashtag.svelte
git commit -m "feat: add default mention and hashtag components"

# 3. Add embedded handlers
git add src/lib/registry/components/article-embedded/
git add src/lib/registry/components/highlight-embedded/
git add src/lib/registry/components/note-embedded/
git commit -m "feat: add embedded event handler components"

# 4. Refactor zap architecture
git add src/lib/registry/components/zap-send/
git add src/lib/registry/components/zaps/
git add src/lib/registry/ui/zap/
git add core/src/zap/utils.ts
git commit -m "refactor: split zap sending and displaying with ProcessedZap"

# 5. Move article primitives
git add src/lib/registry/ui/article/
git rm src/lib/registry/components/article-card/
git commit -m "refactor: move article primitives to ui/article"

# 6. Move user primitives
git add src/lib/registry/ui/user/
git rm src/lib/registry/components/user-profile/
git commit -m "refactor: move user primitives to ui/user with standalone avatar"

# 7-11. Move other primitives (one commit each)

# 12. Move blocks
git mv src/lib/registry/components/blocks src/lib/registry/blocks
git commit -m "refactor: move blocks to top-level directory"

# 13. Update all imports
# (Mass update commit)
git commit -m "refactor: update all import paths for new structure"

# 14. Add ui/index.ts exports
git add src/lib/registry/ui/index.ts
git commit -m "feat: add unified ui/index.ts with convenience exports"

# 15. Version bump
git commit -m "chore: bump to beta.30"
```

---

## Part 11: What We Lost (Functionality Audit)

### Permanently Lost:
1. ✅ **Article author display** - No built-in author component in Article primitives
2. ✅ **Article date display** - No date component
3. ✅ **Voice message author** - Removed
4. ✅ **Event card thread line** - Removed (check if moved elsewhere)
5. ✅ **Centralized blocks export** - No blocks/index.ts
6. ✅ **Generic input primitive** - ui/input.svelte deleted
7. ✅ **UI utils** - ui/utils/index.ts deleted

### Preserved but Moved:
1. ✅ **All article primitives** - Moved to ui/article (minus author/date)
2. ✅ **All user primitives** - Moved to ui/user (enhanced with standalone mode)
3. ✅ **All highlight primitives** - Moved to ui/highlight
4. ✅ **All voice message primitives** - Moved to ui/voice-message (minus author)
5. ✅ **Relay primitives** - Moved to ui/relay
6. ✅ **Follow pack primitives** - Moved to ui/follow-pack
7. ✅ **User input** - Moved to ui/user-input
8. ✅ **Media upload** - Moved to ui/media-upload

---

## Part 12: Quick Reference

### Import Changes Cheat Sheet:

```typescript
// Article
- import { ArticleCard } from '$lib/registry/components/article-card'
+ import { Article } from '$lib/registry/ui/article'

// User
- import { UserProfile } from '$lib/registry/components/user-profile'
+ import { User } from '$lib/registry/ui/user'

// Highlight
- import { HighlightCard } from '$lib/registry/components/highlight-card'
+ import { Highlight } from '$lib/registry/ui/highlight'
// OR (backwards compat)
+ import { HighlightCard } from '$lib/registry/ui/highlight'

// Voice Message
- import { VoiceMessageCard } from '$lib/registry/components/voice-message-card'
+ import { VoiceMessage } from '$lib/registry/ui/voice-message'

// User Input
- import { UserInput } from '$lib/registry/components/input'
+ import { UserInput } from '$lib/registry/ui/user-input'
// OR
+ import { Input } from '$lib/registry/ui/user-input'

// Zap (NEW SPLIT)
- import { Zap } from '$lib/registry/components/zap'
+ import { ZapSend } from '$lib/registry/components/zap-send'  // For sending
+ import { Zaps } from '$lib/registry/components/zaps'          // For displaying
+ import { Zap } from '$lib/registry/ui/zap'                    // Primitives

// Blocks
- import { ArticleCardHero } from '$lib/registry/components/blocks'
+ import ArticleCardHero from '$lib/registry/blocks/article-card-hero.svelte'

// New Components
+ import { defaultContentRenderer, ContentRenderer } from '$lib/registry/ui/content-renderer.svelte'
+ import EventContent from '$lib/registry/ui/event-content.svelte'
+ import EmbeddedEvent from '$lib/registry/ui/embedded-event.svelte'
+ import Mention from '$lib/registry/components/mention.svelte'
+ import Hashtag from '$lib/registry/components/hashtag.svelte'
```

### Component Name Changes:

```
ArticleCard.* → Article.*
UserProfile.* → User.*
HighlightCard.* → Highlight.*
VoiceMessageCard.* → VoiceMessage.*
article-card-* → article-*
user-profile-* → user-*
highlight-card-* → highlight-*
voice-message-card-* → voice-message-*
```

---

## Part 13: TODO - Further Investigation Needed

1. **Event Thread Line:** Where did the thread line rendering logic go?
2. **Component Deletions:** Verify ALL deleted components have replacements
3. **Profile Fetching:** Audit performance impact of distributed author fetching
4. **Block Index:** Decide if we need centralized blocks export
5. **Voice Message Context:** Check if voice-message/index.ts exports everything
6. **Testing:** Create comprehensive test suite for new architecture
7. **Documentation:** Update all component documentation
8. **Migration Scripts:** Create automated migration scripts for common patterns

---

## Conclusion

This refactor introduced **significant architectural improvements**:
1. ✅ ContentRenderer system for unified customization
2. ✅ Clear primitive/component/block separation
3. ✅ Zap send/display separation
4. ✅ Embedded event handler system
5. ✅ Standalone component modes

But it also had **problems**:
1. ❌ Massive commits that hid changes
2. ❌ Back-and-forth file moves
3. ❌ Lost functionality (author display, date, etc.)
4. ❌ Broken imports across hundreds of files
5. ❌ Inadequate testing before committing

**This document provides the roadmap to re-implement these changes PROPERLY** - one logical step at a time, with testing and verification at each stage.
