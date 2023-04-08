[NDK](../README.md) / [Exports](../modules.md) / NDKRelay

# Class: NDKRelay

The NDKRelay class represents a connection to a relay.

**`Emits`**

NDKRelay#connect

**`Emits`**

NDKRelay#disconnect

**`Emits`**

NDKRelay#notice

**`Emits`**

NDKRelay#event

**`Emits`**

NDKRelay#eose

## Hierarchy

- `EventEmitter`

  ↳ **`NDKRelay`**

## Table of contents

### Constructors

- [constructor](NDKRelay.md#constructor)

### Properties

- [scores](NDKRelay.md#scores)
- [url](NDKRelay.md#url)

### Accessors

- [connectionStats](NDKRelay.md#connectionstats)
- [status](NDKRelay.md#status)

### Methods

- [connect](NDKRelay.md#connect)
- [handleNotice](NDKRelay.md#handlenotice)
- [publish](NDKRelay.md#publish)
- [scoreSlowerEvent](NDKRelay.md#scoreslowerevent)
- [subscribe](NDKRelay.md#subscribe)

## Constructors

### constructor

• **new NDKRelay**(`url`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `url` | `string` |

#### Overrides

EventEmitter.constructor

#### Defined in

[src/relay/index.ts:57](https://github.com/nostr-dev-kit/ndk/blob/5bceb9f/src/relay/index.ts#L57)

## Properties

### scores

• `Readonly` **scores**: `Map`<[`NDKUser`](NDKUser.md), `number`\>

#### Defined in

[src/relay/index.ts:51](https://github.com/nostr-dev-kit/ndk/blob/5bceb9f/src/relay/index.ts#L51)

___

### url

• `Readonly` **url**: `string`

#### Defined in

[src/relay/index.ts:50](https://github.com/nostr-dev-kit/ndk/blob/5bceb9f/src/relay/index.ts#L50)

## Accessors

### connectionStats

• `get` **connectionStats**(): `NDKRelayConnectionStats`

Number of times this relay has been successfully connected to.

#### Returns

`NDKRelayConnectionStats`

#### Defined in

[src/relay/index.ts:167](https://github.com/nostr-dev-kit/ndk/blob/5bceb9f/src/relay/index.ts#L167)

___

### status

• `get` **status**(): `NDKRelayStatus`

#### Returns

`NDKRelayStatus`

#### Defined in

[src/relay/index.ts:89](https://github.com/nostr-dev-kit/ndk/blob/5bceb9f/src/relay/index.ts#L89)

## Methods

### connect

▸ **connect**(): `Promise`<`void`\>

#### Returns

`Promise`<`void`\>

#### Defined in

[src/relay/index.ts:93](https://github.com/nostr-dev-kit/ndk/blob/5bceb9f/src/relay/index.ts#L93)

___

### handleNotice

▸ **handleNotice**(`notice`): `Promise`<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `notice` | `string` |

#### Returns

`Promise`<`void`\>

#### Defined in

[src/relay/index.ts:101](https://github.com/nostr-dev-kit/ndk/blob/5bceb9f/src/relay/index.ts#L101)

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

[src/relay/index.ts:124](https://github.com/nostr-dev-kit/ndk/blob/5bceb9f/src/relay/index.ts#L124)

___

### scoreSlowerEvent

▸ **scoreSlowerEvent**(`timeDiffInMs`): `void`

Called when this relay has responded with an event but
wasn't the fastest one.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `timeDiffInMs` | `number` | The time difference in ms between the fastest and this relay in milliseconds |

#### Returns

`void`

#### Defined in

[src/relay/index.ts:135](https://github.com/nostr-dev-kit/ndk/blob/5bceb9f/src/relay/index.ts#L135)

___

### subscribe

▸ **subscribe**(`subscription`): `Sub`

#### Parameters

| Name | Type |
| :------ | :------ |
| `subscription` | [`NDKSubscription`](NDKSubscription.md) |

#### Returns

`Sub`

#### Defined in

[src/relay/index.ts:105](https://github.com/nostr-dev-kit/ndk/blob/5bceb9f/src/relay/index.ts#L105)
