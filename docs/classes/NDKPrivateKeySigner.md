[NDK](../README.md) / [Exports](../modules.md) / NDKPrivateKeySigner

# Class: NDKPrivateKeySigner

## Implements

- `NDKSigner`

## Table of contents

### Constructors

- [constructor](NDKPrivateKeySigner.md#constructor)

### Properties

- [privateKey](NDKPrivateKeySigner.md#privatekey)

### Methods

- [blockUntilReady](NDKPrivateKeySigner.md#blockuntilready)
- [sign](NDKPrivateKeySigner.md#sign)
- [user](NDKPrivateKeySigner.md#user)
- [generate](NDKPrivateKeySigner.md#generate)

## Constructors

### constructor

• **new NDKPrivateKeySigner**(`privateKey?`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `privateKey?` | `string` |

#### Defined in

[src/signers/private-key/index.ts:11](https://github.com/nostr-dev-kit/ndk/blob/4e41494/src/signers/private-key/index.ts#L11)

## Properties

### privateKey

• `Optional` **privateKey**: `string`

#### Defined in

[src/signers/private-key/index.ts:9](https://github.com/nostr-dev-kit/ndk/blob/4e41494/src/signers/private-key/index.ts#L9)

## Methods

### blockUntilReady

▸ **blockUntilReady**(): `Promise`<[`NDKUser`](NDKUser.md)\>

#### Returns

`Promise`<[`NDKUser`](NDKUser.md)\>

#### Implementation of

NDKSigner.blockUntilReady

#### Defined in

[src/signers/private-key/index.ts:23](https://github.com/nostr-dev-kit/ndk/blob/4e41494/src/signers/private-key/index.ts#L23)

___

### sign

▸ **sign**(`event`): `Promise`<`string`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | `NostrEvent` |

#### Returns

`Promise`<`string`\>

#### Implementation of

NDKSigner.sign

#### Defined in

[src/signers/private-key/index.ts:35](https://github.com/nostr-dev-kit/ndk/blob/4e41494/src/signers/private-key/index.ts#L35)

___

### user

▸ **user**(): `Promise`<[`NDKUser`](NDKUser.md)\>

#### Returns

`Promise`<[`NDKUser`](NDKUser.md)\>

#### Implementation of

NDKSigner.user

#### Defined in

[src/signers/private-key/index.ts:30](https://github.com/nostr-dev-kit/ndk/blob/4e41494/src/signers/private-key/index.ts#L30)

___

### generate

▸ `Static` **generate**(): [`NDKPrivateKeySigner`](NDKPrivateKeySigner.md)

#### Returns

[`NDKPrivateKeySigner`](NDKPrivateKeySigner.md)

#### Defined in

[src/signers/private-key/index.ts:18](https://github.com/nostr-dev-kit/ndk/blob/4e41494/src/signers/private-key/index.ts#L18)
