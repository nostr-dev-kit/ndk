# Nutzaps

NDK Wallet provides a robust implementation of NIP-61 nutzaps, which allows users to send and receive Cashu tokens via Nostr events. This guide explains how to monitor and automatically redeem incoming nutzaps.

## Using NDKNutzapMonitor

The `NDKNutzapMonitor` class is responsible for detecting and processing nutzaps automatically:

```ts
import { NDKNutzapMonitor, NDKCashuWallet, NDKUser } from "@nostr-dev-kit/ndk-wallet";

// Create a wallet
const cashuWallet = new NDKCashuWallet(ndk);
await cashuWallet.init();

// Create a user instance
const user = new NDKUser({ pubkey: "user_pubkey_here" });

// Create a nutzap monitor for a specific user
const monitor = new NDKNutzapMonitor(ndk, user);

// Set the wallet for the monitor
monitor.wallet = cashuWallet;

// Optional: Provide known nutzaps to avoid reprocessing
const knownNutzaps = new Set<string>();
// Fill with IDs of nutzaps you've already processed...

// Start monitoring with options
await monitor.start({
    knownNutzaps,
    pageSize: 10,
});

// Listen for various nutzap events
monitor.on("seen", (nutzap) => {
    console.log("Seen a new nutzap:", nutzap.id);
});

monitor.on("redeem", (nutzaps, amount) => {
    console.log(`Redeemed ${nutzaps.length} nutzaps for ${amount} sats`);
});

monitor.on("spent", (nutzap) => {
    console.log("Nutzap was already spent:", nutzap.id);
});

monitor.on("failed", (nutzap, error) => {
    console.log(`Failed to redeem nutzap ${nutzap.id}: ${error}`);
});

// Stop monitoring when done
monitor.stop();
```

## Private Key Management

For nutzap redemption, you need the private key corresponding to the p2pk tag in the nutzap event. The monitor automatically handles private keys when you assign a wallet:

```ts
// Simply assign any wallet type to the monitor
monitor.wallet = cashuWallet;

// The monitor will automatically:
// 1. Use private keys from the assigned wallet
// 2. Use the NDK instance's signer if it's a private key signer
// 3. Load backup keys from kind:375 events authored by the user
```

You typically don't need to manually add private keys as the monitor will extract them from the assigned wallet and cashu wallet backups.

## Custom Mint Handling

You can store/retrieve mint information to avoid doing unnecessary calls.

```ts
// Custom mint info handlers
monitor.onMintInfoNeeded = async (mint: string) => {
    // Load mint info from your database or storage
    return db.getMintInfo(mint);
};

monitor.onMintInfoLoaded = (mint: string, info: GetInfoResponse) => {
    // Save loaded mint info to your database
    db.saveMintInfo(mint, info);
};

// Similar handlers for mint keys
monitor.onMintKeysNeeded = async (mint: string) => {
    return db.getMintKeys(mint);
};

monitor.onMintKeysLoaded = (mint: string, keysets: Map<string, MintKeys>) => {
    db.saveMintKeys(mint, keysets);
};
```

## Technical Flow

1. The monitor starts by loading any backup keys for the user
2. It processes existing nutzaps that haven't been redeemed yet
3. It subscribes to new nutzap events for the user
4. When a nutzap is received:
    - It checks if the nutzap has already been spent
    - If not, it redeems the token using the appropriate private key
    - It emits events for the different stages of processing
