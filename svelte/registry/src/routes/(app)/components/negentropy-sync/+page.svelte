<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { Button } from "$lib/components/ui/button";
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
  import type { ShowcaseComponent } from '$lib/templates/types';
  import ComponentCard from '$site-components/ComponentCard.svelte';
  import SectionTitle from '$site-components/SectionTitle.svelte';

  // Import code examples
  import negentropySyncProgressMinimalCode from './negentropy-sync-progress-minimal.example?raw';
  import negentropySyncProgressDetailedCode from './negentropy-sync-progress-detailed.example?raw';
  import negentropySyncProgressAnimatedCode from './negentropy-sync-progress-animated.example?raw';
  // import negentropySyncProgressCompactCode from './negentropy-sync-progress-compact.example?raw';

  // Import block components
  import NegentropySyncProgressMinimal from '$lib/registry/components/negentropy-sync/progress/minimal/negentropy-sync-progress-minimal.svelte';
  import NegentropySyncProgressDetailed from '$lib/registry/components/negentropy-sync/progress/detailed/negentropy-sync-progress-detailed.svelte';
  import NegentropySyncProgressAnimated from '$lib/registry/components/negentropy-sync/progress/animated/negentropy-sync-progress-animated.svelte';
  // import NegentropySyncProgressCompact from '$lib/registry/components/negentropy-sync/progress/compact/negentropy-sync-progress-compact.svelte';
  import type { NDKFilter } from '@nostr-dev-kit/ndk';

  const ndk = getContext<NDKSvelte>('ndk');

  // Demo state
  let filters = $state<NDKFilter[]>([{ kinds: [0, 1] }]);
  let relayUrls = $state<string[] | undefined>(['wss://relay.damus.io', 'wss://relay.nostr.band']);

  let demoSyncBuilder = $state<ReturnType<typeof createNegentropySync>>(
    createNegentropySync(() => {
      // Get 5 random pubkeys from follows
      const follows = Array.from(ndk.$follows || []);
      const randomFollows = follows
        .sort(() => Math.random() - 0.5)
        .slice(0, 5)

      // Add authors to filter if we have follows
      const filterWithAuthors = randomFollows.length > 0
        ? [{ ...filters[0], authors: randomFollows }]
        : filters;

      return {
        filters: filterWithAuthors,
        relayUrls
      };
    }, ndk)
  );

  // Showcase blocks
    const showcaseComponents: ShowcaseComponent[] = [
    {
      cardData: negentropySyncProgressMinimalCard,
      preview: minimalPreview
    },
    // {
    //   cardData: negentropySyncProgressCompactCard,
    //   preview: compactPreview
    // },
    {
      cardData: negentropySyncProgressAnimatedCard,
      preview: animatedPreview
    },
    {
      cardData: negentropySyncProgressDetailedCard,
      preview: detailedPreview,
      cellClass: 'md:col-span-3'
    }
  ];
</script>

