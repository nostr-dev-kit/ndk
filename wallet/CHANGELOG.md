# @nostr-dev-kit/wallet

## 0.8.11

### Patch Changes

- Updated dependencies [b8e7a06]
- Updated dependencies [ad7936b]
- Updated dependencies [b5bdb2c]
- Updated dependencies [4b8d146]
- Updated dependencies [8f116fa]
- Updated dependencies [b5bdb2c]
- Updated dependencies [72fc3b0]
- Updated dependencies [73adeb9]
- Updated dependencies [b5bdb2c]
- Updated dependencies [b5bdb2c]
    - @nostr-dev-kit/ndk@3.0.0
    - @nostr-dev-kit/sync@0.4.0

## 0.8.10

### Patch Changes

- bump
- Updated dependencies
- Updated dependencies
    - @nostr-dev-kit/ndk@2.18.0
    - @nostr-dev-kit/sync@0.3.6

## 0.8.9

### Patch Changes

- e2154a0: Add `publishMintList()` method to NDKCashuWallet for simplified CashuMintList (kind 10019) publishing. The svelte wallet store's `save()` method now automatically publishes both the wallet configuration (kind 17375) and the mint list (kind 10019) for nutzap reception, eliminating the need for manual mint list creation.

## 0.8.8

### Patch Changes

- Add `publishMintList()` method to NDKCashuWallet for simplified CashuMintList (kind 10019) publishing. The svelte wallet store's `save()` method now automatically publishes both the wallet configuration (kind 17375) and the mint list (kind 10019) for nutzap reception, eliminating the need for manual mint list creation.

## 0.8.8

### Patch Changes

- bump

## 0.8.7

### Patch Changes

- d5b4753: Wallet configuration and management improvements:

    **NDKCashuWallet**:
    - Add `send()` method to create cashu tokens for sending amounts
    - Add `update()` method to update wallet configuration (mints and relays) with proper replaceable event publishing
    - Add static `create()` factory method for easy wallet creation with initial configuration

    **ReactiveWalletStore (Svelte)**:
    - Add reactive Svelte 5 store for wallet state management
    - Automatic session integration with NDKSessionManager
    - Reactive balance, status, and wallet state using $state runes
    - Convenience methods and getters for mints, relays, and transactions

- Updated dependencies [59a97a5]
- Updated dependencies [28ebbe1]
    - @nostr-dev-kit/ndk@2.17.9

## 0.8.6

### Patch Changes

- Bump version for zustand/vanilla import fix

## 0.8.5

### Patch Changes

- Fix zustand import to use vanilla API instead of React-dependent main export

## 0.8.4

### Patch Changes

- Fix zustand bundling issue causing React import errors in non-React environments by marking zustand as external dependency

## 0.8.3

### Patch Changes

- bump
- Updated dependencies
    - @nostr-dev-kit/sync@0.3.2

## 0.8.2

### Patch Changes

- 3407126: Fix negentropy relay capability caching and add fallback support
    - Fixed async callback race condition where cache updates weren't awaited
    - Added DRY refactoring with `syncSingleRelay()` helper method
    - Implemented automatic fallback to `fetchEvents` for relays without negentropy support
    - Both `sync()` and `syncAndSubscribe()` now try all relays and automatically fall back when needed
    - Events are properly cached even when using fallback mechanism
    - Updated wallet to use `NDKSync` class instead of low-level `ndkSync` function for proper capability caching

- Updated dependencies [344c313]
- Updated dependencies [2adef59]
- Updated dependencies [3407126]
- Updated dependencies [344c313]
    - @nostr-dev-kit/ndk@2.17.0
    - @nostr-dev-kit/sync@0.3.0

## 0.8.1

### Patch Changes

- bump

## 0.8.0

### Minor Changes

- e596023: Export NIP-87 mint store and wallet config store utilities

### Patch Changes

- Updated dependencies [e596023]
    - @nostr-dev-kit/ndk@2.16.0

## 0.7.2

### Patch Changes

- Updated dependencies [a912a2c]
- Updated dependencies [3bffc04]
    - @nostr-dev-kit/ndk@2.15.3
    - @nostr-dev-kit/sync@0.2.0

## 0.7.0

### Minor Changes

