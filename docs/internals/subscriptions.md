# Subscriptions Lifecycle
When an application creates a subscription a lot of things happen under the hood.

Say we want to see `kind:1` events from pubkeys `123`, `456`, and `678`.

```ts
const subscription = ndk.subscribe({ kinds: [1], authors: [ "123", "456", "678" ]})
```

Since the application level didn't explicitly provide a relay-set, which is the most common use case, NDK will calculate a relay set based on the outbox model plus a variety of some other factors.

So the first thing we'll do before talking to relays is, decide to *which* relays we should talk to.

The `calculateRelaySetsFromFilters` function will take care of this and provide us with a map of relay URLs and filters for each relay.

This means that the query, as specified by the client might be broken into distinct queries specialized for the different relays.

For example, if we have 3 relays, and the query is for `kind:1` events from pubkeys `a` and `b`, the `calculateRelaySetsFromFilters` function might return something like this:

```ts
{
  "wss://relay1": { kinds: [1], authors: [ "a" ] },
  "wss://relay2": { kinds: [1], authors: [ "b" ] },
}
```

flowchart TD
    Client -->|"kinds: [1], authors: [a, b]"| Subscription1
    Subscription1 -->|"kinds: [1], authors: [a]"| wss://relay1
    Subscription1 -->|"kinds: [1], authors: [b]"| wss://relay2

## Subscription bundling
Once the subscription has been split into the filters each relay should receive, the filters are sent to the individual `NDKRelay`'s `NDKRelaySubscriptionManager` instances.

`NDKRelaySubscriptionManager` is responsible for keeping track of the active and scheduled subscriptions that are pending to be executed within an individual relay.

This is an important aspect to consider:

> `NDKSubscription` have a different lifecycle than `NDKRelaySubscription`. For example, a subscription that is set to close after EOSE might still be active within the `NDKSubscription` lifecycle, but it might have been already been closed within the `NDKRelaySubscription` lifecycle.

## NDKRelaySubscription
Most NDK subscriptions (at least by default) are set to be executed with a grouping delay. Will cover what this looks like in practice later, but for now, let's understand than when the `NDKRelaySubscriptionManager` receives an order, it might not execute it right away.

Once the filter is executed

As a way to reduce the number of subscriptions sent to a relay, NDK bundles subscriptions that have similar filters into a single `REQ`. So once a filter has been broken into relay filters, they are sent to the `NDKRelay`'s `NDKRelaySubscriptionManager` instance.

This instance keeps track of the 