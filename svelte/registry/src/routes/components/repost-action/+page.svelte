<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { NDKEvent } from '@nostr-dev-kit/ndk';
  import { EditProps } from '$lib/ndk/edit-props';
  import RepostAction from '$lib/ndk/actions/repost-action.svelte';
  import UIExample from '$site-components/ui-example.svelte';
  import ComponentAPI from '$site-components/component-api.svelte';

  // Import code examples (for Code tab)
  import BasicCodeRaw from './examples/basic-code.svelte?raw';
  import BuilderCodeRaw from './examples/builder-code.svelte?raw';

  // Import builder example (for Preview tab)
  import BuilderExample from './examples/builder.svelte';

  const ndk = getContext<NDKSvelte>('ndk');

  let eventId = $state<string>('nevent1qqsqqe0hd9e2y5mf7qffkfv4w4rxcv63rj458fqj9hn08cwrn23wnvgwrvg7j');
  let sampleEvent = $state<NDKEvent | undefined>();

  $effect(() => {
    (async () => {
      try {
        const event = await ndk.fetchEvent(eventId);
        if (event) sampleEvent = event;
      } catch (err) {
        console.error('Failed to fetch sample event:', err);
      }
    })();
  });
</script>

<div class="container mx-auto p-8 max-w-7xl">
  <!-- Header -->
  <div class="mb-12">
    <h1 class="text-4xl font-bold mb-4">RepostAction</h1>
    <p class="text-lg text-muted-foreground mb-6">
      Repost button component and builder for adding repost functionality to your Nostr events. Tracks both regular reposts (Kind 6/16) and quote posts.
    </p>

    <EditProps.Root>
      <EditProps.Prop name="Sample Event" type="event" bind:value={sampleEvent} />
    </EditProps.Root>
  </div>

  {#if sampleEvent}
    <!-- UI Components Section -->
    <section class="mb-16">
      <h2 class="text-3xl font-bold mb-2">UI Components</h2>
      <p class="text-muted-foreground mb-8">
        Simple repost button component and custom builder for full control.
      </p>

      <div class="space-y-8">
        <UIExample
          title="Basic Usage"
          description="Ready-to-use repost button with icon, count display, and visual feedback."
          code={BasicCodeRaw}
        >
          <div class="flex items-center gap-4 p-6 bg-card border border-border rounded-lg">
            <RepostAction {ndk} event={sampleEvent} />
            <span class="text-sm text-muted-foreground">Click to repost this event</span>
          </div>
        </UIExample>

        <UIExample
          title="Custom Repost Button"
          description="Use the createRepostAction builder to create your own repost button with custom styling and behavior."
          code={BuilderCodeRaw}
        >
          <BuilderExample {ndk} event={sampleEvent} />
        </UIExample>
      </div>
    </section>

    <!-- Component API -->
    <ComponentAPI
      components={[
        {
          name: 'RepostAction',
          description: 'Pre-composed repost button with icon, count display, and state management.',
          importPath: "import RepostAction from '$lib/ndk/actions/repost-action.svelte'",
          props: [
            {
              name: 'ndk',
              type: 'NDKSvelte',
              description: 'NDK instance. Optional if NDK is available in Svelte context.',
              required: false
            },
            {
              name: 'event',
              type: 'NDKEvent',
              description: 'The event to repost',
              required: false
            },
            {
              name: 'showCount',
              type: 'boolean',
              default: 'true',
              description: 'Whether to display the repost count',
              required: false
            },
            {
              name: 'class',
              type: 'string',
              default: "''",
              description: 'Additional CSS classes to apply to the button',
              required: false
            }
          ]
        }
      ]}
    />

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
