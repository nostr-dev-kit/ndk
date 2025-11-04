<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { NDKEvent } from '@nostr-dev-kit/ndk';
  import { EditProps } from '$lib/site-components/edit-props';
  import ComponentsShowcaseGrid from '$site-components/ComponentsShowcaseGrid.svelte';
  import ComponentPageSectionTitle from '$site-components/ComponentPageSectionTitle.svelte';
  import ComponentCard from '$site-components/ComponentCard.svelte';
  import ComponentAPI from '$site-components/component-api.svelte';

  // Import blocks
  import RepostButton from '$lib/registry/components/actions/repost-button.svelte';
  import RepostButtonPill from '$lib/registry/components/actions/repost-button-pill.svelte';

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

  const repostButtonCardData = {
    name: 'repost-button',
    title: 'RepostButton',
    description: 'Clean, minimal repost button.',
    richDescription: 'Clean, minimal repost button with icon and count. Perfect for action bars and compact layouts.',
    command: 'npx shadcn@latest add repost-button',
    apiDocs: [
      {
        name: 'RepostButton',
        description: 'Minimal repost button component',
        importPath: "import RepostButton from '$lib/registry/components/actions/repost-button.svelte'",
        props: [
          { name: 'ndk', type: 'NDKSvelte', description: 'NDK instance (optional if provided via context)' },
          { name: 'event', type: 'NDKEvent', required: true, description: 'Event to repost' },
          { name: 'class', type: 'string', description: 'Custom CSS classes' }
        ]
      }
    ]
  };

  const repostButtonPillCardData = {
    name: 'repost-button-pill',
    title: 'RepostButtonPill',
    description: 'Pill-style repost button.',
    richDescription: 'Pill-style button with rounded background. Great for standalone repost actions. Available in solid and outline variants.',
    command: 'npx shadcn@latest add repost-button-pill',
    apiDocs: [
      {
        name: 'RepostButtonPill',
        description: 'Pill-style repost button component',
        importPath: "import RepostButtonPill from '$lib/registry/components/actions/repost-button-pill.svelte'",
        props: [
          { name: 'ndk', type: 'NDKSvelte', description: 'NDK instance (optional if provided via context)' },
          { name: 'event', type: 'NDKEvent', required: true, description: 'Event to repost' },
          { name: 'variant', type: "'solid' | 'outline'", default: "'solid'", description: 'Button style variant' },
          { name: 'class', type: 'string', description: 'Custom CSS classes' }
        ]
      }
    ]
  };

  const basicBuilderCardData = {
    name: 'repost-basic-builder',
    title: 'Minimal Builder Example',
    description: 'Simplest builder implementation.',
    richDescription: 'Simplest possible implementation using the createRepostAction builder. Perfect starting point for custom buttons.',
    command: 'npx shadcn@latest add repost-button',
    apiDocs: []
  };

  const customBuilderCardData = {
    name: 'repost-custom-builder',
    title: 'Custom Styled Button',
    description: 'Custom styled repost button.',
    richDescription: 'Build your own repost button with custom styling and layout using the createRepostAction builder.',
    command: 'npx shadcn@latest add repost-button',
    apiDocs: []
  };
</script>