- Add cashu mint list support for nutzap reception
    - Add `mintList` getter and `fetchMintList` method to NDKCashuWallet
    - Implement automatic mint list fetching during wallet initialization
    - Support NIP-61 nutzap reception configuration through mint lists
    - Add comprehensive test coverage for mint list functionality
    - Add subId parameters for better subscription tracking

    This enables wallets to properly configure nutzap reception by fetching and exposing their published mint lists (kind:10019 events), supporting the NIP-61 specification for enhanced cashu token interoperability.

### Patch Changes

- Updated dependencies
- Updated dependencies
- Updated dependencies
    - @nostr-dev-kit/ndk@2.15.0

## 0.6.3

### Patch Changes

- 96341c3: Remove old NIP-60 migration code and legacy wallet kind 37375
    - Removed `getOldWallets` function and `migrateCashuWallet` from ndk-wallet
    - Removed `LegacyCashuWallet = 37375` kind definition from ndk-core
    - Cleaned up all references to the legacy migration code

- Updated dependencies [2886111]
- Updated dependencies [96341c3]
    - @nostr-dev-kit/ndk@2.14.37

## 0.6.2

### Patch Changes

- bump

## 0.6.1

### Patch Changes

- make wallet.start() wait until the wallet is ready

## 0.6.0

### Minor Changes

- bump

## 0.5.14

### Patch Changes

- bump

## 0.5.11

### Patch Changes

- Updated dependencies
    - @nostr-dev-kit/ndk@2.14.7

## 0.5.10

### Patch Changes

- Updated dependencies
    - @nostr-dev-kit/ndk@2.14.6

## 0.5.9

### Patch Changes

- Updated dependencies
    - @nostr-dev-kit/ndk@2.14.5

## 0.5.8

### Patch Changes

- Updated dependencies
- Updated dependencies
    - @nostr-dev-kit/ndk@2.14.4

## 0.5.7

### Patch Changes

- Updated dependencies
    - @nostr-dev-kit/ndk@2.14.3

## 0.5.6

### Patch Changes

- fix release

## 0.5.5

### Patch Changes

- Updated dependencies
    - @nostr-dev-kit/ndk@2.14.2

## 0.5.4

### Patch Changes

- bump

## 0.5.3

### Patch Changes

- Updated dependencies
    - @nostr-dev-kit/ndk@2.14.1

## 0.5.2

### Patch Changes

- c83166a: bump
- import changes
- Updated dependencies [c83166a]
- Updated dependencies [5ab19ef]
- Updated dependencies [6e16e06]
- Updated dependencies
- Updated dependencies [5ab19ef]
    - @nostr-dev-kit/ndk@2.14.0

## 0.5.0

### Minor Changes

- BREAKING: move wallet balance to be a getter since it sets a more natural expectation of what the function does
- Bug fix: NWC nutzaps always validate that the p2pk is properly padded

### Patch Changes

- implement mint get/set interfaces at the NDKWallet level

## 0.4.3

### Patch Changes

- Updated dependencies
    - @nostr-dev-kit/ndk@2.12.2

## 0.4.2

### Patch Changes

- cca3357: move NDKWalletChange from ndk-wallet to NDKCashuWalletTx in ndk
- Updated dependencies [3ea9695]
- Updated dependencies [cca3357]
- Updated dependencies [1235f69]
    - @nostr-dev-kit/ndk@2.12.1

## 0.4.1

### Patch Changes

- Updated dependencies [f255a07]
- Updated dependencies [f255a07]
- Updated dependencies [2171140]
- Updated dependencies [72c8492]
- Updated dependencies [72c8492]
    - @nostr-dev-kit/ndk@2.12.0

## 0.4.0

### Minor Changes

- Update to new NIP-60 and NIP-61 implementations

### Patch Changes

- Updated dependencies
- Updated dependencies
- Updated dependencies
    - @nostr-dev-kit/ndk@2.11.2

## 0.3.17

### Patch Changes

- Updated dependencies
    - @nostr-dev-kit/ndk@2.11.1

## 0.3.16

### Patch Changes

- 689305c: NWC support
- Updated dependencies [35987be]
- Updated dependencies [689305c]
- Updated dependencies [35987be]
- Updated dependencies [35987be]
- Updated dependencies
- Updated dependencies [4ed75a6]
    - @nostr-dev-kit/ndk@2.11.0

