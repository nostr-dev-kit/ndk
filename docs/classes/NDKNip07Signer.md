[NDK](../README.md) / [Exports](../modules.md) / NDKNip07Signer

# Class: NDKNip07Signer

NDKNip07Signer implements the NDKSigner interface for signing Nostr events
with a NIP-07 browser extension (e.g., getalby, nos2x).

## Implements

- [`NDKSigner`](../interfaces/NDKSigner.md)

## Table of contents

### Constructors

- [constructor](NDKNip07Signer.md#constructor)

### Methods

- [blockUntilReady](NDKNip07Signer.md#blockuntilready)
- [decrypt](NDKNip07Signer.md#decrypt)
- [encrypt](NDKNip07Signer.md#encrypt)
- [sign](NDKNip07Signer.md#sign)
- [user](NDKNip07Signer.md#user)

## Constructors

### constructor

• **new NDKNip07Signer**()

#### Defined in

[src/signers/nip07/index.ts:12](https://github.com/nostr-dev-kit/ndk/blob/4b9fbc9/src/signers/nip07/index.ts#L12)

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

[src/signers/nip07/index.ts:18](https://github.com/nostr-dev-kit/ndk/blob/4b9fbc9/src/signers/nip07/index.ts#L18)

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

[src/signers/nip07/index.ts:65](https://github.com/nostr-dev-kit/ndk/blob/4b9fbc9/src/signers/nip07/index.ts#L65)

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

[src/signers/nip07/index.ts:56](https://github.com/nostr-dev-kit/ndk/blob/4b9fbc9/src/signers/nip07/index.ts#L56)

___

### sign

▸ **sign**(`event`): `Promise`<`string`\>

Signs the given Nostr event.

**`Throws`**

Error if the NIP-07 is not available on the window object.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `event` | [`NostrEvent`](../modules.md#nostrevent) | The Nostr event to be signed. |

#### Returns

`Promise`<`string`\>

The signature of the signed event.

#### Implementation of

[NDKSigner](../interfaces/NDKSigner.md).[sign](../interfaces/NDKSigner.md#sign)

#### Defined in

[src/signers/nip07/index.ts:47](https://github.com/nostr-dev-kit/ndk/blob/4b9fbc9/src/signers/nip07/index.ts#L47)

___

### user

▸ **user**(): `Promise`<[`NDKUser`](NDKUser.md)\>

Getter for the user property.

#### Returns

`Promise`<[`NDKUser`](NDKUser.md)\>

The NDKUser instance.

#### Implementation of

[NDKSigner](../interfaces/NDKSigner.md).[user](../interfaces/NDKSigner.md#user)

#### Defined in

[src/signers/nip07/index.ts:33](https://github.com/nostr-dev-kit/ndk/blob/4b9fbc9/src/signers/nip07/index.ts#L33)
