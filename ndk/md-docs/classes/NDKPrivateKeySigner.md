**NDK** • [Readme](../README.md) \| [API](../globals.md)

***

[NDK](../README.md) / NDKPrivateKeySigner

# Class: NDKPrivateKeySigner

Interface for NDK signers.

## Implements

- [`NDKSigner`](../interfaces/NDKSigner.md)

## Constructors

### new NDKPrivateKeySigner(privateKey)

> **new NDKPrivateKeySigner**(`privateKey`?): [`NDKPrivateKeySigner`](NDKPrivateKeySigner.md)

#### Parameters

• **privateKey?**: `string`

#### Returns

[`NDKPrivateKeySigner`](NDKPrivateKeySigner.md)

#### Source

[ndk/src/signers/private-key/index.ts:12](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/signers/private-key/index.ts#L12)

## Properties

### privateKey?

> **privateKey**?: `string`

#### Source

[ndk/src/signers/private-key/index.ts:10](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/signers/private-key/index.ts#L10)

## Methods

### blockUntilReady()

> **blockUntilReady**(): `Promise`\<[`NDKUser`](NDKUser.md)\>

Blocks until the signer is ready and returns the associated NDKUser.

#### Returns

`Promise`\<[`NDKUser`](NDKUser.md)\>

A promise that resolves to the NDKUser instance.

#### Implementation of

[`NDKSigner`](../interfaces/NDKSigner.md).[`blockUntilReady`](../interfaces/NDKSigner.md#blockuntilready)

#### Source

[ndk/src/signers/private-key/index.ts:26](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/signers/private-key/index.ts#L26)

***

### decrypt()

> **decrypt**(`sender`, `value`): `Promise`\<`string`\>

Decrypts the given value.

#### Parameters

• **sender**: [`NDKUser`](NDKUser.md)

• **value**: `string`

#### Returns

`Promise`\<`string`\>

#### Implementation of

[`NDKSigner`](../interfaces/NDKSigner.md).[`decrypt`](../interfaces/NDKSigner.md#decrypt)

#### Source

[ndk/src/signers/private-key/index.ts:55](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/signers/private-key/index.ts#L55)

***

### encrypt()

> **encrypt**(`recipient`, `value`): `Promise`\<`string`\>

Encrypts the given Nostr event for the given recipient.

#### Parameters

• **recipient**: [`NDKUser`](NDKUser.md)

The recipient of the encrypted value.

• **value**: `string`

The value to be encrypted.

#### Returns

`Promise`\<`string`\>

#### Implementation of

[`NDKSigner`](../interfaces/NDKSigner.md).[`encrypt`](../interfaces/NDKSigner.md#encrypt)

#### Source

[ndk/src/signers/private-key/index.ts:46](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/signers/private-key/index.ts#L46)

***

### sign()

> **sign**(`event`): `Promise`\<`string`\>

Signs the given Nostr event.

#### Parameters

• **event**: [`NostrEvent`](../type-aliases/NostrEvent.md)

The Nostr event to be signed.

#### Returns

`Promise`\<`string`\>

A promise that resolves to the signature of the signed event.

#### Implementation of

[`NDKSigner`](../interfaces/NDKSigner.md).[`sign`](../interfaces/NDKSigner.md#sign)

#### Source

[ndk/src/signers/private-key/index.ts:38](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/signers/private-key/index.ts#L38)

***

### user()

> **user**(): `Promise`\<[`NDKUser`](NDKUser.md)\>

Getter for the user property.

#### Returns

`Promise`\<[`NDKUser`](NDKUser.md)\>

A promise that resolves to the NDKUser instance.

#### Implementation of

[`NDKSigner`](../interfaces/NDKSigner.md).[`user`](../interfaces/NDKSigner.md#user)

#### Source

[ndk/src/signers/private-key/index.ts:33](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/signers/private-key/index.ts#L33)

***

### generate()

> **`static`** **generate**(): [`NDKPrivateKeySigner`](NDKPrivateKeySigner.md)

#### Returns

[`NDKPrivateKeySigner`](NDKPrivateKeySigner.md)

#### Source

[ndk/src/signers/private-key/index.ts:21](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/signers/private-key/index.ts#L21)
