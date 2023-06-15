[NDK](../README.md) / [Exports](../modules.md) / NDKUser

# Class: NDKUser

Represents a pubkey.

## Table of contents

### Constructors

- [constructor](NDKUser.md#constructor)

### Properties

- [follows](NDKUser.md#follows)
- [ndk](NDKUser.md#ndk)
- [npub](NDKUser.md#npub)
- [profile](NDKUser.md#profile)
- [relayUrls](NDKUser.md#relayurls)

### Methods

- [fetchProfile](NDKUser.md#fetchprofile)
- [hexpubkey](NDKUser.md#hexpubkey)
- [relayList](NDKUser.md#relaylist)
- [tagReference](NDKUser.md#tagreference)
- [fromNip05](NDKUser.md#fromnip05)

## Constructors

### constructor

• **new NDKUser**(`opts`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `opts` | `NDKUserParams` |

#### Defined in

[src/user/index.ts:24](https://github.com/nostr-dev-kit/ndk/blob/0aa26c2/src/user/index.ts#L24)

## Properties

### follows

• **follows**: (...`args`: []) => `Promise`<`Set`<[`NDKUser`](NDKUser.md)\>\>

#### Type declaration

▸ (`...args`): `Promise`<`Set`<[`NDKUser`](NDKUser.md)\>\>

Returns a set of users that this user follows.

##### Parameters

| Name | Type |
| :------ | :------ |
| `...args` | [] |

##### Returns

`Promise`<`Set`<[`NDKUser`](NDKUser.md)\>\>

#### Defined in

[src/user/index.ts:83](https://github.com/nostr-dev-kit/ndk/blob/0aa26c2/src/user/index.ts#L83)

___

### ndk

• **ndk**: `undefined` \| [`default`](default.md)

#### Defined in

[src/user/index.ts:19](https://github.com/nostr-dev-kit/ndk/blob/0aa26c2/src/user/index.ts#L19)

___

### npub

• `Readonly` **npub**: `string` = `""`

#### Defined in

[src/user/index.ts:21](https://github.com/nostr-dev-kit/ndk/blob/0aa26c2/src/user/index.ts#L21)

___

### profile

• `Optional` **profile**: [`NDKUserProfile`](../interfaces/NDKUserProfile.md)

#### Defined in

[src/user/index.ts:20](https://github.com/nostr-dev-kit/ndk/blob/0aa26c2/src/user/index.ts#L20)

___

### relayUrls

• `Readonly` **relayUrls**: `string`[] = `[]`

#### Defined in

[src/user/index.ts:22](https://github.com/nostr-dev-kit/ndk/blob/0aa26c2/src/user/index.ts#L22)

## Methods

### fetchProfile

▸ **fetchProfile**(`opts?`): `Promise`<``null`` \| `Set`<[`NDKEvent`](NDKEvent.md)\>\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `opts?` | [`NDKFilterOptions`](../interfaces/NDKFilterOptions.md) |

#### Returns

`Promise`<``null`` \| `Set`<[`NDKEvent`](NDKEvent.md)\>\>

#### Defined in

[src/user/index.ts:51](https://github.com/nostr-dev-kit/ndk/blob/0aa26c2/src/user/index.ts#L51)

___

### hexpubkey

▸ **hexpubkey**(): `string`

#### Returns

`string`

#### Defined in

[src/user/index.ts:47](https://github.com/nostr-dev-kit/ndk/blob/0aa26c2/src/user/index.ts#L47)

___

### relayList

▸ **relayList**(): `Promise`<`Set`<[`NDKEvent`](NDKEvent.md)\>\>

#### Returns

`Promise`<`Set`<[`NDKEvent`](NDKEvent.md)\>\>

#### Defined in

[src/user/index.ts:85](https://github.com/nostr-dev-kit/ndk/blob/0aa26c2/src/user/index.ts#L85)

___

### tagReference

▸ **tagReference**(): [`NDKTag`](../modules.md#ndktag)

Get the tag that can be used to reference this user in an event

#### Returns

[`NDKTag`](../modules.md#ndktag)

#### Defined in

[src/user/index.ts:104](https://github.com/nostr-dev-kit/ndk/blob/0aa26c2/src/user/index.ts#L104)

___

### fromNip05

▸ `Static` **fromNip05**(`nip05Id`): `Promise`<`undefined` \| [`NDKUser`](NDKUser.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `nip05Id` | `string` |

#### Returns

`Promise`<`undefined` \| [`NDKUser`](NDKUser.md)\>

#### Defined in

[src/user/index.ts:36](https://github.com/nostr-dev-kit/ndk/blob/0aa26c2/src/user/index.ts#L36)
