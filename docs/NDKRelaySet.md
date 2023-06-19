# Class: NDKRelaySet

A relay set is a group of relays. This grouping can be short-living, for a single
REQ or can be long-lasting, for example for the explicit relay list the user
has specified.

Requests to relays should be sent through this interface.

## Table of contents

### Constructors

- [constructor](../wiki/NDKRelaySet#constructor)

### Properties

- [relays](../wiki/NDKRelaySet#relays)

### Methods

- [getId](../wiki/NDKRelaySet#getid)
- [publish](../wiki/NDKRelaySet#publish)
- [size](../wiki/NDKRelaySet#size)
- [subscribe](../wiki/NDKRelaySet#subscribe)
- [fromRelayUrls](../wiki/NDKRelaySet#fromrelayurls)

## Constructors

### constructor

• **new NDKRelaySet**(`relays`, `ndk`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `relays` | `Set`<[`NDKRelay`](../wiki/NDKRelay)\> |
| `ndk` | [`default`](../wiki/default) |

#### Defined in

[src/relay/sets/index.ts:20](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/relay/sets/index.ts#L20)

## Properties

### relays

• `Readonly` **relays**: `Set`<[`NDKRelay`](../wiki/NDKRelay)\>

#### Defined in

[src/relay/sets/index.ts:16](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/relay/sets/index.ts#L16)

## Methods

### getId

▸ **getId**(): `string`

Calculates an ID of this specific combination of relays.

#### Returns

`string`

#### Defined in

[src/relay/sets/index.ts:56](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/relay/sets/index.ts#L56)

___

### publish

▸ **publish**(`event`): `Promise`<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | [`NDKEvent`](../wiki/NDKEvent) |

#### Returns

`Promise`<`void`\>

#### Defined in

[src/relay/sets/index.ts:140](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/relay/sets/index.ts#L140)

___

### size

▸ **size**(): `number`

#### Returns

`number`

#### Defined in

[src/relay/sets/index.ts:150](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/relay/sets/index.ts#L150)

___

### subscribe

▸ **subscribe**(`subscription`): [`NDKSubscription`](../wiki/NDKSubscription)

Add a subscription to this relay set

#### Parameters

| Name | Type |
| :------ | :------ |
| `subscription` | [`NDKSubscription`](../wiki/NDKSubscription) |

#### Returns

[`NDKSubscription`](../wiki/NDKSubscription)

#### Defined in

[src/relay/sets/index.ts:65](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/relay/sets/index.ts#L65)

___

### fromRelayUrls

▸ `Static` **fromRelayUrls**(`relayUrls`, `ndk`): [`NDKRelaySet`](../wiki/NDKRelaySet)

Creates a relay set from a list of relay URLs.

This is useful for testing in development to pass a local relay
to publish methods.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `relayUrls` | `string`[] | list of relay URLs to include in this set |
| `ndk` | [`default`](../wiki/default) |  |

#### Returns

[`NDKRelaySet`](../wiki/NDKRelaySet)

NDKRelaySet

#### Defined in

[src/relay/sets/index.ts:36](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/relay/sets/index.ts#L36)
