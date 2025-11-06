# Data Attributes & ID Generation - Implementation Guide

## Progress Summary

### ✅ Completed (28 files)

**Core Utilities (3):**
- `src/lib/registry/utils/attrs.ts` - Data attribute generation
- `src/lib/registry/utils/use-id.ts` - ID generation
- `src/lib/registry/utils/state-attrs.ts` - State attribute helpers

**UI Primitives Completed (25):**
1. **Article** (5 files) - Root, Title, Image, Summary, ReadingTime
2. **User** (8 files) - Root, Avatar, Name, Handle, Bio, Banner, Nip05, Field
3. **Portal** (1 file)
4. **Reaction** (1 file) - Display
5. **Event** (2 files) - ReplyIndicator, Time
6. **Highlight** (3 files) - Root, Content, Source
7. **Notification** (5 files) - Root, Actors, Action, Content, Timestamp

### 🔄 Remaining Work

**UI Primitives Remaining (6):**
- Follow-Pack
- Media-Upload (5 parts)
- Negentropy-Sync (4 parts)
- Relay
- Relay-Selector
- User-Input
- Voice-Message
- Zap

**Styled Components (80):** All components in `src/lib/registry/components/`

---

## Implementation Pattern

### For Multi-Part Primitives with Context

#### Step 1: Update Context Interface

Add `id` property to context:

```typescript
// example.context.ts
export interface ExampleContext {
    // existing properties...
    id: string;  // ADD THIS
}
```

#### Step 2: Update Root Component

```svelte
<!-- example-root.svelte -->
<script lang="ts">
  import { useId } from '../../utils/use-id.js';

  interface Props {
    // existing props...
    id?: string;  // ADD THIS
  }

  let {
    // existing destructuring...
    id: providedId,  // ADD THIS
  }: Props = $props();

  const id = providedId ?? useId('example');  // ADD THIS

  const context = {
    // existing getters...
    get id() { return id; }  // ADD THIS
  };
</script>

<div
  {id}
  data-example-root=""
  class={className}
>
  {@render children()}
</div>
```

#### Step 3: Update Child Components

```svelte
<!-- example-part.svelte -->
<div
  data-example-part=""
  class={className}
>
  <!-- content -->
</div>
```

### For Simple Components (No Context)

Just add the data attribute:

```svelte
<div
  data-component-name=""
  class={className}
>
  <!-- content -->
</div>
```

### For Styled Components

Add data attributes with component-specific naming:

```svelte
<div
  data-user-card-classic=""
  class={className}
>
  <div data-user-card-avatar="">
    <!-- avatar -->
  </div>
  <div data-user-card-name="">
    <!-- name -->
  </div>
</div>
```

---

## State Attributes

Import and use state helpers when applicable:

```svelte
<script>
  import { getDataOpenClosed, getDataLoading, getDataDisabled } from '../../utils/state-attrs.js';
</script>

<div
  data-component=""
  data-state={getDataOpenClosed(isOpen)}
  data-loading={getDataLoading(isLoading)}
  data-disabled={getDataDisabled(isDisabled)}
>
```

### Available State Helpers

```typescript
// Binary states (returns "" or undefined)
getDataDisabled(condition)
getDataLoading(condition)
getDataSelected(condition)
getDataPlaying(condition)
getDataUploading(condition)
getDataExpanded(condition)
getDataHidden(condition)
getDataVisible(condition)

// Named states (returns string value)
getDataOpenClosed(condition) // "open" | "closed"
getDataActiveInactive(condition) // "active" | "inactive"
getDataChecked(condition) // "checked" | "unchecked"
getDataState(state) // any string
getDataProgress(value) // "75%"
getDataCount(count) // "5"
getDataOrientation(orientation) // "horizontal" | "vertical"
getDataDir(direction) // "ltr" | "rtl"
```

---

## Naming Convention

Follow this strict pattern:

### UI Primitives
- Root: `data-{component}-root` (e.g., `data-article-root`)
- Parts: `data-{component}-{part}` (e.g., `data-article-title`)

### Styled Components
- Component: `data-{component}-{variant}` (e.g., `data-user-card-classic`)
- Parts: `data-{component}-{part}` (e.g., `data-user-card-avatar`)

### State Attributes
- State: `data-state="value"` (e.g., `data-state="open"`)
- Boolean flags: `data-{flag}=""` (e.g., `data-loading=""`)
- Counts/Progress: `data-{type}="value"` (e.g., `data-count="5"`)

