[NDK](../README.md) / [Exports](../modules.md) / NDKNip46Backend

# Class: NDKNip46Backend

This class implements a NIP-46 backend, meaning that it will hold a private key
of the npub that wants to be published as.

This backend is meant to be used by an NDKNip46Signer, which is the class that
should run client-side, where the user wants to sign events from.

## Table of contents

### Constructors

- [constructor](NDKNip46Backend.md#constructor)

### Properties

- [debug](NDKNip46Backend.md#debug)
- [handlers](NDKNip46Backend.md#handlers)
- [localUser](NDKNip46Backend.md#localuser)
- [ndk](NDKNip46Backend.md#ndk)

### Methods

- [pubkeyAllowed](NDKNip46Backend.md#pubkeyallowed)
- [setStrategy](NDKNip46Backend.md#setstrategy)
- [signEvent](NDKNip46Backend.md#signevent)
- [start](NDKNip46Backend.md#start)

## Constructors

### constructor

• **new NDKNip46Backend**(`ndk`, `privateKey`, `permitCallback`)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `ndk` | [`default`](default.md) | The NDK instance to use |
| `privateKey` | `string` | The private key of the npub that wants to be published as |
| `permitCallback` | [`Nip46PermitCallback`](../modules.md#nip46permitcallback) | - |

#### Defined in

[src/signers/nip46/backend/index.ts:37](https://github.com/nostr-dev-kit/ndk/blob/fece2d0/src/signers/nip46/backend/index.ts#L37)

## Properties

### debug

• `Readonly` **debug**: `Debugger`

#### Defined in

[src/signers/nip46/backend/index.ts:29](https://github.com/nostr-dev-kit/ndk/blob/fece2d0/src/signers/nip46/backend/index.ts#L29)

___

### handlers

• **handlers**: `Object`

#### Index signature

▪ [method: `string`]: [`IEventHandlingStrategy`](../interfaces/IEventHandlingStrategy.md)

#### Defined in

[src/signers/nip46/backend/index.ts:60](https://github.com/nostr-dev-kit/ndk/blob/fece2d0/src/signers/nip46/backend/index.ts#L60)

___

### localUser

• `Optional` **localUser**: [`NDKUser`](NDKUser.md)

#### Defined in

[src/signers/nip46/backend/index.ts:28](https://github.com/nostr-dev-kit/ndk/blob/fece2d0/src/signers/nip46/backend/index.ts#L28)

___

### ndk

• `Readonly` **ndk**: [`default`](default.md)

#### Defined in

[src/signers/nip46/backend/index.ts:26](https://github.com/nostr-dev-kit/ndk/blob/fece2d0/src/signers/nip46/backend/index.ts#L26)

## Methods

### pubkeyAllowed

▸ **pubkeyAllowed**(`pubkey`, `method`, `params?`): `Promise`<`boolean`\>

This method should be overriden by the user to allow or reject incoming
connections.

#### Parameters

| Name | Type |
| :------ | :------ |
| `pubkey` | `string` |
| `method` | `string` |
| `params?` | `any` |

#### Returns

`Promise`<`boolean`\>

#### Defined in

[src/signers/nip46/backend/index.ts:120](https://github.com/nostr-dev-kit/ndk/blob/fece2d0/src/signers/nip46/backend/index.ts#L120)

___

### setStrategy

▸ **setStrategy**(`method`, `strategy`): `void`

Enables the user to set a custom strategy for handling incoming events.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `method` | `string` | The method to set the strategy for |
| `strategy` | [`IEventHandlingStrategy`](../interfaces/IEventHandlingStrategy.md) | The strategy to set |

#### Returns

`void`

#### Defined in

[src/signers/nip46/backend/index.ts:72](https://github.com/nostr-dev-kit/ndk/blob/fece2d0/src/signers/nip46/backend/index.ts#L72)

___

### signEvent

▸ **signEvent**(`remotePubkey`, `params`): `Promise`<`undefined` \| [`NDKEvent`](NDKEvent.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `remotePubkey` | `string` |
| `params` | `string`[] |

#### Returns

`Promise`<`undefined` \| [`NDKEvent`](NDKEvent.md)\>

#### Defined in

[src/signers/nip46/backend/index.ts:96](https://github.com/nostr-dev-kit/ndk/blob/fece2d0/src/signers/nip46/backend/index.ts#L96)

___

### start

▸ **start**(): `Promise`<`void`\>

This method starts the backend, which will start listening for incoming
requests.

#### Returns

`Promise`<`void`\>

#### Defined in

[src/signers/nip46/backend/index.ts:49](https://github.com/nostr-dev-kit/ndk/blob/fece2d0/src/signers/nip46/backend/index.ts#L49)
