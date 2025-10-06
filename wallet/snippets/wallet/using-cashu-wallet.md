# Using a Cashu Wallet (NIP-60) with NDK

This snippet demonstrates how to create, configure, and use an NDKCashuWallet for managing Cashu tokens.

```typescript
import NDK, { NDKKind, NDKCashuMintList } from "@nostr-dev-kit/ndk";
import { NDKCashuWallet, NDKWalletStatus } from "@nostr-dev-kit/ndk-wallet";

/**
 * Example function to set up an NDKCashuWallet
 */
async function setupCashuWallet(ndk: NDK, mints: string[], relays: string[]) {
    // Create the Cashu wallet instance
    const wallet = new NDKCashuWallet(ndk);
    
    // Add mints to the wallet
    wallet.mints = mints;
    wallet.relays = relays;
    
    // Generate or load a p2pk (Pay-to-Public-Key) token
    // This is used for receiving payments with NIP-61 (nutzaps)
    const p2pk = await wallet.getP2pk();
    console.log(`Wallet p2pk: ${p2pk}`);

    await wallet.publish();
    console.log('published the wallet event')

    // configure reception of NIP-61 nutzaps for the user
    // this publishes an event that tells others who want to zap
    // this user the information they need to publish a NIP-61 nutzap.
    const mintlistForNutzapReception = new NDKCashuMintList(ndk);
    mintlistForNutzapReception.relays = wallet.relays;
    mintlistForNutzapReception.mints = wallet.mints;
    mintlistForNutzapReception.p2pk = wallet.p2pk;
    await mintlistForNutzapReception.publish();
    console.log('published he nutzap mintlist event to receive nutzaps', mintlistForNutzapReception.rawEvent())
    
    return wallet;
}

/**
 * Get balance for a specific mint
 */
function getMintBalance(wallet: NDKCashuWallet, mintUrl: string) {
    const balance = wallet.mintBalance(mintUrl);
    console.log(`Balance for mint ${mintUrl}: ${balance} sats`);
    return balance;
}

/**
 * Check if the user already has a nutsack (NIP-60) wallet.
 **/
async function findExistingWallet(ndk: NDK): Promise<NDKCashuWallet | undefined> {
    const activeUser = ndk.activeUser;

    if (!activeUser) throw "we need a user first, set a signer in ndk";
    
    const event = await ndk.fetchEvent([
        { kinds: [ NDKKind.CashuWallet], authors: [activeUser.pubkey] }
    ])

    // if we receive a CashuWallet event we load the wallet
    if (event) return await NDKCashuWallet.from(event);
}

/**
 * Example usage
 */
async function main() {
    // we assume ndk is already connected and ready
    // ...
    
    let wallet: NDKCashuWallet | undefined;

    wallet = await findExistingWallet(ndk);
    
    // if we don't have a wallet, we create one
    if (!wallet) {
        // List of mints to use
        const mints = [ "https://8333.space:3338" ];

        // Setup the wallet
        wallet = await setupCashuWallet(ndk, mints);
    }

    wallet.on("balance_updated", (balance) => {
        console.log(`Wallet balance updated: ${balance?.amount} sats`);
        // You might want to update your UI here
    });

    wallet.start();
    
    // Example: Check wallet balance
    const totalBalance = wallet.balance?.amount || 0;
    console.log(`Total wallet balance: ${totalBalance} sats`);
    
    // Example: Need to fund wallet?
    // See the Cashu Deposits snippet for funding your wallet with lightning
    
    // Example: Get balance for specific mint
    for (const mint of mints) {
        getMintBalance(wallet, mint);
    }
    
    // Note: For monitoring nutzaps, see the Nutzap Monitor snippet
    
    // Keep the connection open for monitoring
    // In a real app, you'd use proper lifecycle management
}
```

## Notes

- The Cashu wallet implements the NIP-60 specification for Nostr eCash
- The wallet needs to be assigned to the NDK instance with `ndk.wallet = wallet` for full integration
- To receive tokens, you need to generate a p2pk (Pay-to-Public-Key) identifier
- The wallet monitors and processes events continuously while active
- Always handle wallet operations with proper error handling
- For handling nutzaps (Cashu tokens sent via Nostr), see the Nutzap Monitor snippet
- For depositing funds to your wallet, see the Cashu Deposits snippet 