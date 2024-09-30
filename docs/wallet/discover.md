# Discover wallets

A user might have configured your application to use a specific wallet (e.g. via WebLN), or they could be
interfacing with your application with a NIP-60 wallet created somewhere else.

Additionally, a user might have NIP-61 nutzaps enabled.

The `NDKWalletService` provides a simple interface to handle these cases:
* Configure + Discover configured wallets
* See NIP-61 nutzaps

## Discovering configured wallets
```typescript
const walletService = new NDKWalletService(ndk);

walletService.start();
walletService.on("wallet", (wallet: NDKWallet, isDefault: boolean) => {
    console.log("Found a wallet of type " + wallet.type, isDefault ? "(default)" : "");
});
```

`walletService.start()` will do the following:
* If you have established a client name via `ndk.clientName`, it will look for a NIP-78 configuration

## Configuring a wallet for your application
```typescript
ndk.clientName = 'my-application';
const walletService = new NDKWalletService(ndk);
const wallet = new NDKWebLNWallet();
await walletService.setDefaultWallet(wallet);
```

`walletService.setDefaultWallet(wallet)` will add to your applications's NIP-78, the configuration to be able to use this wallet next time your application starts, next time your application is initialized, `walletService.start()` will emit a `wallet` event for this wallet.

## Seeing NIP-61 nutzaps
```typescript
const walletService = new NDKWalletService(ndk);
walletService.start();
walletService.on("nutzap", (nutzap: NDKNutzap) => {
    console.log("Received a nutzap from " + nutzap.pubkey + " for " + nutzap.amount + " " + nutzap.unit + " on mint " + nutzap.mint);
    // -> "Received a nutzap from fa98..... for 1 usd on mint https://..."
});
```

