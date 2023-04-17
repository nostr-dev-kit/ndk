[NDK](README.md) / Exports

# NDK

## Table of contents

### Enumerations

- [NDKKind](enums/NDKKind.md)
- [NDKRelayStatus](enums/NDKRelayStatus.md)
- [NDKSubscriptionCacheUsage](enums/NDKSubscriptionCacheUsage.md)

### Classes

- [NDKEvent](classes/NDKEvent.md)
- [NDKNip07Signer](classes/NDKNip07Signer.md)
- [NDKPrivateKeySigner](classes/NDKPrivateKeySigner.md)
- [NDKRelay](classes/NDKRelay.md)
- [NDKRelaySet](classes/NDKRelaySet.md)
- [NDKUser](classes/NDKUser.md)
- [default](classes/default.md)

### Events

- [NDKSubscription](classes/NDKSubscription.md)

### Interfaces

- [GetUserParams](interfaces/GetUserParams.md)
- [NDKCacheAdapter](interfaces/NDKCacheAdapter.md)
- [NDKConstructorParams](interfaces/NDKConstructorParams.md)
- [NDKFilterOptions](interfaces/NDKFilterOptions.md)
- [NDKRelayConnectionStats](interfaces/NDKRelayConnectionStats.md)
- [NDKSubscriptionOptions](interfaces/NDKSubscriptionOptions.md)
- [NDKUserProfile](interfaces/NDKUserProfile.md)
- [NDKZapInvoice](interfaces/NDKZapInvoice.md)

### Type Aliases

- [NDKFilter](modules.md#ndkfilter)

### Variables

- [defaultOpts](modules.md#defaultopts)

### Functions

- [zapInvoiceFromEvent](modules.md#zapinvoicefromevent)

## Type Aliases

### NDKFilter

Ƭ **NDKFilter**: `NostrFilter`

#### Defined in

[src/subscription/index.ts:10](https://github.com/nostr-dev-kit/ndk/blob/bdedd0e/src/subscription/index.ts#L10)

## Variables

### defaultOpts

• `Const` **defaultOpts**: [`NDKSubscriptionOptions`](interfaces/NDKSubscriptionOptions.md)

Default subscription options.

#### Defined in

[src/subscription/index.ts:50](https://github.com/nostr-dev-kit/ndk/blob/bdedd0e/src/subscription/index.ts#L50)

## Functions

### zapInvoiceFromEvent

▸ **zapInvoiceFromEvent**(`event`): [`NDKZapInvoice`](interfaces/NDKZapInvoice.md) \| ``null``

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | [`NDKEvent`](classes/NDKEvent.md) |

#### Returns

[`NDKZapInvoice`](interfaces/NDKZapInvoice.md) \| ``null``

#### Defined in

[src/zap/invoice.ts:14](https://github.com/nostr-dev-kit/ndk/blob/bdedd0e/src/zap/invoice.ts#L14)
