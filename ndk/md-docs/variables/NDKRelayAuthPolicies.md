**NDK** • [Readme](../README.md) \| [API](../globals.md)

***

[NDK](../README.md) / NDKRelayAuthPolicies

# Variable: NDKRelayAuthPolicies

> **`const`** **NDKRelayAuthPolicies**: `Object`

## Type declaration

### disconnect

> **disconnect**: (`pool`: `NDKPool`, `debug`?: `Debugger`) => (`relay`: [`NDKRelay`](../classes/NDKRelay.md)) => `Promise`\<`void`\>

This policy will disconnect from relays that request authentication.

#### Parameters

• **pool**: `NDKPool`

• **debug?**: `Debugger`

#### Returns

`Function`

> ##### Parameters
>
> • **relay**: [`NDKRelay`](../classes/NDKRelay.md)
>
> ##### Returns
>
> `Promise`\<`void`\>
>

### signIn

> **signIn**: (`__namedParameters`: `ISignIn`) => (`relay`: [`NDKRelay`](../classes/NDKRelay.md), `challenge`: `string`) => `Promise`\<[`NDKEvent`](../classes/NDKEvent.md)\>

Uses the signer to sign an event and then authenticate with the relay. If no signer is provided the NDK signer will be used. If none is not available it will wait for one to be ready.

#### Parameters

• **\_\_namedParameters**: `ISignIn`= `{}`

#### Returns

`Function`

> ##### Parameters
>
> • **relay**: [`NDKRelay`](../classes/NDKRelay.md)
>
> • **challenge**: `string`
>
> ##### Returns
>
> `Promise`\<[`NDKEvent`](../classes/NDKEvent.md)\>
>

## Source

[ndk/src/relay/auth-policies.ts:86](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/relay/auth-policies.ts#L86)
