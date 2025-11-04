<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { createThreadView } from '@nostr-dev-kit/svelte';
  import ThreadViewTwitter from '$lib/registry/blocks/thread-view-twitter.svelte';
  import { EditProps } from '$lib/site-components/edit-props';
  import ComponentsShowcaseGrid from '$site-components/ComponentsShowcaseGrid.svelte';
  import ComponentCard from '$site-components/ComponentCard.svelte';
  import ComponentPageSectionTitle from '$site-components/ComponentPageSectionTitle.svelte';
  import ComponentAPI from '$site-components/component-api.svelte';

  import TwitterCode from './examples/twitter-code.svelte';
  import UIBasic from './examples/ui-basic.svelte';
  import UIComposition from './examples/ui-composition.svelte';

  const ndk = getContext<NDKSvelte>('ndk');

  let neventInput = $state<string>(
    'nevent1qvzqqqqqqypzqzw53gd9m0sngp98993578tt5u3dgpgng6xawy7gaguv4xmmduk8qyg8wumn8ghj7mn0wd68ytnddakj7qghwaehxw309aex2mrp0yhxummnw3ezucnpdejz7qpqghp3frrq7j7ja6xqj40x4yrwvux7ymev27e2pvrgjd4gvzj7maassk7g7w'
  );

  const thread = createThreadView(
    () => ({
      focusedEvent: neventInput
    }),
    ndk
  );

  const twitterBlockData = {
    name: 'thread-view-twitter',
    title: 'Twitter Style',
    description: 'Vertical thread with connector lines.',
    richDescription: 'Vertical thread view with continuous connector lines, perfect for social media-style conversations. Shows parent chain, focused event, and all replies.',
    command: 'npx shadcn@latest add thread-view-twitter',
    apiDocs: []
  };

  const basicUIData = {
    name: 'thread-view-basic',
    title: 'Basic Usage',
    description: 'Minimal thread view primitives.',
    richDescription: 'Minimal thread view with EventCard.Root, EventCard.Header, and EventCard.Content. Shows the essential composition for displaying thread events.',
    command: 'npx shadcn@latest add thread-view',
    apiDocs: []
  };

  const fullCompositionData = {
    name: 'thread-view-full',
    title: 'Full Composition',
    description: 'All primitives together.',
    richDescription: 'Complete thread view showing parent chain with thread lines, focused event highlighting, reply sections, and interactive navigation. Demonstrates all available primitives working together.',
    command: 'npx shadcn@latest add thread-view',
    apiDocs: []
  };
</script>

