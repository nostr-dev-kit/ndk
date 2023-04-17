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

• **new NDKRelaySet**(`relays`, `debug`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `relays` | `Set`<[`NDKRelay`](NDKRelay.md)\> |
| `debug` | `Debugger` |

#### Defined in

[src/relay/sets/index.ts:17](https://github.com/nostr-dev-kit/ndk/blob/bdedd0e/src/relay/sets/index.ts#L17)

## Properties

### relays

• `Readonly` **relays**: `Set`<[`NDKRelay`](NDKRelay.md)\>

#### Defined in

[src/relay/sets/index.ts:13](https://github.com/nostr-dev-kit/ndk/blob/bdedd0e/src/relay/sets/index.ts#L13)

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

[src/relay/sets/index.ts:88](https://github.com/nostr-dev-kit/ndk/blob/bdedd0e/src/relay/sets/index.ts#L88)

___

### size

▸ **size**(): `number`

#### Returns

`number`

#### Defined in

[src/relay/sets/index.ts:98](https://github.com/nostr-dev-kit/ndk/blob/bdedd0e/src/relay/sets/index.ts#L98)

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

[src/relay/sets/index.ts:31](https://github.com/nostr-dev-kit/ndk/blob/bdedd0e/src/relay/sets/index.ts#L31)
