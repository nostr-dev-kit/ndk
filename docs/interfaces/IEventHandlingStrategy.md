[NDK](../README.md) / [Exports](../modules.md) / IEventHandlingStrategy

# Interface: IEventHandlingStrategy

## Table of contents

### Methods

- [handle](IEventHandlingStrategy.md#handle)

## Methods

### handle

▸ **handle**(`backend`, `remotePubkey`, `params`): `Promise`<`undefined` \| `string`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `backend` | [`NDKNip46Backend`](../classes/NDKNip46Backend.md) |
| `remotePubkey` | `string` |
| `params` | `string`[] |

#### Returns

`Promise`<`undefined` \| `string`\>

#### Defined in

[src/signers/nip46/backend/index.ts:11](https://github.com/nostr-dev-kit/ndk/blob/db9bb3b/src/signers/nip46/backend/index.ts#L11)
