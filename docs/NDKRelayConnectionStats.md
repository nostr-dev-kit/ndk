# Interface: NDKRelayConnectionStats

## Table of contents

### Properties

- [attempts](../wiki/NDKRelayConnectionStats#attempts)
- [connectedAt](../wiki/NDKRelayConnectionStats#connectedat)
- [durations](../wiki/NDKRelayConnectionStats#durations)
- [success](../wiki/NDKRelayConnectionStats#success)

## Properties

### attempts

• **attempts**: `number`

The number of times a connection has been attempted.

#### Defined in

[src/relay/index.ts:24](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/relay/index.ts#L24)

___

### connectedAt

• `Optional` **connectedAt**: `number`

The time the current connection was established in milliseconds.

#### Defined in

[src/relay/index.ts:39](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/relay/index.ts#L39)

___

### durations

• **durations**: `number`[]

The durations of the last 100 connections in milliseconds.

#### Defined in

[src/relay/index.ts:34](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/relay/index.ts#L34)

___

### success

• **success**: `number`

The number of times a connection has been successfully established.

#### Defined in

[src/relay/index.ts:29](https://github.com/nostr-dev-kit/ndk/blob/1f6f222/src/relay/index.ts#L29)
