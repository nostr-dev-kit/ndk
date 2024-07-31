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

```mermaid
flowchart TD
    Client -->|"kinds: [1], authors: [a, b]"| Subscription1
    Subscription1 -->|"kinds: [1], authors: [a]"| wss://relay1
    Subscription1 -->|"kinds: [1], authors: [b]"| wss://relay2
```

## Subscription bundling
Once the subscription has been split into the filters each relay should receive, the filters are sent to the individual `NDKRelay`'s `NDKRelaySubscriptionManager` instances.

`NDKRelaySubscriptionManager` is responsible for keeping track of the active and scheduled subscriptions that are pending to be executed within an individual relay.

This is an important aspect to consider:

> `NDKSubscription` have a different lifecycle than `NDKRelaySubscription`. For example, a subscription that is set to close after EOSE might still be active within the `NDKSubscription` lifecycle, but it might have been already been closed within the `NDKRelaySubscription` lifecycle, since NDK attempts to keep the minimum amount of open subscriptions at any given time.

## NDKRelaySubscription
Most NDK subscriptions (by default) are set to be executed with a grouping delay. Will cover what this looks like in practice later, but for now, let's understand than when the `NDKRelaySubscriptionManager` receives an order, it might not execute it right away.

The different filters that can be grouped together (thus executed as a single `REQ` within a relay) are grouped within the same `NDKRelaySubscription` instance and the execution scheduler is computed respecting what each individual `NDKSubscription` has requested.

(For example, if a subscription with a `groupingDelay` of `at-least` 500 millisecond has been grouped with another subscription with a `groupingDelay` of `at-least` 1000 milliseconds, the `NDKRelaySubscriptionManager` will wait 1000 ms before sending the `REQ` to this particular relay).

### Execution
Once the filter is executed at the relay level, the `REQ` is submitted into that relay's `NDKRelayConnectivity` instance, which will take care of monitoring for responses for this particular REQ and communicate them back into the `NDKRelaySubscription` instance.

Each `EVENT` that comes back as a response to our `REQ` within this `NDKRelaySubscription` instance is then compared with the filters of each `NDKSubscription` that has been grouped and if it matches, it is sent back to the `NDKSubscription` instance.


# Example

If an application requests `kind:1` of pubkeys `123`, `456`, and `789`. It creates an `NDKSubscription`:

```ts
ndk.subscribe({ kinds: [1], authors: [ "123", "456", "789" ]}, { groupableDelay: 500, groupableDelayType: 'at-least' })
// results in NDKSubscription1 with filters { kinds: [1], authors: [ "123", "456", "789" ] }
```

Some other part of the application requests a kind:7 from pubkey `123` at the same time.

```ts
ndk.subscribe({ kinds: [7], authors: [ "123" ]}, { groupableDelay: 500, groupableDelayType: 'at-most' })
// results in NDKSubscription2 with filters { kinds: [7], authors: [ "123" ] }
```

```mermaid
flowchart TD
    subgraph Subscriptions Lifecycle
        A[Application] -->|"kinds: [1], authors: [123, 456, 678], groupingDelay: at-least 500ms"| B[NDKSubscription1]
        
        A2[Application] -->|"kinds: [7], authors: [123], groupingDelay: at-most 1000ms"| B2[NDKSubscription2]
    end
```

Both subscriptions have their relayset calculated by NDK and, the resulting filters are sent into the `NDKRelaySubscriptionManager`, which will decide what, and how filters can be grouped.

```mermaid
flowchart TD
    subgraph Subscriptions Lifecycle
        A[Application] -->|"kinds: [1], authors: [123, 456, 678], groupingDelay: at-least 500ms"| B[NDKSubscription1]
        B --> C{Calculate Relay Sets}
        
        A2[Application] -->|"kinds: [7], authors: [123], groupingDelay: at-most 1000ms"| B2[NDKSubscription2]
        B2 --> C2{Calculate Relay Sets}
    end

    subgraph Subscription Bundling
        C -->|"kinds: [1], authors: [123]"| E1[wss://relay1 NDKRelaySubscriptionManager]
        C -->|"kinds: [1], authors: [456]"| E2[wss://relay2 NDKRelaySubscriptionManager]
        C -->|"kinds: [1], authors: [678]"| E3[wss://relay3 NDKRelaySubscriptionManager]

        C2 -->|"kinds: [7], authors: [123]"| E1
    end
```

The `NDKRelaySubscriptionManager` will create `NDKRelaySubscription` instances, or add filters to them if `NDKRelaySubscription` with the same filter fingerprint exists.

```mermaid
flowchart TD
    subgraph Subscriptions Lifecycle
        A[Application] -->|"kinds: [1], authors: [123, 456, 678], groupingDelay: at-least 500ms"| B[NDKSubscription1]
        B --> C{Calculate Relay Sets}
        
        A2[Application] -->|"kinds: [7], authors: [123], groupingDelay: at-most 1000ms"| B2[NDKSubscription2]
        B2 --> C2{Calculate Relay Sets}
    end

    subgraph Subscription Bundling
        C -->|"kinds: [1], authors: [123]"| E1[wss://relay1 NDKRelaySubscriptionManager]
        C -->|"kinds: [1], authors: [456]"| E2[wss://relay2 NDKRelaySubscriptionManager]
        C -->|"kinds: [1], authors: [678]"| E3[wss://relay3 NDKRelaySubscriptionManager]
        
        C2 -->|"kinds: [7], authors: [123]"| E1

        E1 -->|"Grouping Delay: at-most 1000ms"| F1[NDKRelaySubscription]
        E2 -->|"Grouping Delay: at-least 500ms"| F2[NDKRelaySubscription]
        E3 -->|"Grouping Delay: at-least 500ms"| F3[NDKRelaySubscription]
    end
```

