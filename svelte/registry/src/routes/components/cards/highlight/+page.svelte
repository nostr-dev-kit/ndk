<script lang="ts">
	import Demo from '$site-components/Demo.svelte';
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { NDKHighlight, NDKKind } from '@nostr-dev-kit/ndk';
  import { HighlightCard } from '$lib/registry/components/highlight-card';
  import {
    HighlightCardFeed,
    HighlightCardElegant,
    HighlightCardCompact,
    HighlightCardGrid
  } from '$lib/registry/components/blocks';
  import { EditProps } from '$lib/site-components/edit-props';
  import ComponentAPI from '$site-components/component-api.svelte';

  // Code examples for blocks
  import FeedCodeRaw from './examples/feed-code.svelte?raw';
  import ElegantCodeRaw from './examples/elegant-code.svelte?raw';
  import CompactCodeRaw from './examples/compact-code.svelte?raw';
  import GridCodeRaw from './examples/grid-code.svelte?raw';

  // UI component examples
  import UIBasic from './examples/ui-basic.svelte';
  import UIBasicRaw from './examples/ui-basic.svelte?raw';
  import UIComposition from './examples/custom-composition.svelte';
  import UICompositionRaw from './examples/custom-composition.svelte?raw';

  const ndk = getContext<NDKSvelte>('ndk');

  let highlights = $state<NDKHighlight[]>([]);
  let loading = $state(true);
  let highlight1 = $state<NDKHighlight | undefined>();
  let highlight2 = $state<NDKHighlight | undefined>();
  let highlight3 = $state<NDKHighlight | undefined>();
  let highlight4 = $state<NDKHighlight | undefined>();
  let highlight5 = $state<NDKHighlight | undefined>();

  $effect(() => {
    (async () => {
      try {
        const events = await ndk.fetchEvents({
          kinds: [NDKKind.Highlight],
          authors: [
            'fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52',
            ...ndk.$follows
          ],
          limit: 10
        });

        highlights = Array.from(events)
          .map((event) => NDKHighlight.from(event))
          .filter((h) => h.content);

        // Initialize display highlights from fetched highlights
        if (highlights.length > 0) {
          if (!highlight1) highlight1 = highlights[0];
          if (!highlight2 && highlights.length > 1) highlight2 = highlights[1];
          if (!highlight3 && highlights.length > 2) highlight3 = highlights[2];
          if (!highlight4 && highlights.length > 3) highlight4 = highlights[3];
          if (!highlight5 && highlights.length > 4) highlight5 = highlights[4];
        }

        loading = false;
      } catch (error) {
        console.error('Failed to fetch highlights:', error);
        loading = false;
      }
    })();
  });

  const displayHighlights = $derived([highlight1, highlight2, highlight3, highlight4, highlight5].filter(Boolean) as NDKHighlight[]);
</script>

