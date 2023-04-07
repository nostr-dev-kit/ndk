[NDK](README.md) / Exports

# NDK

## Table of contents

### Enumerations

- [NDKKind](enums/NDKKind.md)

### Classes

- [NDKEvent](classes/NDKEvent.md)
- [NDKNip07Signer](classes/NDKNip07Signer.md)
- [NDKUser](classes/NDKUser.md)
- [default](classes/default.md)

### Events

- [NDKSubscription](classes/NDKSubscription.md)

### Interfaces

- [GetUserParams](interfaces/GetUserParams.md)
- [NDKCacheAdapter](interfaces/NDKCacheAdapter.md)
- [NDKConstructorParams](interfaces/NDKConstructorParams.md)
- [NDKUserProfile](interfaces/NDKUserProfile.md)
- [NDKZapInvoice](interfaces/NDKZapInvoice.md)

### Type Aliases

- [NDKFilter](modules.md#ndkfilter)

### Functions

- [zapInvoiceFromEvent](modules.md#zapinvoicefromevent)

## Type Aliases

### NDKFilter

Ƭ **NDKFilter**: `NostrFilter`

#### Defined in

[src/subscription/index.ts:10](https://github.com/nostr-dev-kit/ndk/blob/e1d90e2/src/subscription/index.ts#L10)

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

[src/zap/invoice.ts:14](https://github.com/nostr-dev-kit/ndk/blob/e1d90e2/src/zap/invoice.ts#L14)
