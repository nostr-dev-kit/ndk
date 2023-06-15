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
- [remoteUser](NDKNip46Signer.md#remoteuser)
- [token](NDKNip46Signer.md#token)

### Methods

- [blockUntilReady](NDKNip46Signer.md#blockuntilready)
- [decrypt](NDKNip46Signer.md#decrypt)
- [encrypt](NDKNip46Signer.md#encrypt)
- [sign](NDKNip46Signer.md#sign)
- [user](NDKNip46Signer.md#user)

## Constructors

### constructor

• **new NDKNip46Signer**(`ndk`, `token`, `localSigner?`)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `ndk` | [`default`](default.md) | The NDK instance to use |
| `token` | `string` | connection token, in the form "npub#otp" |
| `localSigner?` | [`NDKSigner`](../interfaces/NDKSigner.md) | The signer that will be used to request events to be signed |

#### Defined in

[src/signers/nip46/index.ts:23](https://github.com/nostr-dev-kit/ndk/blob/0aa26c2/src/signers/nip46/index.ts#L23)

• **new NDKNip46Signer**(`ndk`, `remoteNpub`, `localSigner?`)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `ndk` | [`default`](default.md) | The NDK instance to use |
| `remoteNpub` | `string` | The npub that wants to be published as |
| `localSigner?` | [`NDKSigner`](../interfaces/NDKSigner.md) | The signer that will be used to request events to be signed |

#### Defined in

[src/signers/nip46/index.ts:30](https://github.com/nostr-dev-kit/ndk/blob/0aa26c2/src/signers/nip46/index.ts#L30)

• **new NDKNip46Signer**(`ndk`, `remotePubkey`, `localSigner?`)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `ndk` | [`default`](default.md) | The NDK instance to use |
| `remotePubkey` | `string` | The public key of the npub that wants to be published as |
| `localSigner?` | [`NDKSigner`](../interfaces/NDKSigner.md) | The signer that will be used to request events to be signed |

#### Defined in

[src/signers/nip46/index.ts:37](https://github.com/nostr-dev-kit/ndk/blob/0aa26c2/src/signers/nip46/index.ts#L37)

## Properties

### localSigner

• **localSigner**: [`NDKSigner`](../interfaces/NDKSigner.md)

#### Defined in

[src/signers/nip46/index.ts:13](https://github.com/nostr-dev-kit/ndk/blob/0aa26c2/src/signers/nip46/index.ts#L13)

___

### remotePubkey

• **remotePubkey**: `string`

#### Defined in

[src/signers/nip46/index.ts:11](https://github.com/nostr-dev-kit/ndk/blob/0aa26c2/src/signers/nip46/index.ts#L11)

___

### remoteUser

• **remoteUser**: [`NDKUser`](NDKUser.md)

#### Defined in

[src/signers/nip46/index.ts:10](https://github.com/nostr-dev-kit/ndk/blob/0aa26c2/src/signers/nip46/index.ts#L10)

___

### token

• **token**: `undefined` \| `string`

#### Defined in

[src/signers/nip46/index.ts:12](https://github.com/nostr-dev-kit/ndk/blob/0aa26c2/src/signers/nip46/index.ts#L12)

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

[src/signers/nip46/index.ts:81](https://github.com/nostr-dev-kit/ndk/blob/0aa26c2/src/signers/nip46/index.ts#L81)

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

[src/signers/nip46/index.ts:141](https://github.com/nostr-dev-kit/ndk/blob/0aa26c2/src/signers/nip46/index.ts#L141)

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

[src/signers/nip46/index.ts:119](https://github.com/nostr-dev-kit/ndk/blob/0aa26c2/src/signers/nip46/index.ts#L119)

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

[src/signers/nip46/index.ts:164](https://github.com/nostr-dev-kit/ndk/blob/0aa26c2/src/signers/nip46/index.ts#L164)

___

### user

▸ **user**(): `Promise`<[`NDKUser`](NDKUser.md)\>

Get the user that is being published as

#### Returns

`Promise`<[`NDKUser`](NDKUser.md)\>

#### Implementation of

[NDKSigner](../interfaces/NDKSigner.md).[user](../interfaces/NDKSigner.md#user)

#### Defined in

[src/signers/nip46/index.ts:77](https://github.com/nostr-dev-kit/ndk/blob/0aa26c2/src/signers/nip46/index.ts#L77)
