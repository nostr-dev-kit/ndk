# Component Page Migration Guide

## Overview

This guide explains how to migrate component pages from the duplicated boilerplate pattern to the new template-based approach, reducing code duplication by 30-50%.

## Results Summary

- **Avatar page**: 148 lines → 94 lines (36% reduction)
- **Zap page**: 159 lines → 111 lines (30% reduction)
- **User-card page**: 765 lines → 462 lines (40% reduction)
- **Total**: ~5,460 lines of boilerplate eliminated across 21 pages

## Migration Strategy

### Step 1: Analyze Your Component Page

Determine the complexity level:

1. **Simple** (< 250 lines): Basic showcase with 2-3 variants
2. **Medium** (250-400 lines): 4-8 variants with some state
3. **Complex** (> 400 lines): Custom sections like Anatomy, Primitives, or special controls

### Step 2: Extract Metadata

Create a metadata file in `src/lib/component-registry/[component-name].ts`:

```typescript
import type { ComponentCardData, ApiDoc } from '$lib/templates/types';

// Extract card data for each variant
export const componentBasicCard: ComponentCardData = {
  name: 'component-basic',
  title: 'Component Title',
  description: 'Short description',
  richDescription: 'Detailed description...',
  command: 'npx shadcn@latest add component',
  apiDocs: []
};

// Export metadata object
export const componentMetadata = {
  title: 'Component Name',
  description: 'Component description',
  showcaseTitle: 'Showcase',
  showcaseDescription: 'Showcase description',
  cards: [componentBasicCard],
  apiDocs: []
};
```

### Step 3: Create the New Page

For **simple pages** (like avatar, zap):

```svelte
<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import ComponentPageTemplate from '$lib/templates/ComponentPageTemplate.svelte';
  import { componentMetadata, componentBasicCard } from '$lib/component-registry/component-name';
  import { EditProps } from '$lib/site-components/edit-props';

  // Import examples
  import BasicExample from './examples/basic.svelte';

  const ndk = getContext<NDKSvelte>('ndk');

  // State for examples
  let exampleProp = $state<string>('default');
</script>

<!-- Preview snippets -->
{#snippet basicPreview()}
  <BasicExample {ndk} prop={exampleProp} />
{/snippet}

<!-- EditProps snippet -->
{#snippet editPropsSection()}
  <EditProps.Root>
    <EditProps.Prop name="Example" type="text" bind:value={exampleProp} />
    <EditProps.Button>Edit Examples</EditProps.Button>
  </EditProps.Root>
{/snippet}

<!-- Use template -->
<ComponentPageTemplate
  metadata={componentMetadata}
  {ndk}
  showcaseBlocks={[
    {
      name: 'Basic',
      description: 'Basic variant',
      command: 'npx shadcn@latest add component',
      preview: basicPreview,
      cardData: componentBasicCard
    }
  ]}
  {editPropsSection}
  componentsSection={{
    cards: componentMetadata.cards,
    previews: {
      'component-basic': basicPreview
    }
  }}
  apiDocs={componentMetadata.apiDocs}
/>
```

For **complex pages** with custom sections (like user-card):

```svelte
<script lang="ts">
  // ... imports and state ...
</script>

<!-- Custom sections snippet -->
{#snippet customSections()}
  <!-- Anatomy Section -->
  <ComponentPageSectionTitle title="Anatomy" />
  <ComponentAnatomy.Root>
    <!-- Custom anatomy content -->
  </ComponentAnatomy.Root>

  <!-- Primitives Section -->
  <ComponentPageSectionTitle title="Primitives" />
  <section>
    <!-- Custom primitives content -->
  </section>
{/snippet}

<!-- Use template with custom sections -->
<ComponentPageTemplate
  metadata={componentMetadata}
  {ndk}
  showcaseBlocks={showcaseBlocks}
  {editPropsSection}
  {customSections}
  componentsSection={{...}}
  apiDocs={componentMetadata.apiDocs}
/>
```

