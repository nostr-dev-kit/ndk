**NDK** • [Readme](../README.md) \| [API](../globals.md)

***

[NDK](../README.md) / default

# Class: default

The NDK class is the main entry point to the library.

## Emits

signer:ready when a signer is ready

## Extends

- `EventEmitter`

## Constructors

### new default(opts)

> **new default**(`opts`): [`default`](default.md)

#### Parameters

• **opts**: [`NDKConstructorParams`](../interfaces/NDKConstructorParams.md)= `{}`

#### Returns

[`default`](default.md)

#### Overrides

`EventEmitter.constructor`

#### Source

[ndk/src/ndk/index.ts:175](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/ndk/index.ts#L175)

## Properties

### cacheAdapter?

> **cacheAdapter**?: [`NDKCacheAdapter`](../interfaces/NDKCacheAdapter.md)

#### Source

[ndk/src/ndk/index.ts:126](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/ndk/index.ts#L126)

***

### clientName?

> **clientName**?: `string`

#### Source

[ndk/src/ndk/index.ts:131](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/ndk/index.ts#L131)

***

### clientNip89?

> **clientNip89**?: `string`

#### Source

[ndk/src/ndk/index.ts:132](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/ndk/index.ts#L132)

***

### debug

> **debug**: `Debugger`

#### Source

[ndk/src/ndk/index.ts:127](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/ndk/index.ts#L127)

***

### devWriteRelaySet?

> **devWriteRelaySet**?: [`NDKRelaySet`](NDKRelaySet.md)

#### Source

[ndk/src/ndk/index.ts:128](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/ndk/index.ts#L128)

***

### explicitRelayUrls?

> **explicitRelayUrls**?: `string`[]

#### Source

[ndk/src/ndk/index.ts:121](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/ndk/index.ts#L121)

***

### httpFetch

> **httpFetch**: `undefined` \| (`input`: `RequestInfo` \| `URL`, `init`?: `RequestInit`) => `Promise`\<`Response`\>

Fetch function to use for HTTP requests.

#### Example

```typescript
import fetch from "node-fetch";

ndk.httpFetch = fetch;
```

#### Source

[ndk/src/ndk/index.ts:170](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/ndk/index.ts#L170)

***

### mutedIds

> **mutedIds**: `Map`\<`string`, `string`\>

#### Source

[ndk/src/ndk/index.ts:130](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/ndk/index.ts#L130)

***

### outboxPool?

> **outboxPool**?: `NDKPool`

#### Source

[ndk/src/ndk/index.ts:123](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/ndk/index.ts#L123)

***

### outboxTracker?

> **outboxTracker**?: `OutboxTracker`

#### Source

[ndk/src/ndk/index.ts:129](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/ndk/index.ts#L129)

***

### pool

> **pool**: `NDKPool`

#### Source

[ndk/src/ndk/index.ts:122](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/ndk/index.ts#L122)

***

### relayAuthDefaultPolicy?

> **relayAuthDefaultPolicy**?: [`NDKAuthPolicy`](../type-aliases/NDKAuthPolicy.md)

Default relay-auth policy that will be used when a relay requests authentication,
if no other policy is specified for that relay.

#### Example

Disconnect from relays that request authentication:
```typescript
ndk.relayAuthDefaultPolicy = NDKAuthPolicies.disconnect(ndk.pool);
```

#### Example

Sign in to relays that request authentication:
```typescript
ndk.relayAuthDefaultPolicy = NDKAuthPolicies.signIn({ndk})
```

#### Example

Sign in to relays that request authentication, asking the user for confirmation:
```typescript
ndk.relayAuthDefaultPolicy = (relay: NDKRelay) => {
    const signIn = NDKAuthPolicies.signIn({ndk});
    if (confirm(`Relay ${relay.url} is requesting authentication, do you want to sign in?`)) {
       signIn(relay);
    }
}
```

#### Source

[ndk/src/ndk/index.ts:158](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/ndk/index.ts#L158)

## Accessors

### activeUser

> **`get`** **activeUser**(): `undefined` \| [`NDKUser`](NDKUser.md)

> **`set`** **activeUser**(`user`): `void`

Sets the active user for this NDK instance, typically this will be
called when assigning a signer to the NDK instance.

This function will automatically connect to the user's relays if
`autoConnectUserRelays` is set to true.

It will also fetch the user's mutelist if `autoFetchUserMutelist` is set to true.

#### Parameters

• **user**: `undefined` \| [`NDKUser`](NDKUser.md)

#### Returns

`undefined` \| [`NDKUser`](NDKUser.md)

#### Source

[ndk/src/ndk/index.ts:252](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/ndk/index.ts#L252)

***

### signer

> **`get`** **signer**(): `undefined` \| [`NDKSigner`](../interfaces/NDKSigner.md)

> **`set`** **signer**(`newSigner`): `void`

#### Parameters

• **newSigner**: `undefined` \| [`NDKSigner`](../interfaces/NDKSigner.md)

#### Returns

`undefined` \| [`NDKSigner`](../interfaces/NDKSigner.md)

#### Source

[ndk/src/ndk/index.ts:345](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/ndk/index.ts#L345)

## Methods

### addExplicitRelay()

> **addExplicitRelay**(`urlOrRelay`, `relayAuthPolicy`?, `connect`?): [`NDKRelay`](NDKRelay.md)

Adds an explicit relay to the pool.

#### Parameters

• **urlOrRelay**: `string` \| [`NDKRelay`](NDKRelay.md)

• **relayAuthPolicy?**: [`NDKAuthPolicy`](../type-aliases/NDKAuthPolicy.md)

Authentication policy to use if different from the default

• **connect?**: `boolean`= `true`

Whether to connect to the relay automatically

#### Returns

[`NDKRelay`](NDKRelay.md)

#### Source

[ndk/src/ndk/index.ts:229](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/ndk/index.ts#L229)

***

### assertSigner()

> **assertSigner**(): `void`

Ensures that a signer is available to sign an event.

#### Returns

`void`

#### Source

[ndk/src/ndk/index.ts:579](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/ndk/index.ts#L579)

***

### connect()

> **connect**(`timeoutMs`?): `Promise`\<`void`\>

Connect to relays with optional timeout.
If the timeout is reached, the connection will be continued to be established in the background.

#### Parameters

• **timeoutMs?**: `number`

#### Returns

`Promise`\<`void`\>

#### Source

[ndk/src/ndk/index.ts:363](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/ndk/index.ts#L363)

***

### fetchEvent()

> **fetchEvent**(`idOrFilter`, `opts`?, `relaySetOrRelay`?): `Promise`\<`null` \| [`NDKEvent`](NDKEvent.md)\>

Fetch a single event.

#### Parameters

• **idOrFilter**: `string` \| [`NDKFilter`](../type-aliases/NDKFilter.md)

event id in bech32 format or filter

• **opts?**: [`NDKSubscriptionOptions`](../interfaces/NDKSubscriptionOptions.md)

subscription options

• **relaySetOrRelay?**: [`NDKRelay`](NDKRelay.md) \| [`NDKRelaySet`](NDKRelaySet.md)

explicit relay set to use

#### Returns

`Promise`\<`null` \| [`NDKEvent`](NDKEvent.md)\>

#### Source

[ndk/src/ndk/index.ts:473](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/ndk/index.ts#L473)

***

### fetchEvents()

> **fetchEvents**(`filters`, `opts`?, `relaySet`?): `Promise`\<`Set`\<[`NDKEvent`](NDKEvent.md)\>\>

Fetch events

#### Parameters

• **filters**: [`NDKFilter`](../type-aliases/NDKFilter.md) \| [`NDKFilter`](../type-aliases/NDKFilter.md)[]

• **opts?**: [`NDKSubscriptionOptions`](../interfaces/NDKSubscriptionOptions.md)

• **relaySet?**: [`NDKRelaySet`](NDKRelaySet.md)

#### Returns

`Promise`\<`Set`\<[`NDKEvent`](NDKEvent.md)\>\>

#### Source

[ndk/src/ndk/index.ts:536](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/ndk/index.ts#L536)

***

### getNip96()

> **getNip96**(`domain`): `Nip96`

Creates a new Nip96 instance for the given domain.

#### Parameters

• **domain**: `string`

Domain to use for nip96 uploads

#### Returns

`Nip96`

#### Example

Upload a file to a NIP-96 enabled domain:

```typescript
const blob = new Blob(["Hello, world!"], { type: "text/plain" });
const nip96 = ndk.getNip96("nostrcheck.me");
await nip96.upload(blob);
```

#### Source

[ndk/src/ndk/index.ts:597](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/ndk/index.ts#L597)

***

### getUser()

> **getUser**(`opts`): [`NDKUser`](NDKUser.md)

Get a NDKUser object

#### Parameters

• **opts**: `GetUserParams`

#### Returns

[`NDKUser`](NDKUser.md)

#### Source

[ndk/src/ndk/index.ts:391](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/ndk/index.ts#L391)

***

### getUserFromNip05()

> **getUserFromNip05**(`nip05`, `skipCache`): `Promise`\<`undefined` \| [`NDKUser`](NDKUser.md)\>

Get a NDKUser from a NIP05

#### Parameters

• **nip05**: `string`

NIP-05 ID

• **skipCache**: `boolean`= `false`

Skip cache

#### Returns

`Promise`\<`undefined` \| [`NDKUser`](NDKUser.md)\>

#### Source

[ndk/src/ndk/index.ts:403](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/ndk/index.ts#L403)

***

### ~~publish()~~

> **publish**(`event`, `relaySet`?, `timeoutMs`?): `Promise`\<`Set`\<[`NDKRelay`](NDKRelay.md)\>\>

Publish an event to a relay

#### Parameters

• **event**: [`NDKEvent`](NDKEvent.md)

event to publish

• **relaySet?**: [`NDKRelaySet`](NDKRelaySet.md)

explicit relay set to use

• **timeoutMs?**: `number`

timeout in milliseconds to wait for the event to be published

#### Returns

`Promise`\<`Set`\<[`NDKRelay`](NDKRelay.md)\>\>

The relays the event was published to

#### Deprecated

Use `event.publish()` instead

#### Source

[ndk/src/ndk/index.ts:456](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/ndk/index.ts#L456)

***

### subscribe()

> **subscribe**(`filters`, `opts`?, `relaySet`?, `autoStart`?): [`NDKSubscription`](NDKSubscription.md)

Create a new subscription. Subscriptions automatically start, you can make them automatically close when all relays send back an EOSE by setting `opts.closeOnEose` to `true`)

#### Parameters

• **filters**: [`NDKFilter`](../type-aliases/NDKFilter.md) \| [`NDKFilter`](../type-aliases/NDKFilter.md)[]

• **opts?**: [`NDKSubscriptionOptions`](../interfaces/NDKSubscriptionOptions.md)

• **relaySet?**: [`NDKRelaySet`](NDKRelaySet.md)

explicit relay set to use

• **autoStart?**: `boolean`= `true`

automatically start the subscription

#### Returns

[`NDKSubscription`](NDKSubscription.md)

NDKSubscription

#### Source

[ndk/src/ndk/index.ts:416](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/ndk/index.ts#L416)

***

### toJSON()

> **toJSON**(): `string`

#### Returns

`string`

#### Source

[ndk/src/ndk/index.ts:248](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/ndk/index.ts#L248)
