# Wallet

NDK provides an optional `@nostr-dev-kit/ndk-wallet` package, which provides common interfaces and functionalities to interface with different wallet adapters.

Currently ndk-wallet supports:

- NIP-60 wallets (nutsacks)
- NIP-47 connectors (NWC)
- WebLN (when available)

## Connecting NDK with a wallet

As a developer, the first thing you need to do to use a wallet in your app is to choose how you will connect to your wallet by using one of the wallet adapters.

Once you instantiate the desired wallet, you simply pass it to ndk.

```ts
const wallet = new NDKNWCWallet(ndk, { timeout: 5000, pairingCode: "nostr+walletconnect:...." });
ndk.wallet = wallet;
wallet.on("timeout", (method: string) => console.log('Unable to complete the operation in time', { method }))
```

Now whenever you want to pay something, the wallet will be called. Refer to the Nutsack adapter to see more details of the interface.

## Configuration

- [NIP-60 Wallet Configuration](./nip60-configuration.md) - How to add/remove mints and relays
