# Class: NDKPrivateKeySigner

Interface for NDK signers.

## Implements

- [`NDKSigner`](../wiki/NDKSigner)

## Table of contents

### Constructors

- [constructor](../wiki/NDKPrivateKeySigner#constructor)

### Properties

- [privateKey](../wiki/NDKPrivateKeySigner#privatekey)

### Methods

- [blockUntilReady](../wiki/NDKPrivateKeySigner#blockuntilready)
- [decrypt](../wiki/NDKPrivateKeySigner#decrypt)
- [encrypt](../wiki/NDKPrivateKeySigner#encrypt)
- [sign](../wiki/NDKPrivateKeySigner#sign)
- [user](../wiki/NDKPrivateKeySigner#user)
- [generate](../wiki/NDKPrivateKeySigner#generate)

## Constructors

### constructor

• **new NDKPrivateKeySigner**(`privateKey?`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `privateKey?` | `string` |

#### Defined in

[src/signers/private-key/index.ts:11](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/signers/private-key/index.ts#L11)

## Properties

### privateKey

• `Optional` **privateKey**: `string`

#### Defined in

[src/signers/private-key/index.ts:9](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/signers/private-key/index.ts#L9)

## Methods

### blockUntilReady

▸ **blockUntilReady**(): `Promise`<[`NDKUser`](../wiki/NDKUser)\>

Blocks until the signer is ready and returns the associated NDKUser.

#### Returns

`Promise`<[`NDKUser`](../wiki/NDKUser)\>

A promise that resolves to the NDKUser instance.

#### Implementation of

[NDKSigner](../wiki/NDKSigner).[blockUntilReady](../wiki/NDKSigner#blockuntilready)

#### Defined in

[src/signers/private-key/index.ts:23](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/signers/private-key/index.ts#L23)

___

### decrypt

▸ **decrypt**(`sender`, `value`): `Promise`<`string`\>

Decrypts the given value.

#### Parameters

| Name | Type |
| :------ | :------ |
| `sender` | [`NDKUser`](../wiki/NDKUser) |
| `value` | `string` |

#### Returns

`Promise`<`string`\>

#### Implementation of

[NDKSigner](../wiki/NDKSigner).[decrypt](../wiki/NDKSigner#decrypt)

#### Defined in

[src/signers/private-key/index.ts:52](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/signers/private-key/index.ts#L52)

___

### encrypt

▸ **encrypt**(`recipient`, `value`): `Promise`<`string`\>

Encrypts the given Nostr event for the given recipient.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `recipient` | [`NDKUser`](../wiki/NDKUser) | The recipient of the encrypted value. |
| `value` | `string` | The value to be encrypted. |

#### Returns

`Promise`<`string`\>

#### Implementation of

[NDKSigner](../wiki/NDKSigner).[encrypt](../wiki/NDKSigner#encrypt)

#### Defined in

[src/signers/private-key/index.ts:43](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/signers/private-key/index.ts#L43)

___

### sign

▸ **sign**(`event`): `Promise`<`string`\>

Signs the given Nostr event.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `event` | [`NostrEvent`](../wiki/Exports#nostrevent) | The Nostr event to be signed. |

#### Returns

`Promise`<`string`\>

A promise that resolves to the signature of the signed event.

#### Implementation of

[NDKSigner](../wiki/NDKSigner).[sign](../wiki/NDKSigner#sign)

#### Defined in

[src/signers/private-key/index.ts:35](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/signers/private-key/index.ts#L35)

___

### user

▸ **user**(): `Promise`<[`NDKUser`](../wiki/NDKUser)\>

Getter for the user property.

#### Returns

`Promise`<[`NDKUser`](../wiki/NDKUser)\>

A promise that resolves to the NDKUser instance.

#### Implementation of

[NDKSigner](../wiki/NDKSigner).[user](../wiki/NDKSigner#user)

#### Defined in

[src/signers/private-key/index.ts:30](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/signers/private-key/index.ts#L30)

___

### generate

▸ `Static` **generate**(): [`NDKPrivateKeySigner`](../wiki/NDKPrivateKeySigner)

#### Returns

[`NDKPrivateKeySigner`](../wiki/NDKPrivateKeySigner)

#### Defined in

[src/signers/private-key/index.ts:18](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/signers/private-key/index.ts#L18)
