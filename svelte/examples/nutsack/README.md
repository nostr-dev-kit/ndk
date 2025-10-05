# 🥜 Nutsack - Cashu Wallet

A gorgeous, NIP-60 compliant Cashu wallet built with NDK and Svelte 5.

## Features

- 🔐 **NIP-60 Compliant** - Encrypted wallet storage on Nostr relays
- 💰 **Multi-mint Support** - Manage tokens from multiple Cashu mints
- 🎯 **NIP-61 Nutzaps** - Send and receive zaps using Cashu tokens
- 🔒 **End-to-End Encrypted** - Your wallet data is encrypted using NIP-44
- 🚫 **Non-custodial** - You control your keys and tokens
- ⚡ **Real-time Payment Tracking** - See pending transactions immediately with automatic status updates
- 📊 **Unified Transaction History** - View all payments (zaps, nutzaps, cashu transfers) in one place
- ✨ **Gorgeous UI** - Modern, responsive design with smooth animations

## Getting Started

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

Visit http://localhost:5173 to see the app.

## Usage

### First Time Setup

1. **Login Options:**
   - Use a Nostr extension (Alby, nos2x, etc.)
   - Create a new account
   - Import an existing private key

2. **Add a Mint:**
   - Go to Settings
   - Add a mint URL (e.g., `https://nofees.testnut.cashu.space`)

3. **Receive Funds:**
   - For testnet: Use the "Mint (Testnet)" tab to request test sats
   - For real tokens: Paste a Cashu token to redeem

4. **Send Tokens:**
   - Enter amount and optional memo
   - Generate token
   - Share with recipient

## Testnet Mint

The app includes support for the testnet mint at `https://nofees.testnut.cashu.space`. This mint automatically settles deposits, making it perfect for testing.

⚠️ **Note:** Testnet tokens have no real value and are for testing purposes only.

## Architecture

### Built With

- **NDK** - Nostr Development Kit for all Nostr interactions
- **ndk-wallet** - Wallet management with NIP-60/61 support
- **Svelte 5** - Modern reactive framework with runes
- **@nostr-dev-kit/svelte** - Svelte 5 bindings for NDK with payment tracking

### Payment Tracking System

This example showcases the payment tracking system from `@nostr-dev-kit/svelte`, which provides:

- **Automatic Pending Payments** - Transactions appear immediately when initiated, before they complete
- **Multi-source Tracking** - Tracks spending history (kind 7376), nutzaps (kind 9321), and traditional zap receipts (kind 9735)
- **Smart Matching** - Automatically matches receipts to pending payments for seamless status updates
- **Reactive Updates** - Built on Svelte 5 runes for zero-ceremony reactivity

The payment tracking is initialized in `App.svelte` using:
```typescript
import { payments, PaymentMonitor } from '@nostr-dev-kit/svelte';

// Initialize when user logs in
payments.init(ndk, currentUser.pubkey);
const monitor = new PaymentMonitor(ndk, currentUser.pubkey);
monitor.start();
```

Transactions are automatically merged with the wallet history in `useWallet.svelte.ts` for a unified view.

### Key Components

- `WalletView.svelte` - Main wallet interface
- `BalanceCard.svelte` - Balance display with mint breakdown
- `SendView.svelte` - Token generation interface
- `ReceiveView.svelte` - Token redemption and mint requests
- `TransactionList.svelte` - Transaction history
- `SettingsView.svelte` - Mint management and account settings

## NIP Compliance

### NIP-60: Cashu Wallet

- ✅ Encrypted wallet events (kind 37375)
- ✅ Token events (kind 7375)
- ✅ Spending history (kind 7376)
- ✅ Multi-mint support
- ✅ NIP-44 encryption

### NIP-61: Nutzaps

- ✅ Nutzap events (kind 9321)
- ✅ P2PK token locking
- ✅ Mint trust verification

## Development

### Project Structure

```
src/
├── components/
│   ├── BalanceCard.svelte
│   ├── LoginView.svelte
│   ├── ReceiveView.svelte
│   ├── SendView.svelte
│   ├── SettingsView.svelte
│   ├── TransactionList.svelte
│   └── WalletView.svelte
├── lib/
│   └── ndk.ts
├── App.svelte
├── app.css
└── main.ts
```

### Building for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## License

MIT
