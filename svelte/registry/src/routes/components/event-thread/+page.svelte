<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { createThreadView } from '@nostr-dev-kit/svelte';
  import ComponentPageTemplate from '$lib/templates/ComponentPageTemplate.svelte';
  import { threadViewMetadata, threadViewTwitterCard, threadViewBasicCard, threadViewFullCard } from '$lib/component-registry/event-thread';
  import { EditProps } from '$lib/site-components/edit-props';
  import PageTitle from '$lib/site-components/PageTitle.svelte';
  import type { ShowcaseBlock } from '$lib/templates/types';
  import SectionTitle from '$site-components/SectionTitle.svelte';

  // Import code examples
  import threadViewTwitterCode from './thread-view-twitter.example?raw';
  import threadViewBasicCode from './thread-view-basic.example?raw';
  import threadViewFullCode from './thread-view-full.example?raw';

  import TwitterCode from './examples/twitter-code.example.svelte';
  import UIBasic from './examples/ui-basic.example.svelte';
  import UIComposition from './examples/ui-composition.example.svelte';

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

  // Showcase blocks for Blocks section
  const blocksShowcaseBlocks: ShowcaseBlock[] = [
    {
      name: 'Twitter Style',
      description: 'Vertical with connectors',
      command: 'npx shadcn@latest add thread-view-twitter',
      preview: twitterPreview,
      cardData: threadViewTwitterCard
    }
  ];

  // Showcase blocks for UI Primitives section
  const primitivesShowcaseBlocks: ShowcaseBlock[] = [
    {
      name: 'Basic Usage',
      description: 'Minimal primitives',
      command: 'npx shadcn@latest add thread-view',
      preview: basicPreview,
      cardData: threadViewBasicCard
    },
    {
      name: 'Full Composition',
      description: 'All primitives together',
      command: 'npx shadcn@latest add thread-view',
      preview: compositionPreview,
      cardData: threadViewFullCard
    }
  ];
</script>

<!-- Preview snippets -->
{#snippet twitterPreview()}
  <TwitterCode {ndk} {thread} />
{/snippet}

{#snippet basicPreview()}
  <UIBasic {ndk} nevent={neventInput} />
{/snippet}

{#snippet compositionPreview()}
  <UIComposition {ndk} nevent={neventInput} />
{/snippet}


<!-- Custom Builder section before showcase -->
{#snippet beforeShowcase()}
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
{/snippet}

<!-- Custom UI Primitives showcase section -->
{#snippet afterShowcase()}
  <SectionTitle
    title="UI Primitives"
    description="Primitive components for building custom thread layouts."
  />

  <ComponentsShowcaseGrid blocks={primitivesShowcaseBlocks} />
{/snippet}

<!-- Custom Builder API section -->
{#snippet customSections()}
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
{/snippet}

<!-- Import ComponentsShowcaseGrid for afterShowcase snippet -->
<script module lang="ts">
  import ComponentsShowcaseGrid from '$site-components/ComponentsShowcaseGrid.svelte';
</script>

<!-- Conditional rendering based on thread loading -->
{#if !thread.focusedEventId}
  <div class="px-8">
    <PageTitle title={threadViewMetadata.title} subtitle={threadViewMetadata.description}>
      <EditProps.Prop name="Thread Event" type="text" bind:value={neventInput} />
    </PageTitle>
    <div class="flex items-center justify-center py-12">
      <div class="text-muted-foreground">Loading thread...</div>
    </div>
  </div>
{:else}
  <ComponentPageTemplate
    metadata={threadViewMetadata}
    {ndk}
    {beforeShowcase}
    showcaseBlocks={blocksShowcaseBlocks}
    {afterShowcase}
    {customSections}
    componentsSection={{
      cards: [
        { ...threadViewTwitterCard, code: threadViewTwitterCode },
        { ...threadViewBasicCard, code: threadViewBasicCode },
        { ...threadViewFullCard, code: threadViewFullCode }
      ],
      previews: {
        'thread-view-twitter': twitterPreview,
        'thread-view-basic': basicPreview,
        'thread-view-full': compositionPreview
      }
    }}
    apiDocs={threadViewMetadata.apiDocs}
  >
    <EditProps.Prop name="Thread Event" type="text" bind:value={neventInput} />
  </ComponentPageTemplate>
{/if}
