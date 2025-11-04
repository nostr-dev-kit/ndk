<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { NDKHighlight, NDKKind } from '@nostr-dev-kit/ndk';
  import { Highlight as HighlightCard } from '$lib/registry/ui/highlight';
  import HighlightCardFeed from '$lib/registry/components/highlight-card/highlight-card-feed.svelte';
  import HighlightCardElegant from '$lib/registry/components/highlight-card/highlight-card-elegant.svelte';
  import HighlightCardCompact from '$lib/registry/components/highlight-card/highlight-card-compact.svelte';
  import HighlightCardGrid from '$lib/registry/components/highlight-card/highlight-card-grid.svelte';
  import { EditProps } from '$lib/site-components/edit-props';
  import ComponentsShowcase from '$site-components/ComponentsShowcase.svelte';
  import ComponentCard from '$site-components/ComponentCard.svelte';
  import ComponentPageSectionTitle from '$site-components/ComponentPageSectionTitle.svelte';
  import ComponentAPI from '$site-components/component-api.svelte';

  // UI component examples
  import UIBasic from './examples/ui-basic.example.svelte';
  import UIComposition from './examples/custom-composition.example.svelte';

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

  const feedCardData = {
    name: 'highlight-card-feed',
    title: 'Feed',
    description: 'Full-width card for main feed displays.',
    richDescription: 'Full-width card with header, large highlighted text in a book-page style, source badge, and action buttons. Best for main feed displays.',
    command: 'npx shadcn@latest add highlight-card-feed',
    apiDocs: []
  };

  const elegantCardData = {
    name: 'highlight-card-elegant',
    title: 'Elegant',
    description: 'Square card with gradient background.',
    richDescription: 'Square-sized elegant card with gradient background. Context text is muted while the highlight is bright with primary foreground color.',
    command: 'npx shadcn@latest add highlight-card-elegant',
    apiDocs: []
  };

  const compactCardData = {
    name: 'highlight-card-compact',
    title: 'Compact',
    description: 'Small horizontal card layout.',
    richDescription: 'Small horizontal card layout. Ideal for compact lists and sidebars.',
    command: 'npx shadcn@latest add highlight-card-compact',
    apiDocs: []
  };

  const gridCardData = {
    name: 'highlight-card-grid',
    title: 'Grid',
    description: 'Square card for grid layouts.',
    richDescription: 'Square card perfect for grid layouts. Shows highlight with optional author info below.',
    command: 'npx shadcn@latest add highlight-card-grid',
    apiDocs: []
  };

  const basicCardData = {
    name: 'highlight-basic',
    title: 'Basic Usage',
    description: 'Minimal primitives example.',
    richDescription: 'Minimal example with HighlightCard.Root and essential primitives. Build custom layouts by composing primitives.',
    command: 'npx shadcn@latest add highlight-card',
    apiDocs: []
  };

  const compositionCardData = {
    name: 'highlight-composition',
    title: 'Full Composition',
    description: 'All primitives composed together.',
    richDescription: 'All available primitives composed together demonstrating the flexibility of the primitive-based approach.',
    command: 'npx shadcn@latest add highlight-card',
    apiDocs: []
  };
</script>

