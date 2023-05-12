[NDK](../README.md) / [Exports](../modules.md) / NDKRelaySet

# Class: NDKRelaySet

A relay set is a group of relays. This grouping can be short-living, for a single
REQ or can be long-lasting, for example for the explicit relay list the user
has specified.

Requests to relays should be sent through this interface.

## Table of contents

### Constructors

- [constructor](NDKRelaySet.md#constructor)

### Properties

- [relays](NDKRelaySet.md#relays)

### Methods

- [getId](NDKRelaySet.md#getid)
- [publish](NDKRelaySet.md#publish)
- [size](NDKRelaySet.md#size)
- [subscribe](NDKRelaySet.md#subscribe)
- [fromRelayUrls](NDKRelaySet.md#fromrelayurls)

## Constructors

### constructor

• **new NDKRelaySet**(`relays`, `ndk`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `relays` | `Set`<[`NDKRelay`](NDKRelay.md)\> |
| `ndk` | [`default`](default.md) |

#### Defined in

[src/relay/sets/index.ts:20](https://github.com/nostr-dev-kit/ndk/blob/db9bb3b/src/relay/sets/index.ts#L20)

## Properties

### relays

• `Readonly` **relays**: `Set`<[`NDKRelay`](NDKRelay.md)\>

#### Defined in

[src/relay/sets/index.ts:16](https://github.com/nostr-dev-kit/ndk/blob/db9bb3b/src/relay/sets/index.ts#L16)

## Methods

### getId

▸ **getId**(): `string`

Calculates an ID of this specific combination of relays.

#### Returns

`string`

#### Defined in

[src/relay/sets/index.ts:56](https://github.com/nostr-dev-kit/ndk/blob/db9bb3b/src/relay/sets/index.ts#L56)

___

### publish

▸ **publish**(`event`): `Promise`<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | [`NDKEvent`](NDKEvent.md) |

#### Returns

`Promise`<`void`\>

#### Defined in

[src/relay/sets/index.ts:137](https://github.com/nostr-dev-kit/ndk/blob/db9bb3b/src/relay/sets/index.ts#L137)

___

### size

▸ **size**(): `number`

#### Returns

`number`

#### Defined in

[src/relay/sets/index.ts:147](https://github.com/nostr-dev-kit/ndk/blob/db9bb3b/src/relay/sets/index.ts#L147)

___

### subscribe

▸ **subscribe**(`subscription`): [`NDKSubscription`](NDKSubscription.md)

Add a subscription to this relay set

#### Parameters

| Name | Type |
| :------ | :------ |
| `subscription` | [`NDKSubscription`](NDKSubscription.md) |

#### Returns

[`NDKSubscription`](NDKSubscription.md)

#### Defined in

[src/relay/sets/index.ts:65](https://github.com/nostr-dev-kit/ndk/blob/db9bb3b/src/relay/sets/index.ts#L65)

___

### fromRelayUrls

▸ `Static` **fromRelayUrls**(`relayUrls`, `ndk`): [`NDKRelaySet`](NDKRelaySet.md)

Creates a relay set from a list of relay URLs.

This is useful for testing in development to pass a local relay
to publish methods.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `relayUrls` | `string`[] | list of relay URLs to include in this set |
| `ndk` | [`default`](default.md) |  |

#### Returns

[`NDKRelaySet`](NDKRelaySet.md)

NDKRelaySet

#### Defined in

[src/relay/sets/index.ts:36](https://github.com/nostr-dev-kit/ndk/blob/db9bb3b/src/relay/sets/index.ts#L36)
