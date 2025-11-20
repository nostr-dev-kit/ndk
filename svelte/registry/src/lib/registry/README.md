# NDK Svelte Registry

A comprehensive component library for building Nostr applications with Svelte 5.

## Architecture

The registry is organized into three distinct layers, each serving a specific purpose in the component hierarchy:

### 📦 UI Primitives (`./ui/`)

**Headless, compositional building blocks with no opinions on styling.**

UI primitives are the lowest-level components that provide functionality without prescribing any visual design. They use the **composition pattern** where you compose smaller primitives together to build your interface.

**Characteristics:**
- Zero styling (or minimal base styles)
- Export as namespaced objects (e.g., `User.Root`, `Article.Title`)
- Context-based composition using Svelte snippets
- Maximum flexibility and control
- Building blocks for custom designs

**Example Structure:**
```typescript
// ui/user/index.ts
export const User = {
  Root,      // Sets up context
  Avatar,    // Displays avatar
  Name,      // Displays name
  Bio,       // Displays bio
  Field      // Displays custom field
};
```

**Usage:**
```svelte
<script>
  import { User } from '$lib/registry/ui';
</script>

<User.Root {ndk} {user}>
  <div class="my-custom-card">
    <User.Avatar class="size-12" />
    <div>
      <User.Name class="font-bold" />
      <User.Handle class="text-sm text-gray-500" />
    </div>
  </div>
</User.Root>
```

**When to use UI primitives:**
- You need complete control over styling
- Building a custom design system
- Creating reusable patterns specific to your app
- Maximizing flexibility over convenience

**Available primitives:**
- `User` - User profile display primitives
- `Article` - Article content primitives
- `Highlight` - Text highlight primitives
- `Event` - Event display utilities
- `Relay` - Relay information primitives
- `UserInput` - User search/input primitives
- `MediaUpload` - Media upload primitives
- `NegentropySync` - Sync status primitives
- `FollowPack` - Follow pack display primitives

---

### 🎨 Components (`./components/`)

**Pre-styled, opinionated compositions ready to use.**

Components are complete, styled implementations built on top of UI primitives. They provide sensible defaults and work out-of-the-box while still allowing customization through props.

**Characteristics:**
- Opinionated styling (using Tailwind CSS)
- Export as named components (e.g., `UserCardPortrait`, `ArticleCardHero`)
- Props-based customization
- Ready to drop into your app
- Multiple style variants available

**Example Structure:**
```typescript
// components/user-card/index.ts
export { default as UserCardPortrait } from './user-card-portrait.svelte';
export { default as UserCardLandscape } from './user-card-landscape.svelte';
export { default as UserCardCompact } from './user-card-compact.svelte';
export { default as UserCardNeon } from './user-card-neon.svelte';
```

**Usage:**
```svelte
<script>
  import { UserCardPortrait } from '$lib/registry/components';
</script>

<UserCardPortrait
  {ndk}
  {user}
  class="hover:shadow-lg transition-shadow"
/>
```

**When to use components:**
- You want a quick, styled solution
- Prototyping or MVPs
- Standard layouts that don't need heavy customization
- You like the pre-built design

**Available components:**
- **User Cards** - `UserCardPortrait`, `UserCardLandscape`, `UserCardCompact`, `UserCardNeon`, `UserCardGlass`, `UserCardClassic`
- **Article Cards** - `ArticleCardHero`, `ArticleCardMedium`, `ArticleCardPortrait`, `ArticleCardNeon`
- **Highlight Cards** - `HighlightCardCompact`, `HighlightCardElegant`, `HighlightCardFeed`, `HighlightCardGrid`, `HighlightCardInline`
- **Event Cards** - `EventCard` namespace with `Root`, `Header`, `Content`, `Actions`
- **Image Cards** - `ImageCardBase`, `ImageCardHero`, `ImageCardInstagram`
- **Follow Packs** - `FollowPackHero`, `FollowPackCompact`, `FollowPackPortrait`, `FollowPackModernPortrait`
- **Relay Cards** - `RelayCard`, `RelayCardCompact`, `RelayCardPortrait`, `RelayCardList`
- **Actions** - `FollowButton`, `FollowButtonPill`, `FollowButtonAnimated`, `MuteButton`, `RepostButton`, `UploadButton`
- **Reactions** - `Reaction`, `ReactionButton`, `ReactionEmojiButton`, `ReactionSlack`
- **Zap** - `ZapButton`, `ZapSend.Root`, `ZapSend.Splits`
- **Composers** - `NoteComposer` namespace with `Root`, `Textarea`, `Submit`, `Media`
- **Selectors** - `UserSearchCombobox`
- **Embedded Events** - `NoteEmbedded`, `ArticleEmbedded`, `HighlightEmbedded`
- **Content Display** - `ArticleContent`, `ImageContent`, `Hashtag`, `Mention`
- **Negentropy Sync** - `NegentropySyncProgressCompact`, `NegentropySyncProgressAnimated`, `NegentropySyncProgressDetailed`

---

### 🏗️ Blocks (`./blocks/`)

**Complete, production-ready patterns and layouts.**

Blocks are fully-featured, complex compositions that combine multiple components and primitives into complete UI patterns. They represent entire sections or features of an application.