---

## Quick Reference: Remaining Primitives

### Follow-Pack
```
src/lib/registry/ui/follow-pack/
├── follow-pack.context.ts  ← Add id
├── follow-pack-root.svelte ← Add id generation + data-follow-pack-root
└── ...other parts           ← Add data-follow-pack-{part}
```

### Media-Upload (5 parts)
```
src/lib/registry/ui/media-upload/
├── context or builder       ← Add id if has context
├── media-upload-root.svelte ← data-media-upload-root + id
├── media-upload-button.svelte ← data-media-upload-button
├── media-upload-preview.svelte ← data-media-upload-preview + data-uploading
├── media-upload-carousel.svelte ← data-media-upload-carousel
└── media-upload-item.svelte ← data-media-upload-item + data-progress
```

### Negentropy-Sync (4 parts)
```
src/lib/registry/ui/negentropy-sync/
├── negentropy-sync.context.ts ← Add id
├── negentropy-sync-root.svelte ← data-negentropy-sync-root + id
├── negentropy-sync-progress-bar.svelte ← data-negentropy-sync-progress-bar + data-progress
├── negentropy-sync-relay-status.svelte ← data-negentropy-sync-relay-status + data-state
└── negentropy-sync-stats.svelte ← data-negentropy-sync-stats
```

### Relay
```
src/lib/registry/ui/relay/
├── relay.context.ts  ← Add id
├── relay-root.svelte ← data-relay-root + id
└── ...other parts    ← data-relay-{part}
```

### Relay-Selector
Already has some data attributes! Just add:
```
├── relay-selector.context.ts ← Add id
├── relay-selector-root.svelte ← data-relay-selector-root + id
└── ...update existing data attributes to match pattern
```

### User-Input
Already has `data-loading`! Just add:
```
├── user-input.context.ts ← Add id
├── user-input-root.svelte ← data-user-input-root + id
└── ...other parts ← data-user-input-{part}
```

### Voice-Message
Already has `data-playing` and `data-progress`! Just add:
```
├── voice-message.context.ts ← Add id
├── voice-message-root.svelte ← data-voice-message-root + id
└── ...keep existing + add data-voice-message-{part}
```

### Zap
```
src/lib/registry/ui/zap/
├── zap.context.ts  ← Add id if has context
├── zap-root.svelte ← data-zap-root + id
└── ...other parts  ← data-zap-{part}
```

---

## Styled Components Pattern

For the 80 styled components, apply the same pattern:

```svelte
<!-- user-card-classic.svelte -->
<script lang="ts">
  // existing imports
</script>

<div
  data-user-card-classic=""  ← Component identifier
  class={className}
>
  <div data-user-card-avatar="">  ← Part identifier
    <!-- avatar content -->
  </div>
  <div data-user-card-name="">
    <!-- name content -->
  </div>
  <div data-user-card-bio="">
    <!-- bio content -->
  </div>
</div>
```

### When to Add IDs

Only add ID generation to styled components that:
1. Have multiple interactive parts that need ARIA relationships
2. Are used in lists where unique IDs are beneficial

Most styled components DON'T need IDs - they just need data attributes.

---

## Testing Your Implementation

After adding attributes, verify:

1. **Inspect DOM:** Check that attributes appear correctly
2. **CSS Selectors:** Test targeting `[data-component-part]`
3. **State Changes:** Verify state attributes update reactively
4. **IDs:** Ensure IDs are unique per instance

Example CSS test:
```css
[data-article-root] {
  /* styles */
}

[data-article-title] {
  /* styles */
}

[data-state="open"] {
  /* open state styles */
}

[data-loading] {
  /* loading styles */
}
```

---

## Benefits

Once complete, you'll have:

✅ **Styling Hooks:** Target any component part with CSS
✅ **State Indication:** Visual feedback for all states
✅ **Debug-Friendly:** Self-documenting DOM structure
✅ **Accessibility:** Automatic ARIA relationships via IDs
✅ **Query-Friendly:** Easy DOM queries for testing/automation
✅ **Consistent:** Same pattern across all 95+ components

---

## Next Steps

1. Complete remaining 6 UI primitives using the patterns above
2. Apply data attributes to all 80 styled components
3. Optional: Add type utilities in `types.ts` for enhanced type safety
4. Test a few components to ensure attributes work correctly
5. Update CSS/styling to leverage the new data attributes

Good luck! The pattern is now well-established and you can apply it systematically to the remaining components.
