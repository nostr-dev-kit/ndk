**NDK** • [Readme](../README.md) \| [API](../globals.md)

***

[NDK](../README.md) / NDKSigner

# Interface: NDKSigner

Interface for NDK signers.

## Methods

### blockUntilReady()

> **blockUntilReady**(): `Promise`\<[`NDKUser`](../classes/NDKUser.md)\>

Blocks until the signer is ready and returns the associated NDKUser.

#### Returns

`Promise`\<[`NDKUser`](../classes/NDKUser.md)\>

A promise that resolves to the NDKUser instance.

#### Source

[ndk/src/signers/index.ts:13](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/signers/index.ts#L13)

***

### decrypt()

> **decrypt**(`sender`, `value`): `Promise`\<`string`\>

Decrypts the given value.

#### Parameters

• **sender**: [`NDKUser`](../classes/NDKUser.md)

• **value**: `string`

#### Returns

`Promise`\<`string`\>

#### Source

[ndk/src/signers/index.ts:45](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/signers/index.ts#L45)

***

### encrypt()

> **encrypt**(`recipient`, `value`): `Promise`\<`string`\>

Encrypts the given Nostr event for the given recipient.

#### Parameters

• **recipient**: [`NDKUser`](../classes/NDKUser.md)

The recipient of the encrypted value.

• **value**: `string`

The value to be encrypted.

#### Returns

`Promise`\<`string`\>

#### Source

[ndk/src/signers/index.ts:39](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/signers/index.ts#L39)

***

### relays()?

> **`optional`** **relays**(): `Promise`\<[`NDKRelay`](../classes/NDKRelay.md)[]\>

Getter for the preferred relays.

#### Returns

`Promise`\<[`NDKRelay`](../classes/NDKRelay.md)[]\>

A promise containing a simple map of preferred relays and their read/write policies.

#### Source

[ndk/src/signers/index.ts:32](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/signers/index.ts#L32)

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

#### Source

[ndk/src/signers/index.ts:26](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/signers/index.ts#L26)

***

### user()

> **user**(): `Promise`\<[`NDKUser`](../classes/NDKUser.md)\>

Getter for the user property.

#### Returns

`Promise`\<[`NDKUser`](../classes/NDKUser.md)\>

A promise that resolves to the NDKUser instance.

#### Source

[ndk/src/signers/index.ts:19](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/signers/index.ts#L19)
