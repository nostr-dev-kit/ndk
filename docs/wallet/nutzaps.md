# Nutzaps

ndk-wallet provides a simple way to automatically redeem nutzaps. You can run this periodically or you can just start it as part of the boostrap of your application

# Sweeping NIP-61 nutzaps

When a user receives a nutzap, they should sweep the public tokens into their wallet, the `@nostr-dev-kit/ndk-wallet` package takes care of this for you when
the `NDKWalletService` is running by default.

```ts
const walletService = new NDKWalletService(ndk);
walletService.start();
walletService.on("nutzap", (nutzap: NDKNutzap) => {
    console.log("Received a nutzap", nutzap);
});
```
