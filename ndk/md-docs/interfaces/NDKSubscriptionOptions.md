**NDK** • [Readme](../README.md) \| [API](../globals.md)

***

[NDK](../README.md) / NDKSubscriptionOptions

# Interface: NDKSubscriptionOptions

## Properties

### cacheUsage?

> **cacheUsage**?: [`NDKSubscriptionCacheUsage`](../enumerations/NDKSubscriptionCacheUsage.md)

#### Source

[ndk/src/subscription/index.ts:43](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/subscription/index.ts#L43)

***

### closeOnEose?

> **closeOnEose**?: `boolean`

Whether to close the subscription when all relays have reached the end of the event stream.

#### Default

```ts
false
```

#### Source

[ndk/src/subscription/index.ts:42](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/subscription/index.ts#L42)

***

### groupable?

> **groupable**?: `boolean`

Groupable subscriptions are created with a slight time
delayed to allow similar filters to be grouped together.

#### Source

[ndk/src/subscription/index.ts:49](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/subscription/index.ts#L49)

***

### groupableDelay?

> **groupableDelay**?: `number`

The delay to use when grouping subscriptions, specified in milliseconds.

#### Default

```ts
100
```

#### Example

```ts
const sub1 = ndk.subscribe({ kinds: [1], authors: ["alice"] }, { groupableDelay: 100 });
const sub2 = ndk.subscribe({ kinds: [0], authors: ["alice"] }, { groupableDelay: 1000 });
// sub1 and sub2 will be grouped together and executed 100ms after sub1 was created
```

#### Source

[ndk/src/subscription/index.ts:59](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/subscription/index.ts#L59)

***

### groupableDelayType?

> **groupableDelayType**?: `"at-least"` \| `"at-most"`

Specifies how this delay should be interpreted.
"at-least" means "wait at least this long before sending the subscription"
"at-most" means "wait at most this long before sending the subscription"

#### Default

```ts
"at-most"
```

#### Example

```ts
const sub1 = ndk.subscribe({ kinds: [1], authors: ["alice"] }, { groupableDelay: 100, groupableDelayType: "at-least" });
const sub2 = ndk.subscribe({ kinds: [0], authors: ["alice"] }, { groupableDelay: 1000, groupableDelayType: "at-most" });
// sub1 and sub2 will be grouped together and executed 1000ms after sub1 was created
```

#### Source

[ndk/src/subscription/index.ts:71](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/subscription/index.ts#L71)

***

### pool?

> **pool**?: `NDKPool`

Pool to use

#### Source

[ndk/src/subscription/index.ts:81](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/subscription/index.ts#L81)

***

### skipValidation?

> **skipValidation**?: `boolean`

Skip event validation

#### Default

```ts
false
```

#### Source

[ndk/src/subscription/index.ts:93](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/subscription/index.ts#L93)

***

### skipVerification?

> **skipVerification**?: `boolean`

Skip signature verification

#### Default

```ts
false
```

#### Source

[ndk/src/subscription/index.ts:87](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/subscription/index.ts#L87)

***

### subId?

> **subId**?: `string`

The subscription ID to use for the subscription.

#### Source

[ndk/src/subscription/index.ts:76](https://github.com/nostr-dev-kit/ndk/blob/d04eef3/ndk/src/subscription/index.ts#L76)
