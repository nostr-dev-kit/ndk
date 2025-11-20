# Subscribing to Events

Once [connected](/core/docs/getting-started/usage#connecting), you can subscribe to events using `ndk.subscribe()` by
providing filters you can specify the events you're interested in.

## Subscribe

The `ndk.subscribe()` method accepts these parameters:

- `filters`: A single or array of `NDKFilter`.
  See [NIP-01](https://github.com/nostr-protocol/nips/blob/master/01.md#communication-between-clients-and-relays).
- `opts?`: Subscription options object `NDKSubscriptionOptions`.
- `autoStart?`: [Event handlers](#event-handlers) for that subscription.

<<< @/core/docs/snippets/subscribe.ts

## Specifying Relays

By default, NDK will use the already connected relay set or provided through the signer. You can
override this behavior by providing explicit relays in the `relayUrls` or `relaySet` options.

<<< @/core/docs/snippets/subscribe_relayset.ts

## Event Handlers

### Handler Functions

> [!TIP]
> The **recommended** way to handle events is to provide handler functions directly when calling `ndk.subscribe()`. This
> is done using the third argument (`autoStart`), which accepts an object containing `onEvent`, `onEvents`, and/or
`onEose` callbacks.

**Why is this preferred?** Subscriptions can start receiving events (especially from a fast cache) almost immediately
after `ndk.subscribe()` is called. By providing handlers directly, you ensure they are attached *before* any events are
emitted, preventing potential race conditions where you might miss the first few events if you attached handlers later
using `.on()`.

<<< @/core/docs/snippets/subscribe_event_handlers.ts

### Attaching Handlers

You can also attach event listeners *after* creating the subscription using the `.on()` method.

> [!WARNING]
> While functional, be mindful of the potential race condition mentioned above, especially if you rely on immediate
> cache results.

<<< @/core/docs/snippets/subscribe_event_attach.ts

## Functions

### onEvent

The `onEvent` handler is called for every event received from relays or the cache.

### onEvents

Using the `onEvents` handler provides an efficient way to process events loaded from the cache. When you provide
`onEvents`:

1. If NDK finds matching events in its cache *synchronously* when the subscription starts, `onEvents` is called **once**
   with an array of all those cached events.
2. The `onEvent` handler is **skipped** for this initial batch of cached events.
3. `onEvent` will still be called for any subsequent events received from relays or later asynchronous cache updates.

This is ideal for scenarios like populating initial UI state, as it allows you to process the cached data in a single
batch, preventing potentially numerous individual updates that would occur if `onEvent` were called for each cached
item.

If you *don't* provide `onEvents`, the standard `onEvent` handler will be triggered for every event, whether it comes
from the cache or a relay.

### onEose

Called when the subscription is closed.
