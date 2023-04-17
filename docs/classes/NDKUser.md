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
- [fromNip05](NDKUser.md#fromnip05)

## Constructors

### constructor

• **new NDKUser**(`opts`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `opts` | `NDKUserParams` |

#### Defined in

[src/user/index.ts:23](https://github.com/nostr-dev-kit/ndk/blob/bdedd0e/src/user/index.ts#L23)

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

[src/user/index.ts:79](https://github.com/nostr-dev-kit/ndk/blob/bdedd0e/src/user/index.ts#L79)

___

### ndk

• **ndk**: `undefined` \| [`default`](default.md)

#### Defined in

[src/user/index.ts:18](https://github.com/nostr-dev-kit/ndk/blob/bdedd0e/src/user/index.ts#L18)

___

### npub

• `Readonly` **npub**: `string` = `''`

#### Defined in

[src/user/index.ts:20](https://github.com/nostr-dev-kit/ndk/blob/bdedd0e/src/user/index.ts#L20)

___

### profile

• `Optional` **profile**: [`NDKUserProfile`](../interfaces/NDKUserProfile.md)

#### Defined in

[src/user/index.ts:19](https://github.com/nostr-dev-kit/ndk/blob/bdedd0e/src/user/index.ts#L19)

___

### relayUrls

• `Readonly` **relayUrls**: `string`[] = `[]`

#### Defined in

[src/user/index.ts:21](https://github.com/nostr-dev-kit/ndk/blob/bdedd0e/src/user/index.ts#L21)

## Methods

### fetchProfile

▸ **fetchProfile**(): `Promise`<``null`` \| `Set`<[`NDKEvent`](NDKEvent.md)\>\>

#### Returns

`Promise`<``null`` \| `Set`<[`NDKEvent`](NDKEvent.md)\>\>

#### Defined in

[src/user/index.ts:50](https://github.com/nostr-dev-kit/ndk/blob/bdedd0e/src/user/index.ts#L50)

___

### hexpubkey

▸ **hexpubkey**(): `string`

#### Returns

`string`

#### Defined in

[src/user/index.ts:46](https://github.com/nostr-dev-kit/ndk/blob/bdedd0e/src/user/index.ts#L46)

___

### relayList

▸ **relayList**(): `Promise`<`Set`<[`NDKEvent`](NDKEvent.md)\>\>

#### Returns

`Promise`<`Set`<[`NDKEvent`](NDKEvent.md)\>\>

#### Defined in

[src/user/index.ts:81](https://github.com/nostr-dev-kit/ndk/blob/bdedd0e/src/user/index.ts#L81)

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

[src/user/index.ts:35](https://github.com/nostr-dev-kit/ndk/blob/bdedd0e/src/user/index.ts#L35)
