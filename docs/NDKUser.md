# Class: NDKUser

Represents a pubkey.

## Table of contents

### Constructors

- [constructor](../wiki/NDKUser#constructor)

### Properties

- [follows](../wiki/NDKUser#follows)
- [ndk](../wiki/NDKUser#ndk)
- [npub](../wiki/NDKUser#npub)
- [profile](../wiki/NDKUser#profile)
- [relayUrls](../wiki/NDKUser#relayurls)

### Methods

- [fetchProfile](../wiki/NDKUser#fetchprofile)
- [hexpubkey](../wiki/NDKUser#hexpubkey)
- [relayList](../wiki/NDKUser#relaylist)
- [tagReference](../wiki/NDKUser#tagreference)
- [fromNip05](../wiki/NDKUser#fromnip05)

## Constructors

### constructor

• **new NDKUser**(`opts`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `opts` | `NDKUserParams` |

#### Defined in

[src/user/index.ts:24](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/user/index.ts#L24)

## Properties

### follows

• **follows**: (...`args`: []) => `Promise`<`Set`<[`NDKUser`](../wiki/NDKUser)\>\>

#### Type declaration

▸ (`...args`): `Promise`<`Set`<[`NDKUser`](../wiki/NDKUser)\>\>

Returns a set of users that this user follows.

##### Parameters

| Name | Type |
| :------ | :------ |
| `...args` | [] |

##### Returns

`Promise`<`Set`<[`NDKUser`](../wiki/NDKUser)\>\>

#### Defined in

[src/user/index.ts:83](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/user/index.ts#L83)

___

### ndk

• **ndk**: `undefined` \| [`default`](../wiki/default)

#### Defined in

[src/user/index.ts:19](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/user/index.ts#L19)

___

### npub

• `Readonly` **npub**: `string` = `""`

#### Defined in

[src/user/index.ts:21](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/user/index.ts#L21)

___

### profile

• `Optional` **profile**: [`NDKUserProfile`](../wiki/NDKUserProfile)

#### Defined in

[src/user/index.ts:20](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/user/index.ts#L20)

___

### relayUrls

• `Readonly` **relayUrls**: `string`[] = `[]`

#### Defined in

[src/user/index.ts:22](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/user/index.ts#L22)

## Methods

### fetchProfile

▸ **fetchProfile**(`opts?`): `Promise`<``null`` \| `Set`<[`NDKEvent`](../wiki/NDKEvent)\>\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `opts?` | [`NDKFilterOptions`](../wiki/NDKFilterOptions) |

#### Returns

`Promise`<``null`` \| `Set`<[`NDKEvent`](../wiki/NDKEvent)\>\>

#### Defined in

[src/user/index.ts:51](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/user/index.ts#L51)

___

### hexpubkey

▸ **hexpubkey**(): `string`

#### Returns

`string`

#### Defined in

[src/user/index.ts:47](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/user/index.ts#L47)

___

### relayList

▸ **relayList**(): `Promise`<`Set`<[`NDKEvent`](../wiki/NDKEvent)\>\>

#### Returns

`Promise`<`Set`<[`NDKEvent`](../wiki/NDKEvent)\>\>

#### Defined in

[src/user/index.ts:85](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/user/index.ts#L85)

___

### tagReference

▸ **tagReference**(): [`NDKTag`](../wiki/Exports#ndktag)

Get the tag that can be used to reference this user in an event

#### Returns

[`NDKTag`](../wiki/Exports#ndktag)

#### Defined in

[src/user/index.ts:104](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/user/index.ts#L104)

___

### fromNip05

▸ `Static` **fromNip05**(`nip05Id`): `Promise`<`undefined` \| [`NDKUser`](../wiki/NDKUser)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `nip05Id` | `string` |

#### Returns

`Promise`<`undefined` \| [`NDKUser`](../wiki/NDKUser)\>

#### Defined in

[src/user/index.ts:36](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/user/index.ts#L36)
