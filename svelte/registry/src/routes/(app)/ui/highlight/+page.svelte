<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { NDKHighlight, NDKKind } from '@nostr-dev-kit/ndk';
  import UIPrimitivePageTemplate from '$lib/site/templates/UIPrimitivePageTemplate.svelte';
  import Preview from '$site-components/preview.svelte';
  import * as ComponentAnatomy from '$site-components/component-anatomy';
  import { Highlight } from '$lib/registry/ui/highlight';

  import Basic from './examples/basic-usage/index.svelte';
  import BasicRaw from './examples/basic-usage/index.txt?raw';
  import Composition from './examples/styled-card/index.svelte';
  import CompositionRaw from './examples/styled-card/index.txt?raw';

  const ndk = getContext<NDKSvelte>('ndk');

  // Fetch a highlight for examples and anatomy
  const highlightFetcher = ndk.$subscribe(() => ({
    filters: [{ kinds: [NDKKind.Highlight], limit: 1 }]
  }));

  let highlight = $state<NDKHighlight | null>(null);

  $effect(() => {
    if (highlightFetcher.events.length > 0) {
      highlight = NDKHighlight.from(highlightFetcher.events[0]);
    }
  });

  // Page metadata
  const metadata = {
    title: 'Highlight',
    description: 'Headless, composable primitives for displaying text highlights (NIP-84).',
    importPath: 'ui/highlight',
    nips: ['84'],
    primitives: [
      {
        name: 'Highlight.Root',
        title: 'Highlight.Root',
        description: 'Context provider for highlight primitives. Required wrapper for all Highlight components.',
        apiDocs: [
          { name: 'ndk', type: 'NDKSvelte', default: 'from context', description: 'NDK instance' },
          { name: 'event', type: 'NDKHighlight', default: 'required', description: 'The highlight event to display' },
          { name: 'onclick', type: '(event: MouseEvent) => void', default: 'undefined', description: 'Click handler for the root element' },
          { name: 'class', type: 'string', default: "''", description: 'Additional CSS classes' },
          { name: 'children', type: 'Snippet', default: 'required', description: 'Child components' }
        ]
      },
      {
        name: 'Highlight.Content',
        title: 'Highlight.Content',
        description: 'Displays the highlighted text from the event content.',
        apiDocs: [
          { name: 'class', type: 'string', default: "''", description: 'Additional CSS classes' }
        ]
      },
      {
        name: 'Highlight.Source',
        title: 'Highlight.Source',
        description: 'Displays a link to the source article or context tag.',
        apiDocs: [
          { name: 'class', type: 'string', default: "''", description: 'Additional CSS classes' }
        ]
      }
    ],
    anatomyLayers: [
      {
        id: 'root',
        label: 'Highlight.Root',
        description: 'Container that provides highlight context to all child primitives. Handles event data and click handling.',
        props: ['ndk', 'event', 'onclick', 'class']
      },
      {
        id: 'content',
        label: 'Highlight.Content',
        description: 'Displays the highlighted text content from the event.',
        props: ['class']
      },
      {
        id: 'source',
        label: 'Highlight.Source',
        description: 'Shows a link to the source article or context where the highlight was made.',
        props: ['class']
      }
    ]
  };
</script>

<svelte:head>
  <title>Highlight Primitives - NDK Svelte</title>
  <meta name="description" content="Headless, composable primitives for displaying text highlights (NIP-84)." />
</svelte:head>

