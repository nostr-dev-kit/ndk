# @nostr/svelte Component Registry

A comprehensive collection of beautiful, production-ready Svelte 5 components for building Nostr applications. Built on NDK and distributed through jsrepo.

## What is @nostr/svelte?

The @nostr/svelte registry provides a curated set of UI components, hooks, utilities, and complete blocks specifically designed for Nostr applications. All components are:

- **Svelte 5 Native** - Built from the ground up using Svelte 5 runes
- **NDK Powered** - Deep integration with [@nostr-dev-kit/svelte](https://github.com/nostr-dev-kit/ndk)
- **Tailwind Styled** - Beautiful, customizable designs using Tailwind CSS v4
- **Production Ready** - Battle-tested components used in real applications
- **Copy & Paste** - Install individual components via jsrepo, not a monolithic package

## Component Categories

The registry includes a comprehensive collection of components organized into categories:

- **🧱 Blocks** - Complete, ready-to-use UI sections like login interfaces and thread viewers
- **🎨 Components** - Individual UI components for users, articles, events, hashtags, highlights, media, and more
- **🎯 UI Primitives** - Low-level, composable building blocks for custom layouts
- **🪝 Hooks** - Reactive hooks for common Nostr patterns
- **🛠️ Utilities** - Helper functions for formatting, parsing, and data manipulation
- **🎭 Icons** - Optimized Svelte icon components

To see all available components, run:

```bash
jsrepo info @nostr/svelte
```

Or browse the [component showcase](#) to see live examples and documentation for each component.

## Quick Start

### Prerequisites

- Node.js 18+ or Bun
- A SvelteKit project with Svelte 5
- Tailwind CSS v4 (recommended)

### Installation

1. **Install jsrepo CLI**

```bash
npm install -g jsrepo
# or
bun add -g jsrepo
```

2. **Initialize jsrepo in your project**

```bash
jsrepo init @nostr/svelte
```

This creates a `jsrepo.json` configuration file in your project.

3. **Install NDK dependencies**

```bash
npm install @nostr-dev-kit/ndk @nostr-dev-kit/svelte
# or
bun add @nostr-dev-kit/ndk @nostr-dev-kit/svelte
```

4. **Add components**

```bash
jsrepo add components/user-card ui/user
```

5. **Use the components**

```svelte
<script lang="ts">
  import { ndk } from '$lib/ndk';
  import { User } from '$lib/components/ui/user';

  const profile = ndk.$fetchProfile(() => pubkey);
</script>

<User.Root {pubkey}>
  <User.Avatar />
  <User.Name />
  <User.Nip05 />
</User.Root>
```

## Documentation

For comprehensive installation instructions, configuration options, and component documentation, visit:

- **Installation Guide**: `/docs/installation` (in the showcase app)
- **Component Examples**: Browse the showcase at [your-deployed-url]
- **NDK Documentation**: [NDK Svelte Guide](https://github.com/nostr-dev-kit/ndk)

## jsrepo Registry

This registry is published to [jsrepo.com](https://jsrepo.com) as `@nostr/svelte`.

To explore all available components:

```bash
jsrepo info @nostr/svelte
```

## Development

This repository contains both the component registry and a showcase application.

### Project Structure

```
registry/
├── src/
│   ├── lib/
│   │   ├── registry/          # Component source code
│   │   │   ├── components/    # UI components
│   │   │   ├── ui/            # UI primitives
│   │   │   ├── blocks/        # Complete UI blocks
│   │   │   ├── builders/      # Component builders
│   │   │   ├── hooks/         # Svelte hooks
│   │   │   ├── utils/         # Utility functions
│   │   │   └── icons/         # Icon components
│   │   └── site-components/   # Showcase components
│   └── routes/                # Showcase pages
├── jsrepo.json                # jsrepo project config
├── jsrepo-build-config.json   # jsrepo registry config
└── jsrepo-manifest.json       # Generated manifest
```

### Building the Registry

```bash
# Generate registry manifest
bun run registry:update

# Build registry for jsrepo
jsrepo build
```

### Publishing to jsrepo

```bash
jsrepo publish
```

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

## License

MIT

## Credits

Built with ❤️ by the Nostr community, powered by [NDK](https://github.com/nostr-dev-kit/ndk) and distributed via [jsrepo](https://jsrepo.com).
