# BlockPreview Component Usage

The `BlockPreview` component displays blocks with a file tree sidebar and code viewer, allowing users to browse and view individual file contents.

## Props

- `title` (string, required): The title of the block preview
- `directory` (string, required): The directory path (currently for reference only)
- `installCommand` (string, required): The installation command to display (e.g., "npx ndk-svelte add login-block")
- `files` (Record<string, string>, required): A map of file paths to their raw content
- `children` (Snippet, required): A Svelte snippet for the preview content
- `class` (string, optional): Additional CSS classes for the container
- `previewAreaClass` (string, optional): Additional CSS classes for the preview area

## Example Usage

### Using Vite's glob import to load files

```svelte
<script lang="ts">
  import BlockPreview from '$lib/site-components/BlockPreview.svelte';
  import LoginBlock from '$lib/registry/blocks/login-block/login-block.svelte';

  // Import all files from the login-block directory
  const fileModules = import.meta.glob(
    '$lib/registry/blocks/login-block/**/*.{svelte,ts,js,json}',
    {
      query: '?raw',
      import: 'default',
      eager: true
    }
  );

  // Convert to the format expected by BlockPreview
  const files: Record<string, string> = {};
  for (const [path, content] of Object.entries(fileModules)) {
    // Extract relative path from the full module path
    const relativePath = path.replace(/^.*blocks\/login-block\//, '');
    files[relativePath] = content as string;
  }
</script>

<BlockPreview
  title="Login Block"
  directory="blocks/login-block"
  installCommand="npx ndk-svelte add login-block"
  files={files}
>
  <LoginBlock />
</BlockPreview>
```

### Manual file specification

```svelte
<script lang="ts">
  import BlockPreview from '$lib/site-components/BlockPreview.svelte';
  import MyComponent from './my-component.svelte';

  // Manually import files as raw strings
  import componentCode from './my-component.svelte?raw';
  import utilsCode from './utils.ts?raw';

  const files = {
    'my-component.svelte': componentCode,
    'utils.ts': utilsCode
  };
</script>

<BlockPreview
  title="My Component"
  directory="components/my-component"
  installCommand="npx ndk-svelte add my-component"
  files={files}
>
  <MyComponent />
</BlockPreview>
```

## Features

- **File Tree Navigation**: Click on folders to expand/collapse them
- **Syntax Highlighting**: Automatically detects file types and applies appropriate syntax highlighting
- **File Selection**: Click on files to view their code
- **Auto-selection**: The first file in the tree is automatically selected on load
- **Installation Command**: Shows the installation command with package manager support
- **Responsive Layout**: The sidebar and code viewer are arranged in a flexible layout

## File Tree Structure

The component automatically builds a hierarchical file tree from the provided files object. Files can be organized in nested directories:

```typescript
const files = {
  'components/button.svelte': '...',
  'components/input.svelte': '...',
  'utils/helpers.ts': '...',
  'types.ts': '...'
};
```

This will create a tree structure like:
```
components/
  ├─ button.svelte
  └─ input.svelte
utils/
  └─ helpers.ts
types.ts
```
