# Class: NDKNip07Signer

NDKNip07Signer implements the NDKSigner interface for signing Nostr events
with a NIP-07 browser extension (e.g., getalby, nos2x).

## Implements

- [`NDKSigner`](../wiki/NDKSigner)

## Table of contents

### Constructors

- [constructor](../wiki/NDKNip07Signer#constructor)

### Methods

- [blockUntilReady](../wiki/NDKNip07Signer#blockuntilready)
- [decrypt](../wiki/NDKNip07Signer#decrypt)
- [encrypt](../wiki/NDKNip07Signer#encrypt)
- [sign](../wiki/NDKNip07Signer#sign)
- [user](../wiki/NDKNip07Signer#user)

## Constructors

### constructor

• **new NDKNip07Signer**()

#### Defined in

[src/signers/nip07/index.ts:12](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/signers/nip07/index.ts#L12)

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

[src/signers/nip07/index.ts:18](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/signers/nip07/index.ts#L18)

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

[src/signers/nip07/index.ts:65](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/signers/nip07/index.ts#L65)

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

[src/signers/nip07/index.ts:56](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/signers/nip07/index.ts#L56)

___

### sign

▸ **sign**(`event`): `Promise`<`string`\>

Signs the given Nostr event.

**`Throws`**

Error if the NIP-07 is not available on the window object.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `event` | [`NostrEvent`](../wiki/Exports#nostrevent) | The Nostr event to be signed. |

#### Returns

`Promise`<`string`\>

The signature of the signed event.

#### Implementation of

[NDKSigner](../wiki/NDKSigner).[sign](../wiki/NDKSigner#sign)

#### Defined in

[src/signers/nip07/index.ts:47](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/signers/nip07/index.ts#L47)

___

### user

▸ **user**(): `Promise`<[`NDKUser`](../wiki/NDKUser)\>

Getter for the user property.

#### Returns

`Promise`<[`NDKUser`](../wiki/NDKUser)\>

The NDKUser instance.

#### Implementation of

[NDKSigner](../wiki/NDKSigner).[user](../wiki/NDKSigner#user)

#### Defined in

[src/signers/nip07/index.ts:33](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/signers/nip07/index.ts#L33)
