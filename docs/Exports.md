# NDK

## Table of contents

### Enumerations

- [NDKKind](../wiki/NDKKind)
- [NDKRelayStatus](../wiki/NDKRelayStatus)
- [NDKSubscriptionCacheUsage](../wiki/NDKSubscriptionCacheUsage)

### Classes

- [NDKEvent](../wiki/NDKEvent)
- [NDKNip07Signer](../wiki/NDKNip07Signer)
- [NDKNip46Backend](../wiki/NDKNip46Backend)
- [NDKNip46Signer](../wiki/NDKNip46Signer)
- [NDKNostrRpc](../wiki/NDKNostrRpc)
- [NDKPrivateKeySigner](../wiki/NDKPrivateKeySigner)
- [NDKRelay](../wiki/NDKRelay)
- [NDKRelaySet](../wiki/NDKRelaySet)
- [NDKSubscriptionGroup](../wiki/NDKSubscriptionGroup)
- [NDKUser](../wiki/NDKUser)
- [default](../wiki/default)

### Interfaces

- [GetUserParams](../wiki/GetUserParams)
- [IEventHandlingStrategy](../wiki/IEventHandlingStrategy)
- [NDKCacheAdapter](../wiki/NDKCacheAdapter)
- [NDKConstructorParams](../wiki/NDKConstructorParams)
- [NDKFilterOptions](../wiki/NDKFilterOptions)
- [NDKRelayConnectionStats](../wiki/NDKRelayConnectionStats)
- [NDKRpcRequest](../wiki/NDKRpcRequest)
- [NDKRpcResponse](../wiki/NDKRpcResponse)
- [NDKSigner](../wiki/NDKSigner)
- [NDKSubscriptionOptions](../wiki/NDKSubscriptionOptions)
- [NDKUserProfile](../wiki/NDKUserProfile)
- [NDKZapInvoice](../wiki/NDKZapInvoice)

### Type Aliases

- [NDKEventId](../wiki/Exports#ndkeventid)
- [NDKFilter](../wiki/Exports#ndkfilter)
- [NDKTag](../wiki/Exports#ndktag)
- [Nip46ApplyTokenCallback](../wiki/Exports#nip46applytokencallback)
- [Nip46PermitCallback](../wiki/Exports#nip46permitcallback)
- [NostrEvent](../wiki/Exports#nostrevent)

### Variables

- [defaultOpts](../wiki/Exports#defaultopts)

### Functions

- [filterFromId](../wiki/Exports#filterfromid)
- [mergeEvent](../wiki/Exports#mergeevent)
- [mergeFilters](../wiki/Exports#mergefilters)
- [zapInvoiceFromEvent](../wiki/Exports#zapinvoicefromevent)

### Events

- [NDKSubscription](../wiki/NDKSubscription)

## Type Aliases

### NDKEventId

Ƭ **NDKEventId**: `string`

#### Defined in

[src/events/index.ts:13](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/events/index.ts#L13)

___

### NDKFilter

Ƭ **NDKFilter**: `NostrFilter`

#### Defined in

[src/subscription/index.ts:10](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/subscription/index.ts#L10)

___

### NDKTag

Ƭ **NDKTag**: `string`[]

#### Defined in

[src/events/index.ts:14](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/events/index.ts#L14)

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

[src/signers/nip46/backend/index.ts:16](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/signers/nip46/backend/index.ts#L16)

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

[src/signers/nip46/backend/index.ts:10](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/signers/nip46/backend/index.ts#L10)

___

### NostrEvent

Ƭ **NostrEvent**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `content` | `string` |
| `created_at` | `number` |
| `id?` | `string` |
| `kind?` | [`NDKKind`](../wiki/NDKKind) \| `number` |
| `pubkey` | `string` |
| `sig?` | `string` |
| `tags` | [`NDKTag`](../wiki/Exports#ndktag)[] |

#### Defined in

[src/events/index.ts:16](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/events/index.ts#L16)

## Variables

### defaultOpts

• `Const` **defaultOpts**: [`NDKSubscriptionOptions`](../wiki/NDKSubscriptionOptions)

Default subscription options.

#### Defined in

[src/subscription/index.ts:55](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/subscription/index.ts#L55)

## Functions

### filterFromId

▸ **filterFromId**(`id`): [`NDKFilter`](../wiki/Exports#ndkfilter)

Creates a valid nostr filter from an event id or a NIP-19 bech32.

#### Parameters

| Name | Type |
| :------ | :------ |
| `id` | `string` |

#### Returns

[`NDKFilter`](../wiki/Exports#ndkfilter)

#### Defined in

[src/subscription/index.ts:449](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/subscription/index.ts#L449)

___

### mergeEvent

▸ **mergeEvent**(`event`, `profile`): [`NDKUserProfile`](../wiki/NDKUserProfile)

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | [`NDKEvent`](../wiki/NDKEvent) |
| `profile` | [`NDKUserProfile`](../wiki/NDKUserProfile) |

#### Returns

[`NDKUserProfile`](../wiki/NDKUserProfile)

#### Defined in

[src/user/profile.ts:16](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/user/profile.ts#L16)

___

### mergeFilters

▸ **mergeFilters**(`filters`): [`NDKFilter`](../wiki/Exports#ndkfilter)

Go through all the passed filters, which should be
relatively similar, and merge them.

#### Parameters

| Name | Type |
| :------ | :------ |
| `filters` | [`NDKFilter`](../wiki/Exports#ndkfilter)[] |

#### Returns

[`NDKFilter`](../wiki/Exports#ndkfilter)

#### Defined in

[src/subscription/index.ts:426](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/subscription/index.ts#L426)

___

### zapInvoiceFromEvent

▸ **zapInvoiceFromEvent**(`event`): [`NDKZapInvoice`](../wiki/NDKZapInvoice) \| ``null``

Parses a zap invoice from a kind 9735 event

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `event` | [`NDKEvent`](../wiki/NDKEvent) | The event to parse |

#### Returns

[`NDKZapInvoice`](../wiki/NDKZapInvoice) \| ``null``

NDKZapInvoice | null

#### Defined in

[src/zap/invoice.ts:21](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/zap/invoice.ts#L21)