Each individual `NDKRelaySubscription` computes the execution schedule of the filters it has received and sends them to the `NDKRelayConnectivity` instance, which in turns sends the `REQ` to the relay.

```mermaid
flowchart TD
    subgraph Subscriptions Lifecycle
        A[Application] -->|"kinds: [1], authors: [123, 456, 678], groupingDelay: at-least 500ms"| B[NDKSubscription1]
        B --> C{Calculate Relay Sets}
        
        A2[Application] -->|"kinds: [7], authors: [123], groupingDelay: at-most 1000ms"| B2[NDKSubscription2]
        B2 --> C2{Calculate Relay Sets}
    end

    subgraph Subscription Bundling
        C -->|"kinds: [1], authors: [123]"| E1[wss://relay1 NDKRelaySubscriptionManager]
        C -->|"kinds: [1], authors: [456]"| E2[wss://relay2 NDKRelaySubscriptionManager]
        C -->|"kinds: [1], authors: [678]"| E3[wss://relay3 NDKRelaySubscriptionManager]
        
        C2 -->|"kinds: [7], authors: [123]"| E1

        E1 -->|"Grouping Delay: at-most 1000ms"| F1[NDKRelaySubscription]
        E2 -->|"Grouping Delay: at-least 500ms"| F2[NDKRelaySubscription]
        E3 -->|"Grouping Delay: at-least 500ms"| F3[NDKRelaySubscription]

        F1 -->|"REQ: kinds: [1, 7], authors: [123]"| G1[NDKRelayConnectivity]
        F2 -->|"REQ: kinds: [1], authors: [456]"| G2[NDKRelayConnectivity]
        F3 -->|"REQ: kinds: [1], authors: [678]"| G3[NDKRelayConnectivity]
    end

    subgraph Execution
        G1 -->|"Send REQ to wss://relay1 after 1000ms"| R1[Relay1]
        G2 -->|"Send REQ to wss://relay2 after 500ms"| R2[Relay2]
        G3 -->|"Send REQ to wss://relay3 after 500ms"| R3[Relay3]
    end
```

As the events come from the relays, `NDKRelayConnectivity` will send them back to the `NDKRelaySubscription` instance, which will compare the event with the filters of the `NDKSubscription` instances that have been grouped together and send the received event back to the correct `NDKSubscription` instance.

```mermaid
flowchart TD
    subgraph Subscriptions Lifecycle
        A[Application] -->|"kinds: [1], authors: [123, 456, 678], groupingDelay: at-least 500ms"| B[NDKSubscription1]
        B --> C{Calculate Relay Sets}
        
        A2[Application] -->|"kinds: [7], authors: [123], groupingDelay: at-most 1000ms"| B2[NDKSubscription2]
        B2 --> C2{Calculate Relay Sets}
    end

    subgraph Subscription Bundling
        C -->|"kinds: [1], authors: [123]"| E1[wss://relay1 NDKRelaySubscriptionManager]
        C -->|"kinds: [1], authors: [456]"| E2[wss://relay2 NDKRelaySubscriptionManager]
        C -->|"kinds: [1], authors: [678]"| E3[wss://relay3 NDKRelaySubscriptionManager]
        
        C2 -->|"kinds: [7], authors: [123]"| E1

        E1 -->|"Grouping Delay: at-most 1000ms"| F1[NDKRelaySubscription]
        E2 -->|"Grouping Delay: at-least 500ms"| F2[NDKRelaySubscription]
        E3 -->|"Grouping Delay: at-least 500ms"| F3[NDKRelaySubscription]

        F1 -->|"REQ: kinds: [1, 7], authors: [123]"| G1[NDKRelayConnectivity]
        F2 -->|"REQ: kinds: [1], authors: [456]"| G2[NDKRelayConnectivity]
        F3 -->|"REQ: kinds: [1], authors: [678]"| G3[NDKRelayConnectivity]
    end

    subgraph Execution
        G1 -->|"Send REQ to wss://relay1 after 1000ms"| R1[Relay1]
        G2 -->|"Send REQ to wss://relay2 after 500ms"| R2[Relay2]
        G3 -->|"Send REQ to wss://relay3 after 500ms"| R3[Relay3]

        R1 -->|"EVENT: kinds: [1]"| H1[NDKRelaySubscription]
        R1 -->|"EVENT: kinds: [7]"| H2[NDKRelaySubscription]
        R2 -->|"EVENT"| H3[NDKRelaySubscription]
        R3 -->|"EVENT"| H4[NDKRelaySubscription]

        H1 -->|"Matched Filters: kinds: [1]"| I1[NDKSubscription1]
        H2 -->|"Matched Filters: kinds: [7]"| I2[NDKSubscription2]
        H3 -->|"Matched Filters: kinds: [1]"| I1
        H4 -->|"Matched Filters: kinds: [1]"| I1
    end
```