## 0.3.15

### Patch Changes

- Updated dependencies
    - @nostr-dev-kit/ndk@2.10.7

## 0.3.14

### Patch Changes

- Updated dependencies
    - @nostr-dev-kit/ndk@2.10.6

## 0.3.13

### Patch Changes

- Updated dependencies [5939a3e]
- Updated dependencies
- Updated dependencies [f2a0cce]
    - @nostr-dev-kit/ndk@2.10.5

## 0.3.12

### Patch Changes

- Updated dependencies [5bed70c]
- Updated dependencies [873ad4a]
    - @nostr-dev-kit/ndk@2.10.4

## 0.3.11

### Patch Changes

- 0bdffa7: if we run into duplicate proofs throughout the same or different tokens, clean up when we roll them into a new token event
- 0bdffa7: be more tolerant of incorrect nip04 encryption
- apply orphan tokens to the default wallet
- Updated dependencies [0fc66c5]
    - @nostr-dev-kit/ndk@2.10.3

## 0.3.10

### Patch Changes

- bump

## 0.3.9

### Patch Changes

- nip44 decrypt wallet change events

## 0.3.8

### Patch Changes

- avoid duplicating proofs when they existed previously in different tokens

## 0.3.7

### Patch Changes

- fix issue were two tokens are being created when redeeming cashu

## 0.3.6

### Patch Changes

- bump

## 0.3.5

### Patch Changes

- receive cashu

## 0.3.4

### Patch Changes

- 0191977: provide a way to create nuts of specific denomincation(s)

## 0.3.3

### Patch Changes

- 4351ec4: provide a way to create nuts of specific denomincation(s)
- Updated dependencies
    - @nostr-dev-kit/ndk@2.10.2

## 0.3.2

### Patch Changes

- bump

## 0.3.1

### Patch Changes

- publish wallet change events

## 0.3.0

### Minor Changes

- update to cashuts 1.1.0

### Patch Changes

- Updated dependencies [d6cfa8a]
- Updated dependencies [d6cfa8a]
- Updated dependencies [d6cfa8a]
- Updated dependencies [722345b]
    - @nostr-dev-kit/ndk@2.10.1

## 0.2.0

### Minor Changes

- Zap improvements

### Patch Changes

- Updated dependencies [ec83ddc]
- Updated dependencies [18c55bb]
- Updated dependencies
- Updated dependencies [18c55bb]
- Updated dependencies
- Updated dependencies
- Updated dependencies [3029124]
    - @nostr-dev-kit/ndk@2.10.0

## 2.1.16

### Patch Changes

- Updated dependencies
    - @nostr-dev-kit/ndk@2.9.1

## 2.1.15

### Patch Changes

- Updated dependencies [94018b4]
- Updated dependencies [548f4d8]
    - @nostr-dev-kit/ndk@2.9.0

## 2.1.14

### Patch Changes

- Updated dependencies [0af033f]
- Updated dependencies
    - @nostr-dev-kit/ndk@2.8.2

## 2.1.13

### Patch Changes

- Updated dependencies [e40312b]
- Updated dependencies
    - @nostr-dev-kit/ndk@2.8.1

## 2.1.12

### Patch Changes

- Updated dependencies [91d873c]
- Updated dependencies [6fd9ddc]
- Updated dependencies [0b8f331]
- Updated dependencies
- Updated dependencies [f2898ad]
- Updated dependencies [9b92cd9]
- Updated dependencies
- Updated dependencies [6814f0c]
- Updated dependencies [89b5b3f]
- Updated dependencies [9b92cd9]
- Updated dependencies [27b10cc]
- Updated dependencies
- Updated dependencies
- Updated dependencies [ed7cdc4]
    - @nostr-dev-kit/ndk@2.8.0

## 2.1.11

### Patch Changes

- Updated dependencies
    - @nostr-dev-kit/ndk@2.7.1

## 2.1.10

### Patch Changes

- Updated dependencies
- Updated dependencies
- Updated dependencies
    - @nostr-dev-kit/ndk@2.7.0

## 2.1.9

### Patch Changes

- Updated dependencies
    - @nostr-dev-kit/ndk@2.6.1

## 2.1.8

### Patch Changes

