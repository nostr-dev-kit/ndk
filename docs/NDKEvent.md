# Class: NDKEvent

NDKEvent is the basic building block of NDK; most things
you do with NDK will revolve around writing or consuming NDKEvents.

## Hierarchy

- `EventEmitter`

  ↳ **`NDKEvent`**

## Table of contents

### Constructors

- [constructor](../wiki/NDKEvent#constructor)

### Properties

- [content](../wiki/NDKEvent#content)
- [created\_at](../wiki/NDKEvent#created_at)
- [decrypt](../wiki/NDKEvent#decrypt)
- [encode](../wiki/NDKEvent#encode)
- [encrypt](../wiki/NDKEvent#encrypt)
- [id](../wiki/NDKEvent#id)
- [isParamReplaceable](../wiki/NDKEvent#isparamreplaceable)
- [isReplaceable](../wiki/NDKEvent#isreplaceable)
- [kind](../wiki/NDKEvent#kind)
- [ndk](../wiki/NDKEvent#ndk)
- [pubkey](../wiki/NDKEvent#pubkey)
- [relay](../wiki/NDKEvent#relay)
- [repost](../wiki/NDKEvent#repost)
- [sig](../wiki/NDKEvent#sig)
- [tags](../wiki/NDKEvent#tags)

### Accessors

- [author](../wiki/NDKEvent#author)

### Methods

- [delete](../wiki/NDKEvent#delete)
- [filter](../wiki/NDKEvent#filter)
- [getMatchingTags](../wiki/NDKEvent#getmatchingtags)
- [publish](../wiki/NDKEvent#publish)
- [rawEvent](../wiki/NDKEvent#rawevent)
- [removeTag](../wiki/NDKEvent#removetag)
- [replaceableDTag](../wiki/NDKEvent#replaceabledtag)
- [sign](../wiki/NDKEvent#sign)
- [tag](../wiki/NDKEvent#tag)
- [tagId](../wiki/NDKEvent#tagid)
- [tagReference](../wiki/NDKEvent#tagreference)
- [tagValue](../wiki/NDKEvent#tagvalue)
- [toNostrEvent](../wiki/NDKEvent#tonostrevent)
- [toString](../wiki/NDKEvent#tostring)
- [zap](../wiki/NDKEvent#zap)

## Constructors

### constructor

• **new NDKEvent**(`ndk?`, `event?`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `ndk?` | [`default`](../wiki/default) |
| `event?` | [`NostrEvent`](../wiki/Exports#nostrevent) |

#### Overrides

EventEmitter.constructor

#### Defined in

[src/events/index.ts:50](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/events/index.ts#L50)

## Properties

### content

• **content**: `string` = `""`

#### Defined in

[src/events/index.ts:38](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/events/index.ts#L38)

___

### created\_at

• `Optional` **created\_at**: `number`

#### Defined in

[src/events/index.ts:37](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/events/index.ts#L37)

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

[src/events/index.ts:163](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/events/index.ts#L163)

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

[src/events/index.ts:161](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/events/index.ts#L161)

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

[src/events/index.ts:162](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/events/index.ts#L162)

___

### id

• **id**: `string` = `""`

#### Defined in

[src/events/index.ts:41](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/events/index.ts#L41)

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

[src/events/index.ts:160](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/events/index.ts#L160)

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

[src/events/index.ts:159](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/events/index.ts#L159)

___

### kind

• `Optional` **kind**: `number`

#### Defined in

[src/events/index.ts:40](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/events/index.ts#L40)

___

### ndk

• `Optional` **ndk**: [`default`](../wiki/default)

#### Defined in

[src/events/index.ts:36](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/events/index.ts#L36)

___

### pubkey

• **pubkey**: `string` = `""`

#### Defined in

[src/events/index.ts:43](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/events/index.ts#L43)

___

### relay

• **relay**: `undefined` \| [`NDKRelay`](../wiki/NDKRelay)

The relay that this event was first received from.

#### Defined in

[src/events/index.ts:48](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/events/index.ts#L48)

___

### repost

• **repost**: (...`args`: [publish: boolean, signer?: NDKSigner]) => `Promise`<[`NDKEvent`](../wiki/NDKEvent)\>

#### Type declaration

▸ (`...args`): `Promise`<[`NDKEvent`](../wiki/NDKEvent)\>

NIP-18 reposting event.

**`Function`**

##### Parameters

| Name | Type |
| :------ | :------ |
| `...args` | [publish: boolean, signer?: NDKSigner] |

##### Returns

`Promise`<[`NDKEvent`](../wiki/NDKEvent)\>

The reposted event

#### Defined in

[src/events/index.ts:361](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/events/index.ts#L361)

___

### sig

• `Optional` **sig**: `string`

#### Defined in

[src/events/index.ts:42](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/events/index.ts#L42)

___

### tags

• **tags**: [`NDKTag`](../wiki/Exports#ndktag)[] = `[]`

#### Defined in

[src/events/index.ts:39](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/events/index.ts#L39)

## Accessors

### author

• `get` **author**(): [`NDKUser`](../wiki/NDKUser)

Returns an NDKUser for the author of the event.

#### Returns

[`NDKUser`](../wiki/NDKUser)

#### Defined in

[src/events/index.ts:84](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/events/index.ts#L84)

• `set` **author**(`user`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `user` | [`NDKUser`](../wiki/NDKUser) |

#### Returns

`void`

#### Defined in

[src/events/index.ts:77](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/events/index.ts#L77)

## Methods

### delete

▸ **delete**(`reason?`): `Promise`<[`NDKEvent`](../wiki/NDKEvent)\>

Generates a deletion event of the current event

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `reason?` | `string` | The reason for the deletion |

#### Returns

`Promise`<[`NDKEvent`](../wiki/NDKEvent)\>

The deletion event

#### Defined in

[src/events/index.ts:337](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/events/index.ts#L337)

___

### filter

▸ **filter**(): [`NDKFilter`](../wiki/Exports#ndkfilter)

Provides the filter that will return matching events for this event.

**`Example`**

```ts
event = new NDKEvent(ndk, { kind: 30000, pubkey: 'pubkey', tags: [ ["d", "d-code"] ] });
   event.filter(); // { "#a": ["30000:pubkey:d-code"] }
```

**`Example`**

```ts
event = new NDKEvent(ndk, { kind: 1, pubkey: 'pubkey', id: "eventid" });
   event.filter(); // { "#e": ["eventid"] }
```

#### Returns

[`NDKFilter`](../wiki/Exports#ndkfilter)

The filter that will return matching events for this event

#### Defined in

[src/events/index.ts:300](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/events/index.ts#L300)

___

### getMatchingTags

▸ **getMatchingTags**(`tagName`): [`NDKTag`](../wiki/Exports#ndktag)[]

Get all tags with the given name

#### Parameters

| Name | Type |
| :------ | :------ |
| `tagName` | `string` |

#### Returns

[`NDKTag`](../wiki/Exports#ndktag)[]

#### Defined in

[src/events/index.ts:168](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/events/index.ts#L168)

___

### publish

▸ **publish**(`relaySet?`): `Promise`<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `relaySet?` | [`NDKRelaySet`](../wiki/NDKRelaySet) |

#### Returns

`Promise`<`void`\>

#### Defined in

[src/events/index.ts:215](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/events/index.ts#L215)

___

### rawEvent

▸ **rawEvent**(): [`NostrEvent`](../wiki/Exports#nostrevent)

Returns the event as is.

#### Returns

[`NostrEvent`](../wiki/Exports#nostrevent)

#### Defined in

[src/events/index.ts:65](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/events/index.ts#L65)

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

[src/events/index.ts:187](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/events/index.ts#L187)

___

### replaceableDTag

▸ **replaceableDTag**(): `string`

#### Returns

`string`

the `d` tag of a parameterized replaceable event

#### Defined in

[src/events/index.ts:245](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/events/index.ts#L245)

___

### sign

▸ **sign**(`signer?`): `Promise`<`void`\>

Sign the event if a signer is present.

It will generate tags.
Repleacable events will have their created_at field set to the current time.

#### Parameters

| Name | Type |
| :------ | :------ |
| `signer?` | [`NDKSigner`](../wiki/NDKSigner) |

#### Returns

`Promise`<`void`\>

#### Defined in

[src/events/index.ts:201](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/events/index.ts#L201)

___

### tag

▸ **tag**(`user`, `marker?`): `void`

Tag a user with an optional marker.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `user` | [`NDKUser`](../wiki/NDKUser) | The user to tag. |
| `marker?` | `string` | The marker to use in the tag. |

#### Returns

`void`

#### Defined in

[src/events/index.ts:95](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/events/index.ts#L95)

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
| `event` | [`NDKEvent`](../wiki/NDKEvent) | The event to tag. |
| `marker?` | `string` | The marker to use in the tag. |

#### Returns

`void`

#### Defined in

[src/events/index.ts:107](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/events/index.ts#L107)

___

### tagId

▸ **tagId**(): `string`

#### Returns

`string`

the id of the event, or if it's a parameterized event, the id of the event with the d tag

#### Defined in

[src/events/index.ts:259](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/events/index.ts#L259)

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

[src/events/index.ts:279](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/events/index.ts#L279)

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

[src/events/index.ts:177](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/events/index.ts#L177)

___

### toNostrEvent

▸ **toNostrEvent**(`pubkey?`): `Promise`<[`NostrEvent`](../wiki/Exports#nostrevent)\>

Return a NostrEvent object, trying to fill in missing fields
when possible, adding tags when necessary.

#### Parameters

| Name | Type |
| :------ | :------ |
| `pubkey?` | `string` |

#### Returns

`Promise`<[`NostrEvent`](../wiki/Exports#nostrevent)\>

#### Defined in

[src/events/index.ts:135](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/events/index.ts#L135)

___

### toString

▸ **toString**(): `Promise`<[`NostrEvent`](../wiki/Exports#nostrevent)\>

#### Returns

`Promise`<[`NostrEvent`](../wiki/Exports#nostrevent)\>

#### Defined in

[src/events/index.ts:191](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/events/index.ts#L191)

___

### zap

▸ **zap**(`amount`, `comment?`, `extraTags?`): `Promise`<``null`` \| `string`\>

Create a zap request for an existing event

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `amount` | `number` | The amount to zap in millisatoshis |
| `comment?` | `string` | A comment to add to the zap request |
| `extraTags?` | [`NDKTag`](../wiki/Exports#ndktag)[] | Extra tags to add to the zap request |

#### Returns

`Promise`<``null`` \| `string`\>

#### Defined in

[src/events/index.ts:315](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/events/index.ts#L315)
