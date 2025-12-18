# Subscription Management

NDK attempts to intelligently group subscriptions to avoid excessively hitting relays with too many subscriptions when
similar requests are going to be created with similar requests.

Take the example of an application rendering a list of events along with the authors' name.

This would typically be accomplished by creating a subscription for the desired events, say, kind:1s with a `#nostr`
tag.

```ts
const sub = ndk.subscribe({ kinds: [1], "#t": ["nostr"] });
sub.on("event", (event: NDKEvent) => {
    const author = event.author;
    const profile = await author.fetchProfile();

    console.log(`${profile.name}: ${event.content}`);
});
```

Now, this seemingly simple approach would have created a kind:0 subscription (`fetchProfile()`) for each note.

Not great. Most relays will start to reject subscriptions when you have around 10 or 20 active requests.

In this case, NDK will automatically realize that you are requesting `kind:0` events for a lot of different pubkeys and
group them into a single subscription.

Without grouping:

```ts
[ "REQ", "<sub1>", '{ "kinds": [0], pubkeys: [ "pubkey1" ] }'],
[ "REQ", "<sub2>", '{ "kinds": [0], pubkeys: [ "pubkey2" ] }'],
[ "REQ", "<sub3>", '{ "kinds": [0], pubkeys: [ "pubkey3" ] }'],
[ "REQ", "<sub4>", '{ "kinds": [0], pubkeys: [ "pubkey4" ] }'],
[ "REQ", "<sub5>", '{ "kinds": [0], pubkeys: [ "pubkey5" ] }'],
```

With grouping:

```ts
[ "REQ", "<sub1>", '{ "kinds": [0], pubkeys: [ "pubkey1", "pubkey2", "pubkey3", "pubkey4", "pubkey5" ] }'],
```

Application code doesn't need to concern itself with checking if the event they are receiving is the one they asked for;
NDK will only call the event handler with the correct event so that the grouping is transparent to the application.

## Disabling Grouping

Sometimes you have a specific need or are certain that you won't be requesting multiple requests of the same type, so we
can safely disable grouping and enjoy a small performance boost (since we don't need to wait for grouping to happen).

```ts
const sub = ndk.subscribe({ kinds: [1], "#t": ["nostr"] }, { groupable: false });
```

## Mute Filtering

By default, NDK automatically filters out events from muted users and muted event IDs. When you set an active user,
their mute list (kind 10000) is automatically fetched and applied to all subscriptions. See
the [Mute Filtering](./mute-filtering.md) guide for more details on customizing mute behavior and including muted
content when needed.

## Filter Validation

NDK automatically validates subscription filters to prevent runtime errors. By default, filters containing `undefined`
values or invalid data will throw an error, helping you catch bugs early. See
the [Filter Validation](./filter-validation.md) guide for more details on validation modes and best practices.

This will make the REQ for `kind:1` events to hit the relays immediately and skip the `100ms` (default) grouping window.

If you want to change the grouping delay you can do so by setting the `groupingDelay` option

```ts
const sub = ndk.subscribe({ kinds: [1], "#t": ["nostr"] }, { groupingDelay: 500 });
```

You can also establish how the delay should be interpreted:

```ts
const sub = ndk.subscribe({ kinds: [1], "#t": ["nostr"] }, { groupingDelayType: "at-least" });
// * "at-least" means "wait at least this long before sending the subscription"
// * "at-most" means "wait at most this long before sending the subscription"
```

When using `at-least` the subscription timer will be reset every time a new subscription is added to the group.

For example, if you create two subscriptions, one at `t=0` and the other one 50ms later (`t=50ms`), with a
`groupableDelay` of `200ms`, `at-least` would send the subscription at `t=250ms` and `at-most` would send it at
`t=200ms`.

### Deferred subscription

Another useful interface to creating subscriptions is to pass event handlers within the subscription itself. In this
way, the subscription will first connect the event handlers and then auto-start the subscription.

```ts
const sub = ndk.subscribe(
    { kinds: [1] }, // filters
    { groupable: false }, /// subscription options
    relaySet, // optional relaySet
    {
        onEvent: (event: NDKEvent) => console.log("an event was received", event.id),
        onEose: () => console.log("the subscription EOSED"),
    }
);
```

## Advanced uses

### `cacheUnconstrainFilter`

`NDKSubscribe` supports passing a number of filters that will be removed when querying the cache; this allows you to
pass certain filters when going to relays and drop them when going to the cache. For example, a typical use is querying
for events `since` a certain timestamp. But you might want to load, in the same subscription everything that the cache
also has, regardless of that timestamp.

```ts
const events = ndk.subscribe([{ kinds: [1], limit: 10 }, { cacheUnconstrainFilter: ["limit"] }]);
```

This query will hit relays and only load 10 events from each relay that it hits, but the cache will be unconstrained
from the `limit` filter and everything that matches the `kinds:[1]` filter will be loaded by the subscription.
