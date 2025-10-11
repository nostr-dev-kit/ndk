
### WebLN Client (`NDKWebLNWallet`)

The `NDKWebLNWallet` implements the NIP-57 specification and allows you to zap using WebLN:

- Connect to WebLn-compatible wallets
- Send payment requests
- Query wallet information
- Handle payment responses

```typescript
import { NDKWebLNWallet } from "@nostr-dev-kit/ndk-wallet";

// Create an WebLN wallet
const wallet = new NDKWebLNWallet(ndk);

// Pay an invoice
await wallet.pay({ invoice: "lnbc..." });