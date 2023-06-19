# Class: NDKNostrRpc

## Hierarchy

- `EventEmitter`

  ↳ **`NDKNostrRpc`**

## Table of contents

### Constructors

- [constructor](../wiki/NDKNostrRpc#constructor)

### Methods

- [parseEvent](../wiki/NDKNostrRpc#parseevent)
- [sendRequest](../wiki/NDKNostrRpc#sendrequest)
- [sendResponse](../wiki/NDKNostrRpc#sendresponse)
- [subscribe](../wiki/NDKNostrRpc#subscribe)

## Constructors

### constructor

• **new NDKNostrRpc**(`ndk`, `signer`, `debug`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `ndk` | [`default`](../wiki/default) |
| `signer` | [`NDKSigner`](../wiki/NDKSigner) |
| `debug` | `Debugger` |

#### Overrides

EventEmitter.constructor

#### Defined in

[src/signers/nip46/rpc.ts:24](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/signers/nip46/rpc.ts#L24)

## Methods

### parseEvent

▸ **parseEvent**(`event`): `Promise`<[`NDKRpcRequest`](../wiki/NDKRpcRequest) \| [`NDKRpcResponse`](../wiki/NDKRpcResponse)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | [`NDKEvent`](../wiki/NDKEvent) |

#### Returns

`Promise`<[`NDKRpcRequest`](../wiki/NDKRpcRequest) \| [`NDKRpcResponse`](../wiki/NDKRpcResponse)\>

#### Defined in

[src/signers/nip46/rpc.ts:55](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/signers/nip46/rpc.ts#L55)

___

### sendRequest

▸ **sendRequest**(`remotePubkey`, `method`, `params?`, `kind?`, `cb?`): `Promise`<[`NDKRpcResponse`](../wiki/NDKRpcResponse)\>

Sends a request.

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `remotePubkey` | `string` | `undefined` |
| `method` | `string` | `undefined` |
| `params` | `string`[] | `[]` |
| `kind` | `number` | `24133` |
| `cb?` | (`res`: [`NDKRpcResponse`](../wiki/NDKRpcResponse)) => `void` | `undefined` |

#### Returns

`Promise`<[`NDKRpcResponse`](../wiki/NDKRpcResponse)\>

#### Defined in

[src/signers/nip46/rpc.ts:97](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/signers/nip46/rpc.ts#L97)

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

[src/signers/nip46/rpc.ts:69](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/signers/nip46/rpc.ts#L69)

___

### subscribe

▸ **subscribe**(`filter`): `Promise`<[`NDKSubscription`](../wiki/NDKSubscription)\>

Subscribe to a filter. This function will resolve once the subscription is ready.

#### Parameters

| Name | Type |
| :------ | :------ |
| `filter` | [`NDKFilter`](../wiki/Exports#ndkfilter) |

#### Returns

`Promise`<[`NDKSubscription`](../wiki/NDKSubscription)\>

#### Defined in

[src/signers/nip46/rpc.ts:34](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/signers/nip46/rpc.ts#L34)
