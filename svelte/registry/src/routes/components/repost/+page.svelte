<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { NDKEvent } from '@nostr-dev-kit/ndk';
  import ComponentPageTemplate from '$lib/templates/ComponentPageTemplate.svelte';
  import { repostMetadata, repostButtonCard, repostButtonPillCard, repostBasicBuilderCard, repostCustomBuilderCard } from '$lib/component-registry/repost';
  import { EditProps } from '$lib/site-components/edit-props';
  import PageTitle from '$lib/site-components/PageTitle.svelte';
  import type { ShowcaseBlock } from '$lib/templates/types';

  // Import blocks
  import RepostButton from '$lib/registry/components/actions/repost-button.svelte';
  import RepostButtonPill from '$lib/registry/components/actions/repost-button-pill.svelte';

  // Import builder examples
  import BasicExample from './examples/basic-code.example.svelte';
  import BuilderExample from './examples/builder-code.example.svelte';

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

  const showcaseBlocks: ShowcaseBlock[] = [
    {
      name: 'RepostButton',
      description: 'Minimal with icon and count',
      command: 'npx shadcn@latest add repost-button',
      preview: repostButtonPreview,
      cardData: repostButtonCard
    },
    {
      name: 'Pill Solid',
      description: 'Rounded with solid background',
      command: 'npx shadcn@latest add repost-button-pill',
      preview: repostButtonPillSolidPreview,
      cardData: repostButtonPillCard
    },
    {
      name: 'Pill Outline',
      description: 'Rounded with outline style',
      command: 'npx shadcn@latest add repost-button-pill',
      preview: repostButtonPillOutlinePreview,
      cardData: repostButtonPillCard
    },
    {
      name: 'Basic Builder',
      description: 'Minimal builder example',
      command: 'npx shadcn@latest add repost-button',
      preview: basicBuilderPreview,
      cardData: repostBasicBuilderCard
    },
    {
      name: 'Custom Styled',
      description: 'Custom styled builder',
      command: 'npx shadcn@latest add repost-button',
      preview: customBuilderPreview,
      cardData: repostCustomBuilderCard
    }
  ];
</script>

{#if sampleEvent}
  <!-- Preview snippets for showcase -->
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

  <!-- Preview snippets for components section -->
  {#snippet repostButtonComponentPreview()}
    <RepostButton {ndk} event={sampleEvent} />
  {/snippet}

  {#snippet repostButtonPillComponentPreview()}
    <div class="flex items-center gap-4">
      <RepostButtonPill {ndk} event={sampleEvent} variant="solid" />
      <RepostButtonPill {ndk} event={sampleEvent} variant="outline" />
    </div>
  {/snippet}

  {#snippet basicBuilderComponentPreview()}
    <BasicExample {ndk} event={sampleEvent} />
  {/snippet}

  {#snippet customBuilderComponentPreview()}
    <BuilderExample {ndk} event={sampleEvent} />
  {/snippet}

  <!-- Additional section for Builder API -->
  {#snippet afterComponents()}
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
  {/snippet}

  <!-- Use the template -->
  <ComponentPageTemplate
    metadata={repostMetadata}
    {ndk}
    {showcaseBlocks}
    {afterComponents}
    componentsSection={{
      cards: repostMetadata.cards,
      previews: {
        'repost-button': repostButtonComponentPreview,
        'repost-button-pill': repostButtonPillComponentPreview,
        'repost-basic-builder': basicBuilderComponentPreview,
        'repost-custom-builder': customBuilderComponentPreview
      }
    }}
    apiDocs={repostMetadata.apiDocs}
  >
    <EditProps.Prop
      name="Sample Event"
      type="event"
      default="nevent1qvzqqqqqqypzp75cf0tahv5z7plpdeaws7ex52nmnwgtwfr2g3m37r844evqrr6jqyxhwumn8ghj7e3h0ghxjme0qyd8wumn8ghj7urewfsk66ty9enxjct5dfskvtnrdakj7qpqn35mrh4hpc53m3qge6m0exys02lzz9j0sxdj5elwh3hc0e47v3qqpq0a0n"
      bind:value={sampleEvent}
    />
  </ComponentPageTemplate>
{:else}
  <!-- Loading state -->
  <div class="px-8">
    <PageTitle title={repostMetadata.title} subtitle={repostMetadata.description}>
      <EditProps.Prop
        name="Sample Event"
        type="event"
        default="nevent1qvzqqqqqqypzp75cf0tahv5z7plpdeaws7ex52nmnwgtwfr2g3m37r844evqrr6jqyxhwumn8ghj7e3h0ghxjme0qyd8wumn8ghj7urewfsk66ty9enxjct5dfskvtnrdakj7qpqn35mrh4hpc53m3qge6m0exys02lzz9j0sxdj5elwh3hc0e47v3qqpq0a0n"
        bind:value={sampleEvent}
      />
    </PageTitle>
    <div class="flex items-center justify-center py-12">
      <div class="text-muted-foreground">Loading event...</div>
    </div>
  </div>
{/if}
