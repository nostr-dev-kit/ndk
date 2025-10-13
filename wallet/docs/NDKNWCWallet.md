# NWC Client (`NDKWalletNWC`)

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