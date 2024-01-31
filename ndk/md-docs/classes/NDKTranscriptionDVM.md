**NDK** • [Readme](../README.md) \| [API](../globals.md)

***

[NDK](../README.md) / NDKTranscriptionDVM

# Class: NDKTranscriptionDVM

NIP-90

This class creates DVM transcription job types

## Extends

- [`NDKDVMRequest`](NDKDVMRequest.md)

## Constructors

### new NDKTranscriptionDVM(ndk, event)

> **new NDKTranscriptionDVM**(`ndk`, `event`?): [`NDKTranscriptionDVM`](NDKTranscriptionDVM.md)

#### Parameters

• **ndk**: `undefined` \| [`default`](default.md)

• **event?**: [`NostrEvent`](../type-aliases/NostrEvent.md)

#### Returns

[`NDKTranscriptionDVM`](NDKTranscriptionDVM.md)

#### Overrides

[`NDKDVMRequest`](NDKDVMRequest.md).[`constructor`](NDKDVMRequest.md#constructors)

#### Source

[ndk/src/events/kinds/dvm/NDKTranscriptionDVM.ts:12](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/events/kinds/dvm/NDKTranscriptionDVM.ts#L12)

## Properties

### content

> **content**: `string` = `""`

#### Inherited from

[`NDKDVMRequest`](NDKDVMRequest.md).[`content`](NDKDVMRequest.md#content)

#### Source

[ndk/src/events/index.ts:40](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/events/index.ts#L40)

***

### created\_at?

> **created\_at**?: `number`

#### Inherited from

[`NDKDVMRequest`](NDKDVMRequest.md).[`created_at`](NDKDVMRequest.md#created_at)

#### Source

[ndk/src/events/index.ts:39](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/events/index.ts#L39)

***

### decrypt

> **decrypt**: (...`args`: [[`NDKUser`](NDKUser.md), [`NDKSigner`](../interfaces/NDKSigner.md)]) => `Promise`\<`void`\>

#### Parameters

• ...**args**: [[`NDKUser`](NDKUser.md), [`NDKSigner`](../interfaces/NDKSigner.md)]

#### Returns

`Promise`\<`void`\>

#### Inherited from

[`NDKDVMRequest`](NDKDVMRequest.md).[`decrypt`](NDKDVMRequest.md#decrypt)

#### Source

[ndk/src/events/index.ts:192](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/events/index.ts#L192)

***

### encode

> **encode**: (...`args`: []) => \`nevent1${string}\` \| \`naddr1${string}\` \| \`note1${string}\`

Encodes a bech32 id.

#### Parameters

• ...**args**: []

#### Returns

\`nevent1${string}\` \| \`naddr1${string}\` \| \`note1${string}\`

- Encoded naddr, note or nevent.

#### Inherited from

[`NDKDVMRequest`](NDKDVMRequest.md).[`encode`](NDKDVMRequest.md#encode)

#### Source

[ndk/src/events/index.ts:190](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/events/index.ts#L190)

***

### encrypt

> **encrypt**: (...`args`: [[`NDKUser`](NDKUser.md), [`NDKSigner`](../interfaces/NDKSigner.md)]) => `Promise`\<`void`\>

#### Parameters

• ...**args**: [[`NDKUser`](NDKUser.md), [`NDKSigner`](../interfaces/NDKSigner.md)]

#### Returns

`Promise`\<`void`\>

#### Inherited from

[`NDKDVMRequest`](NDKDVMRequest.md).[`encrypt`](NDKDVMRequest.md#encrypt)

#### Source

[ndk/src/events/index.ts:191](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/events/index.ts#L191)

***

### id

> **id**: `string` = `""`

#### Inherited from

[`NDKDVMRequest`](NDKDVMRequest.md).[`id`](NDKDVMRequest.md#id)

#### Source

[ndk/src/events/index.ts:43](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/events/index.ts#L43)

***

### isEphemeral

> **isEphemeral**: (...`args`: []) => `boolean`

#### Parameters

• ...**args**: []

#### Returns

`boolean`

#### Inherited from

[`NDKDVMRequest`](NDKDVMRequest.md).[`isEphemeral`](NDKDVMRequest.md#isephemeral)

#### Source

[ndk/src/events/index.ts:182](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/events/index.ts#L182)

***

### isParamReplaceable

> **isParamReplaceable**: (...`args`: []) => `boolean`

#### Parameters

• ...**args**: []

#### Returns

`boolean`

#### Inherited from

[`NDKDVMRequest`](NDKDVMRequest.md).[`isParamReplaceable`](NDKDVMRequest.md#isparamreplaceable)

#### Source

[ndk/src/events/index.ts:183](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/events/index.ts#L183)

***

### isReplaceable

> **isReplaceable**: (...`args`: []) => `boolean`

#### Parameters

• ...**args**: []

#### Returns

`boolean`

#### Inherited from

[`NDKDVMRequest`](NDKDVMRequest.md).[`isReplaceable`](NDKDVMRequest.md#isreplaceable)

#### Source

[ndk/src/events/index.ts:181](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/events/index.ts#L181)

***

### kind?

> **kind**?: `number`

#### Inherited from

[`NDKDVMRequest`](NDKDVMRequest.md).[`kind`](NDKDVMRequest.md#kind)

#### Source

[ndk/src/events/index.ts:42](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/events/index.ts#L42)

***

### ndk?

> **ndk**?: [`default`](default.md)

#### Inherited from

[`NDKDVMRequest`](NDKDVMRequest.md).[`ndk`](NDKDVMRequest.md#ndk)

#### Source

[ndk/src/events/index.ts:38](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/events/index.ts#L38)

***

### pubkey

> **pubkey**: `string` = `""`

#### Inherited from

[`NDKDVMRequest`](NDKDVMRequest.md).[`pubkey`](NDKDVMRequest.md#pubkey)

#### Source

[ndk/src/events/index.ts:45](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/events/index.ts#L45)

***

### relay

> **relay**: `undefined` \| [`NDKRelay`](NDKRelay.md)

The relay that this event was first received from.

#### Inherited from

[`NDKDVMRequest`](NDKDVMRequest.md).[`relay`](NDKDVMRequest.md#relay)

#### Source

[ndk/src/events/index.ts:52](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/events/index.ts#L52)

***

### repost

> **repost**: (...`args`: [`boolean`, [`NDKSigner`](../interfaces/NDKSigner.md)]) => `Promise`\<[`NDKEvent`](NDKEvent.md)\>

NIP-18 reposting event.

#### Parameters

• ...**args**: [`boolean`, [`NDKSigner`](../interfaces/NDKSigner.md)]

#### Returns

`Promise`\<[`NDKEvent`](NDKEvent.md)\>

The reposted event

#### Function

#### Inherited from

[`NDKDVMRequest`](NDKDVMRequest.md).[`repost`](NDKDVMRequest.md#repost)

#### Source

[ndk/src/events/index.ts:574](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/events/index.ts#L574)

***

### sig?

> **sig**?: `string`

#### Inherited from

[`NDKDVMRequest`](NDKDVMRequest.md).[`sig`](NDKDVMRequest.md#sig)

#### Source

[ndk/src/events/index.ts:44](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/events/index.ts#L44)

***

### tags

> **tags**: [`NDKTag`](../type-aliases/NDKTag.md)[] = `[]`

#### Inherited from

[`NDKDVMRequest`](NDKDVMRequest.md).[`tags`](NDKDVMRequest.md#tags)

#### Source

[ndk/src/events/index.ts:41](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/events/index.ts#L41)

## Accessors

### alt

> **`get`** **alt**(): `undefined` \| `string`

Gets the NIP-31 "alt" tag of the event.

> **`set`** **alt**(`alt`): `void`

Sets the NIP-31 "alt" tag of the event. Use this to set an alt tag so
clients that don't handle a particular event kind can display something
useful for users.

#### Parameters

• **alt**: `undefined` \| `string`

#### Returns

`undefined` \| `string`

#### Source

[ndk/src/events/index.ts:217](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/events/index.ts#L217)

***

### author

> **`get`** **author**(): [`NDKUser`](NDKUser.md)

Returns an NDKUser for the author of the event.

> **`set`** **author**(`user`): `void`

#### Parameters

• **user**: [`NDKUser`](NDKUser.md)

#### Returns

[`NDKUser`](NDKUser.md)

#### Source

[ndk/src/events/index.ts:90](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/events/index.ts#L90)

***

### bid

> **`get`** **bid**(): `undefined` \| `number`

> **`set`** **bid**(`msatAmount`): `void`

#### Parameters

• **msatAmount**: `undefined` \| `number`

#### Returns

`undefined` \| `number`

#### Source

[ndk/src/events/kinds/dvm/NDKDVMRequest.ts:55](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/events/kinds/dvm/NDKDVMRequest.ts#L55)

***

### image

> **`get`** **image**(): `undefined` \| `string`

Getter for the image tag

> **`set`** **image**(`value`): `void`

Setter for the image tag

#### Parameters

• **value**: `undefined` \| `string`

#### Returns

`undefined` \| `string`

#### Source

[ndk/src/events/kinds/dvm/NDKTranscriptionDVM.ts:55](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/events/kinds/dvm/NDKTranscriptionDVM.ts#L55)

***

### isValid

> **`get`** **isValid**(): `boolean`

Checks whether the event is valid per underlying NIPs.

This method is meant to be overridden by subclasses that implement specific NIPs
to allow the enforcement of NIP-specific validation rules.

#### Returns

`boolean`

#### Source

[ndk/src/events/index.ts:608](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/events/index.ts#L608)

***

### output

> **`get`** **output**(): `undefined` \| `string`[]

> **`set`** **output**(`output`): `void`

#### Parameters

• **output**: `undefined` \| `string` \| `string`[]

#### Returns

`undefined` \| `string`[]

#### Source

[ndk/src/events/kinds/dvm/NDKDVMRequest.ts:87](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/events/kinds/dvm/NDKDVMRequest.ts#L87)

***

### params

> **`get`** **params**(): `string`[][]

#### Returns

`string`[][]

#### Source

[ndk/src/events/kinds/dvm/NDKDVMRequest.ts:92](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/events/kinds/dvm/NDKDVMRequest.ts#L92)

***

### title

> **`get`** **title**(): `undefined` \| `string`

Getter for the title tag

> **`set`** **title**(`value`): `void`

Setter for the title tag

#### Parameters

• **value**: `undefined` \| `string`

#### Returns

`undefined` \| `string`

#### Source

[ndk/src/events/kinds/dvm/NDKTranscriptionDVM.ts:37](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/events/kinds/dvm/NDKTranscriptionDVM.ts#L37)

***

### url

> **`get`** **url**(): `undefined` \| `string`

Returns the original source of the transcription

#### Returns

`undefined` \| `string`

#### Source

[ndk/src/events/kinds/dvm/NDKTranscriptionDVM.ts:24](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/events/kinds/dvm/NDKTranscriptionDVM.ts#L24)

## Methods

### addInput()

> **addInput**(...`args`): `void`

Adds a new input to the job

#### Parameters

• ...**args**: `string`[]

The arguments to the input

#### Returns

`void`

#### Inherited from

[`NDKDVMRequest`](NDKDVMRequest.md).[`addInput`](NDKDVMRequest.md#addinput)

#### Source

[ndk/src/events/kinds/dvm/NDKDVMRequest.ts:67](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/events/kinds/dvm/NDKDVMRequest.ts#L67)

***

### addParam()

> **addParam**(...`args`): `void`

Adds a new parameter to the job

#### Parameters

• ...**args**: `string`[]

#### Returns

`void`

#### Inherited from

[`NDKDVMRequest`](NDKDVMRequest.md).[`addParam`](NDKDVMRequest.md#addparam)

#### Source

[ndk/src/events/kinds/dvm/NDKDVMRequest.ts:74](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/events/kinds/dvm/NDKDVMRequest.ts#L74)

***

### createFeedback()

> **createFeedback**(`status`): [`NDKDVMJobFeedback`](NDKDVMJobFeedback.md)

Create a new job feedback for this request

#### Parameters

• **status**: `string`

#### Returns

[`NDKDVMJobFeedback`](NDKDVMJobFeedback.md)

#### Inherited from

[`NDKDVMRequest`](NDKDVMRequest.md).[`createFeedback`](NDKDVMRequest.md#createfeedback)

#### Source

[ndk/src/events/kinds/dvm/NDKDVMRequest.ts:29](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/events/kinds/dvm/NDKDVMRequest.ts#L29)

***

### createResult()

> **createResult**(`data`?): [`NDKDVMJobResult`](NDKDVMJobResult.md)

Create a new result event for this request

#### Parameters

• **data?**: [`NostrEvent`](../type-aliases/NostrEvent.md)

#### Returns

[`NDKDVMJobResult`](NDKDVMJobResult.md)

#### Inherited from

[`NDKDVMRequest`](NDKDVMRequest.md).[`createResult`](NDKDVMRequest.md#createresult)

#### Source

[ndk/src/events/kinds/dvm/NDKDVMRequest.ts:40](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/events/kinds/dvm/NDKDVMRequest.ts#L40)

***

### deduplicationKey()

> **deduplicationKey**(): `string`

Provides a deduplication key for the event.

For kinds 0, 3, 10k-20k this will be the event `<kind>`:`<pubkey>`
For kinds 30k-40k this will be the event `<kind>`:`<pubkey>`:`<d-tag>`
For all other kinds this will be the event id

#### Returns

`string`

#### Inherited from

[`NDKDVMRequest`](NDKDVMRequest.md).[`deduplicationKey`](NDKDVMRequest.md#deduplicationkey)

#### Source

[ndk/src/events/index.ts:363](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/events/index.ts#L363)

***

### delete()

> **delete**(`reason`?): `Promise`\<[`NDKEvent`](NDKEvent.md)\>

Generates a deletion event of the current event

#### Parameters

• **reason?**: `string`

The reason for the deletion

#### Returns

`Promise`\<[`NDKEvent`](NDKEvent.md)\>

The deletion event

#### Inherited from

[`NDKDVMRequest`](NDKDVMRequest.md).[`delete`](NDKDVMRequest.md#delete)

#### Source

[ndk/src/events/index.ts:550](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/events/index.ts#L550)

***

### filter()

> **filter**(): [`NDKFilter`](../type-aliases/NDKFilter.md)

Provides the filter that will return matching events for this event.

#### Returns

[`NDKFilter`](../type-aliases/NDKFilter.md)

The filter that will return matching events for this event

#### Inherited from

[`NDKDVMRequest`](NDKDVMRequest.md).[`filter`](NDKDVMRequest.md#filter)

#### Example

```ts
event = new NDKEvent(ndk, { kind: 30000, pubkey: 'pubkey', tags: [ ["d", "d-code"] ] });
   event.filter(); // { "#a": ["30000:pubkey:d-code"] }
```

#### Example

```ts
event = new NDKEvent(ndk, { kind: 1, pubkey: 'pubkey', id: "eventid" });
   event.filter(); // { "#e": ["eventid"] }
```

#### Source

[ndk/src/events/index.ts:494](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/events/index.ts#L494)

***

### generateTags()

> **generateTags**(): `Promise`\<`ContentTag`\>

Generates tags for users, notes, and other events tagged in content.
Will also generate random "d" tag for parameterized replaceable events where needed.

#### Returns

`Promise`\<`ContentTag`\>

The tags and content of the event.

#### Inherited from

[`NDKDVMRequest`](NDKDVMRequest.md).[`generateTags`](NDKDVMRequest.md#generatetags)

#### Source

[ndk/src/events/index.ts:295](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/events/index.ts#L295)

***

### getMatchingTags()

> **getMatchingTags**(`tagName`): [`NDKTag`](../type-aliases/NDKTag.md)[]

Get all tags with the given name

#### Parameters

• **tagName**: `string`

\{string\} The name of the tag to search for

#### Returns

[`NDKTag`](../type-aliases/NDKTag.md)[]

An array of the matching tags

#### Inherited from

[`NDKDVMRequest`](NDKDVMRequest.md).[`getMatchingTags`](NDKDVMRequest.md#getmatchingtags)

#### Source

[ndk/src/events/index.ts:199](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/events/index.ts#L199)

***

### getParam()

> **getParam**(`name`): `undefined` \| `string`

#### Parameters

• **name**: `string`

#### Returns

`undefined` \| `string`

#### Inherited from

[`NDKDVMRequest`](NDKDVMRequest.md).[`getParam`](NDKDVMRequest.md#getparam)

#### Source

[ndk/src/events/kinds/dvm/NDKDVMRequest.ts:97](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/events/kinds/dvm/NDKDVMRequest.ts#L97)

***

### muted()

> **muted**(): `null` \| `string`

#### Returns

`null` \| `string`

#### Inherited from

[`NDKDVMRequest`](NDKDVMRequest.md).[`muted`](NDKDVMRequest.md#muted)

#### Source

[ndk/src/events/index.ts:329](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/events/index.ts#L329)

***

### publish()

> **publish**(`relaySet`?, `timeoutMs`?): `Promise`\<`Set`\<[`NDKRelay`](NDKRelay.md)\>\>

Attempt to sign and then publish an NDKEvent to a given relaySet.
If no relaySet is provided, the relaySet will be calculated by NDK.

#### Parameters

• **relaySet?**: [`NDKRelaySet`](NDKRelaySet.md)

\{NDKRelaySet\} The relaySet to publish the even to.

• **timeoutMs?**: `number`

#### Returns

`Promise`\<`Set`\<[`NDKRelay`](NDKRelay.md)\>\>

A promise that resolves to the relays the event was published to.

#### Inherited from

[`NDKDVMRequest`](NDKDVMRequest.md).[`publish`](NDKDVMRequest.md#publish)

#### Source

[ndk/src/events/index.ts:277](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/events/index.ts#L277)

***

### rawEvent()

> **rawEvent**(): [`NostrEvent`](../type-aliases/NostrEvent.md)

Returns the event as is.

#### Returns

[`NostrEvent`](../type-aliases/NostrEvent.md)

#### Inherited from

[`NDKDVMRequest`](NDKDVMRequest.md).[`rawEvent`](NDKDVMRequest.md#rawevent)

#### Source

[ndk/src/events/index.ts:69](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/events/index.ts#L69)

***

### react()

> **react**(`content`, `publish`): `Promise`\<[`NDKEvent`](NDKEvent.md)\>

React to an existing event

#### Parameters

• **content**: `string`

The content of the reaction

• **publish**: `boolean`= `true`

#### Returns

`Promise`\<[`NDKEvent`](NDKEvent.md)\>

#### Inherited from

[`NDKDVMRequest`](NDKDVMRequest.md).[`react`](NDKDVMRequest.md#react)

#### Source

[ndk/src/events/index.ts:581](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/events/index.ts#L581)

***

### referenceTags()

> **referenceTags**(`marker`?, `skipAuthorTag`?): [`NDKTag`](../type-aliases/NDKTag.md)[]

Get the tags that can be used to reference this event from another event

#### Parameters

• **marker?**: `string`

The marker to use in the tag

• **skipAuthorTag?**: `boolean`

#### Returns

[`NDKTag`](../type-aliases/NDKTag.md)[]

The NDKTag object referencing this event

#### Inherited from

[`NDKDVMRequest`](NDKDVMRequest.md).[`referenceTags`](NDKDVMRequest.md#referencetags)

#### Example

```ts
event = new NDKEvent(ndk, { kind: 30000, pubkey: 'pubkey', tags: [ ["d", "d-code"] ] });
    event.referenceTags(); // [["a", "30000:pubkey:d-code"], ["e", "parent-id"]]

    event = new NDKEvent(ndk, { kind: 1, pubkey: 'pubkey', id: "eventid" });
    event.referenceTags(); // [["e", "parent-id"]]
```

#### Source

[ndk/src/events/index.ts:447](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/events/index.ts#L447)

***

### removeTag()

> **removeTag**(`tagName`): `void`

Remove all tags with the given name (e.g. "d", "a", "p")

#### Parameters

• **tagName**: `string`

Tag name to search for and remove

#### Returns

`void`

#### Inherited from

[`NDKDVMRequest`](NDKDVMRequest.md).[`removeTag`](NDKDVMRequest.md#removetag)

#### Source

[ndk/src/events/index.ts:236](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/events/index.ts#L236)

***

### replaceableDTag()

> **replaceableDTag**(): `string`

Returns the "d" tag of a parameterized replaceable event or throws an error if the event isn't
a parameterized replaceable event.

#### Returns

`string`

the "d" tag of the event.

#### Inherited from

[`NDKDVMRequest`](NDKDVMRequest.md).[`replaceableDTag`](NDKDVMRequest.md#replaceabledtag)

#### Source

[ndk/src/events/index.ts:345](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/events/index.ts#L345)

***

### sign()

> **sign**(`signer`?): `Promise`\<`string`\>

Sign the event if a signer is present.

It will generate tags.
Repleacable events will have their created_at field set to the current time.

#### Parameters

• **signer?**: [`NDKSigner`](../interfaces/NDKSigner.md)

\{NDKSigner\} The NDKSigner to use to sign the event

#### Returns

`Promise`\<`string`\>

A Promise that resolves to the signature of the signed event.

#### Inherited from

[`NDKDVMRequest`](NDKDVMRequest.md).[`sign`](NDKDVMRequest.md#sign)

#### Source

[ndk/src/events/index.ts:248](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/events/index.ts#L248)

***

### tag()

#### tag(user, marker)

> **tag**(`user`, `marker`?): `void`

Tag a user with an optional marker.

##### Parameters

• **user**: [`NDKUser`](NDKUser.md)

The user to tag.

• **marker?**: `string`

The marker to use in the tag.

##### Returns

`void`

##### Inherited from

[`NDKDVMRequest`](NDKDVMRequest.md).[`tag`](NDKDVMRequest.md#tag)

##### Source

[ndk/src/events/index.ts:105](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/events/index.ts#L105)

#### tag(user, marker)

> **tag**(`user`, `marker`?): `void`

Tag a user with an optional marker.

##### Parameters

• **user**: [`NDKUser`](NDKUser.md)

The user to tag.

• **marker?**: `string`

The marker to use in the tag.

##### Returns

`void`

##### Inherited from

[`NDKDVMRequest`](NDKDVMRequest.md).[`tag`](NDKDVMRequest.md#tag)

##### Source

[ndk/src/events/index.ts:112](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/events/index.ts#L112)

#### tag(event, marker)

> **tag**(`event`, `marker`?): `void`

Tag a user with an optional marker.

##### Parameters

• **event**: [`NDKEvent`](NDKEvent.md)

The event to tag.

• **marker?**: `string`

The marker to use in the tag.

##### Returns

`void`

##### Inherited from

[`NDKDVMRequest`](NDKDVMRequest.md).[`tag`](NDKDVMRequest.md#tag)

##### Example

```typescript
reply.tag(opEvent, "reply");
// reply.tags => [["e", <id>, <relay>, "reply"]]
```

##### Source

[ndk/src/events/index.ts:124](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/events/index.ts#L124)

***

### tagAddress()

> **tagAddress**(): `string`

Returns the "reference" value ("`<kind>`:`<author-pubkey>`:`<d-tag>`") for this replaceable event.

#### Returns

`string`

The id

#### Inherited from

[`NDKDVMRequest`](NDKDVMRequest.md).[`tagAddress`](NDKDVMRequest.md#tagaddress)

#### Source

[ndk/src/events/index.ts:392](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/events/index.ts#L392)

***

### tagId()

> **tagId**(): `string`

Returns the id of the event or, if it's a parameterized event, the generated id of the event using "d" tag, pubkey, and kind.

#### Returns

`string`

The id

#### Inherited from

[`NDKDVMRequest`](NDKDVMRequest.md).[`tagId`](NDKDVMRequest.md#tagid)

#### Source

[ndk/src/events/index.ts:379](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/events/index.ts#L379)

***

### tagReference()

> **tagReference**(`marker`?): [`NDKTag`](../type-aliases/NDKTag.md)

Get the tag that can be used to reference this event from another event.

Consider using referenceTags() instead (unless you have a good reason to use this)

#### Parameters

• **marker?**: `string`

#### Returns

[`NDKTag`](../type-aliases/NDKTag.md)

The NDKTag object referencing this event

#### Inherited from

[`NDKDVMRequest`](NDKDVMRequest.md).[`tagReference`](NDKDVMRequest.md#tagreference)

#### Example

```ts
event = new NDKEvent(ndk, { kind: 30000, pubkey: 'pubkey', tags: [ ["d", "d-code"] ] });
    event.tagReference(); // ["a", "30000:pubkey:d-code"]

    event = new NDKEvent(ndk, { kind: 1, pubkey: 'pubkey', id: "eventid" });
    event.tagReference(); // ["e", "eventid"]
```

#### Source

[ndk/src/events/index.ts:413](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/events/index.ts#L413)

***

### tagValue()

> **tagValue**(`tagName`): `undefined` \| `string`

Get the first tag with the given name

#### Parameters

• **tagName**: `string`

Tag name to search for

#### Returns

`undefined` \| `string`

The value of the first tag with the given name, or undefined if no such tag exists

#### Inherited from

[`NDKDVMRequest`](NDKDVMRequest.md).[`tagValue`](NDKDVMRequest.md#tagvalue)

#### Source

[ndk/src/events/index.ts:208](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/events/index.ts#L208)

***

### toNostrEvent()

> **toNostrEvent**(`pubkey`?): `Promise`\<[`NostrEvent`](../type-aliases/NostrEvent.md)\>

Return a NostrEvent object, trying to fill in missing fields
when possible, adding tags when necessary.

#### Parameters

• **pubkey?**: `string`

\{string\} The pubkey of the user who the event belongs to.

#### Returns

`Promise`\<[`NostrEvent`](../type-aliases/NostrEvent.md)\>

A promise that resolves to a NostrEvent.

#### Inherited from

[`NDKDVMRequest`](NDKDVMRequest.md).[`toNostrEvent`](NDKDVMRequest.md#tonostrevent)

#### Source

[ndk/src/events/index.ts:157](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/events/index.ts#L157)

***

### zap()

> **zap**(`amount`, `comment`?, `extraTags`?, `recipient`?, `signer`?): `Promise`\<`null` \| `string`\>

Create a zap request for an existing event

#### Parameters

• **amount**: `number`

The amount to zap in millisatoshis

• **comment?**: `string`

A comment to add to the zap request

• **extraTags?**: [`NDKTag`](../type-aliases/NDKTag.md)[]

Extra tags to add to the zap request

• **recipient?**: [`NDKUser`](NDKUser.md)

The zap recipient (optional for events)

• **signer?**: [`NDKSigner`](../interfaces/NDKSigner.md)

The signer to use (will default to the NDK instance's signer)

#### Returns

`Promise`\<`null` \| `string`\>

#### Inherited from

[`NDKDVMRequest`](NDKDVMRequest.md).[`zap`](NDKDVMRequest.md#zap)

#### Source

[ndk/src/events/index.ts:511](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/events/index.ts#L511)

***

### from()

> **`static`** **from**(`event`): [`NDKTranscriptionDVM`](NDKTranscriptionDVM.md)

#### Parameters

• **event**: [`NDKEvent`](NDKEvent.md)

#### Returns

[`NDKTranscriptionDVM`](NDKTranscriptionDVM.md)

#### Overrides

[`NDKDVMRequest`](NDKDVMRequest.md).[`from`](NDKDVMRequest.md#from)

#### Source

[ndk/src/events/kinds/dvm/NDKTranscriptionDVM.ts:17](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/events/kinds/dvm/NDKTranscriptionDVM.ts#L17)
