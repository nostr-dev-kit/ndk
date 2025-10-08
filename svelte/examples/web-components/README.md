# Nostr User Card Web Component

A beautiful, framework-agnostic web component for displaying Nostr user profiles, built with Svelte 5.

## Features

- 🎨 **Stunning Design** - Beautiful gradients, animations, and glassmorphism effects
- 🌓 **Theme Support** - Light and dark themes
- ✅ **NIP-05 Verification** - Shows verification badges
- 📱 **Responsive** - Works great on all screen sizes
- 🚀 **Framework Agnostic** - Use with React, Vue, Angular, or vanilla HTML
- ⚡ **Powered by NDK** - Uses the Nostr Development Kit for reliable profile fetching

## Usage

### Installation

```bash
bun install
```

### Development

```bash
bun run dev
```

### Build

```bash
bun run build
```

The built web component will be available in `dist/` and can be used in any HTML page.

### Using the Component

```html
<!-- Include the script -->
<script src="./dist/nostr-user-card.js"></script>

<!-- Use the component -->
<nostr-user-card
  npub="npub1..."
  relays="wss://relay.damus.io,wss://nos.lol"
  theme="dark">
</nostr-user-card>
```

### Attributes

- `npub` (required) - The npub of the user to display
- `relays` (optional) - Comma-separated list of relay URLs (defaults to `wss://relay.damus.io,wss://nos.lol`)
- `theme` (optional) - Either `"light"` or `"dark"` (defaults to `"dark"`)

## Examples

See `index.html` for live examples of both themes.

## License

MIT
