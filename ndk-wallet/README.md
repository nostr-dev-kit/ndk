# ndk-wallet

NDK Wallet provides common interfaces and functionalities to create a wallet that leverages nostr.

## Usage

### Install

```
npm add @nostr-dev-kit/ndk-wallet
```

### Add as a cache adapter

```ts
import NDKWallet from "@nostr-dev-kit/ndk-wallet";

const cacheAdapter = new NDKRedisCacheAdapter();
const ndk = new NDK({ cacheAdapter });
```

# License

MIT
