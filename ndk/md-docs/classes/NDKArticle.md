**NDK** • [Readme](../README.md) \| [API](../globals.md)

***

[NDK](../README.md) / NDKArticle

# Class: NDKArticle

Represents a NIP-23 article.

## Extends

- [`NDKEvent`](NDKEvent.md)

## Constructors

### new NDKArticle(ndk, rawEvent)

> **new NDKArticle**(`ndk`, `rawEvent`?): [`NDKArticle`](NDKArticle.md)

#### Parameters

• **ndk**: `undefined` \| [`default`](default.md)

• **rawEvent?**: [`NostrEvent`](../type-aliases/NostrEvent.md)

#### Returns

[`NDKArticle`](NDKArticle.md)

#### Overrides

[`NDKEvent`](NDKEvent.md).[`constructor`](NDKEvent.md#constructors)

#### Source

[ndk/src/events/kinds/article.ts:10](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/events/kinds/article.ts#L10)

## Properties

### content

> **content**: `string` = `""`

#### Inherited from

[`NDKEvent`](NDKEvent.md).[`content`](NDKEvent.md#content)

#### Source

[ndk/src/events/index.ts:40](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/events/index.ts#L40)

***

### created\_at?

> **created\_at**?: `number`

#### Inherited from

[`NDKEvent`](NDKEvent.md).[`created_at`](NDKEvent.md#created_at)

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

[`NDKEvent`](NDKEvent.md).[`decrypt`](NDKEvent.md#decrypt)

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

[`NDKEvent`](NDKEvent.md).[`encode`](NDKEvent.md#encode)

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

[`NDKEvent`](NDKEvent.md).[`encrypt`](NDKEvent.md#encrypt)

#### Source

[ndk/src/events/index.ts:191](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/events/index.ts#L191)

***

### id

> **id**: `string` = `""`

#### Inherited from

[`NDKEvent`](NDKEvent.md).[`id`](NDKEvent.md#id)

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

[`NDKEvent`](NDKEvent.md).[`isEphemeral`](NDKEvent.md#isephemeral)

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

[`NDKEvent`](NDKEvent.md).[`isParamReplaceable`](NDKEvent.md#isparamreplaceable)

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

[`NDKEvent`](NDKEvent.md).[`isReplaceable`](NDKEvent.md#isreplaceable)

#### Source

[ndk/src/events/index.ts:181](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/events/index.ts#L181)

***

### kind?

> **kind**?: `number`

#### Inherited from

[`NDKEvent`](NDKEvent.md).[`kind`](NDKEvent.md#kind)

#### Source

[ndk/src/events/index.ts:42](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/events/index.ts#L42)

***

### ndk?

> **ndk**?: [`default`](default.md)

#### Inherited from

[`NDKEvent`](NDKEvent.md).[`ndk`](NDKEvent.md#ndk)

#### Source

[ndk/src/events/index.ts:38](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/events/index.ts#L38)

***

### pubkey

> **pubkey**: `string` = `""`

#### Inherited from

[`NDKEvent`](NDKEvent.md).[`pubkey`](NDKEvent.md#pubkey)

#### Source

[ndk/src/events/index.ts:45](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/events/index.ts#L45)

***

### relay

> **relay**: `undefined` \| [`NDKRelay`](NDKRelay.md)

The relay that this event was first received from.

#### Inherited from

[`NDKEvent`](NDKEvent.md).[`relay`](NDKEvent.md#relay)

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

[`NDKEvent`](NDKEvent.md).[`repost`](NDKEvent.md#repost)

#### Source

[ndk/src/events/index.ts:574](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/events/index.ts#L574)

***

### sig?

> **sig**?: `string`

#### Inherited from

[`NDKEvent`](NDKEvent.md).[`sig`](NDKEvent.md#sig)

#### Source

[ndk/src/events/index.ts:44](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/events/index.ts#L44)

***

### tags

> **tags**: [`NDKTag`](../type-aliases/NDKTag.md)[] = `[]`

#### Inherited from

[`NDKEvent`](NDKEvent.md).[`tags`](NDKEvent.md#tags)

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

### image

> **`get`** **image**(): `undefined` \| `string`

Getter for the article image.

> **`set`** **image**(`image`): `void`

Setter for the article image.

#### Parameters

• **image**: `undefined` \| `string`

The image to set for the article.

#### Returns

`undefined` \| `string`

- The article image if available, otherwise undefined.

#### Source

[ndk/src/events/kinds/article.ts:50](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/events/kinds/article.ts#L50)

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

### published\_at

> **`get`** **published\_at**(): `undefined` \| `number`

Getter for the article's publication timestamp.

> **`set`** **published\_at**(`timestamp`): `void`

Setter for the article's publication timestamp.

#### Parameters

• **timestamp**: `undefined` \| `number`

The Unix timestamp to set for the article's publication date.

#### Returns

`undefined` \| `number`

- The Unix timestamp of when the article was published or undefined.

#### Source

[ndk/src/events/kinds/article.ts:80](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/events/kinds/article.ts#L80)

***

### summary

> **`get`** **summary**(): `undefined` \| `string`

> **`set`** **summary**(`summary`): `void`

#### Parameters

• **summary**: `undefined` \| `string`

#### Returns

`undefined` \| `string`

#### Source

[ndk/src/events/kinds/article.ts:65](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/events/kinds/article.ts#L65)

***

### title

> **`get`** **title**(): `undefined` \| `string`

Getter for the article title.

> **`set`** **title**(`title`): `void`

Setter for the article title.

#### Parameters

• **title**: `undefined` \| `string`

The title to set for the article.

#### Returns

`undefined` \| `string`

- The article title if available, otherwise undefined.

#### Source

[ndk/src/events/kinds/article.ts:30](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/events/kinds/article.ts#L30)

***

### url

> **`get`** **url**(): `undefined` \| `string`

Getter for the article's URL.

> **`set`** **url**(`url`): `void`

Setter for the article's URL.

#### Parameters

• **url**: `undefined` \| `string`

The URL to set for the article.

#### Returns

`undefined` \| `string`

- The article's URL if available, otherwise undefined.

#### Source

[ndk/src/events/kinds/article.ts:124](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/events/kinds/article.ts#L124)

## Methods

### deduplicationKey()

> **deduplicationKey**(): `string`

Provides a deduplication key for the event.

For kinds 0, 3, 10k-20k this will be the event `<kind>`:`<pubkey>`
For kinds 30k-40k this will be the event `<kind>`:`<pubkey>`:`<d-tag>`
For all other kinds this will be the event id

#### Returns

`string`

#### Inherited from

[`NDKEvent`](NDKEvent.md).[`deduplicationKey`](NDKEvent.md#deduplicationkey)

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

[`NDKEvent`](NDKEvent.md).[`delete`](NDKEvent.md#delete)

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

[`NDKEvent`](NDKEvent.md).[`filter`](NDKEvent.md#filter)

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

Generates content tags for the article.

This method first checks and sets the publication date if not available,
and then generates content tags based on the base NDKEvent class.

#### Returns

`Promise`\<`ContentTag`\>

- The generated content tags.

#### Overrides

[`NDKEvent`](NDKEvent.md).[`generateTags`](NDKEvent.md#generatetags)

#### Source

[ndk/src/events/kinds/article.ts:109](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/events/kinds/article.ts#L109)

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

[`NDKEvent`](NDKEvent.md).[`getMatchingTags`](NDKEvent.md#getmatchingtags)

#### Source

[ndk/src/events/index.ts:199](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/events/index.ts#L199)

***

### muted()

> **muted**(): `null` \| `string`

#### Returns

`null` \| `string`

#### Inherited from

[`NDKEvent`](NDKEvent.md).[`muted`](NDKEvent.md#muted)

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

[`NDKEvent`](NDKEvent.md).[`publish`](NDKEvent.md#publish)

#### Source

[ndk/src/events/index.ts:277](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/events/index.ts#L277)

***

### rawEvent()

> **rawEvent**(): [`NostrEvent`](../type-aliases/NostrEvent.md)

Returns the event as is.

#### Returns

[`NostrEvent`](../type-aliases/NostrEvent.md)

#### Inherited from

[`NDKEvent`](NDKEvent.md).[`rawEvent`](NDKEvent.md#rawevent)

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

[`NDKEvent`](NDKEvent.md).[`react`](NDKEvent.md#react)

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

[`NDKEvent`](NDKEvent.md).[`referenceTags`](NDKEvent.md#referencetags)

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

[`NDKEvent`](NDKEvent.md).[`removeTag`](NDKEvent.md#removetag)

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

[`NDKEvent`](NDKEvent.md).[`replaceableDTag`](NDKEvent.md#replaceabledtag)

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

[`NDKEvent`](NDKEvent.md).[`sign`](NDKEvent.md#sign)

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

[`NDKEvent`](NDKEvent.md).[`tag`](NDKEvent.md#tag)

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

[`NDKEvent`](NDKEvent.md).[`tag`](NDKEvent.md#tag)

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

[`NDKEvent`](NDKEvent.md).[`tag`](NDKEvent.md#tag)

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

[`NDKEvent`](NDKEvent.md).[`tagAddress`](NDKEvent.md#tagaddress)

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

[`NDKEvent`](NDKEvent.md).[`tagId`](NDKEvent.md#tagid)

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

[`NDKEvent`](NDKEvent.md).[`tagReference`](NDKEvent.md#tagreference)

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

[`NDKEvent`](NDKEvent.md).[`tagValue`](NDKEvent.md#tagvalue)

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

[`NDKEvent`](NDKEvent.md).[`toNostrEvent`](NDKEvent.md#tonostrevent)

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

[`NDKEvent`](NDKEvent.md).[`zap`](NDKEvent.md#zap)

#### Source

[ndk/src/events/index.ts:511](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/events/index.ts#L511)

***

### from()

> **`static`** **from**(`event`): [`NDKArticle`](NDKArticle.md)

Creates a NDKArticle from an existing NDKEvent.

#### Parameters

• **event**: [`NDKEvent`](NDKEvent.md)

NDKEvent to create the NDKArticle from.

#### Returns

[`NDKArticle`](NDKArticle.md)

NDKArticle

#### Source

[ndk/src/events/kinds/article.ts:21](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/events/kinds/article.ts#L21)
