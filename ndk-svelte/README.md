# ndk-svelte

This package provides convenience functionalities to make usage of NDK with Svelte nicer.

## Install

```
pnpm add @nostr-dev-kit/ndk-svelte
```

## Store subscriptions

NDK-svelte provides Svelte Store subscriptions so your components can have simple reactivity
when events arrive.

Events in the store will appear in a set ordered by `created_at`.

```typescript
import NDKSvelte from '@nostr-dev-kit/ndk-svelte';

const ndk = new NDKSvelte({
    explicitRelayUrls: ['wss://relay.f7z.io'],
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

 * **Optimized Lifecycle**: Instead of starting a new subscription every time a component mounts, and ending it when it unmounts, you can reuse an existing subscription if another component is already using it.

 * **Resource Efficiency**: By preventing redundant subscriptions, you save both network bandwidth and processing power.

 * **Synchronization**: Ensures that multiple components referencing the same data are synchronized with a single data source.

### How to use:

Whenever you subscribe to a store in a component, call ref to increment the reference count:

```typescript
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

# Notes
If you are interested in NDK and Svelte you might want to checkout the
[ndk-svelte-components](https://github.com/nostr-dev-kit/ndk-svelte-components) package
which provides some components to make it easier to build nostr apps with Svelte.

# Authors

* [@pablof7z](https://nostr.com/npub1l2vyh47mk2p0qlsku7hg0vn29faehy9hy34ygaclpn66ukqp3afqutajft)