# Component Migration Plan

## Goal
Migrate all components to the new three-layer architecture:
1. **Builders** (headless primitives) - Pure logic in `src/lib/builders/`
2. **UI Components** (unstyled) - Headless components in `src/lib/ui/`
3. **Registry Components** (styled) - Beautiful defaults in `registry/ndk/`

## Current State

### ✅ Already Migrated
- `Avatar` → Builder: `createAvatar()` | UI: `ui/User/Avatar.svelte`
- `Name` → Builder: `createName()` | UI: `ui/User/Name.svelte`
- `NoteCard` → Builder: `createNoteCard()` | UI: `ui/Event/NoteCard.svelte` | Registry: ✅

### 🔄 Needs Migration

#### Priority 1: Core User Components
**Status:** Partially done, needs completion

1. **Avatar.svelte** (old)
   - Status: Has new version, delete old
   - Action: Remove `src/lib/components/Avatar.svelte`

2. **Name.svelte** (old)
   - Status: Has new version, delete old
   - Action: Remove `src/lib/components/Name.svelte`

#### Priority 2: Event Content & Display

3. **EventContent.svelte**
   - Current: Monolithic component with hardcoded rendering
   - Builder: `createEventContent()` - Parse and structure content
   - UI: `ui/Event/EventContent.svelte` - Headless content renderer
   - Registry: `registry/ndk/event-content/` - Styled with media, mentions, etc.
   - Components needed:
     - `builders/event/content/` - Content parsing logic
     - `ui/Event/EventContent.svelte` - Headless renderer
     - `registry/ndk/event-content/` - Styled version

