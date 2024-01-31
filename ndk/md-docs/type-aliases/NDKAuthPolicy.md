**NDK** • [Readme](../README.md) \| [API](../globals.md)

***

[NDK](../README.md) / NDKAuthPolicy

# Type alias: NDKAuthPolicy

> **NDKAuthPolicy**: (`relay`: [`NDKRelay`](../classes/NDKRelay.md), `challenge`: `string`) => `Promise`\<`boolean` \| `void` \| [`NDKEvent`](../classes/NDKEvent.md)\>

NDKAuthPolicies are functions that are called when a relay requests authentication
so that you can define a behavior for your application.

## Parameters

• **relay**: [`NDKRelay`](../classes/NDKRelay.md)

The relay that requested authentication.

• **challenge**: `string`

The challenge that the relay sent.

## Returns

`Promise`\<`boolean` \| `void` \| [`NDKEvent`](../classes/NDKEvent.md)\>

## Source

[ndk/src/relay/auth-policies.ts:16](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/relay/auth-policies.ts#L16)
