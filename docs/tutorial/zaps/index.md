# Zaps

NDK comes with an interface to make zapping as simple as possible.

```ts
const user = await ndk.getUserFromNip05("pablo@f7z.io");
const zapper = await ndk.zap(user, 1000)
```

## Connecting to WebLN
Advanced users might have a webln extension available in their browsers. To attempt to use their WebLN to pay, you can connect webln with NDK.

```ts
import { requestProvider } from "webln";
let weblnProvider;
requestProvider().then(provider => weblnProvider = provider });

// whenever the user wants to pay for something, and using LN is an option for the payment
// this function will be called
ndk.walletConfig.onLnPay = async ({pr: string, amount: number, target?: NDKEvent | NDKUser}) => {
    if (weblnProvider) {
        if (confirm("Would you like to pay with your WebLN provider?")) {
            await weblnProvider.sendPayment(pr);
        }
    } else {
        // show a QR code to the user or handle in some way
    }
});
```

Now from anywhere in the app, you can:

```ts
event.zap(1000); // zap an event 1 sat
```

## Configuring a wallet
NDK provides an `ndk-wallet` package that makes it very simple to use a NIP-60 wallet.