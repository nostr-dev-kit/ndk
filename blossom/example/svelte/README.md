# Blossom Upload - Svelte Example

A demonstration app showing how to use `@nostr-dev-kit/svelte` with `@nostr-dev-kit/blossom` for file uploads.

## Features

- 🔐 Multiple authentication methods (NIP-07, private key, generate new key)
- 👤 Multi-session management with session switching
- 📁 File upload to Blossom servers with progress tracking
- 🌐 Blossom server list management (add/remove servers)
- ⚡ Built with Svelte 5 runes for reactive state management

## Getting Started

### Install Dependencies

```bash
bun install
```

### Run Development Server

```bash
bun run dev
```

Open your browser to the URL shown in the terminal (usually http://localhost:5173).

### Build for Production

```bash
bun run build
```

## Usage

1. **Login**: Choose one of the authentication methods:
   - Use a browser extension (nos2x, Alby, etc.)
   - Enter your private key (nsec or hex)
   - Generate a new keypair

2. **Add Blossom Servers**: Once logged in, add one or more Blossom server URLs (e.g., `blossom.oxtr.dev`)

3. **Upload Files**: Select a file and click "Upload File" to upload it to your configured Blossom servers

4. **Session Management**: Switch between multiple logged-in accounts using the "Available Sessions" section

## Key Features Demonstrated

- **Reactive Sessions**: Using `@nostr-dev-kit/svelte/stores` for session management
- **Blossom Upload**: Using `useBlossomUpload()` composable with progress tracking
- **Svelte 5 Runes**: Modern reactive state with `$state`, `$derived`, and `$effect`
- **NDK Integration**: Direct usage of NDK for Nostr interactions

## Code Structure

- `src/App.svelte` - Main application component
- `src/main.ts` - Application entry point
- `src/app.css` - Global styles

## Learn More

- [NDK Documentation](https://github.com/nostr-dev-kit/ndk)
- [@nostr-dev-kit/svelte Documentation](../../svelte/README.md)
- [@nostr-dev-kit/blossom Documentation](../../blossom/README.md)
- [Blossom Protocol](https://github.com/hzrd149/blossom)
