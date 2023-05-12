[NDK](../README.md) / [Exports](../modules.md) / NDKPrivateKeySigner

# Class: NDKPrivateKeySigner

Interface for NDK signers.

## Implements

- [`NDKSigner`](../interfaces/NDKSigner.md)

## Table of contents

### Constructors

- [constructor](NDKPrivateKeySigner.md#constructor)

### Properties

- [privateKey](NDKPrivateKeySigner.md#privatekey)

### Methods

- [blockUntilReady](NDKPrivateKeySigner.md#blockuntilready)
- [decrypt](NDKPrivateKeySigner.md#decrypt)
- [encrypt](NDKPrivateKeySigner.md#encrypt)
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

[src/signers/private-key/index.ts:11](https://github.com/nostr-dev-kit/ndk/blob/db9bb3b/src/signers/private-key/index.ts#L11)

## Properties

### privateKey

• `Optional` **privateKey**: `string`

#### Defined in

[src/signers/private-key/index.ts:9](https://github.com/nostr-dev-kit/ndk/blob/db9bb3b/src/signers/private-key/index.ts#L9)

## Methods

### blockUntilReady

▸ **blockUntilReady**(): `Promise`<[`NDKUser`](NDKUser.md)\>

Blocks until the signer is ready and returns the associated NDKUser.

#### Returns

`Promise`<[`NDKUser`](NDKUser.md)\>

A promise that resolves to the NDKUser instance.

#### Implementation of

[NDKSigner](../interfaces/NDKSigner.md).[blockUntilReady](../interfaces/NDKSigner.md#blockuntilready)

#### Defined in

[src/signers/private-key/index.ts:23](https://github.com/nostr-dev-kit/ndk/blob/db9bb3b/src/signers/private-key/index.ts#L23)

___

### decrypt

▸ **decrypt**(`sender`, `value`): `Promise`<`string`\>

Decrypts the given value.

#### Parameters

| Name | Type |
| :------ | :------ |
| `sender` | [`NDKUser`](NDKUser.md) |
| `value` | `string` |

#### Returns

`Promise`<`string`\>

#### Implementation of

[NDKSigner](../interfaces/NDKSigner.md).[decrypt](../interfaces/NDKSigner.md#decrypt)

#### Defined in

[src/signers/private-key/index.ts:52](https://github.com/nostr-dev-kit/ndk/blob/db9bb3b/src/signers/private-key/index.ts#L52)

___

### encrypt

▸ **encrypt**(`recipient`, `value`): `Promise`<`string`\>

Encrypts the given Nostr event for the given recipient.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `recipient` | [`NDKUser`](NDKUser.md) | The recipient of the encrypted value. |
| `value` | `string` | The value to be encrypted. |

#### Returns

`Promise`<`string`\>

#### Implementation of

[NDKSigner](../interfaces/NDKSigner.md).[encrypt](../interfaces/NDKSigner.md#encrypt)

#### Defined in

[src/signers/private-key/index.ts:43](https://github.com/nostr-dev-kit/ndk/blob/db9bb3b/src/signers/private-key/index.ts#L43)

___

### sign

▸ **sign**(`event`): `Promise`<`string`\>

Signs the given Nostr event.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `event` | [`NostrEvent`](../modules.md#nostrevent) | The Nostr event to be signed. |

#### Returns

`Promise`<`string`\>

A promise that resolves to the signature of the signed event.

#### Implementation of

[NDKSigner](../interfaces/NDKSigner.md).[sign](../interfaces/NDKSigner.md#sign)

#### Defined in

[src/signers/private-key/index.ts:35](https://github.com/nostr-dev-kit/ndk/blob/db9bb3b/src/signers/private-key/index.ts#L35)

___

### user

▸ **user**(): `Promise`<[`NDKUser`](NDKUser.md)\>

Getter for the user property.

#### Returns

`Promise`<[`NDKUser`](NDKUser.md)\>

A promise that resolves to the NDKUser instance.

#### Implementation of

[NDKSigner](../interfaces/NDKSigner.md).[user](../interfaces/NDKSigner.md#user)

#### Defined in

[src/signers/private-key/index.ts:30](https://github.com/nostr-dev-kit/ndk/blob/db9bb3b/src/signers/private-key/index.ts#L30)

___

### generate

▸ `Static` **generate**(): [`NDKPrivateKeySigner`](NDKPrivateKeySigner.md)

#### Returns

[`NDKPrivateKeySigner`](NDKPrivateKeySigner.md)

#### Defined in

[src/signers/private-key/index.ts:18](https://github.com/nostr-dev-kit/ndk/blob/db9bb3b/src/signers/private-key/index.ts#L18)
