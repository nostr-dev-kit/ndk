# NIP-60 (Nutack) wallets

NIP-60 provides wallets that are available to any nostr application immediately; the goal of NIP-60 is to provide the same
seamless experience nostr users expect from their apps with regards to the immediate aailability of their data, to their money.

## Creating a NIP-60 wallet

```ts
import NDKWallet from "@nostr-dev-kit/ndk-wallet";
import NDK from "@nostr-dev-kit/ndk";

// instantiate your NDK
const ndk = new NDK({
    explicitRelayUrls: [ <some-relays> ],
    signer = NDKPrivateKeySigner.generate();
});
ndk.connect();

// create a new NIP-60 wallet
const unit = "sat"; // unit of the wallet
const mints = [ 'https://testnut.cashu.space' ] // mints the wallet will use
const relays = [ 'wss://f7z.io', 'ws://localhost:4040' ]; // relays where proofs will be stored
const wallet = NDKCashuWallet.create(ndk, unit, mints, relays);
await wallet.publish();
```

This will publish a wallet `kind:37376` event, which contains the wallet information.

We now have a NIP-60 wallet -- this wallet will be available from any nostr client that supports NIP-60.

## Deposit money

```ts
const deposit = wallet.deposit(1000, mints[0]);
const bolt11 = deposit.start(); // get a LN PR
deposit.on("success", () => console.log("we have money!", wallet.balance()));
```

## Configure NDK to use a wallet

You can configure NDK to use some wallet, this is equivalent for whatever wallet adapter you choose to use.

```ts
ndk.wallet = wallet;
```

## Send a zap

Now that we have a wallet, some funds, and we have ndk prepared to use that wallet, we'll send a zap. NDK provides a convenient `wallet` setter that allows

```ts
const user = await NDKUser.fronNip05("_@f7z.io");
const zapper = new NDKZapper(user, 1, "sat", {
    comment: "hello from my wallet!",
});
zapper.on("complete", () => console.log("pablo was zapped!"));
zapper.zap();
```

## Zapping without a wallet

If you don't connect a wallet to ndk and attempt to zap, you will receive the zapping information(s) so you can give your users the possibility of paying manually.

```ts
// no wallet
ndk.wallet = undefined;

// this function will be called when a bolt11 needs to be paid
const lnPay = async (payment: NDKZapDetails<LnPaymentInfo>) => {
    console.log("please pay this invoice to complete the zap", payment.pr);
};

const zapper = new NDKZapper(user, 1, "sat", { comment: "manual zapping", lnPay });
const paymentInfo = await zapper.zap();
```

You can also configure this at the application level, for example, to open a modal whenever a payment needs to be done

```ts
const lnPay = async (payment: NDKZapDetails<LnPaymentInfo>) => {
    alert("please pay this invoice: " + payment.pr);
};

ndk.wallet = { lnPay };
```

## Receiving ecash

To receive ecash just call the `receiveToken` method on the wallet.

```ts
const tokenEvent = await wallet.receiveToken(token);
```

This will swap the tokens in the right mint and add them to the wallet. Note that if the mint of this token is not one of the ones in the wallet you will need to move them to the mint you want manually.
