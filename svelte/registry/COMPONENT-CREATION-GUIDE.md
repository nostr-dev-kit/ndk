# Complete Guide to Creating Components in the NDK Svelte Registry

> **For LLMs and Developers**: This guide covers everything needed to create or update components in this registry, including all architectural decisions, mandatory patterns, and common pitfalls.

## Table of Contents
1. [Registry Structure & Layers](#1-registry-structure--layers)
2. [Creating a New Component](#2-creating-a-new-component)
3. [Registry Auto-Generation System](#3-registry-auto-generation-system)
4. [Navigation/Sidebar Configuration (MANUAL)](#4-navigationsidebar-configuration-manual)
5. [Documentation Page (ComponentPageTemplate - MANDATORY)](#5-documentation-page-componentpagetemplate---mandatory)
6. [Recipe Section (Optional - Component Compositions)](#6-recipe-section-optional---component-compositions)
7. [Example Files Format (Dual-File MANDATORY)](#7-example-files-format-dual-file-mandatory)
8. [Styling Guidelines (Tailwind Only)](#8-styling-guidelines-tailwind-only)
9. [Complete Workflow Checklist](#9-complete-workflow-checklist)
10. [Common Pitfalls & How to Avoid Them](#10-common-pitfalls--how-to-avoid-them)

---

## 1. Registry Structure & Layers

The registry has **three distinct layers** - understanding these is critical for proper component placement.

### Layer 1: UI Primitives (`src/lib/registry/ui/`)

**Purpose**: Headless, composable UI building blocks using the compound component pattern.

**When to create here**:
- Building reusable, presentation-focused components
- No business logic
- Meant to be composed together
- Using context for data sharing

**Structure**:
```
src/lib/registry/ui/follow-pack/
├── follow-pack-root.svelte           # Container with context
├── follow-pack-image.svelte          # Subcomponent
├── follow-pack-title.svelte          # Subcomponent
├── follow-pack-description.svelte    # Subcomponent
├── follow-pack.context.ts            # Context definition
└── index.ts                          # Compound export
```

**Export Pattern**:
```typescript
// index.ts
import Root from './follow-pack-root.svelte';
import Image from './follow-pack-image.svelte';
import Title from './follow-pack-title.svelte';
import Description from './follow-pack-description.svelte';

export const FollowPack = {
  Root,
  Image,
  Title,
  Description
};

export { FOLLOW_PACK_CONTEXT_KEY } from './follow-pack.context.js';
export type { FollowPackContext } from './follow-pack.context.js';
```

### Layer 2: Builders (`src/lib/registry/builders/`)

**Purpose**: Reactive state management and business logic (no UI).

**When to create here**:
- Reusable stateful logic
- Actions (follow/unfollow, like/unlike, etc.)
- No visual components

**Files**: `.svelte.ts` files (Svelte 5 runes-based)

**Examples**:
- `follow-action/index.svelte.ts`
- `reaction-action/index.svelte.ts`
- `zap-action/index.svelte.ts`

### Layer 3: Components (`src/lib/registry/components/`)

**Purpose**: Complete, ready-to-use components that combine UI primitives with business logic.

**This is where most components go.**

**Directory Structure**:
```
src/lib/registry/components/
└── {component-name-variant}/   # e.g., "mention-modern", "relay-card-compact", "zap-button-pill"
    ├── {component-name-variant}.svelte
    ├── index.ts
    └── metadata.json
```

**Example**:
```
components/mention-modern/
├── mention-modern.svelte
├── index.ts
└── metadata.json
```

**Naming Convention**: Use kebab-case with descriptive names that include the variant when applicable:
- `mention-modern` (component type + variant)
- `relay-card-compact` (entity + component type + variant)
- `zap-button-pill` (action + component type + variant)
- `event-card-classic` (entity + component type + variant)

---

## 2. Creating a New Component

### Step 1: Determine the Right Location

**Decision Tree**:
1. **Is this a headless/composable UI primitive?** → `src/lib/registry/ui/{name}/`
2. **Is this pure state/business logic with no UI?** → `src/lib/registry/builders/{name}.svelte.ts`
3. **Is this a complete, ready-to-use component?** → `src/lib/registry/components/{component-name-variant}/`

**Naming Conventions for Components**:
Use descriptive kebab-case names that combine the component purpose and variant:
- **Pattern**: `{entity/action}-{type}-{variant}` or `{type}-{variant}`
- **Examples**:
  - `mention-modern` (entity + variant)
  - `relay-card-compact` (entity + type + variant)
  - `zap-button-pill` (action + type + variant)
  - `event-card-classic` (entity + type + variant)
  - `follow-button-pill` (action + type + variant)

### Step 2: Create Component Files

#### File 1: `{component-name}.svelte`

```svelte
<script lang="ts">
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import type { NDKRelay } from '@nostr-dev-kit/ndk';
  import { RelayInput } from '$lib/registry/ui/relay-input';

  interface Props {
    ndk: NDKSvelte;
    relay: NDKRelay;
    class?: string;
  }

  let { ndk, relay, class: className = '' }: Props = $props();

  // Derived state
  let relayUrl = $derived(relay.url);
</script>

<RelayInput.Root {ndk} {relay} class="flex items-center gap-2 {className}" data-relay-input="">
  <RelayInput.Icon class="w-5 h-5 text-muted-foreground" />
  <RelayInput.Url class="flex-1 font-mono text-sm" />
</RelayInput.Root>
```

**Key Patterns**:
- ✅ Use TypeScript with explicit `Props` interface
- ✅ Use `$props()` destructuring with types
- ✅ Use `$derived()` for reactive computed values
- ✅ Use Tailwind classes (NO `<style>` blocks)
- ✅ Use data attributes for component identification: `data-component-name=""`

#### File 2: `index.ts`

```typescript
export { default as RelayInputBasic } from './relay-input-basic.svelte';
```

#### File 3: `metadata.json`

```json
{
  "name": "relay-input-basic",
  "title": "Relay Input Basic",
  "category": "relay",
  "oneLiner": "A basic input field for relay URLs with validation and autocomplete",
  "description": "A basic input field for relay URLs with validation and autocomplete",
  "documentation": "# Relay Input\n\n## Overview\n\nThe Relay Input component provides a user-friendly way to input and validate Nostr relay URLs. It includes autocomplete functionality and real-time validation.\n\n## Features\n\n- URL validation for wss:// and ws:// protocols\n- Autocomplete from known relay lists\n- Visual feedback for valid/invalid URLs\n- Keyboard navigation support\n\n## Usage\n\nBest used in settings pages, relay configuration forms, or anywhere users need to add or manage relay connections.\n\n## Best Practices\n\n1. Always validate relay connectivity after input\n2. Provide visual feedback during connection testing\n3. Consider showing relay metadata (name, description) when available",
  "command": "npx jsrepo add components/relay-input-basic",
  "dependencies": [
    "@nostr-dev-kit/svelte",
    "@nostr-dev-kit/ndk"
  ],
  "useCases": [
    "relay",
    "inputs",
    "basic",
    "nostr",
    "configuration"
  ]
}
```

**metadata.json Fields**:
- `name` (required): kebab-case identifier matching the directory name (e.g., "relay-input-basic")
- `title` (required): Display name (e.g., "Relay Input Basic")
- `category` (required): Top-level category for grouping (e.g., "relay", "user", "event", "zap")
- `oneLiner` (optional): Short one-line description shown under the title
- `description` (required): Short description
- `documentation` (optional): Detailed markdown documentation explaining component behavior, use cases, features, and best practices
- `command` (required): Installation command for jsrepo (format: `npx jsrepo add {component-name}`)
- `dependencies` (required): NPM dependencies array
- `useCases` (required): Keywords for search/discovery
- `apiDoc` (optional): Component API documentation object with props, events, and slots

---

## 2.5. Builder Metadata (`metadata.json` for Builders)

Builders (like `createFollowAction()`, `createReactionAction()`) have `metadata.json` files in their directories at `src/lib/registry/builders/{builder-name}/`.

### Builder Metadata Location

```
src/lib/registry/builders/
├── follow-action/
│   ├── index.svelte.ts         # Builder source code
│   └── metadata.json           # Builder metadata
├── reaction-action/
│   ├── index.svelte.ts
│   └── metadata.json
└── ...
```

### Builder Metadata Schema

```json
{
  "name": "createFollowAction",
  "title": "Follow Action Builder",
  "oneLiner": "Reactive state manager for following/unfollowing Nostr users and hashtags",
  "description": "Detailed markdown documentation about the builder's features, behavior, and use cases",
  "importPath": "import { createFollowAction } from '$lib/registry/builders/follow-action';",
  "command": "npx jsrepo add builders/follow-action",
  "dependencies": [
    "@nostr-dev-kit/svelte",
    "@nostr-dev-kit/ndk"
  ],
  "nips": ["02", "51"],
  "parameters": [
    {
      "name": "target",
      "type": "NDKUser | string",
      "description": "User or hashtag to follow/unfollow",
      "required": true
    }
  ],
  "returns": [
    {
      "name": "isFollowing",
      "type": "boolean",
      "description": "Whether currently following the target"
    },
    {
      "name": "follow",
      "type": "() => Promise<void>",
      "description": "Toggle follow/unfollow state"
    }
  ],
  "usageExample": "const followAction = createFollowAction(() => ({ target: user }), ndk);\n\n// Access reactive state\nfollowAction.isFollowing\n\n// Toggle follow/unfollow\nawait followAction.follow();"
}
```

### Builder Metadata Fields

- `name` (required): Function name (e.g., "createFollowAction")
- `title` (required): Display title (e.g., "Follow Action Builder")
- `oneLiner` (optional): Short one-line description shown under the title
- `description` (optional): Detailed markdown documentation about features and behavior
- `importPath` (required): Import statement
- `command` (required): jsrepo installation command
- `dependencies` (optional): NPM dependencies
- `nips` (optional): Related NIP numbers
- `parameters` (required): Array of configuration object properties (what goes inside the `() => ({ ... })` function)
- `returns` (required): Array of return property objects with name, type, and description
- `usageExample` (optional): Code example showing typical usage

### Using Builder Metadata in Pages

Import builder metadata and pass to `ComponentPageTemplate`:

```svelte
<script lang="ts">
  import ComponentPageTemplate from '$lib/site/templates/ComponentPageTemplate.svelte';
  import followActionBuilder from '$lib/registry/builders/follow-action/metadata.json';

  // ... other imports and setup
</script>

<ComponentPageTemplate
  {metadata}
  {ndk}
  {overview}
  {componentsSection}
  buildersSection={{
    builders: [followActionBuilder]
  }}
/>
```

### BuilderCard Rendering

The `ComponentPageTemplate` automatically renders builders using the `BuilderCard` component, which provides:

- **Header**: Title with one-liner description underneath
- **About Tab**: Usage code snippet and detailed markdown description
- **Usage Tab**: Installation, import, dependencies, NIPs, parameters table, returns table, and example
- No preview area (builders have no UI)
- No attribution (unlike ComponentCard)
- Syntax-highlighted code examples

---

## 3. Registry Auto-Generation System

### Three Scripts Work Together

#### Script 1: `create-all-registry-json.js` (RECOMMENDED)

**Location**: `/scripts/create-all-registry-json.js`

**Purpose**: Auto-generates `metadata.json` files for ALL components by scanning directory structure.

**How it works**:
1. Recursively scans `src/lib/registry/components/`
2. Finds all component directories containing `.svelte` files
3. Auto-generates metadata from directory and file names
4. Creates `metadata.json` only if it doesn't already exist (won't overwrite)

**Run it**:
```bash
node scripts/create-all-registry-json.js
```

#### Script 2: `update-root-registry.js` (REQUIRED)

**Location**: `/scripts/update-root-registry.js`

**Purpose**: Maintains the master `/metadata.json` file at project root.

**How it works**:
1. Scans all `metadata.json` files in component directories
2. Builds a pathMap of component names to file paths
3. Updates root `metadata.json` with correct paths
4. Removes stale entries for deleted components

**Run it**:
```bash
node scripts/update-root-registry.js
```

### Workflow for Registry Files

**Recommended Approach**:
```bash
# 1. Create component files in correct directory structure
mkdir -p src/lib/registry/components/relay-input-basic/

# 2. Auto-generate metadata.json (if it doesn't exist)
node scripts/create-all-registry-json.js

# 3. Update root registry
node scripts/update-root-registry.js
```

---

## 4. Navigation/Sidebar Configuration (MANUAL)

### ⚠️ CRITICAL: Navigation is MANUALLY configured

**Location**: `/src/lib/site/navigation.ts`

**There is NO automatic navigation generation. You MUST manually add your component.**

### Navigation Structure

```typescript
export const componentCategories: NavCategory[] = [
  {
    title: 'Actions',
    items: [
      { name: 'Follow', path: '/components/follow', icon: UserAdd01Icon },
      { name: 'Reaction', path: '/components/reaction', icon: FavouriteIcon },
      // ... more items
    ]
  },
  {
    title: 'Relay',
    items: [
      { name: 'Card', path: '/components/relay-card', icon: ServerStack01Icon },
      { name: 'Input', path: '/components/relay-input', icon: Search01Icon },
      // YOUR NEW COMPONENT GOES HERE
    ]
  },
  // ... more categories
];
```

### Adding Your Component to Navigation

```typescript
// 1. Import icon from Hugeicons
import { TextInputIcon } from '@hugeicons/svelte';

// 2. Add to appropriate category
{
  title: 'Relay',
  items: [
    { name: 'Card', path: '/components/relay-card', icon: ServerStack01Icon },
    {
      name: 'Input',
      path: '/components/relay-input',  // Route to your component page
      icon: TextInputIcon,
      description: 'Input component for relay URLs'  // Optional
    }
  ]
}
```

**Navigation Interface**:
```typescript
export interface NavItem {
  name: string;        // Display name
  path: string;        // Route path (e.g., '/components/relay-input')
  icon: typeof Home01Icon;  // Hugeicons icon
  title?: string;      // Optional title override
  description?: string;
  nip?: string;        // Optional NIP badge
}
```

---

## 5. Documentation Page (ComponentPageTemplate - MANDATORY)

### ⚠️ MANDATORY: All component pages MUST use ComponentPageTemplate

**Location**: `src/lib/site/templates/ComponentPageTemplate.svelte`

**Why mandatory**:
- All 18+ existing component pages use it
- No alternative layout pattern exists
- Ensures consistent UX across all pages
- Provides standard sections: showcase, components, recipes, primitives

### Page Structure

```
src/routes/(app)/components/{component-name}/
├── +page.svelte                   # MUST use ComponentPageTemplate
└── examples/
    ├── basic-usage/
    │   ├── index.svelte
    │   └── index.txt
    └── advanced/
        ├── index.svelte
        └── index.txt
```

### Standard +page.svelte Pattern

```svelte
<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import ComponentPageTemplate from '$lib/site/templates/ComponentPageTemplate.svelte';
  import ComponentCard from '$lib/site/components/ComponentCard.svelte';

  // Import component
  import RelayInput from '$lib/registry/components/relay/inputs/basic/relay-input.svelte';

  // Import registry metadata
  import relayInputCard from '$lib/registry/components/relay/inputs/basic/metadata.json';

  // Import example code (for display)
  import BasicCode from './examples/basic-usage/index.txt?raw';
  // Import example component (for rendering)
  import BasicExample from './examples/basic-usage/index.svelte';

  const metadata = {
    title: 'Relay Input',
    description: 'Input component for relay URLs',
    showcaseTitle: 'Relay Input Variants',
    showcaseDescription: 'Input components for managing relay connections',
  };

  const ndk = getContext<NDKSvelte>('ndk');

  // State for examples
  let relay = $state<NDKRelay | undefined>();

  // Fetch data if needed
  $effect(() => {
    (async () => {
      // Load relay data...
      relay = await fetchRelay();
    })();
  });

  // Preview snippets
  {#snippet basicPreview()}
    {#if relay}
      <RelayInput {ndk} {relay} />
    {/if}
  {/snippet}

  // Components section
  {#snippet components()}
    <ComponentCard data={{...relayInputCard, code: BasicCode}}>
      {#snippet preview()}
        {@render basicPreview()}
      {/snippet}
    </ComponentCard>
  {/snippet}
</script>

<ComponentPageTemplate
  {metadata}
  {ndk}
  showcaseComponents={[
    {
      cardData: relayInputCard,
      preview: basicPreview,
      orientation: 'horizontal'
    }
  ]}
  {components}
/>
```

### ComponentPageTemplate Props

```typescript
interface ComponentPageTemplateProps {
  // Required
  metadata: {
    title: string;
    description: string;
    showcaseTitle?: string;
    showcaseDescription?: string;
  };

  // Optional but common
  ndk?: NDKSvelte;

  // Showcase section
  showcaseComponents?: ShowcaseComponent[];
  showcaseComponent?: ComponentType;  // Custom showcase

  // Components section (use snippets pattern)
  components?: Snippet;
  componentsTitle?: string;
  componentsDescription?: string;

  // Section snippets
  recipes?: Snippet;           // Component composition patterns
  primitives?: Snippet;        // ALL lower-level content (builders, UI primitives, anatomy)

  // Extension points (rarely needed)
  beforeShowcase?: Snippet;
  afterShowcase?: Snippet;
  beforeComponents?: Snippet;
  afterComponents?: Snippet;
  customSections?: Snippet;    // Avoid using - put content in primitives instead

  // Interactive controls
  showcaseControls?: Snippet<[component: ShowcaseComponent]>;
  children?: Snippet;  // EditProps.Prop components
}
```

**Architectural guidance**:
- Use `recipes` for showing component combinations and common patterns
- Use `primitives` for ALL lower-level documentation (builders, UI primitives, anatomy, advanced APIs)
- Avoid `customSections` - it exists for backward compatibility but content should be organized into the proper sections

---

## 6. Recipe Section (Optional - Component Compositions)

### What Are Recipes?

The **recipe section** shows how to **combine your component with other components** to create common patterns and compositions. Think of it as showing "cooking recipes" that use your component as an ingredient.

### When to Use Recipes

Use recipes to demonstrate:
- ✅ **Component composition** - Combining your component with others
- ✅ **Common patterns** - Typical use cases users will implement
- ✅ **Integration examples** - How it works with related components
- ✅ **State management patterns** - Using builders/actions with the component

**Example**: The reaction component shows how to combine `ReactionButton` with `EmojiPicker.Dropdown` for emoji selection.

### Recipe Implementation

#### Step 1: Create Recipe Example Files

```
src/routes/(app)/components/your-component/
└── examples/
    └── recipe-name/
        ├── index.svelte    # Full implementation with types
        └── index.txt       # Simplified for docs
```

**Example**: `examples/emoji-picker-dropdown/index.txt`
```svelte
<script lang="ts">
  import { EmojiPicker } from '$lib/registry/components/emoji-picker';
  import ReactionButton from '$lib/registry/components/reaction/buttons/basic/reaction-button.svelte';
  import { createReactionAction } from '$lib/registry/builders/reaction-action/index.svelte.js';

  let { ndk, event } = $props();

  const reactionState = createReactionAction(() => ({ event }), ndk);
</script>

<EmojiPicker.Dropdown {ndk} onEmojiSelect={(emoji) => reactionState.react(emoji)}>
  <ReactionButton {ndk} {event} variant="ghost" />
</EmojiPicker.Dropdown>
```

#### Step 2: Import Recipe Code in +page.svelte

```svelte
<script lang="ts">
  // Import the simplified code for display
  import emojiPickerDropdownCode from './examples/emoji-picker-dropdown/index.txt?raw';

  const ndk = getContext<NDKSvelte>('ndk');
  let sampleEvent = $state<NDKEvent | undefined>();
</script>
```

#### Step 3: Define Recipe Snippet

```svelte
{#snippet recipes()}
  {#if sampleEvent}
    {@const reactionState = createReactionAction(() => ({ event: sampleEvent }), ndk)}

    <Preview title="Emoji Picker Dropdown" code={emojiPickerDropdownCode}>
      <EmojiPicker.Dropdown
        {ndk}
        onEmojiSelect={(emoji) => reactionState.react(emoji)}
      >
        <ReactionButton {ndk} event={sampleEvent} variant="ghost" />
      </EmojiPicker.Dropdown>
    </Preview>
  {/if}
{/snippet}
```

**Key elements**:
- `{#if sampleEvent}` - Only render when data exists
- `{@const}` - Create derived reactive state
- `<Preview>` - Wrapper component for code + interactive display
- `title` - Human-readable recipe name
- `code` - Imported code string

#### Step 4: Pass to ComponentPageTemplate

```svelte
<ComponentPageTemplate
  {metadata}
  {ndk}
  showcaseComponents={[...]}
  {components}
  {recipes}  <!-- Pass the recipes snippet -->
/>
```

### Preview Component

The `<Preview>` component wraps each recipe example:

```typescript
interface PreviewProps {
  title?: string;           // "Emoji Picker Dropdown"
  code?: string;            // Imported .txt code
  children: Snippet;        // The interactive component
  class?: string;
  previewAreaClass?: string;
}
```

**Renders**:
1. Title (if provided)
2. Interactive preview area (min-h-[433px], gray background)
3. Code snippet below (if code provided)

### Complete Recipe Example

**File**: `src/routes/(app)/components/reaction/+page.svelte`

```svelte
<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte, NDKEvent } from '@nostr-dev-kit/svelte';
  import ComponentPageTemplate from '$lib/site/templates/ComponentPageTemplate.svelte';
  import { Preview } from '$lib/site/components';
  import { EmojiPicker } from '$lib/registry/components/emoji-picker';
  import ReactionButton from '$lib/registry/components/reaction/buttons/basic/reaction-button.svelte';
  import { createReactionAction } from '$lib/registry/builders/reaction-action/index.svelte.js';

  // Import recipe code
  import emojiPickerDropdownCode from './examples/emoji-picker-dropdown/index.txt?raw';

  const ndk = getContext<NDKSvelte>('ndk');
  let sampleEvent = $state<NDKEvent | undefined>();

  // Define recipes snippet
  {#snippet recipes()}
    {#if sampleEvent}
      {@const reactionState = createReactionAction(() => ({ event: sampleEvent }), ndk)}

      <Preview title="Emoji Picker Dropdown" code={emojiPickerDropdownCode}>
        <EmojiPicker.Dropdown
          {ndk}
          onEmojiSelect={(emoji) => reactionState.react(emoji)}
        >
          <ReactionButton {ndk} event={sampleEvent} variant="ghost" />
        </EmojiPicker.Dropdown>
      </Preview>
    {/if}
  {/snippet}
</script>

<ComponentPageTemplate
  metadata={{
    title: 'Reaction',
    description: 'Reaction components for liking and reacting to events'
  }}
  {ndk}
  showcaseComponents={[...]}
  {components}
  {recipes}
/>
```

### Recipe Section in Page Flow

The ComponentPageTemplate renders sections in this order:

1. **Showcase** - Component variants preview
2. **Components** - Detailed component cards with all variants
3. **Recipes** ← Shows composition patterns (optional)
4. **Custom Sections** - Builder API, Primitives, Anatomy, etc. (optional)

### Multiple Recipes

You can include multiple recipes in the snippet:

```svelte
{#snippet recipes()}
  {#if sampleEvent}
    <Preview title="Recipe 1: Emoji Picker Dropdown" code={recipe1Code}>
      <!-- Recipe 1 composition -->
    </Preview>

    <Preview title="Recipe 2: Custom Action Handler" code={recipe2Code}>
      <!-- Recipe 2 composition -->
    </Preview>

    <Preview title="Recipe 3: Grouped Reactions" code={recipe3Code}>
      <!-- Recipe 3 composition -->
    </Preview>
  {/if}
{/snippet}
```

### Recipe vs Custom Sections

| Feature | Recipes | Custom Sections |
|---------|---------|-----------------|
| Purpose | Component composition patterns | Any custom content |
| Structure | `<Preview>` wrapper with code | Fully custom HTML |
| Standard title | "Recipes" (from template) | Custom title per section |
| Prop name | `recipes` | `customSections` |
| Use case | Show combinations | Builder API, Anatomy, Primitives |

### Best Practices
- Keep recipes focused on common, practical patterns
- Show real integration with related components
- Include state management if relevant
- Use descriptive titles that explain the pattern

---

## 6.1. Primitives Section (Optional - Lower-Level Documentation)

### What Is the Primitives Section?

The **primitives section** is the designated place for **all lower-level documentation** including builders, UI primitives, and anatomy. This is where you teach developers about the building blocks and underlying patterns.

**Architectural principle**: Keep ComponentPageTemplate focused. All technical/lower-level content (builders, primitives, anatomy) belongs in the `primitives` section, not scattered across custom sections.

### When to Use Primitives Section

Use the primitives section for:
- ✅ **Builder Pattern Documentation** - How to use state builders (createReactionAction, etc.)
- ✅ **UI Primitive Composition** - How to combine primitive components
- ✅ **Anatomy Diagrams** - Visual breakdown of component structure
- ✅ **Low-Level API Documentation** - Technical details for advanced usage
- ✅ **Building Block Examples** - Showing fundamental composition patterns

**Example**: The notification component shows builder patterns AND UI primitive composition in the primitives section.

### Primitives Implementation

#### Template Structure

In ComponentPageTemplate (lines 114-117):
```svelte
<!-- Primitives Section -->
{#if primitives}
  {@render primitives()}
{/if}
```

**Key characteristics**:
- Completely optional - only renders if provided
- No built-in styling or wrapper
- Full control over structure and content
- Appears after recipes, before customSections

#### Page Flow Position

```
1. Showcase (component variants preview)
2. Components (detailed variant documentation)
3. Recipes (common composition patterns)
4. Primitives ← ALL lower-level content (builders, UI primitives, anatomy)
```

**Note**: The `primitives` section is the final major section. There's also a `customSections` prop, but it should ideally not be needed if you organize content properly.

#### Step 1: Define Primitives Snippet (Multiple Subsections)

The primitives section typically contains multiple subsections for different aspects:

```svelte
{#snippet primitives()}
  <!-- Builder Pattern Section -->
  <section class="mt-16">
    <h2 class="text-3xl font-bold mb-4">Builder Pattern</h2>
    <p class="text-muted-foreground mb-6">
      Use the <code class="px-2 py-1 bg-muted rounded text-sm">createReactionAction()</code>
      builder for managing reaction state.
    </p>
    <Preview code={builderCode}>
      {@render builderExample()}
    </Preview>
  </section>

  <!-- UI Primitives Section -->
  <section class="mt-16">
    <h2 class="text-3xl font-bold mb-4">UI Primitives</h2>
    <p class="text-muted-foreground mb-6">
      Compose custom layouts using UI primitives for maximum flexibility.
    </p>
    <Preview code={primitivesCode}>
      {@render primitivesExample()}
    </Preview>
  </section>

  <!-- Anatomy Section (if relevant) -->
  <section class="mt-16">
    <h2 class="text-3xl font-bold mb-4">Component Anatomy</h2>
    <p class="text-muted-foreground mb-6">
      Visual breakdown of component structure and composition.
    </p>
    <!-- Anatomy diagram or interactive visualization -->
  </section>
{/snippet}
```

#### Step 2: Create Individual Examples

```svelte
{#snippet primitivesExample()}
  {#if notification}
    <NotificationItem.Root {ndk} {notification}>
      <div class="border rounded-lg p-4 space-y-3">
        <!-- Custom layout using primitives -->
        <div class="flex items-center justify-between">
          <NotificationItem.Action />
          <NotificationItem.Timestamp />
        </div>

        <NotificationItem.Content />

        <div class="flex items-center gap-3">
          <NotificationItem.Actors max={5} />
        </div>
      </div>
    </NotificationItem.Root>
  {/if}
{/snippet}
```

#### Step 3: Pass to ComponentPageTemplate

```svelte
<ComponentPageTemplate
  {metadata}
  {ndk}
  showcaseComponents={[...]}
  {components}
  {recipes}
  {primitives}  <!-- Pass the primitives snippet -->
/>
```

### Complete Primitives Example (All Lower-Level Content)

**File**: Recommended pattern for component pages

```svelte
<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import ComponentPageTemplate from '$lib/site/templates/ComponentPageTemplate.svelte';
  import { Preview } from '$lib/site/components';
  import { NotificationItem } from '$lib/registry/ui/notification';
  import { createNotificationFeed } from '$lib/registry/builders/notification-feed.svelte.js';

  // Import code for different subsections
  import builderCode from './examples/builder/index.txt?raw';
  import primitivesCode from './examples/primitives/index.txt?raw';

  const ndk = getContext<NDKSvelte>('ndk');
  let targetPubkey = $state<string | undefined>();

  // Define primitives snippet with ALL lower-level content
  {#snippet primitives()}
    <!-- Builder Pattern -->
    <section class="mt-16">
      <h2 class="text-3xl font-bold mb-4">Builder Pattern</h2>
      <p class="text-muted-foreground mb-6">
        The <code class="px-2 py-1 bg-muted rounded text-sm">createNotificationFeed()</code>
        builder aggregates and categorizes notifications using reactive state.
      </p>
      <Preview code={builderCode}>
        {@render builderExample()}
      </Preview>
    </section>

    <!-- UI Primitives -->
    <section class="mt-16">
      <h2 class="text-3xl font-bold mb-4">UI Primitives</h2>
      <p class="text-muted-foreground mb-6">
        Compose notification displays using UI primitives.
        This example shows maximum flexibility for custom layouts.
      </p>
      <Preview code={primitivesCode}>
        {@render primitivesExample()}
      </Preview>
    </section>

    <!-- Anatomy (optional) -->
    <section class="mt-16">
      <h2 class="text-3xl font-bold mb-4">Component Anatomy</h2>
      <p class="text-muted-foreground mb-6">
        Understanding the component's internal structure.
      </p>
      <!-- Interactive anatomy visualization or diagram -->
    </section>
  {/snippet}

  {#snippet builderExample()}
    {#if targetPubkey}
      {@const feed = createNotificationFeed(() => ({
        kinds: [1, 6, 7, 9735],
        authors: [targetPubkey]
      }), ndk)}

      <div>
        <p>Total: {feed.all.length}</p>
        <p>Likes: {feed.likes.length}</p>
        <p>Replies: {feed.replies.length}</p>
      </div>
    {/if}
  {/snippet}

  {#snippet primitivesExample()}
    {#if targetPubkey}
      {@const feed = createNotificationFeed(() => ({
        kinds: [1, 6, 7, 9735],
        authors: [targetPubkey]
      }), ndk)}

      <div class="space-y-3">
        {#each feed.all.slice(0, 1) as notification}
          <NotificationItem.Root {ndk} {notification}>
            <div class="border rounded-lg p-4 space-y-3">
              <div class="flex items-center justify-between">
                <NotificationItem.Action />
                <NotificationItem.Timestamp />
              </div>
              <NotificationItem.Content />
              <div class="flex items-center gap-3">
                <NotificationItem.Actors max={5} />
              </div>
            </div>
          </NotificationItem.Root>
        {/each}
      </div>
    {/if}
  {/snippet}
</script>

<ComponentPageTemplate
  {metadata}
  {ndk}
  showcaseComponents={[...]}
  {components}
  {recipes}
  {primitives}  <!-- ALL lower-level content goes here -->
/>
```

### Primitives Section Props

**ComponentPageTemplateProps**:
```typescript
interface ComponentPageTemplateProps {
  // ... other props
  primitives?: Snippet;  // Optional, no parameters
  // ... other props
}
```

**Key points**:
- Type: `Snippet` (optional)
- No parameters passed from template
- Full control over content and structure
- No imposed styling or wrapper elements

### Styling and Structure

The primitives section has **no built-in styling**:
- Template only provides conditional rendering
- All styling comes from your snippet
- Common pattern: Use `<section class="mt-16 space-y-8">` for spacing
- Use `<h2>` for section titles
- Wrap examples in `<Preview>` components

### Content Organization Within Primitives

The primitives section should contain **all lower-level content** organized as subsections:

**Recommended structure**:
```svelte
{#snippet primitives()}
  <!-- 1. Builder Pattern (if applicable) -->
  <section class="mt-16">
    <h2 class="text-3xl font-bold mb-4">Builder Pattern</h2>
    <p class="text-muted-foreground mb-6">State management and reactive logic</p>
    <Preview code={builderCode}>
      {@render builderExample()}
    </Preview>
  </section>

  <!-- 2. UI Primitives (if applicable) -->
  <section class="mt-16">
    <h2 class="text-3xl font-bold mb-4">UI Primitives</h2>
    <p class="text-muted-foreground mb-6">Composable building blocks</p>
    <Preview code={primitivesCode}>
      {@render primitivesExample()}
    </Preview>
  </section>

  <!-- 3. Anatomy (if applicable) -->
  <section class="mt-16">
    <h2 class="text-3xl font-bold mb-4">Component Anatomy</h2>
    <p class="text-muted-foreground mb-6">Internal structure visualization</p>
    <!-- Anatomy diagram or interactive visualization -->
  </section>

  <!-- 4. Advanced APIs (if applicable) -->
  <section class="mt-16">
    <h2 class="text-3xl font-bold mb-4">Advanced Usage</h2>
    <p class="text-muted-foreground mb-6">Low-level APIs and edge cases</p>
    <Preview code={advancedCode}>
      {@render advancedExample()}
    </Preview>
  </section>
{/snippet}
```

### Section Hierarchy

| Section | Purpose | Content Type |
|---------|---------|--------------|
| **Showcase** | Preview component variants | Visual demos |
| **Components** | Detailed variant documentation | Component cards with code |
| **Recipes** | Common composition patterns | Component combinations |
| **Primitives** | **All lower-level content** | Builders, UI primitives, anatomy, advanced APIs |

**Architectural principle**: Keep primitives as the single source for all technical/lower-level documentation. Don't scatter builder docs, primitive docs, and anatomy across different sections.

### Best Practices

**Content organization**:
- ✅ Put **all lower-level content** in primitives section (builders, UI primitives, anatomy)
- ✅ Use multiple `<section>` subsections for different aspects
- ✅ Start with Builder Pattern (state management)
- ✅ Then show UI Primitives (composition)
- ✅ End with Anatomy or Advanced APIs if relevant

**Implementation**:
- ✅ Use `<Preview>` components for code + interactive display
- ✅ Include descriptive titles (`<h2>`) and explanations (`<p>`) for each subsection
- ✅ Show realistic, practical examples
- ✅ Demonstrate flexibility without overwhelming
- ✅ Use consistent spacing: `<section class="mt-16">` between subsections

**What NOT to do**:
- ❌ Don't use `customSections` for builder/primitive/anatomy content
- ❌ Don't scatter lower-level docs across multiple top-level sections
- ❌ Don't mix high-level usage patterns with low-level docs

**Note**: The `customSections` prop exists for backward compatibility, but all lower-level content should be organized into the `primitives` section following the architectural pattern above.

---

## 7. Example Files Format (Dual-File MANDATORY)

### ⚠️ MANDATORY: Each Example Must Have TWO Files

**Structure**:
```
examples/{example-name}/
├── index.svelte    # Full implementation
└── index.txt       # Simplified for docs display
```

**Both files MUST demonstrate IDENTICAL functionality.**

### index.svelte (Full Implementation)

**MUST include this sync comment at the top**:

```svelte
<!--
  IMPORTANT: Keep this file in sync with index.txt

  Rules for maintaining sync between index.svelte and index.txt:
  1. Both files must demonstrate the SAME functionality
  2. index.svelte = Full implementation (with TypeScript interfaces, all imports, complete styling)
  3. index.txt = Simplified documentation version with these changes:
     - Remove TypeScript interface definitions
     - Use inline prop destructuring: let { ndk, relay } = $props();
     - Keep only essential imports (remove type imports unless needed)
     - Keep inline classes (class="...") but remove <style> blocks
     - Focus on showing component API usage, not implementation details
     - Keep the core component usage identical between both files

  When you modify this file, you MUST update index.txt to reflect the same changes
  following the simplification rules above.
-->

<script lang="ts">
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import type { NDKRelay } from '@nostr-dev-kit/ndk';
  import { RelayInput } from '$lib/registry/components/relay/inputs/basic';

  interface Props {
    ndk: NDKSvelte;
    relay?: NDKRelay;
  }

  let { ndk, relay }: Props = $props();
</script>

{#if relay}
  <RelayInput {ndk} {relay} />
{/if}
```

### index.txt (Simplified Documentation)

```svelte
<script lang="ts">
  import { RelayInput } from '$lib/registry/components/relay/inputs/basic';

  let { ndk, relay } = $props();
</script>

{#if relay}
  <RelayInput {ndk} {relay} />
{/if}
```

### Simplification Rules for index.txt

1. ❌ Remove `interface Props` definitions
2. ❌ Remove type-only imports (`import type`)
3. ✅ Keep component imports
4. ✅ Use inline destructuring: `let { ndk } = $props();`
5. ✅ Keep all Tailwind classes
6. ❌ Remove `<style>` blocks (if any exist)
7. ✅ Keep core functionality identical

### Importing in +page.svelte

```svelte
// For rendering the example
import BasicExample from './examples/basic-usage/index.svelte';

// For displaying code in docs
import BasicCode from './examples/basic-usage/index.txt?raw';

// Usage in ComponentCard
<ComponentCard data={{...metadata, code: BasicCode}}>
  {#snippet preview()}
    <BasicExample {ndk} {relay} />
  {/snippet}
</ComponentCard>
```

---

## 7. Styling Guidelines (Tailwind Only)

### ⚠️ MANDATORY: Tailwind CSS Only - NO Style Blocks

**✅ CORRECT**:
```svelte
<div class="flex items-center gap-3 p-4 rounded-lg border border-border bg-card hover:bg-muted transition-colors">
  Content
</div>
```

**❌ INCORRECT**:
```svelte
<div class="my-component">Content</div>

<style>
  .my-component {
    display: flex;
    padding: 1rem;
  }
</style>
```

### Common Tailwind Patterns

**Layout**:
```svelte
class="flex items-center justify-between gap-4"
class="grid grid-cols-2 gap-4"
class="w-full max-w-md"
```

**Theme Colors** (using CSS variables):
```svelte
class="bg-card text-card-foreground"
class="bg-muted text-muted-foreground"
class="border border-border"
class="hover:bg-accent hover:text-accent-foreground"
```

**Spacing**:
```svelte
class="p-4"        <!-- padding all sides -->
class="px-6 py-3"  <!-- padding x/y -->
class="gap-2"      <!-- gap in flex/grid -->
```

**Typography**:
```svelte
class="text-lg font-semibold"
class="text-sm text-muted-foreground"
```

**Responsive**:
```svelte
class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
```

### Data Attributes

Use for component identification and testing:
```svelte
<button data-relay-input="" class="...">
<div data-follow-pack-hero="" class="...">
```

---

## 8. Complete Workflow Checklist

### ✅ Phase 1: Component Creation

- [ ] Determine correct location (UI primitive, builder, or component)
- [ ] Create component directory: `components/{component-name-variant}/`
- [ ] Create `{component-name-variant}.svelte`:
  - [ ] TypeScript `Props` interface
  - [ ] `$props()` destructuring
  - [ ] Tailwind classes only (no `<style>` blocks)
  - [ ] Data attributes for identification
- [ ] Create `index.ts` with export
- [ ] Run registry generation:
  ```bash
  node scripts/create-all-registry-json.js
  node scripts/update-root-registry.js
  ```
- [ ] Verify `metadata.json` was created

### ✅ Phase 2: Navigation Update (MANUAL - DON'T FORGET!)

- [ ] **Edit `src/lib/site/navigation.ts`**
- [ ] Import icon from `@hugeicons/svelte` if needed
- [ ] Add component to appropriate category:
  ```typescript
  {
    name: 'Component Name',
    path: '/components/component-name',
    icon: IconName,
    description: 'Brief description'
  }
  ```
- [ ] Save file

### ✅ Phase 3: Documentation Page (MUST use ComponentPageTemplate)

- [ ] Create directory: `src/routes/(app)/components/{component-name}/`
- [ ] Create `+page.svelte`:
  - [ ] Import `ComponentPageTemplate`
  - [ ] Import component, metadata.json, examples
  - [ ] Define `metadata` object
  - [ ] Create preview snippets
  - [ ] Create `components` snippet with ComponentCard
  - [ ] Fetch data with `$effect()` if needed
  - [ ] Pass props to ComponentPageTemplate
- [ ] Create `examples/` directory

### ✅ Phase 4: Example Files (DUAL-FILE MANDATORY)

For each example:
- [ ] Create `examples/{example-name}/` directory
- [ ] Create `index.svelte`:
  - [ ] **Add SYNC COMMENT at top** (mandatory!)
  - [ ] Include TypeScript interfaces
  - [ ] Include all imports
  - [ ] Use Tailwind classes
- [ ] Create `index.txt`:
  - [ ] Remove interface definitions
  - [ ] Remove type-only imports
  - [ ] Use inline prop destructuring
  - [ ] Keep functionality identical to index.svelte
- [ ] Verify both files demonstrate identical behavior

### ✅ Phase 5: Testing & Verification

- [ ] Run `npm run build`
- [ ] Verify no build errors
- [ ] Check navigation shows component in sidebar
- [ ] Visit `/components/{component-name}` page
- [ ] Verify component preview displays correctly
- [ ] Verify code example shows simplified version (index.txt)
- [ ] Test interactive features with real data
- [ ] Verify Tailwind classes render correctly

### ✅ Phase 6: Final Registry Sync

- [ ] Run registry update one final time:
  ```bash
  node scripts/update-root-registry.js
  ```
- [ ] Verify root `/metadata.json` includes your component
- [ ] Commit all files

---

## 9. Common Pitfalls & How to Avoid Them

### Pitfall 1: Forgetting to Update Navigation

**Problem**: Component exists but doesn't appear in sidebar.

**Solution**: Navigation is MANUAL. Always update `src/lib/site/navigation.ts`.

**Check**: After creating component, verify it appears in the sidebar navigation.

### Pitfall 2: Missing Sync Comment in Examples

**Problem**: Future developers don't know examples must stay in sync.

**Solution**: ALWAYS add the sync comment at the top of `index.svelte`.

**Template**:
```svelte
<!--
  IMPORTANT: Keep this file in sync with index.txt
  [full comment text from section 6]
-->
```

### Pitfall 3: Using Style Blocks Instead of Tailwind

**Problem**: Component doesn't match design system, harder to maintain.

**Solution**: Use Tailwind classes exclusively. NO `<style>` blocks.

**Check**: Search your component file for `<style>` - should find zero matches.

### Pitfall 4: Not Using ComponentPageTemplate

**Problem**: Inconsistent page layout, missing features.

**Solution**: ALL component pages MUST use ComponentPageTemplate.

**Check**: Your +page.svelte should import and render ComponentPageTemplate.

### Pitfall 5: index.svelte and index.txt Out of Sync

**Problem**: Documentation shows different code than what actually works.

**Solution**: When changing functionality, update BOTH files.

**Check**: Compare the component usage in both files - should be identical.

### Pitfall 6: Wrong Component Location

**Problem**: Component is hard to find, doesn't follow conventions.

**Solution**: Use decision tree in section 2.1:
- UI primitives → `ui/`
- Builders → `builders/`
- Complete components → `components/{component-name-variant}/`

### Pitfall 7: Forgetting to Run Registry Scripts

**Problem**: Component doesn't appear in jsrepo, root registry out of sync.

**Solution**: Always run both scripts:
```bash
node scripts/create-all-registry-json.js
node scripts/update-root-registry.js
```

### Pitfall 8: Missing metadata.json Fields

**Problem**: Component can't be published or searched.

**Solution**: Ensure metadata.json has all required fields:
- name, title, category, description, command, dependencies, useCases

---

## Quick Reference

### Key Commands

```bash
# Generate metadata.json files
node scripts/create-all-registry-json.js

# Update master registry
node scripts/update-root-registry.js

# Build project
npm run build

# Dev server
npm run dev
```

### Key Files

| File | Purpose |
|------|---------|
| `src/lib/registry/components/{component-name-variant}/` | Component location |
| `src/lib/site/navigation.ts` | **MANUAL navigation config** |
| `src/lib/site/templates/ComponentPageTemplate.svelte` | **MANDATORY page template** |
| `src/routes/(app)/components/{name}/+page.svelte` | Documentation page |
| `examples/{name}/index.svelte` + `index.txt` | **Dual-file examples** |
| `scripts/create-all-registry-json.js` | Auto-generate registry |
| `scripts/update-root-registry.js` | Update master registry |
| `/metadata.json` | Master registry index |

### Decision Tree Summary

```
1. What am I creating?
   ├─ Headless UI primitive → src/lib/registry/ui/
   ├─ State logic (no UI) → src/lib/registry/builders/
   └─ Complete component → src/lib/registry/components/

2. Did I update navigation.ts? (MANUAL!)
   └─ src/lib/site/navigation.ts

3. Does my +page.svelte use ComponentPageTemplate? (MANDATORY!)
   └─ import ComponentPageTemplate from '$lib/site/templates/...'

4. Do my examples have BOTH files? (MANDATORY!)
   ├─ index.svelte (with sync comment)
   └─ index.txt (simplified)

5. Am I using Tailwind only? (NO STYLE BLOCKS!)
   └─ Check: grep "<style>" should find nothing

6. Did I run the registry scripts?
   ├─ node scripts/create-all-registry-json.js
   └─ node scripts/update-root-registry.js
```

---

## Summary

Creating a component requires **SIX critical steps**:

1. ✅ **Component files** in correct directory structure
2. ✅ **Run registry scripts** to auto-generate metadata
3. ✅ **Update navigation.ts** manually (no automation!)
4. ✅ **Create +page.svelte** using ComponentPageTemplate (mandatory!)
5. ✅ **Create dual example files** (index.svelte + index.txt with sync comment)
6. ✅ **Build and verify** everything works

**The three independent systems that MUST be synchronized**:
1. Component registry (auto-generated via scripts)
2. Navigation (manual configuration in navigation.ts)
3. Documentation pages (ComponentPageTemplate pattern)

**Remember**: This is not optional - these are architectural requirements of the system.
