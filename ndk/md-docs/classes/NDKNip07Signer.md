**NDK** • [Readme](../README.md) \| [API](../globals.md)

***

[NDK](../README.md) / NDKNip07Signer

# Class: NDKNip07Signer

NDKNip07Signer implements the NDKSigner interface for signing Nostr events
with a NIP-07 browser extension (e.g., getalby, nos2x).

## Implements

- [`NDKSigner`](../interfaces/NDKSigner.md)

## Constructors

### new NDKNip07Signer(waitTimeout)

> **new NDKNip07Signer**(`waitTimeout`): [`NDKNip07Signer`](NDKNip07Signer.md)

#### Parameters

• **waitTimeout**: `number`= `1000`

The timeout in milliseconds to wait for the NIP-07 to become available

#### Returns

[`NDKNip07Signer`](NDKNip07Signer.md)

#### Source

[ndk/src/signers/nip07/index.ts:37](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/signers/nip07/index.ts#L37)

## Properties

### nip04Queue

> **nip04Queue**: `Nip04QueueItem`[] = `[]`

#### Source

[ndk/src/signers/nip07/index.ts:29](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/signers/nip07/index.ts#L29)

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

[ndk/src/signers/nip07/index.ts:42](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/signers/nip07/index.ts#L42)

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

[ndk/src/signers/nip07/index.ts:102](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/signers/nip07/index.ts#L102)

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

[ndk/src/signers/nip07/index.ts:95](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/signers/nip07/index.ts#L95)

***

### relays()

> **relays**(): `Promise`\<[`NDKRelay`](NDKRelay.md)[]\>

Getter for the preferred relays.

#### Returns

`Promise`\<[`NDKRelay`](NDKRelay.md)[]\>

A promise containing a simple map of preferred relays and their read/write policies.

#### Implementation of

[`NDKSigner`](../interfaces/NDKSigner.md).[`relays`](../interfaces/NDKSigner.md#relays)

#### Source

[ndk/src/signers/nip07/index.ts:80](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/signers/nip07/index.ts#L80)

***

### sign()

> **sign**(`event`): `Promise`\<`string`\>

Signs the given Nostr event.

#### Parameters

• **event**: [`NostrEvent`](../type-aliases/NostrEvent.md)

The Nostr event to be signed.

#### Returns

`Promise`\<`string`\>

The signature of the signed event.

#### Implementation of

[`NDKSigner`](../interfaces/NDKSigner.md).[`sign`](../interfaces/NDKSigner.md#sign)

#### Throws

Error if the NIP-07 is not available on the window object.

#### Source

[ndk/src/signers/nip07/index.ts:73](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/signers/nip07/index.ts#L73)

***

### user()

> **user**(): `Promise`\<[`NDKUser`](NDKUser.md)\>

Getter for the user property.

#### Returns

`Promise`\<[`NDKUser`](NDKUser.md)\>

The NDKUser instance.

#### Implementation of

[`NDKSigner`](../interfaces/NDKSigner.md).[`user`](../interfaces/NDKSigner.md#user)

#### Source

[ndk/src/signers/nip07/index.ts:59](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/signers/nip07/index.ts#L59)
