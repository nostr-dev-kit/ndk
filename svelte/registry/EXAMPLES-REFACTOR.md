# Examples Refactoring Guide

This document outlines the pattern for refactoring example files across the NDK Svelte Registry documentation.

## Overview

The new structure separates example files into two distinct types:
1. **Actual Svelte code** (`index.svelte`) - The full component that gets rendered in the preview
2. **Simplified documentation** (`index.txt`) - Cleaned-up code shown to users in docs

## Directory Structure

### Old Structure
```
src/routes/(app)/ui/[component]/examples/
  basic.example.svelte
  advanced.example.svelte
```

### New Structure
```
src/routes/(app)/ui/[component]/examples/
  basic-usage/
    index.svelte      # Full component with all types and implementation
    index.txt         # Simplified version for documentation
  advanced-usage/
    index.svelte
    index.txt
  profile-card/
    index.svelte
    index.txt
```

## File Naming Conventions

### Example Directories
- Use kebab-case for directory names
- Name should be descriptive of what the example demonstrates
- Examples: `basic-usage/`, `profile-composition/`, `profile-card/`, etc.

### Example Files
- `index.svelte` - Always the actual renderable component
- `index.txt` - Always the simplified documentation version

## Content Guidelines

### IMPORTANT: File Sync Comment
**Every index.svelte file MUST include this comment at the top:**

```svelte
<!--
  IMPORTANT: Keep this file in sync with index.txt

  Rules for maintaining sync between index.svelte and index.txt:
  1. Both files must demonstrate the SAME functionality
  2. index.svelte = Full implementation (with TypeScript interfaces, all imports, complete styling)
  3. index.txt = Simplified documentation version with these changes:
     - Remove TypeScript interface definitions
     - Use inline prop destructuring: let { ndk, userPubkey } = $props();
     - Keep only essential imports (remove type imports unless needed)
     - Keep inline classes (class="...") but remove <style> blocks
     - Focus on showing component API usage, not implementation details
     - Keep the core component usage identical between both files

  When you modify this file, you MUST update index.txt to reflect the same changes
  following the simplification rules above.
-->
```

### index.svelte (Actual Component)
This file contains the complete, working implementation:
- Full TypeScript interfaces
- All imports needed
- Complete styling (inline styles if needed)
- All props with proper typing

Example:
```svelte
<script lang="ts">
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { User } from '$lib/registry/ui/user';

  interface Props {
    ndk: NDKSvelte;
    userPubkey: string;
  }

  let { ndk, userPubkey }: Props = $props();
</script>

<div class="border border-gray-200 rounded-xl overflow-hidden bg-white max-w-md">
  <User.Root {ndk} pubkey={userPubkey}>
    <User.Banner class="w-full h-full object-cover" />
    <User.Avatar class="rounded-full" />
    <User.Name class="font-semibold" />
  </User.Root>
</div>

<style>
  /* Any required styles */
</style>
```

### index.txt (Documentation Version)
This file contains simplified code for documentation:
- Remove TypeScript interfaces - use inline prop destructuring
- Keep imports minimal and clear
- Focus on showing component usage, not implementation details
- No need to show complete styling unless it's essential to the example

Example:
```svelte
<script lang="ts">
  import { User } from '$lib/registry/ui/user';

  let { ndk, userPubkey } = $props();
</script>

<User.Root {ndk} pubkey={userPubkey}>
  <User.Avatar class="rounded-full" />
  <User.Name class="font-semibold" />
  <User.Handle class="text-sm text-gray-500" />
</User.Root>
```

## Import Pattern Changes

### Old Import Pattern
```svelte
import Basic from './examples/basic.example.svelte';
import BasicRaw from './examples/basic.example.svelte?raw';
```

### New Import Pattern
```svelte
import Basic from './examples/basic-usage/index.svelte';
import BasicRaw from './examples/basic-usage/index.txt?raw';
```

Key changes:
- Component import uses `index.svelte` (actual component)
- Raw code import uses `index.txt?raw` (simplified documentation)

## Component Usage Changes

### Old Pattern
```svelte
<Demo title="Basic Usage" code={BasicRaw}>
  <Basic {ndk} {userPubkey} />
</Demo>
```

### New Pattern
```svelte
<Preview title="Basic Usage" code={BasicRaw}>
  <Basic {ndk} {userPubkey} />
</Preview>
```

**Important:** Migrate from `<Demo>` to `<Preview>` component when refactoring examples.

## Refactoring Steps

For each page with examples:

1. **Identify Examples**
   - Read the current page file
   - List all example files
   - Determine appropriate naming for each example

2. **Create Directory Structure**
   ```bash
   mkdir -p ./examples/basic-usage
   mkdir -p ./examples/advanced-usage
   # etc.
   ```

3. **Move/Copy Files**
   ```bash
   cp ./examples/basic.example.svelte ./examples/basic-usage/index.svelte
   ```

4. **Create Simplified .txt Versions**
   - Remove interface definitions
   - Simplify prop declarations to inline destructuring
   - Keep only essential imports
   - Remove unnecessary styling
   - Focus on component usage

5. **Update Page Imports**
   - Change component imports to use new directory structure
   - Update raw imports to point to `.txt` files instead of `.svelte?raw`

6. **Test**
   - Run build: `npm run build`
   - Verify examples render correctly
   - Check that code preview shows simplified version

## Example Refactoring: User Component

### Before
```
src/routes/(app)/ui/user/
  +page.svelte
  examples/
    basic.example.svelte
    standalone.example.svelte
    composition.example.svelte
```

Imports in `+page.svelte`:
```svelte
import Basic from './examples/basic.example.svelte';
import BasicRaw from './examples/basic.example.svelte?raw';
```

### After
```
src/routes/(app)/ui/user/
  +page.svelte
  examples/
    basic-usage/
      index.svelte
      index.txt
    profile-composition/
      index.svelte
      index.txt
    profile-card/
      index.svelte
      index.txt
```

Imports in `+page.svelte`:
```svelte
import Basic from './examples/basic-usage/index.svelte';
import BasicRaw from './examples/basic-usage/index.txt?raw';
```

## Benefits of This Structure

1. **Clearer Documentation** - Users see simplified, focused code examples
2. **Separation of Concerns** - Full implementation separate from educational content
3. **Better Organization** - Each example in its own directory
4. **Extensibility** - Easy to add supporting files (README, assets) per example
5. **Consistency** - Standard pattern across all components

## Notes

- Always test build after refactoring
- Check that Preview components receive the correct code snippets
- Ensure .txt files are valid Svelte syntax (they should be!)
- Use descriptive directory names that match the Preview title where possible
- Clean up old `.example.svelte` files after confirming new structure works
