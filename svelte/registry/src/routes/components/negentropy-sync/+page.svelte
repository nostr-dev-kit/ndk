<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { createNegentropySync } from '$lib/registry/builders/negentropy-sync/index.js';
  import ComponentPageTemplate from '$lib/templates/ComponentPageTemplate.svelte';
  import {
    negentropySyncMetadata,
    negentropySyncProgressMinimalCard,
    negentropySyncProgressDetailedCard,
    negentropySyncProgressAnimatedCard,
    negentropySyncProgressCompactCard
  } from '$lib/component-registry/negentropy-sync';
  import { EditProps } from '$lib/site-components/edit-props';
  import type { ShowcaseBlock } from '$lib/templates/types';
  import ComponentCard from '$site-components/ComponentCard.svelte';
  import ComponentPageSectionTitle from '$site-components/ComponentPageSectionTitle.svelte';

  // Import block components
  import NegentropySyncProgressMinimal from '$lib/registry/components/negentropy-sync/negentropy-sync-progress-minimal.svelte';
  import NegentropySyncProgressDetailed from '$lib/registry/components/negentropy-sync/negentropy-sync-progress-detailed.svelte';
  import NegentropySyncProgressAnimated from '$lib/registry/components/negentropy-sync/negentropy-sync-progress-animated.svelte';
  import NegentropySyncProgressCompact from '$lib/registry/components/negentropy-sync/negentropy-sync-progress-compact.svelte';

  const ndk = getContext<NDKSvelte>('ndk');

  // Demo state
  let filters = $state({ kinds: [1], limit: 100 });
  let relayUrls = $state<string[] | undefined>(undefined);
  let demoSyncBuilder = $state<ReturnType<typeof createNegentropySync>>();

  // Initialize demo sync builder
  $effect(() => {
    demoSyncBuilder = createNegentropySync(() => ({
      filters,
      relayUrls
    }), ndk);
  });

  // Showcase blocks
  const showcaseBlocks: ShowcaseBlock[] = [
    {
      name: 'Minimal',
      description: 'Simple progress bar with basic stats',
      command: 'npx shadcn@latest add negentropy-sync-progress-minimal',
      preview: minimalPreview,
      cardData: negentropySyncProgressMinimalCard
    },
    {
      name: 'Detailed',
      description: 'Full dashboard with relay status',
      command: 'npx shadcn@latest add negentropy-sync-progress-detailed',
      preview: detailedPreview,
      cardData: negentropySyncProgressDetailedCard
    },
    {
      name: 'Animated',
      description: 'Eye-catching with smooth transitions',
      command: 'npx shadcn@latest add negentropy-sync-progress-animated',
      preview: animatedPreview,
      cardData: negentropySyncProgressAnimatedCard
    },
    {
      name: 'Compact',
      description: 'Space-efficient expandable badge',
      command: 'npx shadcn@latest add negentropy-sync-progress-compact',
      preview: compactPreview,
      cardData: negentropySyncProgressCompactCard
    }
  ];
</script>

