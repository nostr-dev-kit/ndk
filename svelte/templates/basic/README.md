# NDK Svelte Template - Basic

A modern Svelte 5 template for building Nostr applications with NDK.

## Features

- 🚀 **Svelte 5** with runes and the latest features
- 🎨 **shadcn-svelte** for beautiful UI components
- 👥 **Multi-account Support** - Switch between multiple Nostr accounts
- 🔌 **Relay Management** - Add, remove, and monitor relay connections
- 👤 **Profile Pages** - Beautiful profile views at `/p/<npub|nip05|hex>`
- 🎯 **TypeScript** - Full type safety
- ⚡ **Vite** - Lightning fast development

## Getting Started

### Installation

```bash
bun install
```

### Development

```bash
bun run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build

```bash
bun run build
```

### Preview

```bash
bun run preview
```

## Features Guide

### Multi-Account Support

- Login with NIP-07 browser extensions (Alby, nos2x, etc.)
- Login with private key (nsec or hex)
- Switch between multiple accounts
- Persistent sessions in localStorage

### Relay Management

- View all connected relays with status
- Add new relays dynamically
- Remove relays
- Real-time connection status

### Profile Pages

Visit any profile at `/p/<identifier>` where identifier can be:
- `npub1...` - Nostr public key (bech32)
- `nprofile1...` - Nostr profile (bech32 with relay hints)
- `user@domain.com` - NIP-05 identifier
- Hex public key

Profile pages display:
- Profile picture and banner
- Display name and NIP-05 verification
- Bio and website
- Follower/following counts
- Recent notes

## Project Structure

```
src/
├── lib/
│   ├── components/
│   │   ├── ui/          # shadcn-svelte components
│   │   ├── Header.svelte
│   │   ├── AccountSwitcher.svelte
│   │   └── RelayManager.svelte
│   ├── stores/
│   │   ├── ndk.svelte.ts      # NDK instance and relay management
│   │   └── sessions.svelte.ts  # Multi-account session management
│   └── utils.ts
├── routes/
│   ├── +layout.svelte
│   ├── +page.svelte
│   └── p/[id]/+page.svelte    # Profile pages
└── app.css
```

## Testing

Run Playwright tests:

```bash
bun run test
```

Run tests in UI mode:

```bash
bun run test:ui
```

## Customization

### Theme

Edit `src/app.css` to customize the color scheme. The template uses CSS variables for theming.

### Relays

Default relays are configured in `src/lib/stores/ndk.svelte.ts`. Modify the `explicitRelayUrls` array to change the default relay set.

## License

MIT
