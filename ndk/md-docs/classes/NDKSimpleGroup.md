**NDK** • [Readme](../README.md) \| [API](../globals.md)

***

[NDK](../README.md) / NDKSimpleGroup

# Class: NDKSimpleGroup

## Constructors

### new NDKSimpleGroup(ndk, groupId, relaySet)

> **new NDKSimpleGroup**(`ndk`, `groupId`, `relaySet`): [`NDKSimpleGroup`](NDKSimpleGroup.md)

#### Parameters

• **ndk**: [`default`](default.md)

• **groupId**: `string`

• **relaySet**: [`NDKRelaySet`](NDKRelaySet.md)

#### Returns

[`NDKSimpleGroup`](NDKSimpleGroup.md)

#### Source

[ndk/src/events/kinds/simple-group/index.ts:37](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/events/kinds/simple-group/index.ts#L37)

## Properties

### groupId

> **`readonly`** **groupId**: `string`

#### Source

[ndk/src/events/kinds/simple-group/index.ts:34](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/events/kinds/simple-group/index.ts#L34)

***

### relaySet

> **`readonly`** **relaySet**: [`NDKRelaySet`](NDKRelaySet.md)

#### Source

[ndk/src/events/kinds/simple-group/index.ts:35](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/events/kinds/simple-group/index.ts#L35)

## Methods

### addUser()

> **addUser**(`user`, `opts`): `Promise`\<`Object`\>

Adds a user to the group.

#### Parameters

• **user**: [`NDKUser`](NDKUser.md)

user to add

• **opts**: `AddUserOpts`= `undefined`

options

#### Returns

`Promise`\<`Object`\>

> ##### addUserEvent
>
> > **addUserEvent**: [`NDKEvent`](NDKEvent.md)
>
> ##### currentUserListEvent?
>
> > **currentUserListEvent**?: [`NDKEvent`](NDKEvent.md)
>

#### Source

[ndk/src/events/kinds/simple-group/index.ts:48](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/events/kinds/simple-group/index.ts#L48)

***

### getMemberListEvent()

> **getMemberListEvent**(): `Promise`\<`null` \| [`NDKEvent`](NDKEvent.md)\>

#### Returns

`Promise`\<`null` \| [`NDKEvent`](NDKEvent.md)\>

#### Source

[ndk/src/events/kinds/simple-group/index.ts:84](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/events/kinds/simple-group/index.ts#L84)

***

### generateAddUserEvent()

> **`static`** **generateAddUserEvent**(`userPubkey`, `groupId`, `alt`?): [`NDKEvent`](NDKEvent.md)

Generates an event that adds a user to a group.

#### Parameters

• **userPubkey**: `string`

pubkey of the user to add

• **groupId**: `string`

group to add the user to

• **alt?**: `string`

optional description of the event

#### Returns

[`NDKEvent`](NDKEvent.md)

#### Source

[ndk/src/events/kinds/simple-group/index.ts:121](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/events/kinds/simple-group/index.ts#L121)

***

### generateUserListEvent()

> **`static`** **generateUserListEvent**(`groupId`): [`NDKEvent`](NDKEvent.md)

Generates an event that lists the members of a group.

#### Parameters

• **groupId**: `string`

#### Returns

[`NDKEvent`](NDKEvent.md)

#### Source

[ndk/src/events/kinds/simple-group/index.ts:102](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/events/kinds/simple-group/index.ts#L102)
