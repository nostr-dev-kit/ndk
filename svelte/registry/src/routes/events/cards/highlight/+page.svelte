<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { NDKHighlight, NDKKind } from '@nostr-dev-kit/ndk';
  import { Highlight as HighlightCard } from '$lib/registry/ui/highlight';
  import HighlightCardFeed from '$lib/registry/components/highlight-card/highlight-card-feed.svelte';
  import HighlightCardElegant from '$lib/registry/components/highlight-card/highlight-card-elegant.svelte';
  import HighlightCardCompact from '$lib/registry/components/highlight-card-compact/highlight-card-compact.svelte';
  import HighlightCardGrid from '$lib/registry/components/highlight-card/highlight-card-grid.svelte';
  import { EditProps } from '$lib/site-components/edit-props';
  import ComponentPageTemplate from '$lib/templates/ComponentPageTemplate.svelte';
  import ComponentAPI from '$site-components/component-api.svelte';
  import SectionTitle from '$site-components/SectionTitle.svelte';
  import * as ComponentAnatomy from '$site-components/component-anatomy';
  import { highlightCardMetadata, highlightCardCards, highlightCardFeedCard, highlightCardElegantCard, highlightCardCompactCard, highlightCardGridCard } from '$lib/component-registry/highlight-card';
  import type { ShowcaseBlock } from '$lib/templates/types';

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

  const anatomyLayers: Record<string, ComponentAnatomy.AnatomyLayer> = {
    root: {
      id: 'root',
      label: 'HighlightCard.Root',
      description: 'Root container that provides highlight context to child components. Must wrap all other primitives.',
      props: ['ndk', 'event']
    },
    content: {
      id: 'content',
      label: 'HighlightCard.Content',
      description: 'Displays the highlighted text with optional context before and after.',
      props: ['fontSize', 'class']
    },
    source: {
      id: 'source',
      label: 'HighlightCard.Source',
      description: 'Shows the source reference badge with URL or article title.',
      props: ['position', 'class']
    }
  };

  const showcaseBlocks: ShowcaseBlock[] = [
    {
      name: 'Feed',
      description: 'Full-width card for feeds',
      command: 'npx jsrepo add highlight-card-feed',
      preview: feedPreview,
      cardData: highlightCardFeedCard,
      orientation: 'vertical'
    },
    {
      name: 'Elegant',
      description: 'Square with gradient',
      command: 'npx jsrepo add highlight-card-elegant',
      preview: elegantPreview,
      cardData: highlightCardElegantCard,
      orientation: 'horizontal'
    },
    {
      name: 'Compact',
      description: 'Horizontal list layout',
      command: 'npx jsrepo add highlight-card-compact',
      preview: compactPreview,
      cardData: highlightCardCompactCard,
      orientation: 'vertical'
    },
    {
      name: 'Grid',
      description: 'Square for grids',
      command: 'npx jsrepo add highlight-card-grid',
      preview: gridPreview,
      cardData: highlightCardGridCard,
      orientation: 'horizontal'
    }
  ];
</script>

{#snippet feedPreview()}
  {#if highlight1}
    <HighlightCardFeed {ndk} event={highlight1} />
  {/if}
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

{#snippet customSections()}
  {#if highlight1}
    <!-- Anatomy Section -->
    <SectionTitle title="Anatomy" description="Click on any layer to see its details and props" />

    <ComponentAnatomy.Root>
      <ComponentAnatomy.Preview>
        <ComponentAnatomy.Layer id="root" label="HighlightCard.Root" absolute={true}>
          <div class="relative bg-card border border-border rounded-xl overflow-hidden max-w-2xl">
            <HighlightCard.Root {ndk} event={highlight1}>
              <div class="p-6 space-y-4">
                <ComponentAnatomy.Layer id="content" label="HighlightCard.Content">
                  <HighlightCard.Content class="text-base leading-relaxed" />
                </ComponentAnatomy.Layer>

                <ComponentAnatomy.Layer id="source" label="HighlightCard.Source" class="w-fit">
                  <HighlightCard.Source class="text-sm text-muted-foreground" />
                </ComponentAnatomy.Layer>
              </div>
            </HighlightCard.Root>
          </div>
        </ComponentAnatomy.Layer>
      </ComponentAnatomy.Preview>

      <ComponentAnatomy.DetailPanel layers={anatomyLayers} />
    </ComponentAnatomy.Root>
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
{/snippet}

{#if loading}
  <div class="px-8 py-16 text-center text-muted-foreground">
    Loading highlights...
  </div>
{:else if highlights.length === 0}
  <div class="px-8 py-16 text-center text-muted-foreground">
    No highlights found. Try following more users or create your own highlights!
  </div>
{:else if highlight1}
  <ComponentPageTemplate
    metadata={highlightCardMetadata}
    {ndk}
    {showcaseBlocks}
    componentsSection={{
      cards: highlightCardCards,
      previews: {
        'highlight-card-feed': feedPreview,
        'highlight-card-elegant': elegantPreview,
        'highlight-card-compact': compactPreview,
        'highlight-card-grid': gridPreview
      }
    }}
    {customSections}
  >
    {#key highlights}
      <EditProps.Prop name="Highlight 1" type="highlight" bind:value={highlight1} options={highlights} />
      <EditProps.Prop name="Highlight 2" type="highlight" bind:value={highlight2} options={highlights} />
      <EditProps.Prop name="Highlight 3" type="highlight" bind:value={highlight3} options={highlights} />
      <EditProps.Prop name="Highlight 4" type="highlight" bind:value={highlight4} options={highlights} />
      <EditProps.Prop name="Highlight 5" type="highlight" bind:value={highlight5} options={highlights} />
    {/key}
  </ComponentPageTemplate>
{/if}