<!-- Preview snippets for showcase -->
{#snippet minimalPreview()}
  <NegentropySyncProgressMinimal {ndk} {filters} {relayUrls} />
{/snippet}

{#snippet detailedPreview()}
  <NegentropySyncProgressDetailed {ndk} {filters} {relayUrls} />
{/snippet}

{#snippet animatedPreview()}
  <NegentropySyncProgressAnimated {ndk} {filters} {relayUrls} />
{/snippet}

{#snippet compactPreview()}
  <NegentropySyncProgressCompact {ndk} {filters} {relayUrls} />
{/snippet}

<!-- EditProps snippet -->
{#snippet editPropsSection()}
  <EditProps.Root>
    <EditProps.Button onclick={() => demoSyncBuilder?.startSync()}>
      Start Demo Sync
    </EditProps.Button>
    <EditProps.Button onclick={() => demoSyncBuilder?.stopSync()} variant="outline">
      Stop Sync
    </EditProps.Button>
  </EditProps.Root>
{/snippet}

<!-- Custom Components section -->
{#snippet customComponentsSection()}
  <ComponentPageSectionTitle
    title="Components"
    description="Pre-built negentropy sync progress component variants ready to use in your application"
  />

  <section class="py-12 space-y-16">
    <ComponentCard inline data={negentropySyncProgressMinimalCard}>
      {#snippet preview()}
        <div class="flex flex-col gap-6 max-w-md mx-auto">
          <NegentropySyncProgressMinimal {ndk} {filters} {relayUrls} />
          <div class="text-xs text-muted-foreground text-center">
            Click "Start Demo Sync" above to see progress
          </div>
        </div>
      {/snippet}
    </ComponentCard>

    <ComponentCard inline data={negentropySyncProgressDetailedCard}>
      {#snippet preview()}
        <div class="flex flex-col gap-6 max-w-2xl mx-auto">
          <NegentropySyncProgressDetailed {ndk} {filters} {relayUrls} />
        </div>
      {/snippet}
    </ComponentCard>

    <ComponentCard inline data={negentropySyncProgressAnimatedCard}>
      {#snippet preview()}
        <div class="flex flex-col gap-6 max-w-2xl mx-auto">
          <NegentropySyncProgressAnimated {ndk} {filters} {relayUrls} />
        </div>
      {/snippet}
    </ComponentCard>

    <ComponentCard inline data={negentropySyncProgressCompactCard}>
      {#snippet preview()}
        <div class="flex flex-col gap-6 items-center">
          <div class="flex items-center gap-4">
            <NegentropySyncProgressCompact {ndk} {filters} {relayUrls} />
            <span class="text-xs text-muted-foreground">Hover to expand</span>
          </div>
        </div>
      {/snippet}
    </ComponentCard>
  </section>
{/snippet}

<!-- Custom Builder API section -->
{#snippet customSections()}
  <section class="mt-16">
    <h2 class="text-3xl font-bold mb-4">Builder API</h2>
    <p class="text-muted-foreground mb-6">
      Use <code class="px-2 py-1 bg-muted rounded text-sm">createNegentropySync()</code> to build custom sync progress implementations with real-time state management.
    </p>

    <div class="bg-muted/50 rounded-lg p-6">
      <h3 class="text-lg font-semibold mb-3">createNegentropySync</h3>
      <pre class="text-sm overflow-x-auto"><code>import &#123; createNegentropySync &#125; from '@/registry/builders/negentropy-sync';

// Create sync manager
const sync = createNegentropySync(() => (&#123;
  filters: &#123; kinds: [1], limit: 100 &#125;,
  relayUrls: ['wss://relay.damus.io'] // optional
&#125;), ndk);

// Start syncing
const subscription = await sync.startSync();

// Access reactive state
sync.syncing          // boolean - whether currently syncing
sync.progress         // number - 0-100 percentage
sync.totalRelays      // number - total relays to sync
sync.completedRelays  // number - completed relay count
sync.totalEvents      // number - total events synced
sync.relays           // RelayProgress[] - per-relay status
sync.errors           // Map&lt;string, Error&gt; - relay errors

// Stop syncing
sync.stopSync();</code></pre>

      <div class="mt-4">
        <h4 class="font-semibold mb-2">Parameters:</h4>
        <ul class="list-disc list-inside space-y-1 text-sm text-muted-foreground">
          <li>
            <code>config</code>: Function returning &#123; filters: NDKFilter | NDKFilter[], relayUrls?: string[] &#125;
          </li>
          <li><code>ndk</code>: NDKSvelte instance (optional, uses context if not provided)</li>
        </ul>
      </div>

      <div class="mt-4">
        <h4 class="font-semibold mb-2">Returns:</h4>
        <ul class="list-disc list-inside space-y-1 text-sm text-muted-foreground">
          <li><code>syncing</code>: boolean - Current sync state</li>
          <li><code>progress</code>: number - Percentage complete (0-100)</li>
          <li><code>totalRelays</code>: number - Total number of relays</li>
          <li><code>completedRelays</code>: number - Completed relay count</li>
          <li><code>totalEvents</code>: number - Total events synced</li>
          <li><code>relays</code>: RelayProgress[] - Individual relay status</li>
          <li><code>errors</code>: Map&lt;string, Error&gt; - Errors by relay URL</li>
          <li><code>subscription</code>: NDKSubscription | null - Active subscription</li>
          <li><code>startSync()</code>: async function - Start syncing</li>
          <li><code>stopSync()</code>: function - Stop sync and subscription</li>
        </ul>
      </div>
    </div>
  </section>

  <section class="mt-16">
    <h2 class="text-3xl font-bold mb-4">Primitive Components</h2>
    <p class="text-muted-foreground mb-6">
      Compose custom layouts using primitive components from <code class="px-2 py-1 bg-muted rounded text-sm">NegentrogySync</code> namespace.
    </p>

    <div class="bg-muted/50 rounded-lg p-6">
      <h3 class="text-lg font-semibold mb-3">Using Primitives</h3>
      <pre class="text-sm overflow-x-auto"><code>import &#123; NegentrogySync &#125; from '@/registry/ui/negentropy-sync';

&lt;NegentrogySync.Root ndk=&#123;ndk&#125; filters=&#123;filters&#125;&gt;
  &lt;NegentrogySync.ProgressBar showPercentage /&gt;
  &lt;NegentrogySync.Stats direction="horizontal" /&gt;
  &lt;NegentrogySync.RelayStatus showCounts /&gt;
&lt;/NegentrogySync.Root&gt;</code></pre>

      <div class="mt-4 space-y-3">
        <div>
          <h4 class="font-semibold">NegentrogySync.Root</h4>
          <p class="text-sm text-muted-foreground">Root component that provides sync context to children</p>
        </div>
        <div>
          <h4 class="font-semibold">NegentrogySync.ProgressBar</h4>
          <p class="text-sm text-muted-foreground">Visual progress bar showing sync completion</p>
        </div>
        <div>
          <h4 class="font-semibold">NegentrogySync.Stats</h4>
          <p class="text-sm text-muted-foreground">Summary statistics (relays, events, status)</p>
        </div>
        <div>
          <h4 class="font-semibold">NegentrogySync.RelayStatus</h4>
          <p class="text-sm text-muted-foreground">List of individual relay sync progress</p>
        </div>
      </div>
    </div>
  </section>
{/snippet}

<ComponentPageTemplate
  metadata={negentropySyncMetadata}
  {ndk}
  {showcaseBlocks}
  {editPropsSection}
  {customSections}
  beforeComponents={customComponentsSection}
  apiDocs={negentropySyncMetadata.apiDocs}
/>
