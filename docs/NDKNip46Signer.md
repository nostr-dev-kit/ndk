# Class: NDKNip46Signer

This NDKSigner implements NIP-46, which allows remote signing of events.
This class is meant to be used client-side, paired with the NDKNip46Backend or a NIP-46 backend (like Nostr-Connect)

## Implements

- [`NDKSigner`](../wiki/NDKSigner)

## Table of contents

### Constructors

- [constructor](../wiki/NDKNip46Signer#constructor)

### Properties

- [localSigner](../wiki/NDKNip46Signer#localsigner)
- [remotePubkey](../wiki/NDKNip46Signer#remotepubkey)
- [remoteUser](../wiki/NDKNip46Signer#remoteuser)
- [token](../wiki/NDKNip46Signer#token)

### Methods

- [blockUntilReady](../wiki/NDKNip46Signer#blockuntilready)
- [decrypt](../wiki/NDKNip46Signer#decrypt)
- [encrypt](../wiki/NDKNip46Signer#encrypt)
- [sign](../wiki/NDKNip46Signer#sign)
- [user](../wiki/NDKNip46Signer#user)

## Constructors

### constructor

• **new NDKNip46Signer**(`ndk`, `token`, `localSigner?`)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `ndk` | [`default`](../wiki/default) | The NDK instance to use |
| `token` | `string` | connection token, in the form "npub#otp" |
| `localSigner?` | [`NDKSigner`](../wiki/NDKSigner) | The signer that will be used to request events to be signed |

#### Defined in

[src/signers/nip46/index.ts:23](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/signers/nip46/index.ts#L23)

• **new NDKNip46Signer**(`ndk`, `remoteNpub`, `localSigner?`)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `ndk` | [`default`](../wiki/default) | The NDK instance to use |
| `remoteNpub` | `string` | The npub that wants to be published as |
| `localSigner?` | [`NDKSigner`](../wiki/NDKSigner) | The signer that will be used to request events to be signed |

#### Defined in

[src/signers/nip46/index.ts:30](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/signers/nip46/index.ts#L30)

• **new NDKNip46Signer**(`ndk`, `remotePubkey`, `localSigner?`)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `ndk` | [`default`](../wiki/default) | The NDK instance to use |
| `remotePubkey` | `string` | The public key of the npub that wants to be published as |
| `localSigner?` | [`NDKSigner`](../wiki/NDKSigner) | The signer that will be used to request events to be signed |

#### Defined in

[src/signers/nip46/index.ts:37](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/signers/nip46/index.ts#L37)

## Properties

### localSigner

• **localSigner**: [`NDKSigner`](../wiki/NDKSigner)

#### Defined in

[src/signers/nip46/index.ts:13](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/signers/nip46/index.ts#L13)

___

### remotePubkey

• **remotePubkey**: `string`

#### Defined in

[src/signers/nip46/index.ts:11](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/signers/nip46/index.ts#L11)

___

### remoteUser

• **remoteUser**: [`NDKUser`](../wiki/NDKUser)

#### Defined in

[src/signers/nip46/index.ts:10](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/signers/nip46/index.ts#L10)

___

### token

• **token**: `undefined` \| `string`

#### Defined in

[src/signers/nip46/index.ts:12](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/signers/nip46/index.ts#L12)

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

[src/signers/nip46/index.ts:81](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/signers/nip46/index.ts#L81)

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

[src/signers/nip46/index.ts:141](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/signers/nip46/index.ts#L141)

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

[src/signers/nip46/index.ts:119](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/signers/nip46/index.ts#L119)

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

[src/signers/nip46/index.ts:164](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/signers/nip46/index.ts#L164)

___

### user

▸ **user**(): `Promise`<[`NDKUser`](../wiki/NDKUser)\>

Get the user that is being published as

#### Returns

`Promise`<[`NDKUser`](../wiki/NDKUser)\>

#### Implementation of

[NDKSigner](../wiki/NDKSigner).[user](../wiki/NDKSigner#user)

#### Defined in

[src/signers/nip46/index.ts:77](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/signers/nip46/index.ts#L77)
