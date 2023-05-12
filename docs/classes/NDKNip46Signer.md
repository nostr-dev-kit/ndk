[NDK](../README.md) / [Exports](../modules.md) / NDKNip46Signer

# Class: NDKNip46Signer

This NDKSigner implements NIP-46, which allows remote signing of events.
This class is meant to be used client-side, paired with the NDKNip46Backend or a NIP-46 backend (like Nostr-Connect)

## Implements

- [`NDKSigner`](../interfaces/NDKSigner.md)

## Table of contents

### Constructors

- [constructor](NDKNip46Signer.md#constructor)

### Properties

- [localSigner](NDKNip46Signer.md#localsigner)
- [remotePubkey](NDKNip46Signer.md#remotepubkey)

### Methods

- [blockUntilReady](NDKNip46Signer.md#blockuntilready)
- [decrypt](NDKNip46Signer.md#decrypt)
- [encrypt](NDKNip46Signer.md#encrypt)
- [sign](NDKNip46Signer.md#sign)
- [user](NDKNip46Signer.md#user)

## Constructors

### constructor

• **new NDKNip46Signer**(`ndk`, `remotePubkey`, `localSigner?`)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `ndk` | [`default`](default.md) | The NDK instance to use |
| `remotePubkey` | `string` | The public key of the npub that wants to be published as |
| `localSigner?` | [`NDKSigner`](../interfaces/NDKSigner.md) | The signer that will be used to request events to be signed |

#### Defined in

[src/signers/nip46/index.ts:21](https://github.com/nostr-dev-kit/ndk/blob/db9bb3b/src/signers/nip46/index.ts#L21)

## Properties

### localSigner

• **localSigner**: [`NDKSigner`](../interfaces/NDKSigner.md)

#### Defined in

[src/signers/nip46/index.ts:11](https://github.com/nostr-dev-kit/ndk/blob/db9bb3b/src/signers/nip46/index.ts#L11)

___

### remotePubkey

• **remotePubkey**: `string`

#### Defined in

[src/signers/nip46/index.ts:10](https://github.com/nostr-dev-kit/ndk/blob/db9bb3b/src/signers/nip46/index.ts#L10)

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

[src/signers/nip46/index.ts:39](https://github.com/nostr-dev-kit/ndk/blob/db9bb3b/src/signers/nip46/index.ts#L39)

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

[src/signers/nip46/index.ts:70](https://github.com/nostr-dev-kit/ndk/blob/db9bb3b/src/signers/nip46/index.ts#L70)

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

[src/signers/nip46/index.ts:66](https://github.com/nostr-dev-kit/ndk/blob/db9bb3b/src/signers/nip46/index.ts#L66)

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

[src/signers/nip46/index.ts:74](https://github.com/nostr-dev-kit/ndk/blob/db9bb3b/src/signers/nip46/index.ts#L74)

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

[src/signers/nip46/index.ts:35](https://github.com/nostr-dev-kit/ndk/blob/db9bb3b/src/signers/nip46/index.ts#L35)
