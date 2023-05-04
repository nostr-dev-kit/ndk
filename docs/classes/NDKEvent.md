[NDK](../README.md) / [Exports](../modules.md) / NDKEvent

# Class: NDKEvent

## Hierarchy

- `EventEmitter`

  ↳ **`NDKEvent`**

## Table of contents

### Constructors

- [constructor](NDKEvent.md#constructor)

### Properties

- [content](NDKEvent.md#content)
- [created\_at](NDKEvent.md#created_at)
- [decrypt](NDKEvent.md#decrypt)
- [encode](NDKEvent.md#encode)
- [encrypt](NDKEvent.md#encrypt)
- [id](NDKEvent.md#id)
- [isParamReplaceable](NDKEvent.md#isparamreplaceable)
- [isReplaceable](NDKEvent.md#isreplaceable)
- [kind](NDKEvent.md#kind)
- [ndk](NDKEvent.md#ndk)
- [pubkey](NDKEvent.md#pubkey)
- [sig](NDKEvent.md#sig)
- [subject](NDKEvent.md#subject)
- [tags](NDKEvent.md#tags)

### Methods

- [getMatchingTags](NDKEvent.md#getmatchingtags)
- [publish](NDKEvent.md#publish)
- [rawEvent](NDKEvent.md#rawevent)
- [replaceableDTag](NDKEvent.md#replaceabledtag)
- [sign](NDKEvent.md#sign)
- [tagId](NDKEvent.md#tagid)
- [tagReference](NDKEvent.md#tagreference)
- [toNostrEvent](NDKEvent.md#tonostrevent)
- [toString](NDKEvent.md#tostring)
- [zap](NDKEvent.md#zap)

## Constructors

### constructor

• **new NDKEvent**(`ndk?`, `event?`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `ndk?` | [`default`](default.md) |
| `event?` | [`NostrEvent`](../modules.md#nostrevent) |

#### Overrides

EventEmitter.constructor

#### Defined in

[src/events/index.ts:37](https://github.com/nostr-dev-kit/ndk/blob/fece2d0/src/events/index.ts#L37)

## Properties

### content

• **content**: `string` = `''`

#### Defined in

[src/events/index.ts:29](https://github.com/nostr-dev-kit/ndk/blob/fece2d0/src/events/index.ts#L29)

___

### created\_at

• `Optional` **created\_at**: `number`

#### Defined in

[src/events/index.ts:28](https://github.com/nostr-dev-kit/ndk/blob/fece2d0/src/events/index.ts#L28)

___

### decrypt

• **decrypt**: (...`args`: [sender: NDKUser, signer?: NDKSigner]) => `Promise`<`void`\>

#### Type declaration

▸ (`...args`): `Promise`<`void`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `...args` | [sender: NDKUser, signer?: NDKSigner] |

##### Returns

`Promise`<`void`\>

#### Defined in

[src/events/index.ts:97](https://github.com/nostr-dev-kit/ndk/blob/fece2d0/src/events/index.ts#L97)

___

### encode

• **encode**: (...`args`: []) => `string`

#### Type declaration

▸ (`...args`): `string`

##### Parameters

| Name | Type |
| :------ | :------ |
| `...args` | [] |

##### Returns

`string`

#### Defined in

[src/events/index.ts:95](https://github.com/nostr-dev-kit/ndk/blob/fece2d0/src/events/index.ts#L95)

___

### encrypt

• **encrypt**: (...`args`: [recipient: NDKUser, signer?: NDKSigner]) => `Promise`<`void`\>

#### Type declaration

▸ (`...args`): `Promise`<`void`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `...args` | [recipient: NDKUser, signer?: NDKSigner] |

##### Returns

`Promise`<`void`\>

#### Defined in

[src/events/index.ts:96](https://github.com/nostr-dev-kit/ndk/blob/fece2d0/src/events/index.ts#L96)

___

### id

• **id**: `string` = `""`

#### Defined in

[src/events/index.ts:33](https://github.com/nostr-dev-kit/ndk/blob/fece2d0/src/events/index.ts#L33)

___

### isParamReplaceable

• **isParamReplaceable**: (...`args`: []) => `boolean`

#### Type declaration

▸ (`...args`): `boolean`

##### Parameters

| Name | Type |
| :------ | :------ |
| `...args` | [] |

##### Returns

`boolean`

#### Defined in

[src/events/index.ts:94](https://github.com/nostr-dev-kit/ndk/blob/fece2d0/src/events/index.ts#L94)

___

### isReplaceable

• **isReplaceable**: (...`args`: []) => `boolean`

#### Type declaration

▸ (`...args`): `boolean`

##### Parameters

| Name | Type |
| :------ | :------ |
| `...args` | [] |

##### Returns

`boolean`

#### Defined in

[src/events/index.ts:93](https://github.com/nostr-dev-kit/ndk/blob/fece2d0/src/events/index.ts#L93)

___

### kind

• `Optional` **kind**: `number`

#### Defined in

[src/events/index.ts:32](https://github.com/nostr-dev-kit/ndk/blob/fece2d0/src/events/index.ts#L32)

___

### ndk

• `Optional` **ndk**: [`default`](default.md)

#### Defined in

[src/events/index.ts:27](https://github.com/nostr-dev-kit/ndk/blob/fece2d0/src/events/index.ts#L27)

___

### pubkey

• **pubkey**: `string` = `''`

#### Defined in

[src/events/index.ts:35](https://github.com/nostr-dev-kit/ndk/blob/fece2d0/src/events/index.ts#L35)

___

### sig

• `Optional` **sig**: `string`

#### Defined in

[src/events/index.ts:34](https://github.com/nostr-dev-kit/ndk/blob/fece2d0/src/events/index.ts#L34)

___

### subject

• **subject**: `undefined` \| `string`

#### Defined in

[src/events/index.ts:30](https://github.com/nostr-dev-kit/ndk/blob/fece2d0/src/events/index.ts#L30)

___

### tags

• **tags**: [`NDKTag`](../modules.md#ndktag)[] = `[]`

#### Defined in

[src/events/index.ts:31](https://github.com/nostr-dev-kit/ndk/blob/fece2d0/src/events/index.ts#L31)

## Methods

### getMatchingTags

▸ **getMatchingTags**(`tagName`): [`NDKTag`](../modules.md#ndktag)[]

Get all tags with the given name

#### Parameters

| Name | Type |
| :------ | :------ |
| `tagName` | `string` |

#### Returns

[`NDKTag`](../modules.md#ndktag)[]

#### Defined in

[src/events/index.ts:102](https://github.com/nostr-dev-kit/ndk/blob/fece2d0/src/events/index.ts#L102)

___

### publish

▸ **publish**(): `Promise`<`void`\>

#### Returns

`Promise`<`void`\>

#### Defined in

[src/events/index.ts:130](https://github.com/nostr-dev-kit/ndk/blob/fece2d0/src/events/index.ts#L130)

___

### rawEvent

▸ **rawEvent**(): [`NostrEvent`](../modules.md#nostrevent)

Returns the event as is.

#### Returns

[`NostrEvent`](../modules.md#nostrevent)

#### Defined in

[src/events/index.ts:53](https://github.com/nostr-dev-kit/ndk/blob/fece2d0/src/events/index.ts#L53)

___

### replaceableDTag

▸ **replaceableDTag**(): `string`

#### Returns

`string`

the `d` tag of a parameterized replaceable event

#### Defined in

[src/events/index.ts:158](https://github.com/nostr-dev-kit/ndk/blob/fece2d0/src/events/index.ts#L158)

___

### sign

▸ **sign**(`signer?`): `Promise`<`void`\>

Sign the event if a signer is present.

It will generate tags.
Repleacable events will have their created_at field set to the current time.

#### Parameters

| Name | Type |
| :------ | :------ |
| `signer?` | [`NDKSigner`](../interfaces/NDKSigner.md) |

#### Returns

`Promise`<`void`\>

#### Defined in

[src/events/index.ts:116](https://github.com/nostr-dev-kit/ndk/blob/fece2d0/src/events/index.ts#L116)

___

### tagId

▸ **tagId**(): `string`

#### Returns

`string`

the id of the event, or if it's a parameterized event, the id of the event with the d tag

#### Defined in

[src/events/index.ts:172](https://github.com/nostr-dev-kit/ndk/blob/fece2d0/src/events/index.ts#L172)

___

### tagReference

▸ **tagReference**(): `string`[]

Get the tag that can be used to reference this event from another event

**`Example`**

```ts
event = new NDKEvent(ndk, { kind: 30000, pubkey: 'pubkey', tags: [ ["d", "d-code"] ] });
    event.tagReference(); // ["a", "30000:pubkey:d-code"]

    event = new NDKEvent(ndk, { kind: 1, pubkey: 'pubkey', id: "eventid" });
    event.tagReference(); // ["e", "eventid"]
```

#### Returns

`string`[]

#### Defined in

[src/events/index.ts:192](https://github.com/nostr-dev-kit/ndk/blob/fece2d0/src/events/index.ts#L192)

___

### toNostrEvent

▸ **toNostrEvent**(`pubkey?`): `Promise`<[`NostrEvent`](../modules.md#nostrevent)\>

Return a NostrEvent object, trying to fill in missing fields
when possible.

#### Parameters

| Name | Type |
| :------ | :------ |
| `pubkey?` | `string` |

#### Returns

`Promise`<[`NostrEvent`](../modules.md#nostrevent)\>

#### Defined in

[src/events/index.ts:69](https://github.com/nostr-dev-kit/ndk/blob/fece2d0/src/events/index.ts#L69)

___

### toString

▸ **toString**(): `Promise`<[`NostrEvent`](../modules.md#nostrevent)\>

#### Returns

`Promise`<[`NostrEvent`](../modules.md#nostrevent)\>

#### Defined in

[src/events/index.ts:106](https://github.com/nostr-dev-kit/ndk/blob/fece2d0/src/events/index.ts#L106)

___

### zap

▸ **zap**(`amount`, `comment?`, `extraTags?`): `Promise`<``null`` \| `string`\>

Create a zap request for an existing event

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `amount` | `number` | The amount to zap |
| `comment?` | `string` | A comment to add to the zap request |
| `extraTags?` | [`NDKTag`](../modules.md#ndktag)[] | Extra tags to add to the zap request |

#### Returns

`Promise`<``null`` \| `string`\>

#### Defined in

[src/events/index.ts:208](https://github.com/nostr-dev-kit/ndk/blob/fece2d0/src/events/index.ts#L208)
