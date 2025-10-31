<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { NDKEvent } from '@nostr-dev-kit/ndk';
  import { EditProps } from '$lib/registry/components/edit-props';
	import Demo from '$site-components/Demo.svelte';

  import BasicExample from './examples/zap-action-basic.svelte';
  import BasicExampleRaw from './examples/zap-action-basic.svelte?raw';

  import BuilderExample from './examples/zap-action-builder.svelte';
  import BuilderExampleRaw from './examples/zap-action-builder.svelte?raw';

  const ndk = getContext<NDKSvelte>('ndk');

  let sampleEvent = $state<NDKEvent | undefined>();

  $effect(() => {
    (async () => {
      try {
        const event = await ndk.fetchEvent('nevent1qqsqqe0hd9e2y5mf7qffkfv4w4rxcv63rj458fqj9hn08cwrn23wnvgwrvg7j');
        if (event && !sampleEvent) sampleEvent = event;
      } catch (err) {
        console.error('Failed to fetch sample event:', err);
      }
    })();
  });
</script>

<div class="container mx-auto p-8 max-w-7xl">
  <!-- Header -->
  <div class="mb-12">
    <h1 class="text-4xl font-bold mb-4">ZapAction</h1>
    <p class="text-lg text-muted-foreground mb-6">
      Zap (lightning payment) button with amount display. Send sats to support events and users on Nostr.
    </p>

    <EditProps.Root>
      <EditProps.Prop
        name="Sample Event"
        type="event"
        default="nevent1qvzqqqqqqypzp75cf0tahv5z7plpdeaws7ex52nmnwgtwfr2g3m37r844evqrr6jqyxhwumn8ghj7e3h0ghxjme0qyd8wumn8ghj7urewfsk66ty9enxjct5dfskvtnrdakj7qpqn35mrh4hpc53m3qge6m0exys02lzz9j0sxdj5elwh3hc0e47v3qqpq0a0n"
        bind:value={sampleEvent}
      />
    </EditProps.Root>
  </div>

  {#if sampleEvent}
    <!-- Examples Section -->
    <section class="mb-16">
      <h2 class="text-3xl font-bold mb-2">Examples</h2>
      <p class="text-muted-foreground mb-8">
        Different ways to implement zap functionality in your application.
      </p>

      <div class="space-y-12">
        <Demo
          title="Basic Usage"
          description="Simple zap button with automatic amount tracking using the ZapAction component."
          code={BasicExampleRaw}
        >
          <BasicExample {ndk} event={sampleEvent} />
        </Demo>

        <Demo
          title="Using the Builder"
          description="Build custom zap buttons using createZapAction() for full control over styling and behavior."
          code={BuilderExampleRaw}
        >
          <BuilderExample {ndk} event={sampleEvent} />
        </Demo>
      </div>
    </section>
  {:else}
    <div class="flex items-center justify-center py-12">
      <div class="text-muted-foreground">Loading event...</div>
    </div>
  {/if}
</div>
