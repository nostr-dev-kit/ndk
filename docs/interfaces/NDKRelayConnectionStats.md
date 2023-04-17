[NDK](../README.md) / [Exports](../modules.md) / NDKRelayConnectionStats

# Interface: NDKRelayConnectionStats

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

[src/relay/index.ts:22](https://github.com/nostr-dev-kit/ndk/blob/bdedd0e/src/relay/index.ts#L22)

___

### connectedAt

• `Optional` **connectedAt**: `number`

The time the current connection was established in milliseconds.

#### Defined in

[src/relay/index.ts:37](https://github.com/nostr-dev-kit/ndk/blob/bdedd0e/src/relay/index.ts#L37)

___

### durations

• **durations**: `number`[]

The durations of the last 100 connections in milliseconds.

#### Defined in

[src/relay/index.ts:32](https://github.com/nostr-dev-kit/ndk/blob/bdedd0e/src/relay/index.ts#L32)

___

### success

• **success**: `number`

The number of times a connection has been successfully established.

#### Defined in

[src/relay/index.ts:27](https://github.com/nostr-dev-kit/ndk/blob/bdedd0e/src/relay/index.ts#L27)