<div class="px-8">
  <!-- Header -->
  <div class="mb-12 pt-8">
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
  {:else if highlight1}
    <!-- Blocks Showcase -->
    {#snippet feedPreview()}
      <HighlightCardFeed {ndk} event={highlight1} />
    {/snippet}

    {#snippet elegantPreview()}
      <div class="flex gap-6 overflow-x-auto pb-4">
        {#each displayHighlights as highlight (highlight.id)}
          <HighlightCardElegant {ndk} event={highlight} />
        {/each}
      </div>
    {/snippet}

    {#snippet compactPreview()}
      <div class="space-y-0 border border-border rounded-lg overflow-hidden max-w-2xl mx-auto">
        {#each displayHighlights.slice(0, 4) as highlight (highlight.id)}
          <HighlightCardCompact {ndk} event={highlight} />
        {/each}
      </div>
    {/snippet}

    {#snippet gridPreview()}
      <div class="flex gap-6 overflow-x-auto pb-4">
        {#each displayHighlights as highlight (highlight.id)}
          <HighlightCardGrid {ndk} event={highlight} />
        {/each}
      </div>
    {/snippet}

    <ComponentPageSectionTitle
      title="Blocks"
      description="Pre-composed layouts ready to use."
    />

    <ComponentsShowcase
      class="-mx-8 px-8"
      blocks={[
        {
          name: 'Feed',
          description: 'Full-width card for feeds',
          command: 'npx shadcn@latest add highlight-card-feed',
          codeSnippet:
            '<span class="text-gray-500">&lt;</span><span class="text-blue-400">HighlightCardFeed</span> <span class="text-cyan-400">event</span><span class="text-gray-500">=</span><span class="text-green-400">{event}</span> <span class="text-gray-500">/&gt;</span>',
          preview: feedPreview,
          cardData: feedCardData
        },
        {
          name: 'Elegant',
          description: 'Square with gradient',
          command: 'npx shadcn@latest add highlight-card-elegant',
          codeSnippet:
            '<span class="text-gray-500">&lt;</span><span class="text-blue-400">HighlightCardElegant</span> <span class="text-cyan-400">event</span><span class="text-gray-500">=</span><span class="text-green-400">{event}</span> <span class="text-gray-500">/&gt;</span>',
          preview: elegantPreview,
          cardData: elegantCardData
        },
        {
          name: 'Compact',
          description: 'Horizontal list layout',
          command: 'npx shadcn@latest add highlight-card-compact',
          codeSnippet:
            '<span class="text-gray-500">&lt;</span><span class="text-blue-400">HighlightCardCompact</span> <span class="text-cyan-400">event</span><span class="text-gray-500">=</span><span class="text-green-400">{event}</span> <span class="text-gray-500">/&gt;</span>',
          preview: compactPreview,
          cardData: compactCardData
        },
        {
          name: 'Grid',
          description: 'Square for grids',
          command: 'npx shadcn@latest add highlight-card-grid',
          codeSnippet:
            '<span class="text-gray-500">&lt;</span><span class="text-blue-400">HighlightCardGrid</span> <span class="text-cyan-400">event</span><span class="text-gray-500">=</span><span class="text-green-400">{event}</span> <span class="text-gray-500">/&gt;</span>',
          preview: gridPreview,
          cardData: gridCardData
        }
      ]}
    />

    <!-- UI Primitives Showcase -->
    {#snippet basicPreview()}
      <UIBasic {ndk} event={highlight1} />
    {/snippet}

    {#snippet compositionPreview()}
      <UIComposition {ndk} event={highlight1} />
    {/snippet}

    <ComponentPageSectionTitle
      title="UI Primitives"
      description="Primitive components for building custom layouts."
    />

    <ComponentsShowcase
      class="-mx-8 px-8"
      blocks={[
        {
          name: 'Basic',
          description: 'Minimal primitives',
          command: 'npx shadcn@latest add highlight-card',
          codeSnippet:
            '<span class="text-gray-500">&lt;</span><span class="text-blue-400">HighlightCard.Root</span><span class="text-gray-500">&gt;</span>...<span class="text-gray-500">&lt;/</span><span class="text-blue-400">HighlightCard.Root</span><span class="text-gray-500">&gt;</span>',
          preview: basicPreview,
          cardData: basicCardData
        },
        {
          name: 'Composition',
          description: 'All primitives together',
          command: 'npx shadcn@latest add highlight-card',
          codeSnippet:
            '<span class="text-gray-500">&lt;</span><span class="text-blue-400">HighlightCard.Root</span><span class="text-gray-500">&gt;</span>...<span class="text-gray-500">&lt;/</span><span class="text-blue-400">HighlightCard.Root</span><span class="text-gray-500">&gt;</span>',
          preview: compositionPreview,
          cardData: compositionCardData
        }
      ]}
    />

    <!-- Components Section -->
    <ComponentPageSectionTitle title="Components" description="Explore each variant in detail" />

    <section class="py-12 space-y-16">
      <ComponentCard data={feedCardData}>
        {#snippet preview()}
          <HighlightCardFeed {ndk} event={highlight1} />
        {/snippet}
      </ComponentCard>

      <ComponentCard data={elegantCardData}>
        {#snippet preview()}
          <div class="flex gap-6 overflow-x-auto pb-4">
            {#each displayHighlights as highlight (highlight.id)}
              <HighlightCardElegant {ndk} event={highlight} />
            {/each}
          </div>
        {/snippet}
      </ComponentCard>

      <ComponentCard data={compactCardData}>
        {#snippet preview()}
          <div class="space-y-0 border border-border rounded-lg overflow-hidden max-w-2xl mx-auto">
            {#each displayHighlights.slice(0, 4) as highlight (highlight.id)}
              <HighlightCardCompact {ndk} event={highlight} />
            {/each}
          </div>
        {/snippet}
      </ComponentCard>

      <ComponentCard data={gridCardData}>
        {#snippet preview()}
          <div class="flex gap-6 overflow-x-auto pb-4">
            {#each displayHighlights as highlight (highlight.id)}
              <HighlightCardGrid {ndk} event={highlight} />
            {/each}
          </div>
        {/snippet}
      </ComponentCard>

      <ComponentCard data={basicCardData}>
        {#snippet preview()}
          <UIBasic {ndk} event={highlight1} />
        {/snippet}
      </ComponentCard>

      <ComponentCard data={compositionCardData}>
        {#snippet preview()}
          <UIComposition {ndk} event={highlight1} />
        {/snippet}
      </ComponentCard>
    </section>
  {/if}

  <!-- Component API -->
  <ComponentAPI
    components={[
      {
        name: 'HighlightCard.Root',
        description:
          'Root container that provides context to child components. Uses createHighlight builder internally.',
        importPath: "import { Highlight as HighlightCard } from '$lib/registry/ui/highlight'",
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
        importPath: "import { Highlight as HighlightCard } from '$lib/registry/ui/highlight'",
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
        importPath: "import { Highlight as HighlightCard } from '$lib/registry/ui/highlight'",
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
        importPath: "import { HighlightCardFeed } from '$lib/registry/blocks'",
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
        importPath: "import { HighlightCardElegant } from '$lib/registry/blocks'",
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
        importPath: "import { HighlightCardCompact } from '$lib/registry/blocks'",
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
        importPath: "import { HighlightCardGrid } from '$lib/registry/blocks'",
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