<!-- Preview snippets for showcase -->
{#snippet minimalPreview()}
  <NegentropySyncProgressMinimal syncBuilder={demoSyncBuilder} />
{/snippet}

{#snippet detailedPreview()}
  <NegentropySyncProgressDetailed syncBuilder={demoSyncBuilder} />
{/snippet}

{#snippet animatedPreview()}
  <NegentropySyncProgressAnimated syncBuilder={demoSyncBuilder} />
{/snippet}

{#snippet compactPreview()}
  <!-- <NegentropySyncProgressCompact syncBuilder={demoSyncBuilder} /> -->
  <div>Compact component not available</div>
{/snippet}

<!-- EditProps snippet -->
<!-- Custom Components section -->
{#snippet customComponentsSection()}
  <SectionTitle
    title="Components"
    description="Pre-built negentropy sync progress component variants ready to use in your application"
  />

  <section class="py-12 space-y-16">
    <ComponentCard data={{ ...negentropySyncProgressMinimalCard, code: negentropySyncProgressMinimalCode }}>
      {#snippet preview()}
        <div class="flex flex-col gap-6 max-w-md mx-auto">
          <NegentropySyncProgressMinimal syncBuilder={demoSyncBuilder} />
          <div class="text-xs text-muted-foreground text-center">
            Click "Start Demo Sync" above to see progress
          </div>
        </div>
      {/snippet}
    </ComponentCard>

    <ComponentCard data={{ ...negentropySyncProgressDetailedCard, code: negentropySyncProgressDetailedCode }}>
      {#snippet preview()}
        <div class="flex flex-col gap-6 max-w-2xl mx-auto">
          <NegentropySyncProgressDetailed syncBuilder={demoSyncBuilder} />
        </div>
      {/snippet}
    </ComponentCard>

    <ComponentCard data={{ ...negentropySyncProgressAnimatedCard, code: negentropySyncProgressAnimatedCode }}>
      {#snippet preview()}
        <div class="flex flex-col gap-6 max-w-2xl mx-auto">
          <NegentropySyncProgressAnimated syncBuilder={demoSyncBuilder} />
        </div>
      {/snippet}
    </ComponentCard>

    <!-- Commented out ComponentCard - can be uncommented if needed
    <ComponentCard data={{ ...negentropySyncProgressCompactCard, code: negentropySyncProgressCompactCode }}>
      {#snippet preview()}
        <div class="flex flex-col gap-6 items-center">
          <div class="flex items-center gap-4">
            <NegentropySyncProgressCompact syncBuilder={demoSyncBuilder} />
            <span class="text-xs text-muted-foreground">Hover to expand</span>
          </div>
        </div>
      {/snippet}
    </ComponentCard> -->
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
sync.syncing                  // boolean - whether currently syncing
sync.progress                 // number - 0-100 percentage
sync.totalRelays              // number - total relays to sync
sync.completedRelays          // number - completed relay count
sync.totalEvents              // number - total events synced
sync.relays                   // RelayProgress[] - per-relay status
sync.errors                   // Map&lt;string, Error&gt; - relay errors
sync.velocity                 // number - events/second velocity
sync.estimatedTimeRemaining   // number | null - ETA in seconds
sync.activeNegotiations       // RelayProgress[] - actively negotiating relays

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
          <li><code>relays</code>: RelayProgress[] - Individual relay status with negotiation details</li>
          <li><code>errors</code>: Map&lt;string, Error&gt; - Errors by relay URL</li>
          <li><code>subscription</code>: NDKSubscription | null - Active subscription</li>
          <li><code>velocity</code>: number - Events per second (0 if not syncing)</li>
          <li><code>estimatedTimeRemaining</code>: number | null - Seconds until completion (null if not calculable)</li>
          <li><code>activeNegotiations</code>: RelayProgress[] - Relays currently in negotiation phase</li>
          <li><code>startSync()</code>: async function - Start syncing</li>
          <li><code>stopSync()</code>: function - Stop sync and subscription</li>
        </ul>
      </div>
    </div>
  </section>

  <section class="mt-16">
    <h2 class="text-3xl font-bold mb-4">Progress Tracking</h2>
    <p class="text-muted-foreground mb-6">
      The sync builder provides detailed negotiation progress tracking with velocity and ETA calculations.
    </p>

    <div class="bg-muted/50 rounded-lg p-6">
      <h3 class="text-lg font-semibold mb-3">Negotiation Progress</h3>
      <p class="text-sm text-muted-foreground mb-4">
        During sync, each relay goes through multiple negotiation rounds. The builder tracks this in real-time:
      </p>
      <pre class="text-sm overflow-x-auto"><code>const sync = createNegentropySync(() => (&#123; filters &#125;), ndk);

// Each relay's progress includes negotiation details
sync.relays.forEach(relay => &#123;
  if (relay.negotiation) &#123;
    console.log(`$&#123;relay.url&#125;:`);
    console.log(`  Phase: $&#123;relay.negotiation.phase&#125;`);        // 'initiating' | 'reconciling' | 'closing' | 'fetching'
    console.log(`  Round: $&#123;relay.negotiation.round&#125;`);        // Current round number
    console.log(`  Need: $&#123;relay.negotiation.needCount&#125;`);     // Events to fetch
    console.log(`  Have: $&#123;relay.negotiation.haveCount&#125;`);     // Events we have
  &#125;
&#125;);</code></pre>

      <div class="mt-4">
        <h4 class="font-semibold mb-2">Negotiation Phases:</h4>
        <ul class="list-disc list-inside space-y-1 text-sm text-muted-foreground">
          <li><code>initiating</code>: Sending initial negentropy message to relay</li>
          <li><code>reconciling</code>: Exchanging fingerprints and ID lists</li>
          <li><code>closing</code>: Negotiation complete, sending close message</li>
          <li><code>fetching</code>: Downloading discovered events from relay</li>
        </ul>
      </div>
    </div>

    <div class="bg-muted/50 rounded-lg p-6 mt-6">
      <h3 class="text-lg font-semibold mb-3">Velocity & ETA</h3>
      <p class="text-sm text-muted-foreground mb-4">
        Real-time velocity tracking and time-to-completion estimates:
      </p>
      <pre class="text-sm overflow-x-auto"><code>const sync = createNegentropySync(() => (&#123; filters &#125;), ndk);

// Velocity in events per second
console.log(`Syncing at $&#123;sync.velocity&#125; events/sec`);

// Estimated time remaining in seconds
if (sync.estimatedTimeRemaining !== null) &#123;
  console.log(`ETA: $&#123;sync.estimatedTimeRemaining&#125;s`);
&#125;

// Active negotiations
console.log(`$&#123;sync.activeNegotiations.length&#125; relays negotiating`);
sync.activeNegotiations.forEach(relay => &#123;
  console.log(`  $&#123;relay.url&#125;: Round $&#123;relay.negotiation?.round&#125;`);
&#125;);</code></pre>
    </div>
  </section>

  <section class="mt-16">
    <h2 class="text-3xl font-bold mb-4">Primitive Components</h2>
    <p class="text-muted-foreground mb-6">
      Compose custom layouts using primitive components from <code class="px-2 py-1 bg-muted rounded text-sm">NegentrogySync</code> namespace.
    </p>

    <div class="bg-muted/50 rounded-lg p-6">
      <h3 class="text-lg font-semibold mb-3">Using Primitives</h3>
      <pre class="text-sm overflow-x-auto"><code>import &#123; createNegentropySync &#125; from '@/registry/builders/negentropy-sync';
import &#123; NegentrogySync &#125; from '@/registry/ui/negentropy-sync';

const syncBuilder = createNegentropySync(() => (&#123;
  filters: &#123; kinds: [1], limit: 100 &#125;,
  relayUrls: ['wss://relay.damus.io'] // optional
&#125;), ndk);

&lt;NegentrogySync.Root syncBuilder=&#123;syncBuilder&#125;&gt;
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
  {showcaseComponents}{customSections}
  beforeComponents={customComponentsSection}
  apiDocs={negentropySyncMetadata.apiDocs}
>
    <Button variant="outline" onclick={() => demoSyncBuilder?.startSync()}>
      Start Demo Sync
    </Button>
    <Button onclick={() => demoSyncBuilder?.stopSync()} variant="outline">
      Stop Sync
    </Button>
  </ComponentPageTemplate>
