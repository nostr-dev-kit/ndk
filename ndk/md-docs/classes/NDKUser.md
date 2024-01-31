**NDK** • [Readme](../README.md) \| [API](../globals.md)

***

[NDK](../README.md) / NDKUser

# Class: NDKUser

Represents a pubkey.

## Constructors

### new NDKUser(opts)

> **new NDKUser**(`opts`): [`NDKUser`](NDKUser.md)

#### Parameters

• **opts**: [`NDKUserParams`](../interfaces/NDKUserParams.md)

#### Returns

[`NDKUser`](NDKUser.md)

#### Source

[ndk/src/user/index.ts:56](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/user/index.ts#L56)

## Properties

### follows

> **follows**: (...`args`: [[`NDKSubscriptionOptions`](../interfaces/NDKSubscriptionOptions.md), `boolean`, `number`]) => `Promise`\<`Set`\<[`NDKUser`](NDKUser.md)\>\>

Returns a set of users that this user follows.

#### Parameters

• ...**args**: [[`NDKSubscriptionOptions`](../interfaces/NDKSubscriptionOptions.md), `boolean`, `number`]

#### Returns

`Promise`\<`Set`\<[`NDKUser`](NDKUser.md)\>\>

#### Source

[ndk/src/user/index.ts:250](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/user/index.ts#L250)

***

### ndk

> **ndk**: `undefined` \| [`default`](default.md)

#### Source

[ndk/src/user/index.ts:49](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/user/index.ts#L49)

***

### nip46Urls

> **`readonly`** **nip46Urls**: `string`[] = `[]`

#### Source

[ndk/src/user/index.ts:54](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/user/index.ts#L54)

***

### pin

> **pin**: (...`args`: [[`NDKEvent`](NDKEvent.md), [`NDKEvent`](NDKEvent.md), `boolean`]) => `Promise`\<[`NDKEvent`](NDKEvent.md)\>

Pins a user or an event

#### Parameters

• ...**args**: [[`NDKEvent`](NDKEvent.md), [`NDKEvent`](NDKEvent.md), `boolean`]

#### Returns

`Promise`\<[`NDKEvent`](NDKEvent.md)\>

#### Source

[ndk/src/user/index.ts:255](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/user/index.ts#L255)

***

### profile?

> **profile**?: [`NDKUserProfile`](../interfaces/NDKUserProfile.md)

#### Source

[ndk/src/user/index.ts:50](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/user/index.ts#L50)

***

### relayUrls

> **`readonly`** **relayUrls**: `string`[] = `[]`

#### Source

[ndk/src/user/index.ts:53](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/user/index.ts#L53)

## Accessors

### hexpubkey

> **`get`** **hexpubkey**(): `string`

Get the user's hexpubkey

#### Deprecated

Use `pubkey` instead

> **`set`** **hexpubkey**(`pubkey`): `void`

Set the user's hexpubkey

#### Deprecated

Use `pubkey` instead

#### Parameters

• **pubkey**: `string`

\{Hexpubkey\} The user's hexpubkey

#### Returns

`string`

The user's hexpubkey

#### Source

[ndk/src/user/index.ts:85](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/user/index.ts#L85)

***

### npub

> **`get`** **npub**(): `string`

> **`set`** **npub**(`npub`): `void`

#### Parameters

• **npub**: `string`

#### Returns

`string`

#### Source

[ndk/src/user/index.ts:66](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/user/index.ts#L66)

***

### pubkey

> **`get`** **pubkey**(): `string`

Get the user's pubkey

> **`set`** **pubkey**(`pubkey`): `void`

Set the user's pubkey

#### Parameters

• **pubkey**: `string`

\{string\} The user's pubkey

#### Returns

`string`

The user's pubkey

#### Source

[ndk/src/user/index.ts:102](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/user/index.ts#L102)

## Methods

### fetchProfile()

> **fetchProfile**(`opts`?): `Promise`\<`null` \| [`NDKUserProfile`](../interfaces/NDKUserProfile.md)\>

Fetch a user's profile

#### Parameters

• **opts?**: [`NDKSubscriptionOptions`](../interfaces/NDKSubscriptionOptions.md)

\{NDKSubscriptionOptions\} A set of NDKSubscriptionOptions

#### Returns

`Promise`\<`null` \| [`NDKUserProfile`](../interfaces/NDKUserProfile.md)\>

User Profile

#### Source

[ndk/src/user/index.ts:172](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/user/index.ts#L172)

***

### follow()

> **follow**(`newFollow`, `currentFollowList`?, `kind`?): `Promise`\<`boolean`\>

Add a follow to this user's contact list

#### Parameters

• **newFollow**: [`NDKUser`](NDKUser.md)

\{NDKUser\} The user to follow

• **currentFollowList?**: `Set`\<[`NDKUser`](NDKUser.md)\>

\{Set`<NDKUser>`} The current follow list

• **kind?**: [`NDKKind`](../enumerations/NDKKind.md)= `NDKKind.Contacts`

\{NDKKind\} The kind to use for this contact list (defaults to `3`)

#### Returns

`Promise`\<`boolean`\>

True if the follow was added, false if the follow already exists

#### Source

[ndk/src/user/index.ts:372](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/user/index.ts#L372)

***

### publish()

> **publish**(): `Promise`\<`void`\>

Publishes the current profile.

#### Returns

`Promise`\<`void`\>

#### Source

[ndk/src/user/index.ts:351](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/user/index.ts#L351)

***

### referenceTags()

> **referenceTags**(`marker`?): [`NDKTag`](../type-aliases/NDKTag.md)[]

Get the tags that can be used to reference this user in an event

#### Parameters

• **marker?**: `string`

#### Returns

[`NDKTag`](../type-aliases/NDKTag.md)[]

an array of NDKTag

#### Source

[ndk/src/user/index.ts:339](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/user/index.ts#L339)

***

### relayList()

> **relayList**(): `Promise`\<`undefined` \| [`NDKRelayList`](NDKRelayList.md)\>

Returns a set of relay list events for a user.

#### Returns

`Promise`\<`undefined` \| [`NDKRelayList`](NDKRelayList.md)\>

A set of NDKEvents returned for the given user.

#### Source

[ndk/src/user/index.ts:261](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/user/index.ts#L261)

***

### tagReference()

> **tagReference**(): [`NDKTag`](../type-aliases/NDKTag.md)

Get the tag that can be used to reference this user in an event

#### Returns

[`NDKTag`](../type-aliases/NDKTag.md)

an NDKTag

#### Source

[ndk/src/user/index.ts:331](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/user/index.ts#L331)

***

### validateNip05()

> **validateNip05**(`nip05Id`): `Promise`\<`null` \| `boolean`\>

Validate a user's NIP-05 identifier (usually fetched from their kind:0 profile data)

#### Parameters

• **nip05Id**: `string`

The NIP-05 string to validate

#### Returns

`Promise`\<`null` \| `boolean`\>

True if the NIP-05 is found and matches this user's pubkey,
False if the NIP-05 is found but doesn't match this user's pubkey,
null if the NIP-05 isn't found on the domain or we're unable to verify (because of network issues, etc.)

#### Source

[ndk/src/user/index.ts:410](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/user/index.ts#L410)

***

### zap()

> **zap**(`amount`, `comment`?, `extraTags`?, `signer`?): `Promise`\<`null` \| `string`\>

Zap a user

#### Parameters

• **amount**: `number`

The amount to zap in millisatoshis

• **comment?**: `string`

A comment to add to the zap request

• **extraTags?**: [`NDKTag`](../type-aliases/NDKTag.md)[]

Extra tags to add to the zap request

• **signer?**: [`NDKSigner`](../interfaces/NDKSigner.md)

The signer to use (will default to the NDK instance's signer)

#### Returns

`Promise`\<`null` \| `string`\>

#### Source

[ndk/src/user/index.ts:427](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/user/index.ts#L427)

***

### fromNip05()

> **`static`** **fromNip05**(`nip05Id`, `ndk`?, `skipCache`?): `Promise`\<`undefined` \| [`NDKUser`](NDKUser.md)\>

Instantiate an NDKUser from a NIP-05 string

#### Parameters

• **nip05Id**: `string`

\{string\} The user's NIP-05

• **ndk?**: [`default`](default.md)

\{NDK\} An NDK instance

• **skipCache?**: `boolean`= `false`

\{boolean\} Whether to skip the cache or not

#### Returns

`Promise`\<`undefined` \| [`NDKUser`](NDKUser.md)\>

An NDKUser if one is found for the given NIP-05, undefined otherwise.

#### Source

[ndk/src/user/index.ts:126](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/user/index.ts#L126)
