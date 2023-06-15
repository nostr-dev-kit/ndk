[NDK](../README.md) / [Exports](../modules.md) / NDKRelayConnectionStats

# Interface: NDKRelayConnectionStats

The NDKRelayConnectionStats interface holds basic stats about a relay connection.

## Table of contents

### Properties

- [attempts](NDKRelayConnectionStats.md#attempts)
- [connectedAt](NDKRelayConnectionStats.md#connectedat)
- [durations](NDKRelayConnectionStats.md#durations)
- [success](NDKRelayConnectionStats.md#success)

## Properties

### attempts

• **attempts**: `number`

The number of times a connection has been attempted.

#### Defined in

[src/relay/index.ts:48](https://github.com/nostr-dev-kit/ndk/blob/4b9fbc9/src/relay/index.ts#L48)

___

### connectedAt

• `Optional` **connectedAt**: `number`

The time the current connection was established in milliseconds.

#### Defined in

[src/relay/index.ts:63](https://github.com/nostr-dev-kit/ndk/blob/4b9fbc9/src/relay/index.ts#L63)

___

### durations

• **durations**: `number`[]

The durations of the last 100 connections in milliseconds.

#### Defined in

[src/relay/index.ts:58](https://github.com/nostr-dev-kit/ndk/blob/4b9fbc9/src/relay/index.ts#L58)

___

### success

• **success**: `number`

The number of times a connection has been successfully established.

#### Defined in

[src/relay/index.ts:53](https://github.com/nostr-dev-kit/ndk/blob/4b9fbc9/src/relay/index.ts#L53)
