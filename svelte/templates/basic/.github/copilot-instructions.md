# AI Coding Agent Guidelines for NDK Svelte Template

## Project Overview
This project is a modern Svelte 5 template designed for building Nostr applications using the NDK (Nostr Development Kit). It includes features like multi-account support, relay management, and profile pages. The project uses TypeScript, TailwindCSS, and Playwright for testing.

## Architecture
- **SvelteKit**: The project is built on SvelteKit, leveraging its routing and server-side rendering capabilities.
- **NDK Integration**: The `src/lib/stores/ndk.svelte.ts` file initializes the NDK instance, manages relays, and handles caching.
- **UI Components**: Reusable components are located in `src/lib/components/ui/`.
- **Routes**:
  - `src/routes/+page.svelte`: Home page with feed and note publishing.
  - `src/routes/p/[id]/+page.svelte`: Profile pages for Nostr users.

## Developer Workflows
### Installation
```bash
bun install
```

### Development
```bash
bun run dev
```
Access the app at [http://localhost:5173](http://localhost:5173).

### Build
```bash
bun run build
```

### Testing
Run Playwright tests:
```bash
bun run test
```
Run tests in UI mode:
```bash
bun run test:ui
```

## Project-Specific Conventions
- **State Management**: Use `$state` for reactive variables and `$derived` for derived stores.
- **NDK Sessions**: Managed in `src/lib/stores/ndk.svelte.ts`. Use `ndk.$sessions` for session handling.
- **Relay Management**: Add/remove relays dynamically using `ndk.addExplicitRelay` and `ndk.pool.relays`.
- **Profile Pages**: Support multiple identifier formats (e.g., `npub`, `nprofile`, `NIP-05`, hex).

## Key Files and Directories
- `src/lib/stores/ndk.svelte.ts`: NDK initialization and relay management.
- `src/lib/components/`: Reusable UI components.
- `src/routes/`: SvelteKit routes.
- `tests/`: Playwright test files.
- `tailwind.config.js`: TailwindCSS configuration.

## External Dependencies
- **NDK**: Core library for Nostr development.
- **TailwindCSS**: Utility-first CSS framework.
- **Playwright**: End-to-end testing framework.

## Examples
### Adding a New Relay
```ts
const relay = ndk.addExplicitRelay('wss://relay.example.com');
await relay.connect();
```

### Fetching Profile Data
```ts
const identifier = $derived(npub);
const user = ndk.$fetchUser(() => identifier);
const profile = ndk.$fetchProfile(() => user?.pubkey);
```

### Customizing Theme
Edit `src/app.css` to modify CSS variables for theming.

## Notes
- Follow the existing patterns for state management and component structure.
- Ensure all new features are covered by Playwright tests.
- Use `$state` and `$derived` for reactive and derived state management.