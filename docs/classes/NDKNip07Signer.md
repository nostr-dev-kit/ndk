[NDK](../README.md) / [Exports](../modules.md) / NDKNip07Signer

# Class: NDKNip07Signer

NDKNip07Signer implements the NDKSigner interface for signing Nostr events
with a NIP-07 browser extension (e.g., getalby, nos2x).

## Implements

- `NDKSigner`

## Table of contents

### Constructors

- [constructor](NDKNip07Signer.md#constructor)

### Methods

- [blockUntilReady](NDKNip07Signer.md#blockuntilready)
- [sign](NDKNip07Signer.md#sign)
- [user](NDKNip07Signer.md#user)

## Constructors

### constructor

• **new NDKNip07Signer**()

#### Defined in

[src/signers/nip07/index.ts:12](https://github.com/nostr-dev-kit/ndk/blob/e1d90e2/src/signers/nip07/index.ts#L12)

## Methods

### blockUntilReady

▸ **blockUntilReady**(): `Promise`<[`NDKUser`](NDKUser.md)\>

#### Returns

`Promise`<[`NDKUser`](NDKUser.md)\>

#### Implementation of

NDKSigner.blockUntilReady

#### Defined in

[src/signers/nip07/index.ts:18](https://github.com/nostr-dev-kit/ndk/blob/e1d90e2/src/signers/nip07/index.ts#L18)

___

### sign

▸ **sign**(`event`): `Promise`<`string`\>

Signs the given Nostr event.

**`Throws`**

Error if the NIP-07 is not available on the window object.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `event` | `NostrEvent` | The Nostr event to be signed. |

#### Returns

`Promise`<`string`\>

The signature of the signed event.

#### Implementation of

NDKSigner.sign

#### Defined in

[src/signers/nip07/index.ts:47](https://github.com/nostr-dev-kit/ndk/blob/e1d90e2/src/signers/nip07/index.ts#L47)

___

### user

▸ **user**(): `Promise`<[`NDKUser`](NDKUser.md)\>

Getter for the user property.

#### Returns

`Promise`<[`NDKUser`](NDKUser.md)\>

The NDKUser instance.

#### Implementation of

NDKSigner.user

#### Defined in

[src/signers/nip07/index.ts:33](https://github.com/nostr-dev-kit/ndk/blob/e1d90e2/src/signers/nip07/index.ts#L33)
