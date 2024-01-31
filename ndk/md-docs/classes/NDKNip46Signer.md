**NDK** • [Readme](../README.md) \| [API](../globals.md)

***

[NDK](../README.md) / NDKNip46Signer

# Class: NDKNip46Signer

This NDKSigner implements NIP-46, which allows remote signing of events.
This class is meant to be used client-side, paired with the NDKNip46Backend or a NIP-46 backend (like Nostr-Connect)

## Emits

authUrl -- Emitted when the user should take an action in certain URL.
                  When a client receives this event, it should direct the user
                  to go to that URL to authorize the application.

## Example

```ts
const ndk = new NDK()
const nip05 = await prompt("enter your nip-05") // Get a NIP-05 the user wants to login with
const privateKey = localStorage.getItem("nip46-local-key") // If we have a private key previously saved, use it
const signer = new NDKNip46Signer(ndk, nip05, privateKey) // Create a signer with (or without) a private key

// Save generated private key for future use
localStorage.setItem("nip46-local-key", signer.localSigner.privateKey)

// If the backend sends an auth_url event, open that URL as a popup so the user can authorize the app
signer.on("authUrl", (url) => { window.open(url, "auth", "width=600,height=600") })

// wait until the signer is ready
const loggedinUser = await signer.blockUntilReady()

alert("You are now logged in as " + loggedinUser.npub)
```

## Extends

- `EventEmitter`

## Implements

- [`NDKSigner`](../interfaces/NDKSigner.md)

## Constructors

### new NDKNip46Signer(ndk, token, localSigner)

> **new NDKNip46Signer**(`ndk`, `token`, `localSigner`?): [`NDKNip46Signer`](NDKNip46Signer.md)

#### Parameters

• **ndk**: [`default`](default.md)

The NDK instance to use

• **token**: `string`

connection token, in the form "npub#otp"

• **localSigner?**: [`NDKSigner`](../interfaces/NDKSigner.md)

The signer that will be used to request events to be signed

#### Returns

[`NDKNip46Signer`](NDKNip46Signer.md)

#### Overrides

`EventEmitter.constructor`

#### Source

[ndk/src/signers/nip46/index.ts:52](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/signers/nip46/index.ts#L52)

### new NDKNip46Signer(ndk, remoteNpub, localSigner)

> **new NDKNip46Signer**(`ndk`, `remoteNpub`, `localSigner`?): [`NDKNip46Signer`](NDKNip46Signer.md)

#### Parameters

• **ndk**: [`default`](default.md)

The NDK instance to use

• **remoteNpub**: `string`

The npub that wants to be published as

• **localSigner?**: [`NDKSigner`](../interfaces/NDKSigner.md)

The signer that will be used to request events to be signed

#### Returns

[`NDKNip46Signer`](NDKNip46Signer.md)

#### Overrides

`EventEmitter.constructor`

#### Source

[ndk/src/signers/nip46/index.ts:59](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/signers/nip46/index.ts#L59)

### new NDKNip46Signer(ndk, remoteNip05, localSigner)

> **new NDKNip46Signer**(`ndk`, `remoteNip05`, `localSigner`?): [`NDKNip46Signer`](NDKNip46Signer.md)

#### Parameters

• **ndk**: [`default`](default.md)

The NDK instance to use

• **remoteNip05**: `string`

The nip05 that wants to be published as

• **localSigner?**: [`NDKSigner`](../interfaces/NDKSigner.md)

The signer that will be used to request events to be signed

#### Returns

[`NDKNip46Signer`](NDKNip46Signer.md)

#### Overrides

`EventEmitter.constructor`

#### Source

[ndk/src/signers/nip46/index.ts:66](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/signers/nip46/index.ts#L66)

### new NDKNip46Signer(ndk, remotePubkey, localSigner)

> **new NDKNip46Signer**(`ndk`, `remotePubkey`, `localSigner`?): [`NDKNip46Signer`](NDKNip46Signer.md)

#### Parameters

• **ndk**: [`default`](default.md)

The NDK instance to use

• **remotePubkey**: `string`

The public key of the npub that wants to be published as

• **localSigner?**: [`NDKSigner`](../interfaces/NDKSigner.md)

The signer that will be used to request events to be signed

#### Returns

[`NDKNip46Signer`](NDKNip46Signer.md)

#### Overrides

`EventEmitter.constructor`

#### Source

[ndk/src/signers/nip46/index.ts:73](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/signers/nip46/index.ts#L73)

## Properties

### localSigner

> **localSigner**: [`NDKSigner`](../interfaces/NDKSigner.md)

#### Source

[ndk/src/signers/nip46/index.ts:41](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/signers/nip46/index.ts#L41)

***

### relayUrls

> **relayUrls**: `string`[] = `[]`

#### Source

[ndk/src/signers/nip46/index.ts:45](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/signers/nip46/index.ts#L45)

***

### remotePubkey

> **remotePubkey**: `undefined` \| `string`

#### Source

[ndk/src/signers/nip46/index.ts:39](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/signers/nip46/index.ts#L39)

***

### remoteUser

> **remoteUser**: [`NDKUser`](NDKUser.md)

#### Source

[ndk/src/signers/nip46/index.ts:38](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/signers/nip46/index.ts#L38)

***

### rpc

> **rpc**: [`NDKNostrRpc`](NDKNostrRpc.md)

#### Source

[ndk/src/signers/nip46/index.ts:43](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/signers/nip46/index.ts#L43)

***

### token

> **token**: `undefined` \| `string`

#### Source

[ndk/src/signers/nip46/index.ts:40](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/signers/nip46/index.ts#L40)

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

[ndk/src/signers/nip46/index.ts:134](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/signers/nip46/index.ts#L134)

***

### createAccount()

> **createAccount**(`username`?, `domain`?, `email`?): `Promise`\<`string`\>

Allows creating a new account on the remote server.

#### Parameters

• **username?**: `string`

Desired username for the NIP-05

• **domain?**: `string`

Desired domain for the NIP-05

• **email?**: `string`

Email address to associate with this account -- Remote servers may use this for recovery

#### Returns

`Promise`\<`string`\>

The public key of the newly created account

#### Source

[ndk/src/signers/nip46/index.ts:256](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/signers/nip46/index.ts#L256)

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

[ndk/src/signers/nip46/index.ts:202](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/signers/nip46/index.ts#L202)

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

[ndk/src/signers/nip46/index.ts:180](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/signers/nip46/index.ts#L180)

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

[ndk/src/signers/nip46/index.ts:225](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/signers/nip46/index.ts#L225)

***

### user()

> **user**(): `Promise`\<[`NDKUser`](NDKUser.md)\>

Get the user that is being published as

#### Returns

`Promise`\<[`NDKUser`](NDKUser.md)\>

#### Implementation of

[`NDKSigner`](../interfaces/NDKSigner.md).[`user`](../interfaces/NDKSigner.md#user)

#### Source

[ndk/src/signers/nip46/index.ts:130](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/signers/nip46/index.ts#L130)
