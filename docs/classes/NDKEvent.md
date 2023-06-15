[NDK](../README.md) / [Exports](../modules.md) / NDKEvent

# Class: NDKEvent

NDKEvent is the basic building block of NDK; most things
you do with NDK will revolve around writing or consuming NDKEvents.

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
- [relay](NDKEvent.md#relay)
- [sig](NDKEvent.md#sig)
- [tags](NDKEvent.md#tags)

### Accessors

- [author](NDKEvent.md#author)

### Methods

- [delete](NDKEvent.md#delete)
- [filter](NDKEvent.md#filter)
- [getMatchingTags](NDKEvent.md#getmatchingtags)
- [publish](NDKEvent.md#publish)
- [rawEvent](NDKEvent.md#rawevent)
- [removeTag](NDKEvent.md#removetag)
- [replaceableDTag](NDKEvent.md#replaceabledtag)
- [repost](NDKEvent.md#repost)
- [sign](NDKEvent.md#sign)
- [tag](NDKEvent.md#tag)
- [tagId](NDKEvent.md#tagid)
- [tagReference](NDKEvent.md#tagreference)
- [tagValue](NDKEvent.md#tagvalue)
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

[src/events/index.ts:49](https://github.com/nostr-dev-kit/ndk/blob/0aa26c2/src/events/index.ts#L49)

## Properties

### content

• **content**: `string` = `""`

#### Defined in

[src/events/index.ts:37](https://github.com/nostr-dev-kit/ndk/blob/0aa26c2/src/events/index.ts#L37)

___

### created\_at

• `Optional` **created\_at**: `number`

#### Defined in

[src/events/index.ts:36](https://github.com/nostr-dev-kit/ndk/blob/0aa26c2/src/events/index.ts#L36)

___

### decrypt

• **decrypt**: (...`args`: [sender?: NDKUser, signer?: NDKSigner]) => `Promise`<`void`\>

#### Type declaration

▸ (`...args`): `Promise`<`void`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `...args` | [sender?: NDKUser, signer?: NDKSigner] |

##### Returns

`Promise`<`void`\>

#### Defined in

[src/events/index.ts:162](https://github.com/nostr-dev-kit/ndk/blob/0aa26c2/src/events/index.ts#L162)

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

[src/events/index.ts:160](https://github.com/nostr-dev-kit/ndk/blob/0aa26c2/src/events/index.ts#L160)

___

### encrypt

• **encrypt**: (...`args`: [recipient?: NDKUser, signer?: NDKSigner]) => `Promise`<`void`\>

#### Type declaration

▸ (`...args`): `Promise`<`void`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `...args` | [recipient?: NDKUser, signer?: NDKSigner] |

##### Returns

`Promise`<`void`\>

#### Defined in

[src/events/index.ts:161](https://github.com/nostr-dev-kit/ndk/blob/0aa26c2/src/events/index.ts#L161)

___

### id

• **id**: `string` = `""`

#### Defined in

[src/events/index.ts:40](https://github.com/nostr-dev-kit/ndk/blob/0aa26c2/src/events/index.ts#L40)

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

[src/events/index.ts:159](https://github.com/nostr-dev-kit/ndk/blob/0aa26c2/src/events/index.ts#L159)

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

[src/events/index.ts:158](https://github.com/nostr-dev-kit/ndk/blob/0aa26c2/src/events/index.ts#L158)

___

### kind

• `Optional` **kind**: `number`

#### Defined in

[src/events/index.ts:39](https://github.com/nostr-dev-kit/ndk/blob/0aa26c2/src/events/index.ts#L39)

___

### ndk

• `Optional` **ndk**: [`default`](default.md)

#### Defined in

[src/events/index.ts:35](https://github.com/nostr-dev-kit/ndk/blob/0aa26c2/src/events/index.ts#L35)

___

### pubkey

• **pubkey**: `string` = `""`

#### Defined in

[src/events/index.ts:42](https://github.com/nostr-dev-kit/ndk/blob/0aa26c2/src/events/index.ts#L42)

___

### relay

• **relay**: `undefined` \| [`NDKRelay`](NDKRelay.md)

The relay that this event was first received from.

#### Defined in

[src/events/index.ts:47](https://github.com/nostr-dev-kit/ndk/blob/0aa26c2/src/events/index.ts#L47)

___

### sig

• `Optional` **sig**: `string`

#### Defined in

[src/events/index.ts:41](https://github.com/nostr-dev-kit/ndk/blob/0aa26c2/src/events/index.ts#L41)

___

### tags

• **tags**: [`NDKTag`](../modules.md#ndktag)[] = `[]`

#### Defined in

[src/events/index.ts:38](https://github.com/nostr-dev-kit/ndk/blob/0aa26c2/src/events/index.ts#L38)

## Accessors

### author

• `get` **author**(): [`NDKUser`](NDKUser.md)

Returns an NDKUser for the author of the event.

#### Returns

[`NDKUser`](NDKUser.md)

#### Defined in

[src/events/index.ts:83](https://github.com/nostr-dev-kit/ndk/blob/0aa26c2/src/events/index.ts#L83)

• `set` **author**(`user`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `user` | [`NDKUser`](NDKUser.md) |

#### Returns

`void`

#### Defined in

[src/events/index.ts:76](https://github.com/nostr-dev-kit/ndk/blob/0aa26c2/src/events/index.ts#L76)

## Methods

### delete

▸ **delete**(`reason?`): `Promise`<[`NDKEvent`](NDKEvent.md)\>

Generates a deletion event of the current event

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `reason?` | `string` | The reason for the deletion |

#### Returns

`Promise`<[`NDKEvent`](NDKEvent.md)\>

The deletion event

#### Defined in

[src/events/index.ts:327](https://github.com/nostr-dev-kit/ndk/blob/0aa26c2/src/events/index.ts#L327)

___

### filter

▸ **filter**(): [`NDKFilter`](../modules.md#ndkfilter)

Provides the filter that will return matching events for this event.

#### Returns

[`NDKFilter`](../modules.md#ndkfilter)

#### Defined in

[src/events/index.ts:290](https://github.com/nostr-dev-kit/ndk/blob/0aa26c2/src/events/index.ts#L290)

___

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

[src/events/index.ts:167](https://github.com/nostr-dev-kit/ndk/blob/0aa26c2/src/events/index.ts#L167)

___

### publish

▸ **publish**(`relaySet?`): `Promise`<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `relaySet?` | [`NDKRelaySet`](NDKRelaySet.md) |

#### Returns

`Promise`<`void`\>

#### Defined in

[src/events/index.ts:214](https://github.com/nostr-dev-kit/ndk/blob/0aa26c2/src/events/index.ts#L214)

___

### rawEvent

▸ **rawEvent**(): [`NostrEvent`](../modules.md#nostrevent)

Returns the event as is.

#### Returns

[`NostrEvent`](../modules.md#nostrevent)

#### Defined in

[src/events/index.ts:64](https://github.com/nostr-dev-kit/ndk/blob/0aa26c2/src/events/index.ts#L64)

___

### removeTag

▸ **removeTag**(`tagName`): `void`

Remove all tags with the given name

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `tagName` | `string` | Tag name to search for |

#### Returns

`void`

#### Defined in

[src/events/index.ts:186](https://github.com/nostr-dev-kit/ndk/blob/0aa26c2/src/events/index.ts#L186)

___

### replaceableDTag

▸ **replaceableDTag**(): `string`

#### Returns

`string`

the `d` tag of a parameterized replaceable event

#### Defined in

[src/events/index.ts:244](https://github.com/nostr-dev-kit/ndk/blob/0aa26c2/src/events/index.ts#L244)

___

### repost

▸ **repost**(): `Promise`<[`NDKEvent`](NDKEvent.md)\>

NIP-18
Repost event.

#### Returns

`Promise`<[`NDKEvent`](NDKEvent.md)\>

#### Defined in

[src/events/index.ts:346](https://github.com/nostr-dev-kit/ndk/blob/0aa26c2/src/events/index.ts#L346)

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

[src/events/index.ts:200](https://github.com/nostr-dev-kit/ndk/blob/0aa26c2/src/events/index.ts#L200)

___

### tag

▸ **tag**(`user`, `marker?`): `void`

Tag a user with an optional marker.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `user` | [`NDKUser`](NDKUser.md) | The user to tag. |
| `marker?` | `string` | The marker to use in the tag. |

#### Returns

`void`

#### Defined in

[src/events/index.ts:94](https://github.com/nostr-dev-kit/ndk/blob/0aa26c2/src/events/index.ts#L94)

▸ **tag**(`event`, `marker?`): `void`

Tag a user with an optional marker.

**`Example`**

```typescript
reply.tag(opEvent, "reply");
// reply.tags => [["e", <id>, <relay>, "reply"]]
```

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `event` | [`NDKEvent`](NDKEvent.md) | The event to tag. |
| `marker?` | `string` | The marker to use in the tag. |

#### Returns

`void`

#### Defined in

[src/events/index.ts:106](https://github.com/nostr-dev-kit/ndk/blob/0aa26c2/src/events/index.ts#L106)

___

### tagId

▸ **tagId**(): `string`

#### Returns

`string`

the id of the event, or if it's a parameterized event, the id of the event with the d tag

#### Defined in

[src/events/index.ts:258](https://github.com/nostr-dev-kit/ndk/blob/0aa26c2/src/events/index.ts#L258)

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

[src/events/index.ts:278](https://github.com/nostr-dev-kit/ndk/blob/0aa26c2/src/events/index.ts#L278)

___

### tagValue

▸ **tagValue**(`tagName`): `undefined` \| `string`

Get the first tag with the given name

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `tagName` | `string` | Tag name to search for |

#### Returns

`undefined` \| `string`

The value of the first tag with the given name, or undefined if no such tag exists

#### Defined in

[src/events/index.ts:176](https://github.com/nostr-dev-kit/ndk/blob/0aa26c2/src/events/index.ts#L176)

___

### toNostrEvent

▸ **toNostrEvent**(`pubkey?`): `Promise`<[`NostrEvent`](../modules.md#nostrevent)\>

Return a NostrEvent object, trying to fill in missing fields
when possible, adding tags when necessary.

#### Parameters

| Name | Type |
| :------ | :------ |
| `pubkey?` | `string` |

#### Returns

`Promise`<[`NostrEvent`](../modules.md#nostrevent)\>

#### Defined in

[src/events/index.ts:134](https://github.com/nostr-dev-kit/ndk/blob/0aa26c2/src/events/index.ts#L134)

___

### toString

▸ **toString**(): `Promise`<[`NostrEvent`](../modules.md#nostrevent)\>

#### Returns

`Promise`<[`NostrEvent`](../modules.md#nostrevent)\>

#### Defined in

[src/events/index.ts:190](https://github.com/nostr-dev-kit/ndk/blob/0aa26c2/src/events/index.ts#L190)

___

### zap

▸ **zap**(`amount`, `comment?`, `extraTags?`): `Promise`<``null`` \| `string`\>

Create a zap request for an existing event

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `amount` | `number` | The amount to zap in millisatoshis |
| `comment?` | `string` | A comment to add to the zap request |
| `extraTags?` | [`NDKTag`](../modules.md#ndktag)[] | Extra tags to add to the zap request |

#### Returns

`Promise`<``null`` \| `string`\>

#### Defined in

[src/events/index.ts:305](https://github.com/nostr-dev-kit/ndk/blob/0aa26c2/src/events/index.ts#L305)