<div class="px-8">
  <!-- Header -->
  <div class="mb-12 pt-8">
    <div class="flex items-start justify-between gap-4 mb-4">
      <h1 class="text-4xl font-bold">Repost</h1>
    </div>
    <p class="text-lg text-muted-foreground mb-6">
      Repost button blocks and builder for adding repost functionality to Nostr events. Tracks both regular reposts (Kind 6/16) and quote posts.
    </p>

    <EditProps.Root>
      <EditProps.Prop
        name="Sample Event"
        type="event"
        default="nevent1qvzqqqqqqypzp75cf0tahv5z7plpdeaws7ex52nmnwgtwfr2g3m37r844evqrr6jqyxhwumn8ghj7e3h0ghxjme0qyd8wumn8ghj7urewfsk66ty9enxjct5dfskvtnrdakj7qpqn35mrh4hpc53m3qge6m0exys02lzz9j0sxdj5elwh3hc0e47v3qqpq0a0n"
        bind:value={sampleEvent}
      />
      <EditProps.Button>Edit Examples</EditProps.Button>
    </EditProps.Root>
  </div>

  {#if sampleEvent}
    <!-- ComponentsShowcase Section -->
    {#snippet repostButtonPreview()}
      <RepostButton {ndk} event={sampleEvent} />
    {/snippet}

    {#snippet repostButtonPillSolidPreview()}
      <RepostButtonPill {ndk} event={sampleEvent} variant="solid" />
    {/snippet}

    {#snippet repostButtonPillOutlinePreview()}
      <RepostButtonPill {ndk} event={sampleEvent} variant="outline" />
    {/snippet}

    {#snippet basicBuilderPreview()}
      <BasicExample {ndk} event={sampleEvent} />
    {/snippet}

    {#snippet customBuilderPreview()}
      <BuilderExample {ndk} event={sampleEvent} />
    {/snippet}

    <ComponentPageSectionTitle
      title="Showcase"
      description="Repost button variants from minimal to custom implementations."
    />

    <ComponentsShowcaseGrid
      blocks={[
        {
          name: 'RepostButton',
          description: 'Minimal with icon and count',
          command: 'npx shadcn@latest add repost-button',
          preview: repostButtonPreview,
          cardData: repostButtonCardData
        },
        {
          name: 'Pill Solid',
          description: 'Rounded with solid background',
          command: 'npx shadcn@latest add repost-button-pill',
          preview: repostButtonPillSolidPreview,
          cardData: repostButtonPillCardData
        },
        {
          name: 'Pill Outline',
          description: 'Rounded with outline style',
          command: 'npx shadcn@latest add repost-button-pill',
          preview: repostButtonPillOutlinePreview,
          cardData: repostButtonPillCardData
        },
        {
          name: 'Basic Builder',
          description: 'Minimal builder example',
          command: 'npx shadcn@latest add repost-button',
          preview: basicBuilderPreview,
          cardData: basicBuilderCardData
        },
        {
          name: 'Custom Styled',
          description: 'Custom styled builder',
          command: 'npx shadcn@latest add repost-button',
          preview: customBuilderPreview,
          cardData: customBuilderCardData
        }
      ]}
    />

    <!-- Components Section -->
    <ComponentPageSectionTitle title="Components" description="Explore each repost button variant in detail" />

    <section class="py-12 space-y-16">
      <ComponentCard inline data={repostButtonCardData}>
        {#snippet preview()}
          <RepostButton {ndk} event={sampleEvent} />
        {/snippet}
      </ComponentCard>

      <ComponentCard inline data={repostButtonPillCardData}>
        {#snippet preview()}
          <div class="flex items-center gap-4">
            <RepostButtonPill {ndk} event={sampleEvent} variant="solid" />
            <RepostButtonPill {ndk} event={sampleEvent} variant="outline" />
          </div>
        {/snippet}
      </ComponentCard>

      <ComponentCard inline data={basicBuilderCardData}>
        {#snippet preview()}
          <BasicExample {ndk} event={sampleEvent} />
        {/snippet}
      </ComponentCard>

      <ComponentCard inline data={customBuilderCardData}>
        {#snippet preview()}
          <BuilderExample {ndk} event={sampleEvent} />
        {/snippet}
      </ComponentCard>
    </section>
  {:else}
    <div class="flex items-center justify-center py-12">
      <div class="text-muted-foreground">Loading event...</div>
    </div>
  {/if}

  <!-- Component API -->
  <ComponentAPI
    components={[
      {
        name: 'createRepostAction',
        description: 'Builder function that provides repost state and methods. Use directly in custom components or with RepostButton blocks.',
        importPath: "import { createRepostAction } from '@nostr-dev-kit/svelte'",
        props: [
          {
            name: 'getter',
            type: '() => { event: NDKEvent }',
            required: true,
            description: 'Function that returns the event to repost'
          },
          {
            name: 'ndk',
            type: 'NDKSvelte',
            required: true,
            description: 'NDK instance'
          }
        ],
        returns: {
          name: 'RepostActionState',
          properties: [
            {
              name: 'count',
              type: 'number',
              description: 'Total repost count (regular + quotes)'
            },
            {
              name: 'hasReposted',
              type: 'boolean',
              description: 'Whether current user has reposted'
            },
            {
              name: 'repost',
              type: '() => Promise<void>',
              description: 'Function to create a repost'
            }
          ]
        }
      }
    ]}
  />

  <!-- Builder API -->
  <section class="mt-16">
    <h2 class="text-3xl font-bold mb-4">Builder API</h2>
    <p class="text-muted-foreground mb-6">
      The <code class="px-2 py-1 bg-muted rounded text-sm">createRepostAction</code> builder provides reactive state and methods.
      Build custom repost buttons with full control over styling and behavior.
    </p>

    <div class="bg-muted/50 rounded-lg p-6">
      <h3 class="text-lg font-semibold mb-3">createRepostAction</h3>
      <pre class="text-sm overflow-x-auto"><code>import &#123; createRepostAction &#125; from '@nostr-dev-kit/svelte';

// Create repost action
const repostState = createRepostAction(() => (&#123; event &#125;), ndk);

// Access reactive state
repostState.count        // number - Total repost count
repostState.hasReposted  // boolean - Whether current user has reposted

// Create a repost
await repostState.repost();</code></pre>

      <div class="mt-4">
        <h4 class="font-semibold mb-2">Parameters:</h4>
        <ul class="list-disc list-inside space-y-1 text-sm text-muted-foreground">
          <li><code>getter</code>: Function returning &#123; event: NDKEvent &#125;</li>
          <li><code>ndk</code>: NDKSvelte instance</li>
        </ul>
      </div>

      <div class="mt-4">
        <h4 class="font-semibold mb-2">Returns:</h4>
        <ul class="list-disc list-inside space-y-1 text-muted-foreground">
          <li><code>count</code>: number - Total repost count (regular + quotes)</li>
          <li><code>hasReposted</code>: boolean - Whether current user has reposted</li>
          <li><code>repost()</code>: async function - Create a repost</li>
        </ul>
      </div>
    </div>
  </section>
</div>