4. **event-card/** (entire directory)
   - Current: Custom EventCard implementation
   - Status: We have NoteCard, might be duplicate
   - Action: Evaluate if needed or if NoteCard covers it
   - Decision: Keep or delete?

5. **embedded-event/** (entire directory)
   - Current: Event preview components
   - Builder: `createEventPreview()` - Load and prepare event data
   - UI: `ui/Event/EventPreview.svelte` - Headless preview
   - Registry: `registry/ndk/event-preview/` - Styled previews
   - Variants needed:
     - NotePreview
     - ArticlePreview
     - GenericPreview

6. **EmbeddedEvent.svelte** (root)
   - Current: Legacy embedded event
   - Action: Probably superseded by embedded-event/ directory
   - Decision: Delete after verifying

#### Priority 3: Relay Management

7. **RelayCard.svelte**
   - Builder: `createRelayCard()` - Relay info, connection status
   - UI: `ui/Relay/RelayCard.svelte` - Headless relay display
   - Registry: `registry/ndk/relay-card/` - Styled relay card

8. **RelayList.svelte**
   - Builder: `createRelayList()` - Relay list management
   - UI: `ui/Relay/RelayList.svelte` - Headless list
   - Registry: `registry/ndk/relay-list/` - Styled list

9. **RelayManager.svelte**
   - Builder: `createRelayManager()` - Add/remove/configure relays
   - UI: `ui/Relay/RelayManager.svelte` - Headless manager
   - Registry: `registry/ndk/relay-manager/` - Full manager UI

10. **RelayAddForm.svelte**
    - Builder: Part of `createRelayManager()`
    - UI: `ui/Relay/RelayAddForm.svelte` - Headless form
    - Registry: Part of relay-manager

11. **RelayConnectionStatus.svelte**
    - Builder: `createRelayStatus()` - Connection state tracking
    - UI: `ui/Relay/RelayStatus.svelte` - Headless status display
    - Registry: `registry/ndk/relay-status/` - Styled status indicator

12. **RelayPoolTabs.svelte**
    - Builder: `createRelayPool()` - Pool management
    - UI: `ui/Relay/RelayPoolTabs.svelte` - Headless tabs
    - Registry: Part of relay-manager or separate

#### Priority 4: Payments/Zaps

13. **ZapButton.svelte**
   - Current: Old implementation
   - Status: We have zap in NoteCard, might be duplicate
   - Builder: Part of `createNoteCard()` or separate `createZapButton()`
   - UI: `ui/Event/ZapButton.svelte` - Headless zap button
   - Registry: Already exists at `registry/ndk/zap-button/` ✅
   - Action: Check if registry version is current, delete old

#### Priority 5: Media

14. **BlossomImage.svelte**
    - Builder: `createBlossomImage()` - Image loading, fallback, blur hash
    - UI: `ui/Media/BlossomImage.svelte` - Headless image component
    - Registry: `registry/ndk/blossom-image/` - Styled with loading states

## Migration Strategy Per Component

### Phase 1: Create Builder
```typescript
// src/lib/builders/{domain}/{feature}/
// - index.ts (implementation)
// - types.ts (interfaces)
```

### Phase 2: Create UI Component
```svelte
// src/lib/ui/{Domain}/{Feature}.svelte
// - Uses builder
// - No styling (or minimal layout-only)
// - Exports all builder state via props
```

### Phase 3: Create Registry Component
```svelte
// registry/ndk/{feature}/{feature}.svelte
// - Uses UI component or builder
// - Fully styled with CSS variables
// - Beautiful defaults
// - shadcn-svelte compatible
```

### Phase 4: Delete Old Component
```bash
rm src/lib/components/{old-component}.svelte
```

## Architecture Decision: EventCard vs NoteCard

**Question:** Do we need both EventCard and NoteCard?

**Current State:**
- `event-card/` - Custom implementation in components
- `NoteCard` - New builder/UI/registry pattern

**Recommendation:**
- **Keep NoteCard** - It's the new pattern, properly architected
- **Delete event-card/** - Old implementation, superseded
- **Expand NoteCard** - Add variants if needed (compact, minimal, etc.)

## Architecture Decision: Multiple Preview Components

**Question:** How to handle ArticlePreview, NotePreview, GenericPreview?

**Recommendation:**
- **Single Builder:** `createEventPreview({ event })` - Auto-detects kind
- **Single UI Component:** `ui/Event/EventPreview.svelte` - Renders based on kind
- **Multiple Registry Components:**
  - `registry/ndk/note-preview/` - Styled note preview
  - `registry/ndk/article-preview/` - Styled article preview
  - `registry/ndk/event-preview/` - Generic styled preview

## Migration Priority Order

### Immediate (Week 1)
1. ✅ Delete old `Avatar.svelte`
2. ✅ Delete old `Name.svelte`
3. ✅ Delete old `event-card/` (if NoteCard covers it)
4. ✅ Delete old `EmbeddedEvent.svelte` (if embedded-event/ covers it)
5. ✅ Verify ZapButton registry is current, delete old

### High Priority (Week 2)
6. **EventContent** - Core content rendering
   - Builder: Parse content, extract media, mentions, hashtags
   - UI: Headless renderer with slots
   - Registry: Styled with syntax highlighting, embeds, etc.

7. **Event Previews** - Embedded event display
   - Builder: Load and prepare event
   - UI: Headless preview component
   - Registry: Styled previews per kind

### Medium Priority (Week 3)
8. **Relay Components** - Relay management
   - Builders: Relay status, list, manager
   - UI: Headless relay components
   - Registry: Full relay management UI

### Lower Priority (Week 4)
9. **BlossomImage** - Media components
   - Builder: Image loading, blur hash
   - UI: Headless image
   - Registry: Styled with loading states

## Component Template

### Builder Template
```typescript
// src/lib/builders/{domain}/{feature}/types.ts
export interface Create{Feature}Options {
  ndk: NDKSvelte;
  // ... other options
}

export interface {Feature}State {
  // Reactive state
  // Actions
  cleanup: () => void;
}

// src/lib/builders/{domain}/{feature}/index.ts
export function create{Feature}(options: Create{Feature}Options): {Feature}State {
  // Implementation
  return {
    // State getters
    cleanup
  };
}
```

### UI Component Template
```svelte
<!-- src/lib/ui/{Domain}/{Feature}.svelte -->
<script lang="ts">
  import { create{Feature} } from '$lib/builders/{domain}/{feature}';
  import { onDestroy } from 'svelte';

  interface Props {
    // Props needed for builder
    class?: string;
  }

  let { ...props, class: className = '' }: Props = $props();

  const state = create{Feature}(props);

  onDestroy(() => state.cleanup());
</script>

<!-- Minimal/no styling, just structure -->
<div class={className}>
  <!-- Render using state -->
</div>
```

### Registry Component Template
```svelte
<!-- registry/ndk/{feature}/{feature}.svelte -->
<script lang="ts">
  import { {Feature} } from '@nostr-dev-kit/svelte';
  import { cn } from '$lib/utils';

  // Props with variants
  interface Props {
    variant?: 'default' | 'compact' | 'minimal';
    class?: string;
  }

  let { variant = 'default', class: className = '' }: Props = $props();
</script>

<{Feature}
  class={cn('ndk-{feature}', `ndk-{feature}--${variant}`, className)}
  {...$$props}
/>

<style>
  /* Styled with CSS variables */
  .ndk-{feature} {
    /* Beautiful defaults */
  }
</style>
```

## Success Criteria

For each component migration:
- ✅ Builder exists in `builders/{domain}/{feature}/`
- ✅ UI component exists in `ui/{Domain}/{Feature}.svelte`
- ✅ Registry component exists in `registry/ndk/{feature}/`
- ✅ Registry entry in `registry/registry.json`
- ✅ Exports in `src/lib/index.ts`
- ✅ Old component deleted from `components/`
- ✅ Documentation updated
- ✅ Storybook story exists
- ✅ Tests pass

## Next Steps

1. **Immediate cleanup** - Delete old Avatar, Name, and duplicate components
2. **EventContent migration** - Highest impact, used everywhere
3. **Event preview migration** - Clean up embedded-event mess
4. **Relay components** - Complete the relay management story
5. **Final cleanup** - Delete components/ directory entirely

After all migrations:
```
src/lib/
├── builders/     # ALL logic
├── ui/           # ALL headless components
└── components/   # DELETE THIS DIRECTORY
```

Registry will be the only place with styled components.
