# NDK Svelte

NDK Svelte is a wrapper around NDK that provides convenient accessors to use NDK in Svelte applications.

## Install

```
pnpm add @nostr-dev-kit/ndk-svelte --save
```

## Store subscriptions

NDK-svelte provides Svelte Store subscriptions so your components can have simple reactivity
when events arrive.

Events in the store will appear in a set ordered by `created_at`.

```typescript
import NDKSvelte from "@nostr-dev-kit/ndk-svelte";

const ndk = new NDKSvelte({
    explicitRelayUrls: ["wss://relay.f7z.io"],
});
```

```typescript
// in your components
<script lang="ts">
    const highlights = $ndk.storeSubscribe(
        { kinds: [9802 as number] }, // Highlights
        { closeOnEose: false },
        NDKHighlight // Wrap all results in NDKHighlight
    );

    const nostrHighlightsAndReposts = $ndk.storeSubscribeWithReposts(
        { kinds: [9802], "#t": ["nostr"] }, // filter for Highlights with Nostr
        { kinds: [16], "#k": ["9802"], "#t": ["nostr"] }, // filter for Reposts of Highlights with Nostr
        { closeOnEose: false },
        NDKHighlight // Wrap all results in NDKHighlight
    );
    { closeOnEose: false }, NDKNote);

    onDestroy(() => {
        // Close the nostr subscription when the component is destroyed
        highlights.unsubscribe();
    });
</script>

<p>
    {$highlights.length} highlights seen
</p>

<p>
    {$nostrHighlightsAndReposts.length} nostr highlights (including reposts)
</p>
```

## Reference Counting with ref/unref

NDK-svelte introduces a reference counting mechanism through the ref and unref methods on the stores. This system is particularly useful for optimizing the lifecycle of subscriptions in components that might be frequently mounted and unmounted.

### Benefits:

-   **Optimized Lifecycle**: Instead of starting a new subscription every time a component mounts, and ending it when it unmounts, you can reuse an existing subscription if another component is already using it.

-   **Resource Efficiency**: By preventing redundant subscriptions, you save both network bandwidth and processing power.

-   **`Synchronization**: Ensures that multiple components referencing the same data are synchronized with a single data source.

### How to use:

Whenever you subscribe to a store in a component, call ref to increment the reference count:

```ts
// lib/stores/highlightsStore.ts
const highlightsStore = $ndk.storeSubscribe(..., { autoStart: false } });

// component 1
<script>
import { highlightsStore } from '$stores/highlightsStore.ts';
import { onDestroy } from 'svelte';
highlightsStore.ref();

onDestroy(() => {
    highlightsStore.unref();
});
</script>

{$highlightsStore.length} highlights seen
```

You can mount this component as many times as you want, and the subscription will only be started once. When the last component unmounts, the subscription will be terminated.

## Manual access to subscriptions
You should probably not need this, so if you are peaking into how to try to access directly to the subscriptions, you are probably doing something wrong. But, in the extremely rare case you need to access the subscriptions directly, you can do so by adding a callback with the `onEvent` option.

Note that this is not recommended and the `onEvent` callback will be called immediately, without ordering events by latest version (i.e. on replace events)

```ts
const highlights = $ndk.storeSubscribe(
    { kinds: [9802 as number] }, // Highlights
    { 
        onEvent: (event) => console.log("Event received", event),
        onEose: () => console.log("Subscription EOSE reached")
    }
);
```