<div class="container mx-auto p-8 max-w-7xl">
  <!-- Header -->
  <div class="mb-12">
    <div class="flex items-start justify-between gap-4 mb-4">
        <h1 class="text-4xl font-bold">HighlightCard</h1>
    </div>
    <p class="text-lg text-muted-foreground mb-6">
      Composable highlight card components for displaying NDKHighlight content (kind 9802) with customizable
      layouts. Automatically extracts and displays source references.
    </p>

    {#key highlights}
      <EditProps.Root>
        <EditProps.Prop name="Highlight 1" type="highlight" bind:value={highlight1} options={highlights} />
        <EditProps.Prop name="Highlight 2" type="highlight" bind:value={highlight2} options={highlights} />
        <EditProps.Prop name="Highlight 3" type="highlight" bind:value={highlight3} options={highlights} />
        <EditProps.Prop name="Highlight 4" type="highlight" bind:value={highlight4} options={highlights} />
        <EditProps.Prop name="Highlight 5" type="highlight" bind:value={highlight5} options={highlights} />
      	<EditProps.Button>Edit Examples</EditProps.Button>
      </EditProps.Root>
    {/key}
  </div>

  {#if loading}
    <div class="flex items-center justify-center py-12">
      <div class="text-muted-foreground">Loading highlights...</div>
    </div>
  {:else if highlights.length === 0}
    <div class="flex items-center justify-center py-12">
      <div class="text-muted-foreground">No highlights found. Try following more users or create your own highlights!</div>
    </div>
  {/if}

  <!-- Blocks Section -->
  <section class="mb-16">
    <h2 class="text-3xl font-bold mb-2">Blocks</h2>
    <p class="text-muted-foreground mb-8">
      Pre-composed layouts ready to use. Install with a single command.
    </p>

    <div class="space-y-12">
      <!-- Feed -->
      <Demo
        title="Feed"
        description="Full-width card with header, large highlighted text in a book-page style, source badge, and action buttons. Best for main feed displays."
        component="highlight-card-feed"
        code={FeedCodeRaw}
      >
        {#if highlight1}
          <HighlightCardFeed {ndk} event={highlight1} />
        {/if}
      </Demo>

      <!-- Elegant -->
      <Demo
        title="Elegant"
        description="Square-sized elegant card with gradient background. Context text is muted while the highlight is bright with primary foreground color."
        component="highlight-card-elegant"
        code={ElegantCodeRaw}
      >
        <div class="flex gap-6 overflow-x-auto pb-4">
          {#each displayHighlights as highlight}
            <HighlightCardElegant {ndk} event={highlight} />
          {/each}
        </div>
      </Demo>

      <!-- Compact -->
      <Demo
        title="Compact"
        description="Small horizontal card layout. Ideal for compact lists and sidebars."
        component="highlight-card-compact"
        code={CompactCodeRaw}
      >
        <div class="space-y-0 border border-border rounded-lg overflow-hidden max-w-2xl">
          {#each displayHighlights.slice(0, 4) as highlight}
            <HighlightCardCompact {ndk} event={highlight} />
          {/each}
        </div>
      </Demo>

      <!-- Grid -->
      <Demo
        title="Grid"
        description="Square card perfect for grid layouts. Shows highlight with optional author info below."
        component="highlight-card-grid"
        code={GridCodeRaw}
      >
        <div class="flex gap-6 overflow-x-auto pb-4">
          {#each displayHighlights as highlight}
            <HighlightCardGrid {ndk} event={highlight} />
          {/each}
        </div>
      </Demo>
    </div>
  </section>

  <!-- UI Components Section -->
  <section class="mb-16">
    <h2 class="text-3xl font-bold mb-2">UI Components</h2>
    <p class="text-muted-foreground mb-8">
      Primitive components for building custom highlight card layouts. Compose them together to
      create your own designs.
    </p>

    <div class="space-y-8">
      <!-- Basic Usage -->
      <Demo
        title="Basic Usage"
        description="Minimal example with HighlightCard.Root and essential primitives."
        code={UIBasicRaw}
      >
        {#if highlight1}
          <UIBasic {ndk} event={highlight1} />
        {/if}
      </Demo>

      <!-- Full Composition -->
      <Demo
        title="Full Composition"
        description="All available primitives composed together."
        code={UICompositionRaw}
      >
        {#if highlight1}
          <UIComposition {ndk} event={highlight1} />
        {/if}
      </Demo>
    </div>
  </section>

  <!-- Component API -->
  <ComponentAPI
    components={[
      {
        name: 'HighlightCard.Root',
        description:
          'Root container that provides context to child components. Uses createHighlight builder internally.',
        importPath: "import { HighlightCard } from '$lib/registry/components/highlight-card'",
        props: [
          {
            name: 'ndk',
            type: 'NDKSvelte',
            description:
              'NDK instance. Optional if NDK is available in Svelte context (from parent components).',
            required: false
          },
          {
            name: 'event',
            type: 'NDKEvent',
            description: 'The highlight event (kind 9802) to display',
            required: true
          }
        ]
      },
      {
        name: 'HighlightCard.Content',
        description: 'Display highlighted text with context.',
        importPath: "import { HighlightCard } from '$lib/registry/components/highlight-card'",
        props: [
          {
            name: 'fontSize',
            type: 'string',
            default: '"text-base"',
            description: 'Tailwind classes for font size',
            required: false
          },
          {
            name: 'class',
            type: 'string',
            description: 'Additional CSS classes',
            required: false
          }
        ]
      },
      {
        name: 'HighlightCard.Source',
        description: 'Display source reference badge.',
        importPath: "import { HighlightCard } from '$lib/registry/components/highlight-card'",
        props: [
          {
            name: 'position',
            type: '"top-right" | "bottom-right" | "inline"',
            default: '"inline"',
            description: 'Source badge position',
            required: false
          },
          {
            name: 'class',
            type: 'string',
            description: 'Additional CSS classes',
            required: false
          }
        ]
      },
      {
        name: 'HighlightCardFeed',
        description:
          'Preset: Full-width feed layout with header, book-style text, and actions. Import from $lib/ndk/blocks.',
        importPath: "import { HighlightCardFeed } from '$lib/registry/components/blocks'",
        props: [
          {
            name: 'ndk',
            type: 'NDKSvelte',
            description: 'NDK instance',
            required: true
          },
          {
            name: 'event',
            type: 'NDKEvent',
            description: 'The highlight event to display',
            required: true
          },
          {
            name: 'showHeader',
            type: 'boolean',
            default: 'true',
            description: 'Show author header',
            required: false
          },
          {
            name: 'showActions',
            type: 'boolean',
            default: 'true',
            description: 'Show action buttons',
            required: false
          }
        ]
      },
      {
        name: 'HighlightCardElegant',
        description:
          'Preset: Square elegant card with gradient background. Import from $lib/ndk/blocks.',
        importPath: "import { HighlightCardElegant } from '$lib/registry/components/blocks'",
        props: [
          {
            name: 'ndk',
            type: 'NDKSvelte',
            description: 'NDK instance',
            required: true
          },
          {
            name: 'event',
            type: 'NDKEvent',
            description: 'The highlight event to display',
            required: true
          },
          {
            name: 'width',
            type: 'string',
            default: '"w-[320px]"',
            description: 'Card width (Tailwind classes)',
            required: false
          },
          {
            name: 'height',
            type: 'string',
            default: '"h-[320px]"',
            description: 'Card height (Tailwind classes)',
            required: false
          }
        ]
      },
      {
        name: 'HighlightCardCompact',
        description:
          'Preset: Compact horizontal card. Import from $lib/ndk/blocks.',
        importPath: "import { HighlightCardCompact } from '$lib/registry/components/blocks'",
        props: [
          {
            name: 'ndk',
            type: 'NDKSvelte',
            description: 'NDK instance',
            required: true
          },
          {
            name: 'event',
            type: 'NDKEvent',
            description: 'The highlight event to display',
            required: true
          },
          {
            name: 'showAuthor',
            type: 'boolean',
            default: 'true',
            description: 'Show author name',
            required: false
          },
          {
            name: 'showTimestamp',
            type: 'boolean',
            default: 'true',
            description: 'Show timestamp',
            required: false
          },
          {
            name: 'showSource',
            type: 'boolean',
            default: 'true',
            description: 'Show source info',
            required: false
          }
        ]
      },
      {
        name: 'HighlightCardGrid',
        description:
          'Preset: Square card for grid layouts. Import from $lib/ndk/blocks.',
        importPath: "import { HighlightCardGrid } from '$lib/registry/components/blocks'",
        props: [
          {
            name: 'ndk',
            type: 'NDKSvelte',
            description: 'NDK instance',
            required: true
          },
          {
            name: 'event',
            type: 'NDKEvent',
            description: 'The highlight event to display',
            required: true
          },
          {
            name: 'showAuthor',
            type: 'boolean',
            default: 'true',
            description: 'Show author info below card',
            required: false
          }
        ]
      }
    ]}
  />
</div>
