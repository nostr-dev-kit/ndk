**NDK** • [Readme](../README.md) \| [API](../globals.md)

***

[NDK](../README.md) / PublishError

# Class: PublishError

## Extends

- `Error`

## Constructors

### new PublishError(message, errors)

> **new PublishError**(`message`, `errors`): [`PublishError`](PublishError.md)

#### Parameters

• **message**: `string`

• **errors**: `Map`\<[`NDKRelay`](NDKRelay.md), `Error`\>

#### Returns

[`PublishError`](PublishError.md)

#### Overrides

`Error.constructor`

#### Source

[ndk/src/relay/sets/index.ts:8](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/relay/sets/index.ts#L8)

## Properties

### errors

> **errors**: `Map`\<[`NDKRelay`](NDKRelay.md), `Error`\>

#### Source

[ndk/src/relay/sets/index.ts:6](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/relay/sets/index.ts#L6)