- Updated dependencies
- Updated dependencies [c2db3c1]
- Updated dependencies
- Updated dependencies [c2db3c1]
- Updated dependencies [c2db3c1]
    - @nostr-dev-kit/ndk@2.6.0

## 2.1.7

### Patch Changes

- Updated dependencies
- Updated dependencies
    - @nostr-dev-kit/ndk@2.5.1

## 2.1.6

### Patch Changes

- Updated dependencies [e08fc74]
    - @nostr-dev-kit/ndk@2.5.0

## 2.1.5

### Patch Changes

- Updated dependencies [111c1ea]
- Updated dependencies [5c0ae51]
- Updated dependencies [6f5ea49]
- Updated dependencies [3738d39]
- Updated dependencies [d22239a]
    - @nostr-dev-kit/ndk@2.4.1

## 2.1.4

### Patch Changes

- Updated dependencies [b9bbf1d]
    - @nostr-dev-kit/ndk@2.4.0

## 2.1.3

### Patch Changes

- Updated dependencies
- Updated dependencies [885b6c2]
- Updated dependencies [5666d56]
    - @nostr-dev-kit/ndk@2.3.3

## 2.1.2

### Patch Changes

- Updated dependencies
- Updated dependencies [4628481]
- Updated dependencies
    - @nostr-dev-kit/ndk@2.3.2

## 2.1.1

### Patch Changes

- Updated dependencies [ece965f]
    - @nostr-dev-kit/ndk@2.3.1

## 2.1.0

### Minor Changes

- 06c83ea: Aggressively cache all filters and their responses so the same filter can hit the cache

### Patch Changes

- Updated dependencies [54cec78]
- Updated dependencies [ef61d83]
- Updated dependencies [98b77dd]
- Updated dependencies [46b0c77]
- Updated dependencies [082e243]
    - @nostr-dev-kit/ndk@2.3.0

## 2.0.11

### Patch Changes

- Updated dependencies
    - @nostr-dev-kit/ndk@2.2.0

## 2.0.10

### Patch Changes

- Updated dependencies [180d774]
- Updated dependencies [7f00c40]
    - @nostr-dev-kit/ndk@2.1.3

## 2.0.9

### Patch Changes

- Updated dependencies
- Updated dependencies
- Updated dependencies
    - @nostr-dev-kit/ndk@2.1.2

## 2.0.8

### Patch Changes

- Updated dependencies
    - @nostr-dev-kit/ndk@2.1.1

## 2.0.7

### Patch Changes

- Updated dependencies
    - @nostr-dev-kit/ndk@2.1.0

## 2.0.6

### Patch Changes

- Updated dependencies
- Updated dependencies
    - @nostr-dev-kit/ndk@2.0.6

## 2.0.5

### Patch Changes

- Updated dependencies [d45d962]
    - @nostr-dev-kit/ndk@2.0.5

## 2.0.5

### Patch Changes

- Updated dependencies
- Updated dependencies [d45d962]
    - @nostr-dev-kit/ndk@2.0.5

## 2.0.4

### Patch Changes

- Updated dependencies
    - @nostr-dev-kit/ndk@2.0.4

## 2.0.3

### Patch Changes

- Updated dependencies
    - @nostr-dev-kit/ndk@2.0.3

## 2.0.2

### Patch Changes

- Updated dependencies
    - @nostr-dev-kit/ndk@2.0.2

## 1.8.7

### Patch Changes

- Updated dependencies
    - @nostr-dev-kit/ndk@2.0.0

## 1.8.6

### Patch Changes

- Updated dependencies
    - @nostr-dev-kit/ndk@1.4.2

## 1.8.5

### Patch Changes

- Updated dependencies
    - @nostr-dev-kit/ndk@1.4.1

## 1.8.4

### Patch Changes

- Updated dependencies
    - @nostr-dev-kit/ndk@1.4.0

## 1.8.3

### Patch Changes

- Updated dependencies [b3561af]
    - @nostr-dev-kit/ndk@1.3.2

## 1.8.2

### Patch Changes

- Updated dependencies
    - @nostr-dev-kit/ndk@1.3.1

## 1.8.1

### Patch Changes

- Updated dependencies [88df10a]
- Updated dependencies [c225094]
- Updated dependencies [cf4a648]
- Updated dependencies [3946078]
- Updated dependencies [3440768]
    - @nostr-dev-kit/ndk@1.3.0
