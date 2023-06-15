[NDK](../README.md) / [Exports](../modules.md) / NDKRelayStatus

# Enumeration: NDKRelayStatus

The current status of a relay.

## Table of contents

### Enumeration Members

- [CONNECTED](NDKRelayStatus.md#connected)
- [CONNECTING](NDKRelayStatus.md#connecting)
- [DISCONNECTED](NDKRelayStatus.md#disconnected)
- [DISCONNECTING](NDKRelayStatus.md#disconnecting)
- [FLAPPING](NDKRelayStatus.md#flapping)
- [RECONNECTING](NDKRelayStatus.md#reconnecting)

## Enumeration Members

### CONNECTED

• **CONNECTED** = ``1``

The relay is connected.

#### Defined in

[src/relay/index.ts:22](https://github.com/nostr-dev-kit/ndk/blob/4b9fbc9/src/relay/index.ts#L22)

___

### CONNECTING

• **CONNECTING** = ``0``

The relay is attempting to connect.

#### Defined in

[src/relay/index.ts:18](https://github.com/nostr-dev-kit/ndk/blob/4b9fbc9/src/relay/index.ts#L18)

___

### DISCONNECTED

• **DISCONNECTED** = ``3``

The relay has disconnected.

#### Defined in

[src/relay/index.ts:30](https://github.com/nostr-dev-kit/ndk/blob/4b9fbc9/src/relay/index.ts#L30)

___

### DISCONNECTING

• **DISCONNECTING** = ``2``

The relay is attempting to disconnect.

#### Defined in

[src/relay/index.ts:26](https://github.com/nostr-dev-kit/ndk/blob/4b9fbc9/src/relay/index.ts#L26)

___

### FLAPPING

• **FLAPPING** = ``5``

The relay is having issues responding.

#### Defined in

[src/relay/index.ts:38](https://github.com/nostr-dev-kit/ndk/blob/4b9fbc9/src/relay/index.ts#L38)

___

### RECONNECTING

• **RECONNECTING** = ``4``

The relay is attempting to reconnect.

#### Defined in

[src/relay/index.ts:34](https://github.com/nostr-dev-kit/ndk/blob/4b9fbc9/src/relay/index.ts#L34)
