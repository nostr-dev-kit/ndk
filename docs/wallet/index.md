# Wallet

NDK provides the `@nostr-dev-kit/ndk-wallet` package, which provides common interfaces and functionalities to create a wallet that leverages nostr.

## Initialization

An `NDKWallet` can be provided to ndk in the constructor.

```ts
// instantiate your NDK
import NDK from "@nostr-dev-kit/ndk";
import NDKWallet from "@nostr-dev-kit/ndk-wallet";

const ndk = new NDK({
    explicitRelayUrls: [ <some-relays> ],
});
ndk.connect();

// Establish the main user's signer
ndk.signer = NDKPrivateKeySigner.generate();

// instantiate the wallet
const ndkWallet = new NDKWallet(ndk);
```

## Creating a Wallet
Once we have an NDK instance ready we can create a wallet.

```ts
const wallet = ndkWallet.createCashuWallet();
wallet.name = "My Wallet";
wallet.relays = [ "wss://relay1", "wss://relay2" ]
wallet.publish();
```

This will publish a wallet `kind:37376` event, which contains the wallet information.

But wait, we have no mints!

## Discovering mints
We need to find mints we want to use.

```ts
import { getMintRecommendations } from "@nostr-dev-kit/ndk-wallet";
const mintRecommendations = await getMintRecommendations(ndk);
```

Now you can either use WoT to find the most trusted mints from the point of view of the user, or you can use any mechanism to let the user determine which mints to use.

```ts
wallet.mints = choosenMints;
// We want to publishReplaceable here since the wallet is a replaceable event
wallet.publishReplaceable();
```

## Receiving ecash
To receive ecash just call the `receiveToken` method on the wallet.

```ts
const tokenEvent = await wallet.receiveToken(token);
```

This will swap the tokens in the right mint and add them to the wallet. Note that if the mint of this token is not one of the ones in the wallet you will need to move them to the mint you want manually.