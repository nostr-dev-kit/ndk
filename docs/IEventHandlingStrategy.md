# Interface: IEventHandlingStrategy

## Table of contents

### Methods

- [handle](../wiki/IEventHandlingStrategy#handle)

## Methods

### handle

▸ **handle**(`backend`, `remotePubkey`, `params`): `Promise`<`undefined` \| `string`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `backend` | [`NDKNip46Backend`](../wiki/NDKNip46Backend) |
| `remotePubkey` | `string` |
| `params` | `string`[] |

#### Returns

`Promise`<`undefined` \| `string`\>

#### Defined in

[src/signers/nip46/backend/index.ts:22](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/signers/nip46/backend/index.ts#L22)
