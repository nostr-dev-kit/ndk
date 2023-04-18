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
- [NDKSubscriptionGroup](classes/NDKSubscriptionGroup.md)
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

- [mergeEvent](modules.md#mergeevent)
- [mergeFilters](modules.md#mergefilters)
- [zapInvoiceFromEvent](modules.md#zapinvoicefromevent)

## Type Aliases

### NDKFilter

Ƭ **NDKFilter**: `NostrFilter`

#### Defined in

[src/subscription/index.ts:10](https://github.com/nostr-dev-kit/ndk/blob/7898849/src/subscription/index.ts#L10)

## Variables

### defaultOpts

• `Const` **defaultOpts**: [`NDKSubscriptionOptions`](interfaces/NDKSubscriptionOptions.md)

Default subscription options.

#### Defined in

[src/subscription/index.ts:50](https://github.com/nostr-dev-kit/ndk/blob/7898849/src/subscription/index.ts#L50)

## Functions

### mergeEvent

▸ **mergeEvent**(`event`, `profile`): [`NDKUserProfile`](interfaces/NDKUserProfile.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | [`NDKEvent`](classes/NDKEvent.md) |
| `profile` | [`NDKUserProfile`](interfaces/NDKUserProfile.md) |

#### Returns

[`NDKUserProfile`](interfaces/NDKUserProfile.md)

#### Defined in

[src/user/profile.ts:16](https://github.com/nostr-dev-kit/ndk/blob/7898849/src/user/profile.ts#L16)

___

### mergeFilters

▸ **mergeFilters**(`filters`): [`NDKFilter`](modules.md#ndkfilter)

Go through all the passed filters, which should be
relatively similar, and merge them.

#### Parameters

| Name | Type |
| :------ | :------ |
| `filters` | `Filter`[] |

#### Returns

[`NDKFilter`](modules.md#ndkfilter)

#### Defined in

[src/subscription/index.ts:382](https://github.com/nostr-dev-kit/ndk/blob/7898849/src/subscription/index.ts#L382)

___

### zapInvoiceFromEvent

▸ **zapInvoiceFromEvent**(`event`): [`NDKZapInvoice`](interfaces/NDKZapInvoice.md) \| ``null``

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | [`NDKEvent`](classes/NDKEvent.md) |

#### Returns

[`NDKZapInvoice`](interfaces/NDKZapInvoice.md) \| ``null``

#### Defined in

[src/zap/invoice.ts:14](https://github.com/nostr-dev-kit/ndk/blob/7898849/src/zap/invoice.ts#L14)
