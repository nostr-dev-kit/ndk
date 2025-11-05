<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { NDKEvent } from '@nostr-dev-kit/ndk';
  import ComponentPageTemplate from '$lib/templates/ComponentPageTemplate.svelte';
  import { zapMetadata, zapBasicCard, zapCustomCard } from '$lib/component-registry/zap';
  import { EditProps } from '$lib/site-components/edit-props';
  import PageTitle from '$lib/site-components/PageTitle.svelte';
  import type { ShowcaseBlock } from '$lib/templates/types';

  // Import code examples
  import zapBasicCode from './zap-basic.example?raw';
  import zapCustomCode from './zap-custom.example?raw';

  // Import examples
  import BasicExample from './examples/zap-action-basic.example.svelte';
  import BuilderExample from './examples/zap-action-builder.example.svelte';

  const ndk = getContext<NDKSvelte>('ndk');

  // State for examples
  let sampleEvent = $state<NDKEvent | undefined>();

  // Load sample event
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

{#if sampleEvent}
  {@const event = sampleEvent}
  <!-- Preview snippets for showcase -->
  {#snippet basicPreview()}
    <BasicExample {ndk} {event} />
  {/snippet}

  {#snippet customPreview()}
    <BuilderExample {ndk} {event} />
  {/snippet}

  <!-- Preview snippets for components section -->
  {#snippet basicComponentPreview()}
    <BasicExample {ndk} {event} />
  {/snippet}

  {#snippet customComponentPreview()}
    <BuilderExample {ndk} {event} />
  {/snippet}

  {@const showcaseBlocks = [
    {
      name: 'Basic',
      description: 'Simple with amount tracking',
      command: 'npx shadcn@latest add zap-button',
      preview: basicPreview,
      cardData: zapBasicCard
    },
    {
      name: 'Custom',
      description: 'Full control over styling',
      command: 'npx shadcn@latest add zap-button',
      preview: customPreview,
      cardData: zapCustomCard
    }
  ]}

  <!-- Use the template -->
  <ComponentPageTemplate
    metadata={zapMetadata}
    {ndk}
    {showcaseBlocks}
    componentsSection={{
      cards: [
        { ...zapBasicCard, code: zapBasicCode },
        { ...zapCustomCard, code: zapCustomCode }
      ],
      previews: {
        'zap-basic': basicComponentPreview,
        'zap-custom': customComponentPreview
      }
    }}
    apiDocs={zapMetadata.apiDocs}
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
    <PageTitle title={zapMetadata.title} subtitle={zapMetadata.description}>
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