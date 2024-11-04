# Sweeping NIP-61 nutzaps
When a user receives a nutzap, they should sweep the public tokens into their wallet, the `@nostr-dev-kit/ndk-wallet` package takes care of this for you when
the `NDKWalletService` is running by default.

```typescript
const walletService = new NDKWalletService(ndk);
walletService.start();
walletService.on("nutzap", (nutzap: NDKNutzap) => {
    console.log("Received a nutzap from " + nutzap.pubkey + " for " + nutzap.amount + " " + nutzap.unit + " on mint " + nutzap.mint);
    // -> Received a nutzap from fa98..... for 1 usd on mint https://...
});
```

