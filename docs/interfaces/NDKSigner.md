[NDK](../README.md) / [Exports](../modules.md) / NDKSigner

# Interface: NDKSigner

Interface for NDK signers.

## Implemented by

- [`NDKNip07Signer`](../classes/NDKNip07Signer.md)
- [`NDKNip46Signer`](../classes/NDKNip46Signer.md)
- [`NDKPrivateKeySigner`](../classes/NDKPrivateKeySigner.md)

## Table of contents

### Methods

- [blockUntilReady](NDKSigner.md#blockuntilready)
- [decrypt](NDKSigner.md#decrypt)
- [encrypt](NDKSigner.md#encrypt)
- [sign](NDKSigner.md#sign)
- [user](NDKSigner.md#user)

## Methods

### blockUntilReady

▸ **blockUntilReady**(): `Promise`<[`NDKUser`](../classes/NDKUser.md)\>

Blocks until the signer is ready and returns the associated NDKUser.

#### Returns

`Promise`<[`NDKUser`](../classes/NDKUser.md)\>

A promise that resolves to the NDKUser instance.

#### Defined in

[src/signers/index.ts:12](https://github.com/nostr-dev-kit/ndk/blob/db9bb3b/src/signers/index.ts#L12)

___

### decrypt

▸ **decrypt**(`sender`, `value`): `Promise`<`string`\>

Decrypts the given value.

#### Parameters

| Name | Type |
| :------ | :------ |
| `sender` | [`NDKUser`](../classes/NDKUser.md) |
| `value` | `string` |

#### Returns

`Promise`<`string`\>

#### Defined in

[src/signers/index.ts:38](https://github.com/nostr-dev-kit/ndk/blob/db9bb3b/src/signers/index.ts#L38)

___

### encrypt

▸ **encrypt**(`recipient`, `value`): `Promise`<`string`\>

Encrypts the given Nostr event for the given recipient.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `recipient` | [`NDKUser`](../classes/NDKUser.md) | The recipient of the encrypted value. |
| `value` | `string` | The value to be encrypted. |

#### Returns

`Promise`<`string`\>

#### Defined in

[src/signers/index.ts:32](https://github.com/nostr-dev-kit/ndk/blob/db9bb3b/src/signers/index.ts#L32)

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

#### Defined in

[src/signers/index.ts:25](https://github.com/nostr-dev-kit/ndk/blob/db9bb3b/src/signers/index.ts#L25)

___

### user

▸ **user**(): `Promise`<[`NDKUser`](../classes/NDKUser.md)\>

Getter for the user property.

#### Returns

`Promise`<[`NDKUser`](../classes/NDKUser.md)\>

A promise that resolves to the NDKUser instance.

#### Defined in

[src/signers/index.ts:18](https://github.com/nostr-dev-kit/ndk/blob/db9bb3b/src/signers/index.ts#L18)
