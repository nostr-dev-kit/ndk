# NIP-60 Wallet Configuration

## Overview

NIP-60 wallets (NDKCashuWallet) store their configuration in an encrypted kind 17375 event that contains:
- Mint URLs
- Private keys
- Relay URLs

## Creating a New Wallet

Use the static `create()` method to create a new wallet with initial configuration:

```typescript
import { NDKCashuWallet } from '@nostr-dev-kit/wallet';

// Create a new wallet with mints and relays
const wallet = await NDKCashuWallet.create(
  ndk,
  ['https://mint.minibits.cash', 'https://mint.coinos.io'], // mints
  ['wss://relay.primal.net', 'wss://relay.damus.io']        // relays (optional)
);

// The wallet is ready to use - it has been published with a backup
```

This method:
1. Creates a new wallet instance
2. Generates a private key
3. Sets mints and relays
4. Publishes the wallet event (kind 17375)
5. Creates and publishes a backup event (kind 375)

## Configuring Mints and Relays

**Important:** Modify the `mints` and `relaySet` properties directly, then call `publish()` to save changes. Do NOT create wrapper methods like `addMint()`, `removeMint()`, `addRelay()`, or `removeRelay()`.

### Adding Mints

```typescript
// Add a single mint
wallet.mints = [...wallet.mints, 'https://mint.example.com'];
await wallet.publish();

// Add multiple mints
wallet.mints = [...wallet.mints, 'https://mint1.com', 'https://mint2.com'];
await wallet.publish();
```

### Removing Mints

```typescript
// Remove a specific mint
wallet.mints = wallet.mints.filter(url => url !== 'https://old-mint.com');
await wallet.publish();

// Replace all mints
wallet.mints = ['https://new-mint.com'];
await wallet.publish();
```

### Configuring Relays

```typescript
// Set wallet relays
wallet.relaySet = NDKRelaySet.fromRelayUrls([
  'wss://relay1.example.com',
  'wss://relay2.example.com'
], ndk);
await wallet.publish();

// Clear wallet relays (falls back to NIP-65 relay list)
wallet.relaySet = undefined;
await wallet.publish();
```

## Complete Example

```typescript
import { NDKCashuWallet, NDKRelaySet } from '@nostr-dev-kit/wallet';

const wallet = new NDKCashuWallet(ndk);

// Configure mints
wallet.mints = [
  'https://mint.minibits.cash',
  'https://mint.coinos.io'
];

// Configure relays
wallet.relaySet = NDKRelaySet.fromRelayUrls([
  'wss://relay.primal.net',
  'wss://relay.damus.io'
], ndk);

// Save configuration
await wallet.publish();
```

## UI Example

See the nutsack example app for a complete UI implementation:
- `svelte/examples/nutsack/src/components/WalletConfigView.svelte`

The example shows:
- Adding/removing mints with validation
- Adding/removing relays
- Detecting unsaved changes
- Save/cancel buttons
- Browsing discovered mints from the network
