**NDK** • [Readme](../README.md) \| [API](../globals.md)

***

[NDK](../README.md) / NDKNostrRpc

# Class: NDKNostrRpc

## Extends

- `EventEmitter`

## Constructors

### new NDKNostrRpc(ndk, signer, debug)

> **new NDKNostrRpc**(`ndk`, `signer`, `debug`): [`NDKNostrRpc`](NDKNostrRpc.md)

#### Parameters

• **ndk**: [`default`](default.md)

• **signer**: [`NDKSigner`](../interfaces/NDKSigner.md)

• **debug**: `Debugger`

#### Returns

[`NDKNostrRpc`](NDKNostrRpc.md)

#### Overrides

`EventEmitter.constructor`

#### Source

[ndk/src/signers/nip46/rpc.ts:30](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/signers/nip46/rpc.ts#L30)

## Methods

### parseEvent()

> **parseEvent**(`event`): `Promise`\<[`NDKRpcRequest`](../interfaces/NDKRpcRequest.md) \| [`NDKRpcResponse`](../interfaces/NDKRpcResponse.md)\>

#### Parameters

• **event**: [`NDKEvent`](NDKEvent.md)

#### Returns

`Promise`\<[`NDKRpcRequest`](../interfaces/NDKRpcRequest.md) \| [`NDKRpcResponse`](../interfaces/NDKRpcResponse.md)\>

#### Source

[ndk/src/signers/nip46/rpc.ts:64](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/signers/nip46/rpc.ts#L64)

***

### sendRequest()

> **sendRequest**(`remotePubkey`, `method`, `params`, `kind`, `cb`?): `Promise`\<[`NDKRpcResponse`](../interfaces/NDKRpcResponse.md)\>

Sends a request.

#### Parameters

• **remotePubkey**: `string`

• **method**: `string`

• **params**: `string`[]= `[]`

• **kind**: `number`= `24133`

• **cb?**: (`res`: [`NDKRpcResponse`](../interfaces/NDKRpcResponse.md)) => `void`

#### Returns

`Promise`\<[`NDKRpcResponse`](../interfaces/NDKRpcResponse.md)\>

#### Source

[ndk/src/signers/nip46/rpc.ts:112](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/signers/nip46/rpc.ts#L112)

***

### sendResponse()

> **sendResponse**(`id`, `remotePubkey`, `result`, `kind`, `error`?): `Promise`\<`void`\>

#### Parameters

• **id**: `string`

• **remotePubkey**: `string`

• **result**: `string`

• **kind**: [`NDKKind`](../enumerations/NDKKind.md)= `NDKKind.NostrConnect`

• **error?**: `string`

#### Returns

`Promise`\<`void`\>

#### Source

[ndk/src/signers/nip46/rpc.ts:78](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/signers/nip46/rpc.ts#L78)

***

### subscribe()

> **subscribe**(`filter`): `Promise`\<[`NDKSubscription`](NDKSubscription.md)\>

Subscribe to a filter. This function will resolve once the subscription is ready.

#### Parameters

• **filter**: [`NDKFilter`](../type-aliases/NDKFilter.md)

#### Returns

`Promise`\<[`NDKSubscription`](NDKSubscription.md)\>

#### Source

[ndk/src/signers/nip46/rpc.ts:40](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/signers/nip46/rpc.ts#L40)
