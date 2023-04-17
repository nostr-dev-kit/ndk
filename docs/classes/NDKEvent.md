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
- [encode](NDKEvent.md#encode)
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
| `event?` | `NostrEvent` |

#### Overrides

EventEmitter.constructor

#### Defined in

[src/events/index.ts:35](https://github.com/nostr-dev-kit/ndk/blob/2bb66fa/src/events/index.ts#L35)

## Properties

### content

• **content**: `string` = `''`

#### Defined in

[src/events/index.ts:27](https://github.com/nostr-dev-kit/ndk/blob/2bb66fa/src/events/index.ts#L27)

___

### created\_at

• `Optional` **created\_at**: `number`

#### Defined in

[src/events/index.ts:26](https://github.com/nostr-dev-kit/ndk/blob/2bb66fa/src/events/index.ts#L26)

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

[src/events/index.ts:97](https://github.com/nostr-dev-kit/ndk/blob/2bb66fa/src/events/index.ts#L97)

___

### id

• **id**: `string` = `""`

#### Defined in

[src/events/index.ts:31](https://github.com/nostr-dev-kit/ndk/blob/2bb66fa/src/events/index.ts#L31)

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

[src/events/index.ts:96](https://github.com/nostr-dev-kit/ndk/blob/2bb66fa/src/events/index.ts#L96)

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

[src/events/index.ts:95](https://github.com/nostr-dev-kit/ndk/blob/2bb66fa/src/events/index.ts#L95)

___

### kind

• `Optional` **kind**: `number`

#### Defined in

[src/events/index.ts:30](https://github.com/nostr-dev-kit/ndk/blob/2bb66fa/src/events/index.ts#L30)

___

### ndk

• `Optional` **ndk**: [`default`](default.md)

#### Defined in

[src/events/index.ts:25](https://github.com/nostr-dev-kit/ndk/blob/2bb66fa/src/events/index.ts#L25)

___

### pubkey

• **pubkey**: `string` = `''`

#### Defined in

[src/events/index.ts:33](https://github.com/nostr-dev-kit/ndk/blob/2bb66fa/src/events/index.ts#L33)

___

### sig

• `Optional` **sig**: `string`

#### Defined in

[src/events/index.ts:32](https://github.com/nostr-dev-kit/ndk/blob/2bb66fa/src/events/index.ts#L32)

___

### subject

• **subject**: `undefined` \| `string`

#### Defined in

[src/events/index.ts:28](https://github.com/nostr-dev-kit/ndk/blob/2bb66fa/src/events/index.ts#L28)

___

### tags

• **tags**: `NDKTag`[] = `[]`

#### Defined in

[src/events/index.ts:29](https://github.com/nostr-dev-kit/ndk/blob/2bb66fa/src/events/index.ts#L29)

## Methods

### getMatchingTags

▸ **getMatchingTags**(`tagName`): `NDKTag`[]

Get all tags with the given name

#### Parameters

| Name | Type |
| :------ | :------ |
| `tagName` | `string` |

#### Returns

`NDKTag`[]

#### Defined in

[src/events/index.ts:102](https://github.com/nostr-dev-kit/ndk/blob/2bb66fa/src/events/index.ts#L102)

___

### publish

▸ **publish**(): `Promise`<`void`\>

#### Returns

`Promise`<`void`\>

#### Defined in

[src/events/index.ts:119](https://github.com/nostr-dev-kit/ndk/blob/2bb66fa/src/events/index.ts#L119)

___

### rawEvent

▸ **rawEvent**(): `NostrEvent`

Returns the event as is.

#### Returns

`NostrEvent`

#### Defined in

[src/events/index.ts:51](https://github.com/nostr-dev-kit/ndk/blob/2bb66fa/src/events/index.ts#L51)

___

### replaceableDTag

▸ **replaceableDTag**(): `string`

#### Returns

`string`

the `d` tag of a parameterized replaceable event

#### Defined in

[src/events/index.ts:147](https://github.com/nostr-dev-kit/ndk/blob/2bb66fa/src/events/index.ts#L147)

___

### sign

▸ **sign**(): `Promise`<`void`\>

#### Returns

`Promise`<`void`\>

#### Defined in

[src/events/index.ts:110](https://github.com/nostr-dev-kit/ndk/blob/2bb66fa/src/events/index.ts#L110)

___

### tagId

▸ **tagId**(): `string`

#### Returns

`string`

the id of the event, or if it's a parameterized event, the id of the event with the d tag

#### Defined in

[src/events/index.ts:161](https://github.com/nostr-dev-kit/ndk/blob/2bb66fa/src/events/index.ts#L161)

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

[src/events/index.ts:181](https://github.com/nostr-dev-kit/ndk/blob/2bb66fa/src/events/index.ts#L181)

___

### toNostrEvent

▸ **toNostrEvent**(`pubkey?`): `Promise`<`NostrEvent`\>

Return a NostrEvent object, trying to fill in missing fields
when possible.

#### Parameters

| Name | Type |
| :------ | :------ |
| `pubkey?` | `string` |

#### Returns

`Promise`<`NostrEvent`\>

#### Defined in

[src/events/index.ts:66](https://github.com/nostr-dev-kit/ndk/blob/2bb66fa/src/events/index.ts#L66)

___

### toString

▸ **toString**(): `Promise`<`NostrEvent`\>

#### Returns

`Promise`<`NostrEvent`\>

#### Defined in

[src/events/index.ts:106](https://github.com/nostr-dev-kit/ndk/blob/2bb66fa/src/events/index.ts#L106)

___

### zap

▸ **zap**(`amount`, `comment?`): `Promise`<``null`` \| `string`\>

Create a zap request for an existing event

#### Parameters

| Name | Type |
| :------ | :------ |
| `amount` | `number` |
| `comment?` | `string` |

#### Returns

`Promise`<``null`` \| `string`\>

#### Defined in

[src/events/index.ts:193](https://github.com/nostr-dev-kit/ndk/blob/2bb66fa/src/events/index.ts#L193)
