# NDK Svelte 5 Component Browser

An interactive browser for exploring all NDK Svelte 5 components with live demos and prop controls.

## Features

- **11 Components** organized into 4 categories:
  - **User & Content**: Avatar, EventContent
  - **Payments**: ZapButton, TransactionList
  - **Relay Management**: RelayManager, RelayCard, RelayList, RelayPoolTabs, RelayConnectionStatus, RelayAddForm
  - **Media**: BlossomImage

- **Interactive Controls** to modify component props in real-time
- **Live Preview** of each component
- **Dark Theme** with modern, responsive UI
- **Categorized Navigation** for easy browsing

## Running the App

```bash
# From the root of the monorepo
cd svelte/examples/component-browser

# Install dependencies (if not already installed from root)
bun install

# Start dev server
bun run dev
```

Then open http://localhost:5173/ in your browser.

## Components Included

### User & Content
- **Avatar**: Display user avatars with automatic profile fetching
  - Props: `ndk`, `pubkey`, `size`, `class`

- **EventContent**: Render Nostr event content with rich formatting
  - Props: `ndk`, `content`, `class`, `emojiTags`, `event`, `onMentionClick`, `onEventClick`, `onLinkClick`
  - Supports: mentions, links, images, videos, YouTube embeds, custom emojis

### Payments
- **ZapButton**: Send lightning zaps to users or events
  - Props: `target`, `amount`, `comment`, `class`

- **TransactionList**: Display payment transactions
  - Props: `limit`, `direction`

### Relay Management
- **RelayManager**: Complete relay management interface
  - Props: `ndk`, `class`

- **RelayCard**: Display individual relay information
  - Props: `relay`, `onFetchInfo`, `onRemove`, `onBlacklist`, `onUnblacklist`, `onCopyUrl`, `expanded`

- **RelayList**: List of relays with filtering
  - Props: `ndk`

- **RelayPoolTabs**: Tabbed interface for relay pools
  - Props: `ndk`

- **RelayConnectionStatus**: Visual relay connection status indicator
  - Props: `status`, `size`, `showLabel`, `class`

- **RelayAddForm**: Form to add new relays
  - Props: `ndk`, `onAdd`

### Media
- **BlossomImage**: Display images from Blossom CDN with healing
  - Props: `blossom`, `user`, `src`, `alt`, `class`, `width`, `height`
  - Note: Requires `NDKBlossom` instance

## Development

The component browser is a single-file Svelte 5 app (`src/App.svelte`) that imports all components from `@nostr-dev-kit/svelte` and provides interactive controls for each.

To add a new component:
1. Import it in `App.svelte`
2. Add it to the `ComponentName` type union
3. Add it to the appropriate category in `componentCategories`
4. Add a conditional block with demo and controls in the template

## Building

```bash
bun run build
```

The built files will be in the `dist/` directory.