<UIPrimitivePageTemplate {metadata} {ndk}>
  {#snippet topExample()}
    <Preview code={BasicRaw}>
      <Basic />
    </Preview>
  {/snippet}

  {#snippet overview()}
    <section>
      <h2 class="text-2xl font-semibold mb-4">Overview</h2>
      <p class="text-lg leading-relaxed text-muted-foreground mb-8">
        Highlight primitives expose individual fields from Nostr highlight events (NIP-84) as composable
        components, making it easy to build custom highlight displays.
      </p>

      <h3 class="text-xl font-semibold mt-8 mb-4">When You Need These</h3>
      <p class="leading-relaxed mb-4">
        Use Highlight primitives when building custom layouts for displaying text highlights. Use these when you're:
      </p>
      <ul class="ml-6 mb-4 list-disc space-y-2">
        <li class="leading-relaxed">Building custom highlight cards with specific styling (quotes, callouts, cards)</li>
        <li class="leading-relaxed">Displaying user-created highlights in reading interfaces</li>
        <li class="leading-relaxed">Creating highlight collections or galleries</li>
        <li class="leading-relaxed">Embedding highlights in articles or blog posts</li>
      </ul>
    </section>
  {/snippet}

  {#snippet anatomyPreview()}
    {#if highlight}
      <Highlight.Root {ndk} event={highlight}>
        <ComponentAnatomy.Layer id="root" label="Highlight.Root">
          <div class="border border-border rounded-lg p-4 bg-card max-w-md">
            <ComponentAnatomy.Layer id="content" label="Highlight.Content">
              <Highlight.Content class="text-lg italic leading-relaxed mb-2" />
            </ComponentAnatomy.Layer>
            <ComponentAnatomy.Layer id="source" label="Highlight.Source">
              <Highlight.Source class="text-sm text-muted-foreground" />
            </ComponentAnatomy.Layer>
          </div>
        </ComponentAnatomy.Layer>
      </Highlight.Root>
    {:else}
      <div class="border border-border rounded-lg p-8 bg-card max-w-md text-center text-muted-foreground">
        Loading highlight...
      </div>
    {/if}
  {/snippet}

  {#snippet examples()}
    <div>
      <h3 class="text-xl font-semibold mb-3">Styled Highlight Card</h3>
      <p class="leading-relaxed text-muted-foreground mb-4">
        Combines Content and Source primitives with custom styling to create a visually distinctive
        highlight card with gradient background and accent border.
      </p>
      <Preview
        title="Styled Highlight Card"
        code={CompositionRaw}
      >
        <Composition />
      </Preview>
    </div>
  {/snippet}

  {#snippet contextSection()}
    <section>
      <h2 class="text-2xl font-semibold mb-4">Context</h2>
      <p class="leading-relaxed text-muted-foreground mb-4">Access highlight context in custom components:</p>
      <pre class="my-4 p-4 bg-muted rounded-lg overflow-x-auto"><code class="font-mono text-sm leading-normal">import &#123; getContext &#125; from 'svelte';
import &#123; HIGHLIGHT_CONTEXT_KEY, type HighlightContext &#125; from '$lib/registry/ui/highlight';

const context = getContext&lt;HighlightContext&gt;(HIGHLIGHT_CONTEXT_KEY);
// Access: context.highlight, context.ndk, context.onclick</code></pre>
    </section>
  {/snippet}

  {#snippet relatedComponents()}
    <section>
      <h2 class="text-2xl font-semibold mb-4">Related</h2>
      <div class="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
        <a href="/components/cards/highlight" class="flex flex-col gap-1 p-4 border border-border rounded-lg no-underline transition-all hover:border-primary hover:-translate-y-0.5">
          <strong class="font-semibold text-foreground">Highlight Blocks</strong>
          <span class="text-sm text-muted-foreground">Pre-styled highlight card layouts</span>
        </a>
        <a href="/components/previews/highlights" class="flex flex-col gap-1 p-4 border border-border rounded-lg no-underline transition-all hover:border-primary hover:-translate-y-0.5">
          <strong class="font-semibold text-foreground">Highlight Embedded</strong>
          <span class="text-sm text-muted-foreground">For embedding highlights in content</span>
        </a>
        <a href="/ui/article" class="flex flex-col gap-1 p-4 border border-border rounded-lg no-underline transition-all hover:border-primary hover:-translate-y-0.5">
          <strong class="font-semibold text-foreground">Article Primitives</strong>
          <span class="text-sm text-muted-foreground">For source articles</span>
        </a>
      </div>
    </section>
  {/snippet}
</UIPrimitivePageTemplate>
