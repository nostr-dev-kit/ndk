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
- [NDKNip46Backend](classes/NDKNip46Backend.md)
- [NDKNip46Signer](classes/NDKNip46Signer.md)
- [NDKNostrRpc](classes/NDKNostrRpc.md)
- [NDKPrivateKeySigner](classes/NDKPrivateKeySigner.md)
- [NDKRelay](classes/NDKRelay.md)
- [NDKRelaySet](classes/NDKRelaySet.md)
- [NDKSubscriptionGroup](classes/NDKSubscriptionGroup.md)
- [NDKUser](classes/NDKUser.md)
- [default](classes/default.md)

### Interfaces

- [GetUserParams](interfaces/GetUserParams.md)
- [IEventHandlingStrategy](interfaces/IEventHandlingStrategy.md)
- [NDKCacheAdapter](interfaces/NDKCacheAdapter.md)
- [NDKConstructorParams](interfaces/NDKConstructorParams.md)
- [NDKFilterOptions](interfaces/NDKFilterOptions.md)
- [NDKRelayConnectionStats](interfaces/NDKRelayConnectionStats.md)
- [NDKRpcRequest](interfaces/NDKRpcRequest.md)
- [NDKRpcResponse](interfaces/NDKRpcResponse.md)
- [NDKSigner](interfaces/NDKSigner.md)
- [NDKSubscriptionOptions](interfaces/NDKSubscriptionOptions.md)
- [NDKUserProfile](interfaces/NDKUserProfile.md)
- [NDKZapInvoice](interfaces/NDKZapInvoice.md)

### Type Aliases

- [NDKEventId](modules.md#ndkeventid)
- [NDKFilter](modules.md#ndkfilter)
- [NDKTag](modules.md#ndktag)
- [Nip46ApplyTokenCallback](modules.md#nip46applytokencallback)
- [Nip46PermitCallback](modules.md#nip46permitcallback)
- [NostrEvent](modules.md#nostrevent)

### Variables

- [defaultOpts](modules.md#defaultopts)

### Functions

- [filterFromId](modules.md#filterfromid)
- [mergeEvent](modules.md#mergeevent)
- [mergeFilters](modules.md#mergefilters)
- [zapInvoiceFromEvent](modules.md#zapinvoicefromevent)

### Events

- [NDKSubscription](classes/NDKSubscription.md)

## Type Aliases

### NDKEventId

Ƭ **NDKEventId**: `string`

#### Defined in

[src/events/index.ts:12](https://github.com/nostr-dev-kit/ndk/blob/4b9fbc9/src/events/index.ts#L12)

___

### NDKFilter

Ƭ **NDKFilter**: `NostrFilter`

#### Defined in

[src/subscription/index.ts:10](https://github.com/nostr-dev-kit/ndk/blob/4b9fbc9/src/subscription/index.ts#L10)

___

### NDKTag

Ƭ **NDKTag**: `string`[]

#### Defined in

[src/events/index.ts:13](https://github.com/nostr-dev-kit/ndk/blob/4b9fbc9/src/events/index.ts#L13)

___

### Nip46ApplyTokenCallback

Ƭ **Nip46ApplyTokenCallback**: (`pubkey`: `string`, `token`: `string`) => `Promise`<`void`\>

#### Type declaration

▸ (`pubkey`, `token`): `Promise`<`void`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `pubkey` | `string` |
| `token` | `string` |

##### Returns

`Promise`<`void`\>

#### Defined in

[src/signers/nip46/backend/index.ts:16](https://github.com/nostr-dev-kit/ndk/blob/4b9fbc9/src/signers/nip46/backend/index.ts#L16)

___

### Nip46PermitCallback

Ƭ **Nip46PermitCallback**: (`pubkey`: `string`, `method`: `string`, `params?`: `any`) => `Promise`<`boolean`\>

#### Type declaration

▸ (`pubkey`, `method`, `params?`): `Promise`<`boolean`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `pubkey` | `string` |
| `method` | `string` |
| `params?` | `any` |

##### Returns

`Promise`<`boolean`\>

#### Defined in

[src/signers/nip46/backend/index.ts:10](https://github.com/nostr-dev-kit/ndk/blob/4b9fbc9/src/signers/nip46/backend/index.ts#L10)

___

### NostrEvent

Ƭ **NostrEvent**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `content` | `string` |
| `created_at` | `number` |
| `id?` | `string` |
| `kind?` | [`NDKKind`](enums/NDKKind.md) \| `number` |
| `pubkey` | `string` |
| `sig?` | `string` |
| `tags` | [`NDKTag`](modules.md#ndktag)[] |

#### Defined in

[src/events/index.ts:15](https://github.com/nostr-dev-kit/ndk/blob/4b9fbc9/src/events/index.ts#L15)

## Variables

### defaultOpts

• `Const` **defaultOpts**: [`NDKSubscriptionOptions`](interfaces/NDKSubscriptionOptions.md)

Default subscription options.

#### Defined in

[src/subscription/index.ts:55](https://github.com/nostr-dev-kit/ndk/blob/4b9fbc9/src/subscription/index.ts#L55)

## Functions

### filterFromId

▸ **filterFromId**(`id`): [`NDKFilter`](modules.md#ndkfilter)

Creates a valid nostr filter from an event id or a NIP-19 bech32.

#### Parameters

| Name | Type |
| :------ | :------ |
| `id` | `string` |

#### Returns

[`NDKFilter`](modules.md#ndkfilter)

#### Defined in

[src/subscription/index.ts:449](https://github.com/nostr-dev-kit/ndk/blob/4b9fbc9/src/subscription/index.ts#L449)

___

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

[src/user/profile.ts:16](https://github.com/nostr-dev-kit/ndk/blob/4b9fbc9/src/user/profile.ts#L16)

___

### mergeFilters

▸ **mergeFilters**(`filters`): [`NDKFilter`](modules.md#ndkfilter)

Go through all the passed filters, which should be
relatively similar, and merge them.

#### Parameters

| Name | Type |
| :------ | :------ |
| `filters` | [`NDKFilter`](modules.md#ndkfilter)[] |

#### Returns

[`NDKFilter`](modules.md#ndkfilter)

#### Defined in

[src/subscription/index.ts:426](https://github.com/nostr-dev-kit/ndk/blob/4b9fbc9/src/subscription/index.ts#L426)

___

### zapInvoiceFromEvent

▸ **zapInvoiceFromEvent**(`event`): [`NDKZapInvoice`](interfaces/NDKZapInvoice.md) \| ``null``

Parses a zap invoice from a kind 9735 event

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `event` | [`NDKEvent`](classes/NDKEvent.md) | The event to parse |

#### Returns

[`NDKZapInvoice`](interfaces/NDKZapInvoice.md) \| ``null``

NDKZapInvoice | null

#### Defined in

[src/zap/invoice.ts:21](https://github.com/nostr-dev-kit/ndk/blob/4b9fbc9/src/zap/invoice.ts#L21)
