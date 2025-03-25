# Connect Nostr Wallet Connect (NWC)

This snippet demonstrates how to connect a Nostr Wallet Connect (NWC) wallet to NDK and use it for zapping.

```typescript
import NDK from "@nostr-dev-kit/ndk";
import { 
    NDKNWCWallet,
    NDKWalletStatus
} from "@nostr-dev-kit/ndk-wallet";

// Connect using NWC pairing code
// Format: nostr+walletconnect://{pubkey}?relay={relay_url}&secret={secret}
const pairingCode = "nostr+walletconnect://npub...?relay=wss://relay.example.com&secret=nsec...";

// Initialize NWC wallet with pairing code
const wallet = new NDKNWCWallet(ndk, { 
    pairingCode,
    // Optional timeout for operations
    timeout: 30000
});

// Set up event listeners
wallet.on("ready", () => {
    console.log("NWC wallet is ready for zapping");
});

// Listen for balance updates
wallet.on("balance_updated", (balance) => {
    console.log("Balance updated:", balance?.amount || 0, "sats");
});

// Assign wallet to NDK instance for zapping
ndk.wallet = wallet;

// Wait for wallet to be ready
if (wallet.status !== NDKWalletStatus.READY) {
    await new Promise<void>((resolve) => {
        wallet.once("ready", () => resolve());
    });
}

console.log("NWC wallet connected successfully");

## Notes

- The wallet must be assigned to the NDK instance with `ndk.wallet = wallet` for zaps to work properly