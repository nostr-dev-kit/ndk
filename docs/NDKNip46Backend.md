# Class: NDKNip46Backend

This class implements a NIP-46 backend, meaning that it will hold a private key
of the npub that wants to be published as.

This backend is meant to be used by an NDKNip46Signer, which is the class that
should run client-side, where the user wants to sign events from.

## Table of contents

### Constructors

- [constructor](../wiki/NDKNip46Backend#constructor)

### Properties

- [debug](../wiki/NDKNip46Backend#debug)
- [handlers](../wiki/NDKNip46Backend#handlers)
- [localUser](../wiki/NDKNip46Backend#localuser)
- [ndk](../wiki/NDKNip46Backend#ndk)
- [signer](../wiki/NDKNip46Backend#signer)

### Methods

- [applyToken](../wiki/NDKNip46Backend#applytoken)
- [decrypt](../wiki/NDKNip46Backend#decrypt)
- [encrypt](../wiki/NDKNip46Backend#encrypt)
- [pubkeyAllowed](../wiki/NDKNip46Backend#pubkeyallowed)
- [setStrategy](../wiki/NDKNip46Backend#setstrategy)
- [signEvent](../wiki/NDKNip46Backend#signevent)
- [start](../wiki/NDKNip46Backend#start)

## Constructors

### constructor

• **new NDKNip46Backend**(`ndk`, `privateKey`, `permitCallback`)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `ndk` | [`default`](../wiki/default) | The NDK instance to use |
| `privateKey` | `string` | The private key of the npub that wants to be published as |
| `permitCallback` | [`Nip46PermitCallback`](../wiki/Exports#nip46permitcallback) | - |

#### Defined in

[src/signers/nip46/backend/index.ts:48](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/signers/nip46/backend/index.ts#L48)

## Properties

### debug

• `Readonly` **debug**: `Debugger`

#### Defined in

[src/signers/nip46/backend/index.ts:40](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/signers/nip46/backend/index.ts#L40)

___

### handlers

• **handlers**: `Object`

#### Index signature

▪ [method: `string`]: [`IEventHandlingStrategy`](../wiki/IEventHandlingStrategy)

#### Defined in

[src/signers/nip46/backend/index.ts:74](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/signers/nip46/backend/index.ts#L74)

___

### localUser

• `Optional` **localUser**: [`NDKUser`](../wiki/NDKUser)

#### Defined in

[src/signers/nip46/backend/index.ts:39](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/signers/nip46/backend/index.ts#L39)

___

### ndk

• `Readonly` **ndk**: [`default`](../wiki/default)

#### Defined in

[src/signers/nip46/backend/index.ts:37](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/signers/nip46/backend/index.ts#L37)

___

### signer

• `Readonly` **signer**: [`NDKPrivateKeySigner`](../wiki/NDKPrivateKeySigner)

#### Defined in

[src/signers/nip46/backend/index.ts:38](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/signers/nip46/backend/index.ts#L38)

## Methods

### applyToken

▸ **applyToken**(`pubkey`, `token`): `Promise`<`void`\>

Overload this method to apply tokens, which can
wrap permission sets to be applied to a pubkey.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `pubkey` | `string` | public key to apply token to |
| `token` | `string` | token to apply |

#### Returns

`Promise`<`void`\>

#### Defined in

[src/signers/nip46/backend/index.ts:98](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/signers/nip46/backend/index.ts#L98)

___

### decrypt

▸ **decrypt**(`remotePubkey`, `senderUser`, `payload`): `Promise`<`undefined` \| `string`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `remotePubkey` | `string` |
| `senderUser` | [`NDKUser`](../wiki/NDKUser) |
| `payload` | `string` |

#### Returns

`Promise`<`undefined` \| `string`\>

#### Defined in

[src/signers/nip46/backend/index.ts:127](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/signers/nip46/backend/index.ts#L127)

___

### encrypt

▸ **encrypt**(`remotePubkey`, `recipientUser`, `payload`): `Promise`<`undefined` \| `string`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `remotePubkey` | `string` |
| `recipientUser` | [`NDKUser`](../wiki/NDKUser) |
| `payload` | `string` |

#### Returns

`Promise`<`undefined` \| `string`\>

#### Defined in

[src/signers/nip46/backend/index.ts:136](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/signers/nip46/backend/index.ts#L136)

___

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

[src/signers/nip46/backend/index.ts:169](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/signers/nip46/backend/index.ts#L169)

___

### setStrategy

▸ **setStrategy**(`method`, `strategy`): `void`

Enables the user to set a custom strategy for handling incoming events.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `method` | `string` | The method to set the strategy for |
| `strategy` | [`IEventHandlingStrategy`](../wiki/IEventHandlingStrategy) | The strategy to set |

#### Returns

`void`

#### Defined in

[src/signers/nip46/backend/index.ts:88](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/signers/nip46/backend/index.ts#L88)

___

### signEvent

▸ **signEvent**(`remotePubkey`, `params`): `Promise`<`undefined` \| [`NDKEvent`](../wiki/NDKEvent)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `remotePubkey` | `string` |
| `params` | `string`[] |

#### Returns

`Promise`<`undefined` \| [`NDKEvent`](../wiki/NDKEvent)\>

#### Defined in

[src/signers/nip46/backend/index.ts:145](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/signers/nip46/backend/index.ts#L145)

___

### start

▸ **start**(): `Promise`<`void`\>

This method starts the backend, which will start listening for incoming
requests.

#### Returns

`Promise`<`void`\>

#### Defined in

[src/signers/nip46/backend/index.ts:60](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/signers/nip46/backend/index.ts#L60)
