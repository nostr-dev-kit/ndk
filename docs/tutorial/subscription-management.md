# Subscription Management

NDK attempts to intelligently group subscriptions to avoid excessively hitting relays with too many subscriptions when similar requests are going to be created with similar requests.

Take the example of an application rendering a list of events along with the authors' name.

This would typically be accomplished by creating a subscription for the desired events, say, kind:1s with a `#nostr` tag.

```ts
const sub = ndk.subscribe({ kinds: [ 1 ], "#t": [ "nostr" ] })
sub.on("event", (event: NDKEvent) => {
    const author = event.author;
    const profile = await author.fetchProfile();

    console.log(`${profile.name}: ${event.content}`);
})
```

Now, this seemingly simple approach would have created a kind:0 subscription (`fetchProfile()`) for each note.

Not great. Most relays will start to reject subscriptions when you have around 10 or 20 active requests.

In this case, NDK will automatically realize that you are requesting `kind:0` events for a lot of different pubkeys and group them into a single subscription.

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

Application code doesn't need to concern itself with checking if the event they are receiving is the one they asked for; NDK will only call the event handler with the correct event so that the grouping is transparent to the application.

## Disabling Grouping

Sometimes you have a specific need or are certain that you won't be requesting multiple requests of the same type, so we can safely disable grouping and enjoy a small performance boost (since we don't need to wait for grouping to happen).

```ts
const sub = ndk.subscribe({ kinds: [ 1 ], "#t": [ "nostr" ] }, { groupable: false })
```

This will make the REQ for `kind:1` events to hit the relays immediately and skip the `100ms` (default) grouping window.

If you want to change the grouping delay you can do so by setting the `groupingDelay` option

```ts
const sub = ndk.subscribe({ kinds: [ 1 ], "#t": [ "nostr" ] }, { groupingDelay: 500 })
```

You can also establish how the delay should be interpreted:

```ts
const sub = ndk.subscribe({ kinds: [ 1 ], "#t": [ "nostr" ] }, { groupingDelayType: "at-least" })
// * "at-least" means "wait at least this long before sending the subscription"
// * "at-most" means "wait at most this long before sending the subscription"
```

When using `at-least` the subscription timer will be reset every time a new subscription is added to the group.

For example, if you create two subscriptions, one at `t=0` and the other one 50ms later (`t=50ms`), with a `groupableDelay` of `200ms`, `at-least` would send the subscription at `t=250ms` and `at-most` would send it at `t=200ms`.