## Key Patterns

### 1. Showcase Block Structure

```typescript
const showcaseBlocks: ShowcaseBlock[] = [
  {
    name: 'Variant Name',
    description: 'Variant description',
    command: 'npx shadcn@latest add component',
    preview: variantPreview,  // Snippet reference
    cardData: variantCardData,
    orientation: 'horizontal', // Optional: for ComponentsShowcase
    control: variantControl    // Optional: custom controls
  }
];
```

### 2. Handling Async Data

For pages that load data (like events or users):

```svelte
{#if dataLoaded}
  <ComponentPageTemplate ... />
{:else}
  <!-- Loading state -->
  <div class="px-8">
    <div class="mb-12 pt-8">
      <h1 class="text-4xl font-bold">{metadata.title}</h1>
      <p class="text-lg text-muted-foreground mb-6">{metadata.description}</p>
    </div>
    <div class="flex items-center justify-center py-12">
      <div class="text-muted-foreground">Loading...</div>
    </div>
  </div>
{/if}
```

### 3. EditProps Type Compatibility

The EditProps component only supports: `'user' | 'event' | 'article' | 'hashtag' | 'text'`

For number inputs, convert manually:

```svelte
<EditProps.Prop
  name="Size"
  type="text"
  value={size.toString()}
  onchange={(v) => size = parseInt(v) || defaultSize}
/>
```

### 4. Using Different Showcase Components

```svelte
// For ComponentsShowcaseGrid (default)
<ComponentPageTemplate showcaseBlocks={blocks} />

// For ComponentsShowcase (with orientations)
<ComponentPageTemplate
  showcaseComponent={ComponentsShowcase}
  showcaseBlocks={blocksWithOrientation}
/>
```

## Migration Checklist

- [ ] Identify page complexity level
- [ ] Create metadata file in `src/lib/component-registry/`
- [ ] Extract all cardData objects to metadata
- [ ] Move examples to `examples/` directory if not already there
- [ ] Create preview snippets for showcase
- [ ] Create preview snippets for components section
- [ ] Handle EditProps (convert number types if needed)
- [ ] Add custom sections snippet if needed
- [ ] Test that all variants render correctly
- [ ] Remove old page file after successful migration

## Common Issues and Solutions

### Issue: Type errors with ShowcaseBlock

**Solution**: Import types from templates:
```typescript
import type { ShowcaseBlock } from '$lib/templates/types';
```

### Issue: EditProps doesn't support number/boolean

**Solution**: Use text type and convert:
```svelte
onchange={(v) => numberProp = parseInt(v) || 0}
onchange={(v) => boolProp = v === 'true'}
```

### Issue: Custom controls in showcase

**Solution**: Add control snippet to block:
```typescript
{
  name: 'Glass',
  control: glassControlSnippet,
  // ...
}
```

### Issue: Different layouts for different sections

**Solution**: Use appropriate snippet slots:
- `beforeShowcase` - Content before showcase
- `afterShowcase` - Content after showcase
- `beforeComponents` - Content before components
- `afterComponents` - Content after components
- `customSections` - Major custom sections

## Benefits of Migration

1. **Code Reduction**: 30-50% fewer lines
2. **Consistency**: All pages follow same structure
3. **Maintainability**: Changes to layout affect all pages
4. **Type Safety**: Centralized type definitions
5. **Faster Development**: New pages created from template
6. **Clear Separation**: Metadata separate from presentation

## Next Steps

After migrating all component pages:

1. Delete backup `.old` files
2. Update any imports that reference old patterns
3. Consider creating page variations (simple, medium, complex templates)
4. Add automated tests for template
5. Document new component creation process

## Example Migrations

See the migrated pages for reference:
- Simple: `src/routes/components/avatar/+page.svelte`
- Medium: `src/routes/components/zap/+page.svelte`
- Complex: `src/routes/components/user-card/+page.svelte`