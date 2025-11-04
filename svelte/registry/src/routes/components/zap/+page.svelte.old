<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { NDKEvent } from '@nostr-dev-kit/ndk';
  import { EditProps } from '$lib/site-components/edit-props';
  import ComponentsShowcaseGrid from '$site-components/ComponentsShowcaseGrid.svelte';
  import ComponentPageSectionTitle from '$site-components/ComponentPageSectionTitle.svelte';
  import ComponentCard from '$site-components/ComponentCard.svelte';
  import ComponentAPI from '$site-components/component-api.svelte';

  import BasicExample from './examples/zap-action-basic.svelte';
  import BuilderExample from './examples/zap-action-builder.svelte';

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

  const basicCardData = {
    name: 'zap-basic',
    title: 'Basic Usage',
    description: 'Simple zap button with amount tracking.',
    richDescription: 'Simple zap button with automatic amount tracking using the ZapButton component.',
    command: 'npx shadcn@latest add zap-button',
    apiDocs: []
  };

  const customCardData = {
    name: 'zap-custom',
    title: 'Custom Implementation',
    description: 'Custom zap button with full control.',
    richDescription: 'Build custom zap buttons using ZapSend and Zaps namespaces for full control over styling and behavior.',
    command: 'npx shadcn@latest add zap-button',
    apiDocs: []
  };
</script>

<div class="px-8">
  <!-- Header -->
  <div class="mb-12 pt-8">
    <div class="flex items-start justify-between gap-4 mb-4">
      <h1 class="text-4xl font-bold">Zap</h1>
    </div>
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
      <EditProps.Button>Edit Examples</EditProps.Button>
    </EditProps.Root>
  </div>

  {#if sampleEvent}
    <!-- ComponentsShowcase Section -->
    {#snippet basicPreview()}
      <BasicExample {ndk} event={sampleEvent} />
    {/snippet}

    {#snippet customPreview()}
      <BuilderExample {ndk} event={sampleEvent} />
    {/snippet}

    <ComponentPageSectionTitle
      title="Showcase"
      description="Zap button variants from basic to custom implementations."
    />

    <ComponentsShowcaseGrid
      blocks={[
        {
          name: 'Basic',
          description: 'Simple with amount tracking',
          command: 'npx shadcn@latest add zap-button',
          preview: basicPreview,
          cardData: basicCardData
        },
        {
          name: 'Custom',
          description: 'Full control over styling',
          command: 'npx shadcn@latest add zap-button',
          preview: customPreview,
          cardData: customCardData
        }
      ]}
    />

    <!-- Components Section -->
    <ComponentPageSectionTitle title="Components" description="Explore each zap button variant in detail" />

    <section class="py-12 space-y-16">
      <ComponentCard inline data={basicCardData}>
        {#snippet preview()}
          <BasicExample {ndk} event={sampleEvent} />
        {/snippet}
      </ComponentCard>

      <ComponentCard inline data={customCardData}>
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
        name: 'ZapButton',
        description: 'Pre-built zap button component with automatic amount tracking.',
        importPath: "import { ZapButton } from '$lib/registry/ui'",
        props: [
          { name: 'ndk', type: 'NDKSvelte', description: 'NDK instance (optional if provided via context)' },
          { name: 'event', type: 'NDKEvent', required: true, description: 'Event to zap' },
          { name: 'class', type: 'string', description: 'Custom CSS classes' }
        ]
      },
      {
        name: 'ZapSend',
        description: 'Namespace for sending zaps with full control.',
        importPath: "import { ZapSend } from '$lib/registry/ui'",
        props: [
          { name: 'ndk', type: 'NDKSvelte', description: 'NDK instance' },
          { name: 'target', type: 'NDKEvent | NDKUser', required: true, description: 'Target to zap' },
          { name: 'amount', type: 'number', required: true, description: 'Amount in satoshis' }
        ]
      },
      {
        name: 'Zaps',
        description: 'Namespace for querying and displaying zap amounts.',
        importPath: "import { Zaps } from '$lib/registry/ui'",
        props: [
          { name: 'ndk', type: 'NDKSvelte', description: 'NDK instance' },
          { name: 'event', type: 'NDKEvent', required: true, description: 'Event to query zaps for' }
        ]
      }
    ]}
  />
</div>
