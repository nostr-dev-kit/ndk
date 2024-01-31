**NDK** • [Readme](../README.md) \| [API](../globals.md)

***

[NDK](../README.md) / NDKZap

# Class: NDKZap

## Extends

- `EventEmitter`

## Constructors

### new NDKZap(args)

> **new NDKZap**(`args`): [`NDKZap`](NDKZap.md)

#### Parameters

• **args**: `ZapConstructorParams`

#### Returns

[`NDKZap`](NDKZap.md)

#### Overrides

`EventEmitter.constructor`

#### Source

[ndk/src/zap/index.ts:31](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/zap/index.ts#L31)

## Properties

### ndk

> **ndk**: [`default`](default.md)

#### Source

[ndk/src/zap/index.ts:27](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/zap/index.ts#L27)

***

### zappedEvent?

> **zappedEvent**?: [`NDKEvent`](NDKEvent.md)

#### Source

[ndk/src/zap/index.ts:28](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/zap/index.ts#L28)

***

### zappedUser

> **zappedUser**: [`NDKUser`](NDKUser.md)

#### Source

[ndk/src/zap/index.ts:29](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/zap/index.ts#L29)

## Methods

### createZapRequest()

> **createZapRequest**(`amount`, `comment`?, `extraTags`?, `relays`?, `signer`?): `Promise`\<`null` \| `string`\>

Generates a kind:9734 zap request and returns the payment request

#### Parameters

• **amount**: `number`

amount to zap in millisatoshis

• **comment?**: `string`

optional comment to include in the zap request

• **extraTags?**: [`NDKTag`](../type-aliases/NDKTag.md)[]

optional extra tags to include in the zap request

• **relays?**: `string`[]

optional relays to ask zapper to publish the zap to

• **signer?**: [`NDKSigner`](../interfaces/NDKSigner.md)

#### Returns

`Promise`\<`null` \| `string`\>

the payment request

#### Source

[ndk/src/zap/index.ts:100](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/zap/index.ts#L100)

***

### generateZapRequest()

> **generateZapRequest**(`amount`, `comment`?, `extraTags`?, `relays`?, `signer`?): `Promise`\<`null` \| `Object`\>

#### Parameters

• **amount**: `number`

• **comment?**: `string`

• **extraTags?**: [`NDKTag`](../type-aliases/NDKTag.md)[]

• **relays?**: `string`[]

• **signer?**: [`NDKSigner`](../interfaces/NDKSigner.md)

#### Returns

`Promise`\<`null` \| `Object`\>

#### Source

[ndk/src/zap/index.ts:145](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/zap/index.ts#L145)

***

### getInvoice()

> **getInvoice**(`event`, `amount`, `zapEndpoint`): `Promise`\<`null` \| `string`\>

#### Parameters

• **event**: [`NDKEvent`](NDKEvent.md)

• **amount**: `number`

• **zapEndpoint**: `string`

#### Returns

`Promise`\<`null` \| `string`\>

#### Source

[ndk/src/zap/index.ts:128](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/zap/index.ts#L128)

***

### getZapEndpoint()

> **getZapEndpoint**(): `Promise`\<`undefined` \| `string`\>

#### Returns

`Promise`\<`undefined` \| `string`\>

#### Source

[ndk/src/zap/index.ts:40](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/zap/index.ts#L40)