**Characteristics:**
- Complex, multi-component layouts
- Complete feature implementations
- Production-ready patterns
- Highly opinionated
- Minimal configuration needed

**Example:**
```svelte
<script>
  import { ThreadViewTwitter } from '$lib/registry/blocks';
</script>

<ThreadViewTwitter {ndk} {rootEvent} />
```

**When to use blocks:**
- You need a complete, production-ready feature
- You want consistent UX patterns
- Building quickly with proven solutions
- Don't want to wire up multiple components

**Available blocks:**
- `ThreadViewTwitter` - Twitter-style threaded conversation view
- `LoginCompact` - Compact login/authentication flow

---

## Comparison Matrix

| Feature | UI Primitives | Components | Blocks |
|---------|--------------|------------|--------|
| **Styling** | None/minimal | Opinionated | Opinionated |
| **Flexibility** | Maximum | High | Limited |
| **Setup time** | Longer | Quick | Instant |
| **Customization** | Full control | Props + classes | Minimal |
| **Complexity** | Simple building blocks | Single-purpose | Multi-component |
| **Use case** | Custom designs | Standard layouts | Complete features |
| **Export style** | Namespace | Named exports | Named exports |
| **Example** | `User.Avatar` | `UserCardPortrait` | `ThreadViewTwitter` |

---

## Choosing the Right Layer

### Use **UI Primitives** when:
- ✅ You have a specific design system
- ✅ You need pixel-perfect control
- ✅ Building reusable abstractions
- ✅ Maximum flexibility is required

### Use **Components** when:
- ✅ You want pre-styled solutions
- ✅ Prototyping or building MVPs
- ✅ You like the default design
- ✅ Standard patterns are sufficient

### Use **Blocks** when:
- ✅ You need complete features fast
- ✅ Proven UX patterns are acceptable
- ✅ Production-ready code is needed
- ✅ Minimal customization is fine

---

## File Organization Conventions

### Context Files
All context files follow the naming convention: `{component-name}.context.ts`

Examples:
- `user.context.ts`
- `article.context.ts`
- `event-card.context.ts`
- `relay-selector.context.ts`

### Index Files
- **UI Primitives**: Export namespaced objects
- **Components**: Export individual components
- **Blocks**: Export individual blocks

---

## Progressive Enhancement Pattern

The registry follows a **progressive enhancement** philosophy:

1. **Start with primitives** for core functionality
2. **Build components** as styled implementations
3. **Compose blocks** from components for complete features

This allows users to:
- Choose their level of abstraction
- Mix and match layers as needed
- Build custom solutions on solid primitives
- Use pre-built components when convenient

---

## Content Rendering System

The registry includes a unified content rendering system (`ui/content-renderer.svelte.ts`) that handles:
- Mentions (npub/nprofile rendering)
- Hashtags
- Links
- Media (images, videos)
- Embedded events (articles, highlights, notes)

### Priority-Based Registration

The ContentRenderer uses a priority system for progressive enhancement:

```typescript
// Basic components (priority 1)
renderer.setMentionComponent(BasicMention, 1);
renderer.addKind([1, 1111], BasicNoteCard, 1);

// Enhanced components (priority 10) override basic ones
renderer.setMentionComponent(ModernMention, 10);
renderer.addKind([1, 1111], FullNoteCard, 10);
```

**Priority Scale:**
- **Priority 1:** Basic/inline components (minimal features)
- **Priority 5:** Compact components (moderate features)
- **Priority 10:** Full/enhanced components (rich features)

Components with higher priorities automatically override lower priority ones, enabling clean progressive enhancement patterns.

All components use this system for consistent content rendering across the registry.

---

## Examples

### Example 1: Custom User Card (Using Primitives)
```svelte
<script>
  import { User } from '$lib/registry/ui';
  import { cn } from '$lib/registry/utils';
</script>

<User.Root {ndk} {user}>
  <div class={cn(
    "flex items-center gap-4 p-6",
    "bg-gradient-to-r from-purple-500 to-pink-500",
    "rounded-2xl shadow-xl"
  )}>
    <User.Avatar class="size-20 border-4 border-white shadow-lg" />
    <div class="flex-1">
      <User.Name class="text-2xl font-bold text-white" />
      <User.Handle class="text-purple-100" />
      <User.Bio class="mt-2 text-sm text-purple-50 line-clamp-2" />
    </div>
  </div>
</User.Root>
```

### Example 2: Quick User Card (Using Component)
```svelte
<script>
  import { UserCardNeon } from '$lib/registry/components';
</script>

<UserCardNeon {ndk} {user} />
```

### Example 3: Complete Thread View (Using Block)
```svelte
<script>
  import { ThreadViewTwitter } from '$lib/registry/blocks';
</script>

<ThreadViewTwitter {ndk} {rootEvent} />
```

---

## Contributing

When adding new components to the registry:

1. **Determine the layer**: Is it a primitive, component, or block?
2. **Follow naming conventions**: Use appropriate naming patterns
3. **Use context properly**: Create `{name}.context.ts` files for shared state
4. **Document your component**: Add TSDoc comments and usage examples
5. **Export correctly**: Use namespace for primitives, named exports for components/blocks

---

## License

This registry is part of the NDK project and follows the same license.