<div class="px-8">
  <!-- Header -->
  <div class="mb-12 pt-8">
    <div class="flex items-start justify-between gap-4 mb-4">
      <h1 class="text-4xl font-bold">ThreadView</h1>
    </div>
    <p class="text-lg text-muted-foreground mb-6">
      Display Nostr event threads with parent chains, focused events, and replies. Built using
      EventCard primitives with the createThreadView builder.
    </p>

    <EditProps.Root>
      <EditProps.Prop name="Thread Event" type="text" bind:value={neventInput} />
      <EditProps.Button>Edit Examples</EditProps.Button>
    </EditProps.Root>
  </div>

  {#if !thread.focusedEventId}
    <div class="flex items-center justify-center py-12">
      <div class="text-muted-foreground">Loading thread...</div>
    </div>
  {:else}
    <!-- Blocks Showcase -->
    {#snippet twitterPreview()}
      <TwitterCode {ndk} nevent={neventInput} />
    {/snippet}

    <ComponentPageSectionTitle
      title="Blocks"
      description="Pre-composed thread layouts ready to use."
    />

    <ComponentsShowcaseGrid
      blocks={[
        {
          name: 'Twitter Style',
          description: 'Vertical with connectors',
          command: 'npx shadcn@latest add thread-view-twitter',
          preview: twitterPreview,
          cardData: twitterBlockData
        }
      ]}
    />

    <!-- UI Primitives Showcase -->
    {#snippet basicPreview()}
      <UIBasic {ndk} nevent={neventInput} />
    {/snippet}

    {#snippet compositionPreview()}
      <UIComposition {ndk} nevent={neventInput} />
    {/snippet}

    <ComponentPageSectionTitle
      title="UI Primitives"
      description="Primitive components for building custom thread layouts."
    />

    <ComponentsShowcaseGrid
      blocks={[
        {
          name: 'Basic Usage',
          description: 'Minimal primitives',
          command: 'npx shadcn@latest add thread-view',
          preview: basicPreview,
          cardData: basicUIData
        },
        {
          name: 'Full Composition',
          description: 'All primitives together',
          command: 'npx shadcn@latest add thread-view',
          preview: compositionPreview,
          cardData: fullCompositionData
        }
      ]}
    />

    <!-- Builder Section -->
    <section class="mb-16">
      <h2 class="text-3xl font-bold mb-2">Builder</h2>
      <p class="text-muted-foreground mb-8">
        The createThreadView builder handles all thread data processing automatically, providing a
        clean API for rendering threads.
      </p>

      <div class="space-y-6">
        <div class="border border-border rounded-lg p-6">
          <h3 class="text-xl font-semibold mb-3">Basic Usage</h3>
          <div class="bg-muted p-4 rounded-lg">
            <code class="text-sm whitespace-pre">
{`import { createThreadView } from '@nostr-dev-kit/svelte';

const thread = createThreadView(() => ({
  focusedEvent: 'nevent1...' | event
}), ndk);

// Access thread data
thread.events          // Parent chain as ThreadNode[]
thread.replies         // Direct replies to focused event
thread.otherReplies    // Replies to other events in thread
thread.focusedEventId  // ID of currently focused event
thread.focusOn(event)  // Navigate to different event`}
            </code>
          </div>
        </div>

        <div class="border border-border rounded-lg p-6">
          <h3 class="text-xl font-semibold mb-3">Automatic Features</h3>
          <ul class="list-disc list-inside space-y-2 text-muted-foreground">
            <li>Fetches parent chain and descendants automatically</li>
            <li>Handles missing events with relay hints</li>
            <li>Detects thread continuations (same-author chains)</li>
            <li>Provides threading metadata for rendering</li>
            <li>Reactive updates as events stream in</li>
            <li>Loop protection and depth limiting</li>
          </ul>
        </div>
      </div>
    </section>

    <!-- Components Section -->
    <ComponentPageSectionTitle title="Components" description="Explore each variant in detail" />

    <section class="py-12 space-y-16">
      <ComponentCard inline data={twitterBlockData}>
        {#snippet preview()}
          <TwitterCode {ndk} nevent={neventInput} />
        {/snippet}
      </ComponentCard>

      <ComponentCard inline data={basicUIData}>
        {#snippet preview()}
          <UIBasic {ndk} nevent={neventInput} />
        {/snippet}
      </ComponentCard>

      <ComponentCard inline data={fullCompositionData}>
        {#snippet preview()}
          <UIComposition {ndk} nevent={neventInput} />
        {/snippet}
      </ComponentCard>
    </section>
  {/if}

  <!-- Component API -->
  <ComponentAPI
    components={[
      {
        name: 'ThreadViewTwitter',
        description:
          'Twitter-style thread view block with vertical connector lines and focused event highlighting.',
        importPath: "import { ThreadViewTwitter } from '$lib/registry/blocks'",
        props: [
          {
            name: 'ndk',
            type: 'NDKSvelte',
            description: 'NDK instance for Nostr operations',
            required: true
          },
          {
            name: 'thread',
            type: 'ThreadView',
            description: 'Thread view instance from createThreadView builder',
            required: true
          },
          {
            name: 'class',
            type: 'string',
            default: "''",
            description: 'Additional CSS classes to apply to container'
          }
        ]
      }
    ]}
  />

  <!-- Builder API -->
  <section class="mb-16">
    <h2 class="text-3xl font-bold mb-2">Builder API</h2>

    <div class="space-y-6">
      <div class="border border-border rounded-lg p-6">
        <h3 class="text-xl font-semibold mb-3">createThreadView(config, ndk)</h3>
        <p class="text-muted-foreground mb-4">
          Creates a reactive thread view that automatically fetches and organizes thread data.
        </p>

        <div class="space-y-4">
          <div>
            <h4 class="font-semibold mb-2">Parameters</h4>
            <ul class="list-disc list-inside space-y-2 text-sm text-muted-foreground">
              <li>
                <code class="bg-muted px-1 py-0.5 rounded">config</code> - Function returning
                configuration object:
                <ul class="list-disc list-inside ml-6 mt-1">
                  <li>
                    <code class="bg-muted px-1 py-0.5 rounded">focusedEvent</code> (required) -
                    nevent string or NDKEvent to focus on
                  </li>
                  <li>
                    <code class="bg-muted px-1 py-0.5 rounded">maxDepth</code> (optional) - Maximum
                    depth for fetching descendants (default: 20)
                  </li>
                  <li>
                    <code class="bg-muted px-1 py-0.5 rounded">kinds</code> (optional) - Event
                    kinds to include (default: [1, 9802])
                  </li>
                </ul>
              </li>
              <li><code class="bg-muted px-1 py-0.5 rounded">ndk</code> - NDK instance</li>
            </ul>
          </div>

          <div>
            <h4 class="font-semibold mb-2">Returns ThreadView</h4>
            <ul class="list-disc list-inside space-y-2 text-sm text-muted-foreground">
              <li>
                <code class="bg-muted px-1 py-0.5 rounded">events</code> - ThreadNode[] - Linear
                parent chain including focused event
              </li>
              <li>
                <code class="bg-muted px-1 py-0.5 rounded">replies</code> - NDKEvent[] - Direct
                replies to focused event
              </li>
              <li>
                <code class="bg-muted px-1 py-0.5 rounded">otherReplies</code> - NDKEvent[] -
                Replies to other events in thread
              </li>
              <li>
                <code class="bg-muted px-1 py-0.5 rounded">allReplies</code> - NDKEvent[] - All
                replies combined
              </li>
              <li>
                <code class="bg-muted px-1 py-0.5 rounded">focusedEventId</code> - string | null -
                ID of currently focused event
              </li>
              <li>
                <code class="bg-muted px-1 py-0.5 rounded">focusOn(event)</code> - Function to
                navigate to a different event in the thread
              </li>
            </ul>
          </div>

          <div>
            <h4 class="font-semibold mb-2">ThreadNode Structure</h4>
            <ul class="list-disc list-inside space-y-2 text-sm text-muted-foreground">
              <li><code class="bg-muted px-1 py-0.5 rounded">id</code> - Event ID</li>
              <li>
                <code class="bg-muted px-1 py-0.5 rounded">event</code> - NDKEvent | null - Event
                if loaded, null if missing
              </li>
              <li>
                <code class="bg-muted px-1 py-0.5 rounded">relayHint</code> - string | undefined -
                Relay hint from e-tag
              </li>
              <li>
                <code class="bg-muted px-1 py-0.5 rounded">threading</code> - ThreadingMetadata |
                undefined - Threading information:
                <ul class="list-disc list-inside ml-6 mt-1">
                  <li>isContinuation - Is this a same-author continuation?</li>
                  <li>showLineToNext - Should show vertical line to next event?</li>
                  <li>depth - Depth in thread hierarchy</li>
                  <li>isMainChain - Is this on the main thread chain?</li>
                </ul>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </section>
</div>
