<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { NDKEvent } from '@nostr-dev-kit/ndk';
  import { EditProps } from '$lib/ndk/edit-props';
  import { RepostButton, RepostButtonPill } from '$lib/ndk/blocks';
	import Demo from '$site-components/Demo.svelte';

  // Import code examples
  import BasicCodeRaw from './examples/basic-code.svelte?raw';
  import BuilderCodeRaw from './examples/builder-code.svelte?raw';
  import BlocksCodeRaw from './examples/blocks-code.svelte?raw';

  // Import builder examples
  import BasicExample from './examples/basic-code.svelte';
  import BuilderExample from './examples/builder-code.svelte';

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
    <h1 class="text-4xl font-bold mb-4">Repost Button</h1>
    <p class="text-lg text-muted-foreground mb-6">
      Repost button blocks and builder for adding repost functionality to Nostr events. Tracks both regular reposts (Kind 6/16) and quote posts.
    </p>

    <EditProps.Root>
      <EditProps.Prop name="Sample Event" type="event" bind:value={sampleEvent} />
    </EditProps.Root>
  </div>

  {#if sampleEvent}
    <!-- Blocks Section -->
    <section class="mb-16">
      <h2 class="text-3xl font-bold mb-2">Blocks</h2>
      <p class="text-muted-foreground mb-8">
        Pre-composed repost button layouts ready to use. Install with a single command.
      </p>

      <div class="space-y-12">
        <Demo
          title="RepostButton"
          description="Clean, minimal repost button with icon and count. Perfect for action bars and compact layouts."
          component="repost-button"
          code={BlocksCodeRaw}
        >
          <div class="flex items-center justify-center">
            <RepostButton {ndk} event={sampleEvent} />
          </div>
        </Demo>

        <Demo
          title="RepostButtonPill"
          description="Pill-style button with rounded background. Great for standalone repost actions."
          component="repost-button-pill"
          code={BlocksCodeRaw}
        >
          <div class="flex items-center justify-center gap-4">
            <RepostButtonPill {ndk} event={sampleEvent} variant="solid" />
            <RepostButtonPill {ndk} event={sampleEvent} variant="outline" />
          </div>
        </Demo>
      </div>
    </section>

    <!-- Builder Section -->
    <section class="mb-16">
      <h2 class="text-3xl font-bold mb-2">Builder</h2>
      <p class="text-muted-foreground mb-8">
        The <code class="px-2 py-1 bg-muted rounded">createRepostAction</code> builder provides reactive state and methods.
        Build custom repost buttons with full control over styling and behavior.
      </p>

      <div class="space-y-8">
        <Demo
          title="Minimal Example"
          description="Simplest possible implementation using the builder."
          code={BasicCodeRaw}
        >
          <div class="flex items-center gap-4">
            <BasicExample {ndk} event={sampleEvent} />
          </div>
        </Demo>

        <Demo
          title="Custom Styled Button"
          description="Build your own repost button with custom styling and layout."
          code={BuilderCodeRaw}
        >
          <div class="flex items-center">
            <BuilderExample {ndk} event={sampleEvent} />
          </div>
        </Demo>
      </div>
    </section>

    <!-- Builder API -->
    <section class="mb-16">
      <h2 class="text-3xl font-bold mb-2">Builder API</h2>
      <p class="text-muted-foreground mb-4">
        The createRepostAction builder returns a reactive state object for managing repost functionality.
      </p>

      <div class="bg-card border border-border rounded-lg p-6">
        <h3 class="text-xl font-semibold mb-4">createRepostAction()</h3>

        <div class="mb-6">
          <h4 class="text-lg font-medium mb-2">Import</h4>
          <pre class="bg-muted p-4 rounded text-sm overflow-x-auto"><code>import &#123; createRepostAction &#125; from '@nostr-dev-kit/svelte';</code></pre>
        </div>

        <div class="mb-6">
          <h4 class="text-lg font-medium mb-2">Parameters</h4>
          <ul class="space-y-2 text-muted-foreground">
            <li><strong>getter</strong>: () => &#123; event: NDKEvent &#125; - Function that returns the event to repost</li>
            <li><strong>ndk</strong>: NDKSvelte - NDK instance</li>
          </ul>
        </div>

        <div>
          <h4 class="text-lg font-medium mb-2">Returns</h4>
          <ul class="space-y-2 text-muted-foreground">
            <li><strong>count</strong>: number - Total repost count (regular + quotes)</li>
            <li><strong>hasReposted</strong>: boolean - Whether current user has reposted</li>
            <li><strong>repost</strong>: () => Promise&lt;void&gt; - Function to create a repost</li>
          </ul>
        </div>
      </div>
    </section>
  {:else}
    <div class="flex items-center justify-center py-12">
      <div class="text-muted-foreground">Loading event...</div>
    </div>
  {/if}
</div>
