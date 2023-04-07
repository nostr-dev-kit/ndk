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

[src/events/index.ts:35](https://github.com/nostr-dev-kit/ndk/blob/ca80fef/src/events/index.ts#L35)

## Properties

### content

• **content**: `string` = `''`

#### Defined in

[src/events/index.ts:27](https://github.com/nostr-dev-kit/ndk/blob/ca80fef/src/events/index.ts#L27)

___

### created\_at

• `Optional` **created\_at**: `number`

#### Defined in

[src/events/index.ts:26](https://github.com/nostr-dev-kit/ndk/blob/ca80fef/src/events/index.ts#L26)

___

### encode

• **encode**: (...`args`: []) => `undefined` \| `string`

#### Type declaration

▸ (`...args`): `undefined` \| `string`

##### Parameters

| Name | Type |
| :------ | :------ |
| `...args` | [] |

##### Returns

`undefined` \| `string`

#### Defined in

[src/events/index.ts:79](https://github.com/nostr-dev-kit/ndk/blob/ca80fef/src/events/index.ts#L79)

___

### id

• **id**: `string` = `""`

#### Defined in

[src/events/index.ts:31](https://github.com/nostr-dev-kit/ndk/blob/ca80fef/src/events/index.ts#L31)

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

[src/events/index.ts:78](https://github.com/nostr-dev-kit/ndk/blob/ca80fef/src/events/index.ts#L78)

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

[src/events/index.ts:77](https://github.com/nostr-dev-kit/ndk/blob/ca80fef/src/events/index.ts#L77)

___

### kind

• `Optional` **kind**: `number`

#### Defined in

[src/events/index.ts:30](https://github.com/nostr-dev-kit/ndk/blob/ca80fef/src/events/index.ts#L30)

___

### ndk

• `Optional` **ndk**: [`default`](default.md)

#### Defined in

[src/events/index.ts:25](https://github.com/nostr-dev-kit/ndk/blob/ca80fef/src/events/index.ts#L25)

___

### pubkey

• **pubkey**: `string` = `''`

#### Defined in

[src/events/index.ts:33](https://github.com/nostr-dev-kit/ndk/blob/ca80fef/src/events/index.ts#L33)

___

### sig

• `Optional` **sig**: `string`

#### Defined in

[src/events/index.ts:32](https://github.com/nostr-dev-kit/ndk/blob/ca80fef/src/events/index.ts#L32)

___

### subject

• **subject**: `undefined` \| `string`

#### Defined in

[src/events/index.ts:28](https://github.com/nostr-dev-kit/ndk/blob/ca80fef/src/events/index.ts#L28)

___

### tags

• **tags**: `NDKTag`[] = `[]`

#### Defined in

[src/events/index.ts:29](https://github.com/nostr-dev-kit/ndk/blob/ca80fef/src/events/index.ts#L29)

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

[src/events/index.ts:84](https://github.com/nostr-dev-kit/ndk/blob/ca80fef/src/events/index.ts#L84)

___

### publish

▸ **publish**(): `Promise`<`void`\>

#### Returns

`Promise`<`void`\>

#### Defined in

[src/events/index.ts:101](https://github.com/nostr-dev-kit/ndk/blob/ca80fef/src/events/index.ts#L101)

___

### sign

▸ **sign**(): `Promise`<`void`\>

#### Returns

`Promise`<`void`\>

#### Defined in

[src/events/index.ts:92](https://github.com/nostr-dev-kit/ndk/blob/ca80fef/src/events/index.ts#L92)

___

### tagId

▸ **tagId**(): `string`

#### Returns

`string`

the id of the event, or if it's a parameterized event, the id of the event with the d tag

#### Defined in

[src/events/index.ts:129](https://github.com/nostr-dev-kit/ndk/blob/ca80fef/src/events/index.ts#L129)

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

[src/events/index.ts:150](https://github.com/nostr-dev-kit/ndk/blob/ca80fef/src/events/index.ts#L150)

___

### toNostrEvent

▸ **toNostrEvent**(`pubkey?`): `Promise`<`NostrEvent`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `pubkey?` | `string` |

#### Returns

`Promise`<`NostrEvent`\>

#### Defined in

[src/events/index.ts:48](https://github.com/nostr-dev-kit/ndk/blob/ca80fef/src/events/index.ts#L48)

___

### toString

▸ **toString**(): `Promise`<`NostrEvent`\>

#### Returns

`Promise`<`NostrEvent`\>

#### Defined in

[src/events/index.ts:88](https://github.com/nostr-dev-kit/ndk/blob/ca80fef/src/events/index.ts#L88)

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

[src/events/index.ts:162](https://github.com/nostr-dev-kit/ndk/blob/ca80fef/src/events/index.ts#L162)
