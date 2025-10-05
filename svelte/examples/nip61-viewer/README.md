# Nostr Event Viewer Example

A simple Svelte 5 app demonstrating how to subscribe to and display different Nostr event kinds using ndk-svelte5's reactive subscriptions.

## Features

- **Event Kind Selector**: Choose between different event kinds:
  - **NIP-61 Wallet Config (10019)**: Cashu wallet configuration with mints, relays, and P2PK
  - **NIP-65 Relay List (10002)**: User relay list metadata with read/write/both relays
- **NIP-05 Lookup**: Enter a NIP-05 identifier to view that user's events
- **Login**: Use a NIP-07 browser extension to view your own events
- **Reactive Subscriptions**: Uses `subscribeReactive()` to keep an active subscription that automatically updates when new events are published
- **Dynamic Display**: Shows different data based on the selected event kind

## Event Kinds Supported

### NIP-61 Wallet Config (kind 10019)
- `mint` tags: URLs of Cashu mints
- `relay` tags: Relay URLs for the wallet
- `p2pk` or `pubkey` tags: Pay-to-public-key for receiving ecash

### NIP-65 Relay List (kind 10002)
- `r` tags with URLs and optional read/write markers
- Relays are categorized as read-only, write-only, or both

## Running the Example

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev
```

## Usage

1. **Select Event Kind**: Choose which event kind you want to view from the dropdown
2. **Lookup by NIP-05**: Enter a NIP-05 identifier (e.g., `user@domain.com`) and click "Lookup"
3. **View Your Own**: Click "Login & View My Events" to use your NIP-07 extension (Alby, nos2x, etc.)

## Code Structure

- `src/App.svelte` - Main application component with reactive subscriptions
- `src/lib/ndk.ts` - NDK configuration and initialization
- `src/main.ts` - Application entry point

## Key Implementation Details

This example demonstrates:
- Using `ndk.subscribeReactive()` to create live subscriptions to different event kinds
- Using `{@const}` in the template to reactively access subscription data
- Dynamic event parsing based on event kind
- Conditional rendering based on event type
- The subscription automatically updates the UI when new events arrive (no manual polling needed!)
- Proper error handling when no events are found
