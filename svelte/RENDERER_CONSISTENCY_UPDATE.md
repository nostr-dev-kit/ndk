# ContentRenderer Consistency Update

## Summary

Made ContentRenderer propagation consistent across all components using the **prop-or-context pattern**.

## Problem Identified

Components were inconsistent in how they handled the `renderer` prop:

1. **EventContent**: ✅ `prop ?? context ?? default` (correct)
2. **EmbeddedEvent**: ❌ `prop with default` (didn't check context)
3. **EventCard.Content**: ⚠️ Passed renderer explicitly as prop (unnecessary)

This created a bug where:
- EventContent had to explicitly pass `{renderer}` to EmbeddedEvent
- Nested components couldn't inherit renderer from context
- Props were being drilled unnecessarily

## Solution Implemented

### Pattern: `prop ?? context ?? default`

All components now follow the same pattern:

```typescript
// 1. Get context
const rendererContext = getContext<ContentRendererContext | undefined>(CONTENT_RENDERER_CONTEXT_KEY);

// 2. Resolve renderer: prop overrides context, context overrides default
const renderer = $derived(rendererProp ?? rendererContext?.renderer ?? defaultContentRenderer);

// 3. Set in context for children
setContext(CONTENT_RENDERER_CONTEXT_KEY, { renderer });
```

### Changes Made

#### 1. Fixed EmbeddedEvent (`ui/embedded-event.svelte`)
**Before:**
```typescript
let { renderer = defaultContentRenderer } = $props();
setContext(CONTENT_RENDERER_CONTEXT_KEY, { renderer });
```

**After:**
```typescript
let { renderer: rendererProp } = $props();
const rendererContext = getContext<ContentRendererContext | undefined>(CONTENT_RENDERER_CONTEXT_KEY);
const renderer = $derived(rendererProp ?? rendererContext?.renderer ?? defaultContentRenderer);
setContext(CONTENT_RENDERER_CONTEXT_KEY, { renderer });
```

#### 2. Added setContext to EventContent (`ui/event-content.svelte`)
**Before:**
```typescript
const renderer = $derived(rendererProp ?? rendererContext?.renderer ?? defaultContentRenderer);
// Did not set context for children
```

**After:**
```typescript
const renderer = $derived(rendererProp ?? rendererContext?.renderer ?? defaultContentRenderer);
setContext(CONTENT_RENDERER_CONTEXT_KEY, { renderer }); // Now sets context
```

#### 3. Removed Prop Drilling
**EventContent → EmbeddedEvent**
```diff
- <EmbeddedEvent {ndk} bech32={segment.data} {renderer} />
+ <EmbeddedEvent {ndk} bech32={segment.data} />
```

**EventCard.Content → EventContent**
```diff
- <EventContent ndk={context.ndk} event={context.event} renderer={rendererContext?.renderer} />
+ <EventContent ndk={context.ndk} event={context.event} />
```

#### 4. Updated NotificationContent
Added context setting since it creates a custom renderer:

```typescript
const activeRenderer = $derived(renderer || defaultRenderer);
setContext(CONTENT_RENDERER_CONTEXT_KEY, { renderer: activeRenderer });
```

Now passes renderer via context instead of prop:
```diff
- <EmbeddedEvent {ndk} bech32="..." renderer={activeRenderer} />
+ <EmbeddedEvent {ndk} bech32="..." />
```

## Usage Patterns

### 1. Context-Based (Recommended for App-Wide)

Set renderer once at app/page level:

```svelte
<script>
  import { setContext } from 'svelte';
  import { CONTENT_RENDERER_CONTEXT_KEY } from '$lib/registry/ui/content-renderer.context';

  const myRenderer = new ContentRenderer();
  myRenderer.mentionComponent = MyMention;

  setContext(CONTENT_RENDERER_CONTEXT_KEY, { renderer: myRenderer });
</script>

<!-- All nested components inherit automatically -->
<EventContent {ndk} {event} />
<EmbeddedEvent {ndk} bech32="..." />
```

### 2. Prop-Based (Override for Specific Use)

Pass renderer as prop to override:

```svelte
<!-- Override for this specific component -->
<EventContent {ndk} {event} renderer={specialRenderer} />

<!-- Great for testing -->
test('custom rendering', () => {
  render(EventContent, {
    props: { ndk, event, renderer: mockRenderer }
  });
});
```

### 3. Resolution Order

Components resolve renderer in this priority:
1. **Prop** - Explicit override
2. **Context** - Inherited from parent
3. **Default** - `defaultContentRenderer`

When a component receives a prop, it automatically sets that in context for its children.

## Benefits

### ✅ Consistency
- All components use the same pattern
- Predictable behavior everywhere

### ✅ No Prop Drilling
- Don't need to pass renderer between components
- Context handles propagation automatically

### ✅ Flexibility
- Props allow explicit overrides (testing, one-offs)
- Context provides implicit inheritance (app-wide)

### ✅ Proper Inheritance
- Nested embeds automatically use parent's renderer
- No more bugs from missing context checks

### ✅ Clean APIs
- Components don't clutter templates with prop passing
- Renderer flows naturally through component tree

## Documentation Updated

1. **EventContent page** (`/ui/event-content`)
   - Added "Renderer Propagation" section
   - Updated API table to show "from context or default"
   - Explains both usage patterns with code examples

2. **EmbeddedEvent page** (`/ui/embedded-event`)
   - Updated API table to show "from context or default"

## Testing

- ✅ Build passes without errors
- ✅ svelte-check shows no type errors related to changes
- ✅ Pattern tested across EventContent, EmbeddedEvent, NotificationContent

## Files Changed

1. `registry/src/lib/registry/ui/embedded-event.svelte`
2. `registry/src/lib/registry/ui/event-content.svelte`
3. `registry/src/lib/registry/components/event-card/event-card-content.svelte`
4. `registry/src/lib/registry/ui/notification/notification-content.svelte`
5. `registry/src/routes/ui/event-content/+page.svelte` (docs)
6. `registry/src/routes/ui/embedded-event/+page.svelte` (docs)

## Why This Pattern?

Considered **context-only** but chose **prop-or-context** because:

### For a Component Library:
- ✅ Easier testing (can pass props directly)
- ✅ Explicit overrides possible (one-off customizations)
- ✅ More flexible for library consumers
- ✅ Svelte-idiomatic (props override context)

### Context-Only Would Be:
- ❌ Harder to test (need wrapper components)
- ❌ Can't do quick overrides
- ❌ Less flexible for library use cases

For an app (not a library), context-only might be simpler. But for a reusable component library, flexibility matters.

## Migration Guide (for Users)

### If You Were Passing Renderer Props:

**Before:**
```svelte
<EventContent {ndk} {event} {renderer} />
  <EmbeddedEvent {ndk} bech32="..." {renderer} />
```

**After (still works, but not needed):**
```svelte
<EventContent {ndk} {event} {renderer} />
  <!-- EmbeddedEvent automatically inherits from context -->
  <EmbeddedEvent {ndk} bech32="..." />
```

**After (recommended):**
```svelte
<script>
  setContext(CONTENT_RENDERER_CONTEXT_KEY, { renderer });
</script>

<!-- All nested components inherit -->
<EventContent {ndk} {event} />
  <EmbeddedEvent {ndk} bech32="..." />
```

### No Breaking Changes

The prop still works! This is backward compatible. But you can now simplify your code by using context instead of prop drilling.
