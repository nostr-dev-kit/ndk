# Interface: NDKSigner

Interface for NDK signers.

## Implemented by

- [`NDKNip07Signer`](../wiki/NDKNip07Signer)
- [`NDKNip46Signer`](../wiki/NDKNip46Signer)
- [`NDKPrivateKeySigner`](../wiki/NDKPrivateKeySigner)

## Table of contents

### Methods

- [blockUntilReady](../wiki/NDKSigner#blockuntilready)
- [decrypt](../wiki/NDKSigner#decrypt)
- [encrypt](../wiki/NDKSigner#encrypt)
- [sign](../wiki/NDKSigner#sign)
- [user](../wiki/NDKSigner#user)

## Methods

### blockUntilReady

▸ **blockUntilReady**(): `Promise`<[`NDKUser`](../wiki/NDKUser)\>

Blocks until the signer is ready and returns the associated NDKUser.

#### Returns

`Promise`<[`NDKUser`](../wiki/NDKUser)\>

A promise that resolves to the NDKUser instance.

#### Defined in

[src/signers/index.ts:12](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/signers/index.ts#L12)

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

#### Defined in

[src/signers/index.ts:38](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/signers/index.ts#L38)

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

#### Defined in

[src/signers/index.ts:32](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/signers/index.ts#L32)

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

#### Defined in

[src/signers/index.ts:25](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/signers/index.ts#L25)

___

### user

▸ **user**(): `Promise`<[`NDKUser`](../wiki/NDKUser)\>

Getter for the user property.

#### Returns

`Promise`<[`NDKUser`](../wiki/NDKUser)\>

A promise that resolves to the NDKUser instance.

#### Defined in

[src/signers/index.ts:18](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/signers/index.ts#L18)
