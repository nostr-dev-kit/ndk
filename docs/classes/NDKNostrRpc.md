[NDK](../README.md) / [Exports](../modules.md) / NDKNostrRpc

# Class: NDKNostrRpc

## Hierarchy

- `EventEmitter`

  ↳ **`NDKNostrRpc`**

## Table of contents

### Constructors

- [constructor](NDKNostrRpc.md#constructor)

### Methods

- [parseEvent](NDKNostrRpc.md#parseevent)
- [sendRequest](NDKNostrRpc.md#sendrequest)
- [sendResponse](NDKNostrRpc.md#sendresponse)
- [subscribe](NDKNostrRpc.md#subscribe)

## Constructors

### constructor

• **new NDKNostrRpc**(`ndk`, `signer`, `debug`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `ndk` | [`default`](default.md) |
| `signer` | [`NDKSigner`](../interfaces/NDKSigner.md) |
| `debug` | `Debugger` |

#### Overrides

EventEmitter.constructor

#### Defined in

[src/signers/nip46/rpc.ts:24](https://github.com/nostr-dev-kit/ndk/blob/0aa26c2/src/signers/nip46/rpc.ts#L24)

## Methods

### parseEvent

▸ **parseEvent**(`event`): `Promise`<[`NDKRpcRequest`](../interfaces/NDKRpcRequest.md) \| [`NDKRpcResponse`](../interfaces/NDKRpcResponse.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | [`NDKEvent`](NDKEvent.md) |

#### Returns

`Promise`<[`NDKRpcRequest`](../interfaces/NDKRpcRequest.md) \| [`NDKRpcResponse`](../interfaces/NDKRpcResponse.md)\>

#### Defined in

[src/signers/nip46/rpc.ts:55](https://github.com/nostr-dev-kit/ndk/blob/0aa26c2/src/signers/nip46/rpc.ts#L55)

___

### sendRequest

▸ **sendRequest**(`remotePubkey`, `method`, `params?`, `kind?`, `cb?`): `Promise`<[`NDKRpcResponse`](../interfaces/NDKRpcResponse.md)\>

Sends a request.

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `remotePubkey` | `string` | `undefined` |
| `method` | `string` | `undefined` |
| `params` | `string`[] | `[]` |
| `kind` | `number` | `24133` |
| `cb?` | (`res`: [`NDKRpcResponse`](../interfaces/NDKRpcResponse.md)) => `void` | `undefined` |

#### Returns

`Promise`<[`NDKRpcResponse`](../interfaces/NDKRpcResponse.md)\>

#### Defined in

[src/signers/nip46/rpc.ts:97](https://github.com/nostr-dev-kit/ndk/blob/0aa26c2/src/signers/nip46/rpc.ts#L97)

___

### sendResponse

▸ **sendResponse**(`id`, `remotePubkey`, `result`, `kind?`, `error?`): `Promise`<`void`\>

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `id` | `string` | `undefined` |
| `remotePubkey` | `string` | `undefined` |
| `result` | `string` | `undefined` |
| `kind` | `number` | `24133` |
| `error?` | `string` | `undefined` |

#### Returns

`Promise`<`void`\>

#### Defined in

[src/signers/nip46/rpc.ts:69](https://github.com/nostr-dev-kit/ndk/blob/0aa26c2/src/signers/nip46/rpc.ts#L69)

___

### subscribe

▸ **subscribe**(`filter`): `Promise`<[`NDKSubscription`](NDKSubscription.md)\>

Subscribe to a filter. This function will resolve once the subscription is ready.

#### Parameters

| Name | Type |
| :------ | :------ |
| `filter` | [`NDKFilter`](../modules.md#ndkfilter) |

#### Returns

`Promise`<[`NDKSubscription`](NDKSubscription.md)\>

#### Defined in

[src/signers/nip46/rpc.ts:34](https://github.com/nostr-dev-kit/ndk/blob/0aa26c2/src/signers/nip46/rpc.ts#L34)
