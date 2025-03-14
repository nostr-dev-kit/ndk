# @nostr-dev-kit/ndk-wallet

A wallet toolkit for the Nostr ecosystem, providing implementations for NIP-47 (NWC), NIP-57 (Zaps), and NIP-60 (Cashu eCash) wallets.

## Overview

The `ndk-wallet` package extends NDK with wallet capabilities, allowing applications to manage and interact with various wallet types in the Nostr ecosystem. Key features include:

- **NIP-60 Wallet**: Implementation of Cashu eCash wallets for Nostr
- **Nutzap Monitor**: Automated monitoring and redemption of Nutzaps (NIP-60 zaps)
- **NWC Client**: For interacting with wallets via Nostr Wallet Connect (NIP-47)
- **Zap Support**: For sending and receiving Lightning zaps (NIP-57)

## Components

### Wallet Base (`NDKWallet`)

The `NDKWallet` interface serves as the foundation for all wallet implementations, providing a common API for:

- Retrieving balances
- Sending and receiving payments
- Interacting with wallet events
- Managing wallet status

### Cashu Wallet (`NDKCashuWallet`)

The `NDKCashuWallet` implements the NIP-60 specification, providing a fully-featured Cashu eCash wallet:

- Token management and validation
- Sending and receiving tokens via nutzaps
- Mint interaction and token issuance
- Proofs handling and validation
- Backup and restore functionality

```typescript
import { NDKCashuWallet } from "@nostr-dev-kit/ndk-wallet";

// Create a Cashu wallet
const wallet = new NDKCashuWallet(ndk);

// Add mints
wallet.addMint("https://mint.example.com");

// Get wallet balance
const balance = await wallet.getBalance();
```

### Nutzap Monitor (`NDKNutzapMonitor`)

The `NDKNutzapMonitor` automatically monitors and processes nutzaps (NIP-60 zaps) for a user:

- Listens for incoming nutzaps
- Manages nutzap states
- Redeems tokens when appropriate private keys are available
- Persists nutzap states across sessions using a customizable store

```typescript
import { NDKNutzapMonitor } from "@nostr-dev-kit/ndk-wallet";

// Create a monitor
const monitor = new NDKNutzapMonitor(ndk, user, { mintList, store });

// Set wallet and start monitoring
monitor.wallet = myCashuWallet;
await monitor.start();
```

For detailed information on using the Nutzap Monitor, see [Nutzap Monitor Documentation](./docs/nutzap-monitor.md).

### NWC Client (`NDKWalletNWC`)

The `NDKWalletNWC` implements the NIP-47 specification for Nostr Wallet Connect:

- Connect to NWC-compatible wallets
- Send payment requests
- Query wallet information
- Handle payment responses

```typescript
import { NDKWalletNWC } from "@nostr-dev-kit/ndk-wallet";

// Create an NWC wallet
const wallet = new NDKWalletNWC(ndk, nwcConnectionInfo);

// Pay an invoice
await wallet.pay({ invoice: "lnbc..." });
```

## State Management

The wallet components use state management patterns to track the status of operations:

- `NDKCashuWallet` tracks token states, mint connections, and wallet status
- `NDKNutzapMonitor` implements a state machine for tracking nutzap processing
- State stores provide persistent storage options

## Events

All wallet components emit events that applications can listen to:

- Balance changes
- Payment events
- State transitions
- Errors and warnings

```typescript
wallet.on("balance_changed", (newBalance) => {
    console.log(`New balance: ${newBalance}`);
});
```

## Documentation

For more detailed documentation on specific components:

- [NIP-60 Cashu Wallet](./docs/cashu-wallet.md)
- [Nutzap Monitor](./docs/nutzap-monitor.md)
- [Nutzap Monitor State Store](./docs/nutzap-monitor-state-store.md)
- [NWC Client](./docs/nwc-client.md)

## Installation

```bash
npm install @nostr-dev-kit/ndk-wallet
```

## Requirements

- `@nostr-dev-kit/ndk`: Peer dependency
- Modern browser or Node.js environment

## License

MIT
