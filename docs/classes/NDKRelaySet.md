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

- [publish](NDKRelaySet.md#publish)
- [size](NDKRelaySet.md#size)
- [subscribe](NDKRelaySet.md#subscribe)

## Constructors

### constructor

• **new NDKRelaySet**(`relays`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `relays` | `Set`<[`NDKRelay`](NDKRelay.md)\> |

#### Defined in

[src/relay/sets/index.ts:15](https://github.com/nostr-dev-kit/ndk/blob/4e41494/src/relay/sets/index.ts#L15)

## Properties

### relays

• `Readonly` **relays**: `Set`<[`NDKRelay`](NDKRelay.md)\>

#### Defined in

[src/relay/sets/index.ts:13](https://github.com/nostr-dev-kit/ndk/blob/4e41494/src/relay/sets/index.ts#L13)

## Methods

### publish

▸ **publish**(`event`): `Promise`<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | [`NDKEvent`](NDKEvent.md) |

#### Returns

`Promise`<`void`\>

#### Defined in

[src/relay/sets/index.ts:39](https://github.com/nostr-dev-kit/ndk/blob/4e41494/src/relay/sets/index.ts#L39)

___

### size

▸ **size**(): `number`

#### Returns

`number`

#### Defined in

[src/relay/sets/index.ts:49](https://github.com/nostr-dev-kit/ndk/blob/4e41494/src/relay/sets/index.ts#L49)

___

### subscribe

▸ **subscribe**(`subscription`): [`NDKSubscription`](NDKSubscription.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `subscription` | [`NDKSubscription`](NDKSubscription.md) |

#### Returns

[`NDKSubscription`](NDKSubscription.md)

#### Defined in

[src/relay/sets/index.ts:24](https://github.com/nostr-dev-kit/ndk/blob/4e41494/src/relay/sets/index.ts#L24)
