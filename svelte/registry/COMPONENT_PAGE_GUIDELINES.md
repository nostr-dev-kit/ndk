# Component Page Structure Guidelines

**Version:** 3.0
**Last Updated:** 2025-01-29
**Status:** Canonical Reference

This document defines the canonical structure for all component documentation pages in the NDK Svelte Registry. These guidelines ensure consistency, maintainability, and excellent developer experience across all component pages.

---

## Table of Contents

1. [Philosophy](#philosophy)
2. [Page Structure](#page-structure)
3. [Section Specifications](#section-specifications)
4. [Code Simplification Rules](#code-simplification-rules)
5. [File Organization](#file-organization)
6. [Infrastructure Components](#infrastructure-components)
7. [Hierarchical Subsections](#hierarchical-subsections)
8. [Import Patterns](#import-patterns)
9. [Complete Checklist](#complete-checklist)
10. [Examples](#examples)

---

## Philosophy

### Core Principles

1. **Consistency Over Flexibility**: Every component page follows the exact same structure
2. **Structure Over Implementation**: Code examples show WHAT to build, not HOW to build it
3. **Hierarchy Matters**: Related concepts are grouped hierarchically, not flatly
4. **No Backwards Compatibility**: Clean, modern code only - break things to make them better
5. **Developer Experience First**: Minimize cognitive load, maximize clarity

### Anti-Patterns to Avoid

❌ **DO NOT** show script tags in block code examples
❌ **DO NOT** show imports in block code examples
❌ **DO NOT** show decorative SVG in structural examples
❌ **DO NOT** create flat lists of related blocks
❌ **DO NOT** mix blocks and primitives in the same section
❌ **DO NOT** write backwards-compatible code
❌ **DO NOT** leave TODOs or technical debt comments

---

## Page Structure

Every component page MUST follow this exact order:

```
1. Header
   - Title (h1)
   - Subtitle/Description (paragraph)
   - EditProps widget

2. Blocks Section (h2)
   - Description paragraph
   - Block examples with hierarchical subsections

3. UI Components Section (h2)
   - Description paragraph
   - Primitive composition examples

4. Builder Section (h2) [OPTIONAL - only if createX builder exists]
   - Description paragraph
   - Builder usage examples

5. Component API (h2)
   - Structured documentation of all components

6. Builder API (h2) [OPTIONAL - only if builder exists]
   - Structured documentation of builder functions
```

### Header Template

```svelte
<div class="container mx-auto p-8 max-w-7xl">
	<!-- Header -->
	<div class="mb-12">
		<h1 class="text-4xl font-bold mb-4">[ComponentName]</h1>
		<p class="text-lg text-muted-foreground mb-6">
			[Clear, concise description of the component's purpose and use cases]
		</p>

		<EditProps.Root>
			<EditProps.Prop name="Sample [Entity]" type="[type]" bind:value={sample} />
		</EditProps.Root>
	</div>
```

---

## Section Specifications

### 1. Blocks Section

**Purpose:** Showcase pre-composed, ready-to-use layouts that can be installed with a single command.

**Structure:**
```svelte
<section class="mb-16">
	<h2 class="text-3xl font-bold mb-2">Blocks</h2>
	<p class="text-muted-foreground mb-8">
		Pre-composed layouts ready to use. Install with a single command.
	</p>

	<div class="space-y-12">
		<!-- Each block example -->
		<BlockExample
			title="[BlockName]"
			description="[When to use this block]"
			component="[npm-package-name]"
			code={BlockCodeRaw}
		>
			<!-- Preview content: actual block components -->
		</BlockExample>
	</div>
</section>
```

**Block Example Requirements:**
- ✅ **Preview Tab**: Renders the ACTUAL block component (e.g., `<ArticleCardPortrait />`)
- ✅ **Code Tab**: Shows SIMPLIFIED primitive composition (see Code Simplification Rules)
- ✅ **Install Tab**: Automatically shown with install command
- ✅ **Import from**: `$lib/ndk/blocks`
- ✅ **Description**: Explains WHEN to use this block, not WHAT it is

### 2. UI Components Section

**Purpose:** Demonstrate how to compose custom layouts using primitive components.

**Structure:**
```svelte
<section class="mb-16">
	<h2 class="text-3xl font-bold mb-2">UI Components</h2>
	<p class="text-muted-foreground mb-8">
		Primitive components for building custom [component] layouts. Mix and match to create your own designs.
	</p>

	<div class="space-y-8">
		<UIExample
			title="[Example Purpose]"
			description="[What this example demonstrates]"
			code={ExampleCodeRaw}
		>
			<!-- Preview content -->
		</UIExample>
	</div>
</section>
```

**UI Example Requirements:**
- ✅ **Preview Tab**: Shows custom composition
- ✅ **Code Tab**: Shows full composable pattern
- ✅ **Import from**: `$lib/ndk/[component-name]`
- ✅ **Minimum 3 examples**: Basic, Composition, Styling

**Standard UI Examples:**
1. **Basic Usage**: Minimal Root + 1-2 primitives
2. **Full Composition**: All relevant primitives working together
3. **Custom Styling**: Multiple styling variations demonstrating flexibility

### 3. Component API Section

**Purpose:** Provide comprehensive, structured documentation of all components.

**Structure:**
```svelte
<ComponentAPI
	components={[
		{
			name: 'ComponentName.Root',
			description: 'What this component does',
			importPath: "import { Component } from '$lib/ndk/component'",
			props: [
				{
					name: 'propName',
					type: 'TypeScript type',
					default: 'default value',
					description: 'What this prop does',
					required: true/false
				}
			],
			events: [...], // optional
			slots: [...]   // optional
		}
	]}
/>
```

**API Documentation Requirements:**
- ✅ **Order**: Primitives first (Root, Image, Title, etc.), then Blocks
- ✅ **Import paths**: Always show correct import statement
- ✅ **Props**: Type, default, description, required flag
- ✅ **Descriptions**: Clear, concise, actionable
- ✅ **No legacy props**: Only document current API

---

## Code Simplification Rules

**The Golden Rule:** Show the STRUCTURE, not the SCAFFOLDING.

### Block Code Examples (e.g., `portrait-code.svelte`)

**✅ DO INCLUDE:**
- Component composition hierarchy
- Tailwind v4 classes
- Structural HTML (button, div, etc.)
- Component props that affect layout
- HTML comments ONLY if clarifying structure

**❌ DO NOT INCLUDE:**
- `<script>` tags
- `import` statements
- `let { ndk, article } = $props()`
- Decorative SVG icons (unless structural)
- Hover arrows/decorations
- Event handlers (unless critical to structure)
- Inline comments explaining the obvious

### Example Transformation

**❌ WRONG (too verbose):**
```svelte
<script lang="ts">
	import { ArticleCard } from '$lib/ndk/article-card';

	let { ndk, article } = $props();
</script>

<ArticleCard.Root {ndk} {article}>
	<button type="button" class="...">
		<!-- Cover Image -->
		<ArticleCard.Image class="h-56" showGradient={true} />

		<!-- Content -->
		<div class="p-4">
			<!-- Title -->
			<ArticleCard.Title class="..." />

			<!-- Decorative arrow SVG -->
			<svg width="16" height="16" class="text-primary opacity-0 group-hover:opacity-100">
				<path d="M9 5l7 7-7 7" />
			</svg>
		</div>
	</button>
</ArticleCard.Root>
```

**✅ CORRECT (structure only):**
```svelte
<ArticleCard.Root {ndk} {article}>
	<button type="button" class="...">
		<ArticleCard.Image class="h-56" showGradient={true} />

		<div class="p-4">
			<ArticleCard.Title class="..." />
		</div>
	</button>
</ArticleCard.Root>
```

### Why This Matters

1. **Cognitive Load**: Developers can instantly see the composition pattern
2. **Copy-Paste Ready**: Focus on what matters - the structure
3. **Maintainability**: Less code to maintain in examples
4. **Clarity**: No distractions from imports, decorations, or boilerplate

---

## File Organization

### Directory Structure

```
src/
├── routes/
│   └── components/
│       └── [component-name]/
│           ├── +page.svelte              # Main page
│           └── examples/
│               ├── [block-name].svelte        # Preview (actual block)
│               ├── [block-name]-code.svelte   # Code tab (simplified)
│               └── ui-[purpose].svelte        # UI examples
├── lib/
│   └── ndk/
│       ├── [component-name]/              # Primitives
│       │   ├── index.ts
│       │   ├── [component]-root.svelte
│       │   ├── [component]-image.svelte
│       │   └── ...
│       └── blocks/                        # Pre-composed blocks
│           ├── index.ts
│           ├── [component]-[variant].svelte
│           └── ...
└── components/                            # Site infrastructure
    ├── block-example.svelte
    ├── ui-example.svelte
    └── component-api.svelte
```

### Naming Conventions

**Block Examples:**
- Preview: `portrait.svelte`, `hero.svelte`, `neon.svelte`
- Code: `portrait-code.svelte`, `hero-code.svelte`, `neon-code.svelte`
- Pattern: `[variant].svelte` and `[variant]-code.svelte`

**UI Examples:**
- Pattern: `ui-[purpose].svelte`
- Examples: `ui-basic.svelte`, `ui-composition.svelte`, `ui-styling.svelte`

**Primitives:**
- Pattern: `[component]-[primitive].svelte`
- Examples: `article-card-root.svelte`, `article-card-image.svelte`

**Blocks:**
- Pattern: `[component]-[variant].svelte`
- Examples: `article-card-portrait.svelte`, `article-card-hero.svelte`

---

## Infrastructure Components

### BlockExample

**Purpose:** Display block examples with Preview/Code/Install tabs.

**Usage:**
```svelte
<BlockExample
	title="Block Name"
	description="When to use this block"
	component="npm-package-name"
	code={BlockCodeRaw}
>
	<!-- Preview content: actual block components -->
	<ArticleCardPortrait {ndk} {article} />
</BlockExample>
```

**Props:**
- `title` (optional): Block name (h3)
- `description` (optional): When to use this block
- `component` (required): Package name for install command
- `code` (required): Raw code string for Code tab
- `children`: Preview content

**Tabs:**
1. **Preview**: Shows live component
2. **Code**: Shows simplified composition
3. **Install**: Shows `npx shadcn-svelte@latest add [component]`

### UIExample

**Purpose:** Display UI component examples with Preview/Code tabs.

**Usage:**
```svelte
<UIExample
	title="Example Purpose"
	description="What this demonstrates"
	code={ExampleCodeRaw}
>
	<!-- Preview content -->
</UIExample>
```

**Props:**
- `title` (optional): Example name (h4)
- `description` (optional): What this demonstrates
- `code` (required): Raw code string
- `children`: Preview content

**Tabs:**
1. **Preview**: Shows live composition
2. **Code**: Shows full code

### ComponentAPI

**Purpose:** Structured API documentation.

**Usage:**
```svelte
<ComponentAPI
	components={[
		{
			name: 'Component.Root',
			description: 'Description',
			importPath: "import { Component } from '$lib/ndk/component'",
			props: [{...}],
			events: [{...}],  // optional
			slots: [{...}]    // optional
		}
	]}
/>
```

---

## Hierarchical Subsections

When a block has related variants (like sizes, themes, layouts), use hierarchical structure.

### Structure Pattern

```svelte
<!-- Parent Block -->
<div>
	<BlockExample
		title="Parent Block"
		description="Main block description"
		component="block-name"
		code={ParentCodeRaw}
	>
		<!-- Preview -->
	</BlockExample>

	<!-- Subsection -->
	<div class="mt-8 ml-8 border-l-2 border-border pl-8">
		<h4 class="text-xl font-semibold mb-4">Subsection Name</h4>
		<BlockExample
			description="Subsection description"
			component="block-name"
			code={SubsectionCodeRaw}
		>
			<!-- Preview -->
		</BlockExample>
	</div>
</div>
```

### Visual Hierarchy Indicators

- **Indent**: `ml-8` (2rem left margin)
- **Border**: `border-l-2 border-border` (left border indicator)
- **Padding**: `pl-8` (2rem left padding)
- **Heading**: `h4` instead of using `title` prop (smaller heading)
- **Grouping**: Wrap parent + subsection in `<div>`

### When to Use Hierarchical Subsections

✅ **Use hierarchical subsections when:**
- Variants are tightly coupled (e.g., size options for same block)
- Showing capability of parent block (e.g., "Sizes" under "Medium")
- Teaching progressive complexity (basic → advanced)

❌ **Don't use hierarchical subsections when:**
- Blocks are independent concepts (Portrait vs Hero vs Neon)
- Different use cases or design patterns
- No clear parent-child relationship

### Example: ArticleCard Medium > Sizes

```
## Medium (h3 via BlockExample title)
   [Preview of default medium size]
   [Code showing medium structure]
   [Install tab]

   ### Sizes (h4 via direct heading)
      [Preview showing all three sizes]
      [Code showing size variants]
      [Install tab for same component]
```

This creates a clear hierarchy showing that "Sizes" is a capability of "Medium", not a separate block.

---

## Import Patterns

### Page-Level Imports

**Block Components (for Preview tab):**
```svelte
import {
	ArticleCardPortrait,
	ArticleCardHero,
	ArticleCardNeon
} from '$lib/ndk/blocks';
```

**Code Examples (for Code tab):**
```svelte
import PortraitCodeRaw from './examples/portrait-code.svelte?raw';
import HeroCodeRaw from './examples/hero-code.svelte?raw';
import NeonCodeRaw from './examples/neon-code.svelte?raw';
```

**UI Examples:**
```svelte
import UIBasic from './examples/ui-basic.svelte';
import UIBasicRaw from './examples/ui-basic.svelte?raw';
import UIComposition from './examples/ui-composition.svelte';
import UICompositionRaw from './examples/ui-composition.svelte?raw';
```

**Infrastructure:**
```svelte
import BlockExample from '$site-components/block-example.svelte';
import UIExample from '$site-components/ui-example.svelte';
import ComponentAPI from '$site-components/component-api.svelte';
```

### Why Separate Code Files?

1. **Single Responsibility**: Preview components show real usage, code files show structure
2. **Maintainability**: Update block implementation without touching examples
3. **Clarity**: Code examples are explicitly simplified, not magical
4. **Consistency**: Every block follows same pattern

---

## Complete Checklist

Use this checklist before marking any component page as complete.

### 📋 Structure Checklist

- [ ] Header section with title, subtitle, EditProps
- [ ] Blocks section with description
- [ ] UI Components section with description
- [ ] Builder section (if applicable)
- [ ] Component API section
- [ ] Builder API section (if applicable)
- [ ] Sections in correct order

### 📋 Blocks Section Checklist

- [ ] Each block uses `BlockExample` component
- [ ] All blocks have `title` prop
- [ ] All blocks have `description` explaining WHEN to use
- [ ] All blocks have `component` prop for install
- [ ] Code examples imported as `?raw`
- [ ] Preview shows actual block component
- [ ] Code shows simplified structure (no script/imports)
- [ ] Hierarchical subsections properly indented
- [ ] Subsections use h4, not BlockExample title
- [ ] Related blocks grouped under parent

### 📋 Code Simplification Checklist

- [ ] No `<script>` tags in code examples
- [ ] No `import` statements
- [ ] No prop declarations (`let { } = $props()`)
- [ ] No decorative SVG (unless structural)
- [ ] No unnecessary comments
- [ ] No event handlers (unless structural)
- [ ] Shows component composition clearly
- [ ] Uses Tailwind v4 classes
- [ ] Focuses on structure, not implementation

### 📋 UI Components Section Checklist

- [ ] Minimum 3 examples (Basic, Composition, Styling)
- [ ] Each example uses `UIExample` component
- [ ] Examples demonstrate composition flexibility
- [ ] Examples show different styling approaches
- [ ] Code examples show full composable pattern
- [ ] Clear progression from simple to complex

### 📋 Component API Checklist

- [ ] All primitive components documented
- [ ] All block components documented
- [ ] Primitives listed before blocks
- [ ] Each component has import path
- [ ] All props have type, description
- [ ] Optional props have default values
- [ ] Required props marked with `required: true`
- [ ] No legacy/deprecated props
- [ ] Events documented (if applicable)
- [ ] Slots documented (if applicable)

### 📋 File Organization Checklist

- [ ] Page at `src/routes/components/[name]/+page.svelte`
- [ ] Examples in `src/routes/components/[name]/examples/`
- [ ] Block preview files: `[variant].svelte`
- [ ] Block code files: `[variant]-code.svelte`
- [ ] UI examples: `ui-[purpose].svelte`
- [ ] Primitives in `src/lib/ndk/[name]/`
- [ ] Blocks in `src/lib/ndk/blocks/`
- [ ] Proper exports in index.ts files

### 📋 Import Patterns Checklist

- [ ] Blocks imported from `$lib/ndk/blocks`
- [ ] Primitives imported from `$lib/ndk/[component]`
- [ ] Code examples imported with `?raw`
- [ ] UI examples imported as components + raw
- [ ] Infrastructure components from `$site-components`
- [ ] No unused imports

### 📋 Quality Checklist

- [ ] Page builds without errors
- [ ] All tabs function correctly
- [ ] Install commands are correct
- [ ] EditProps works with sample data
- [ ] No console errors
- [ ] Responsive design works
- [ ] Follows Tailwind v4 conventions
- [ ] No backwards compatibility code
- [ ] No TODOs or technical debt comments

### 📋 Documentation Checklist

- [ ] Title is clear and matches component name
- [ ] Subtitle explains purpose and use cases
- [ ] Block descriptions explain WHEN to use
- [ ] UI example descriptions explain WHAT they demonstrate
- [ ] API descriptions are actionable
- [ ] No jargon without explanation
- [ ] Consistent terminology throughout

---

## Examples

### Minimal Component Page

For a simple component with only primitives:

```svelte
<script lang="ts">
	import { getContext } from 'svelte';
	import { Component } from '$lib/ndk/component';
	import { EditProps } from '$lib/ndk/edit-props';
	import UIExample from '$site-components/ui-example.svelte';
	import ComponentAPI from '$site-components/component-api.svelte';

	import UIBasic from './examples/ui-basic.svelte';
	import UIBasicRaw from './examples/ui-basic.svelte?raw';

	const ndk = getContext('ndk');
	let sample = $state();
</script>

<div class="container mx-auto p-8 max-w-7xl">
	<!-- Header -->
	<div class="mb-12">
		<h1 class="text-4xl font-bold mb-4">Component</h1>
		<p class="text-lg text-muted-foreground mb-6">
			Description of what this component does.
		</p>

		<EditProps.Root>
			<EditProps.Prop name="Sample" type="type" bind:value={sample} />
		</EditProps.Root>
	</div>

	<!-- UI Components Section -->
	<section class="mb-16">
		<h2 class="text-3xl font-bold mb-2">UI Components</h2>
		<p class="text-muted-foreground mb-8">
			Primitive components for building custom layouts.
		</p>

		<div class="space-y-8">
			<UIExample title="Basic Usage" code={UIBasicRaw}>
				<UIBasic {ndk} {sample} />
			</UIExample>
		</div>
	</section>

	<!-- Component API -->
	<ComponentAPI components={[...]} />
</div>
```

### Full Component Page

For a component with blocks, primitives, and builder:

```svelte
<script lang="ts">
	import { getContext } from 'svelte';
	import { Component } from '$lib/ndk/component';
	import { ComponentBlock1, ComponentBlock2 } from '$lib/ndk/blocks';
	import { EditProps } from '$lib/ndk/edit-props';
	import BlockExample from '$site-components/block-example.svelte';
	import UIExample from '$site-components/ui-example.svelte';
	import ComponentAPI from '$site-components/component-api.svelte';

	import Block1CodeRaw from './examples/block1-code.svelte?raw';
	import Block2CodeRaw from './examples/block2-code.svelte?raw';

	import UIBasic from './examples/ui-basic.svelte';
	import UIBasicRaw from './examples/ui-basic.svelte?raw';

	const ndk = getContext('ndk');
	let sample = $state();
</script>

<div class="container mx-auto p-8 max-w-7xl">
	<!-- Header -->
	<div class="mb-12">
		<h1 class="text-4xl font-bold mb-4">Component</h1>
		<p class="text-lg text-muted-foreground mb-6">
			Description of what this component does and when to use it.
		</p>

		<EditProps.Root>
			<EditProps.Prop name="Sample" type="type" bind:value={sample} />
		</EditProps.Root>
	</div>

	<!-- Blocks Section -->
	<section class="mb-16">
		<h2 class="text-3xl font-bold mb-2">Blocks</h2>
		<p class="text-muted-foreground mb-8">
			Pre-composed layouts ready to use. Install with a single command.
		</p>

		<div class="space-y-12">
			<BlockExample
				title="Block1"
				description="When to use this block"
				component="component-block1"
				code={Block1CodeRaw}
			>
				<ComponentBlock1 {ndk} {sample} />
			</BlockExample>

			<BlockExample
				title="Block2"
				description="When to use this block"
				component="component-block2"
				code={Block2CodeRaw}
			>
				<ComponentBlock2 {ndk} {sample} />
			</BlockExample>
		</div>
	</section>

	<!-- UI Components Section -->
	<section class="mb-16">
		<h2 class="text-3xl font-bold mb-2">UI Components</h2>
		<p class="text-muted-foreground mb-8">
			Primitive components for building custom layouts.
		</p>

		<div class="space-y-8">
			<UIExample
				title="Basic Usage"
				description="Start with Component.Root and add primitives."
				code={UIBasicRaw}
			>
				<UIBasic {ndk} {sample} />
			</UIExample>
		</div>
	</section>

	<!-- Component API -->
	<ComponentAPI components={[...]} />
</div>
```

### Hierarchical Subsection Example

```svelte
<!-- Medium Block with Sizes subsection -->
<div>
	<BlockExample
		title="Medium"
		description="Horizontal card layout with image on right."
		component="component-medium"
		code={MediumCodeRaw}
	>
		<ComponentMedium {ndk} {sample} />
	</BlockExample>

	<!-- Sizes subsection -->
	<div class="mt-8 ml-8 border-l-2 border-border pl-8">
		<h4 class="text-xl font-semibold mb-4">Sizes</h4>
		<BlockExample
			description="Medium layout supports three size options: small, medium, and large."
			component="component-medium"
			code={MediumSizesCodeRaw}
		>
			<ComponentMedium {ndk} {sample} imageSize="small" />
			<ComponentMedium {ndk} {sample} imageSize="medium" />
			<ComponentMedium {ndk} {sample} imageSize="large" />
		</BlockExample>
	</div>
</div>
```

---

## Version History

### v3.0 (2025-01-29)
- Added hierarchical subsection guidelines
- Added code simplification rules
- Added complete checklist
- Added infrastructure component specs
- Established as canonical reference

### v2.0 (2025-01-29)
- Initial structured guidelines
- Basic page structure defined
- File organization established

---

## Enforcement

These guidelines are **mandatory** for all component pages. Any page not following these guidelines is considered incomplete and must be refactored.

When reviewing component pages:
1. Use the Complete Checklist section
2. Mark each item as you verify
3. Do not approve until ALL items are checked
4. Refactor immediately if guidelines are violated

**Remember:** Consistency is more valuable than individual creativity. Follow the guidelines exactly.

---

**Questions or improvements?** These guidelines are living documentation. If you find gaps or improvements, update this document and increment the version number.
