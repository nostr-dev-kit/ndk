**NDK** • [Readme](../README.md) \| [API](../globals.md)

***

[NDK](../README.md) / IEventHandlingStrategy

# Interface: IEventHandlingStrategy

## Methods

### handle()

> **handle**(`backend`, `id`, `remotePubkey`, `params`): `Promise`\<`undefined` \| `string`\>

#### Parameters

• **backend**: [`NDKNip46Backend`](../classes/NDKNip46Backend.md)

• **id**: `string`

• **remotePubkey**: `string`

• **params**: `string`[]

#### Returns

`Promise`\<`undefined` \| `string`\>

#### Source

[ndk/src/signers/nip46/backend/index.ts:44](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/signers/nip46/backend/index.ts#L44)
