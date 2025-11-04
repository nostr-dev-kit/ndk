<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import { EditProps } from '$lib/site-components/edit-props';
  import ComponentsShowcaseGrid from '$site-components/ComponentsShowcaseGrid.svelte';
  import ComponentCard from '$site-components/ComponentCard.svelte';
  import ComponentPageSectionTitle from '$site-components/ComponentPageSectionTitle.svelte';

  import HighlightCardExample from './examples/highlight-card.example.svelte';
  import HighlightInlineExample from './examples/highlight-inline.example.svelte';
  import HighlightCompactExample from './examples/highlight-compact.example.svelte';

  const ndk = getContext<NDKSvelte>('ndk');

  // The sample should be a kind:1 event that EMBEDS a kind:9802 highlight
  let sampleNote = $state<NDKEvent | undefined>();

  const cardData = {
    name: 'highlight-embedded-card',
    title: 'Card Variant',
    description: 'Full book-page style display.',
    richDescription: 'Full book-page style display with source badge. Default variant for embedded highlights.',
    command: 'npx shadcn@latest add highlight-embedded-card',
    apiDocs: []
  };

  const inlineData = {
    name: 'highlight-embedded-inline',
    title: 'Inline Variant',
    description: 'Medium-sized for inline references.',
    richDescription: 'Medium-sized display for inline references with line clamping.',
    command: 'npx shadcn@latest add highlight-embedded-inline',
    apiDocs: []
  };

  const compactData = {
    name: 'highlight-embedded-compact',
    title: 'Compact Variant',
    description: 'Minimal with truncated content.',
    richDescription: 'Minimal display with heavily truncated content (2 lines).',
    command: 'npx shadcn@latest add highlight-embedded-compact',
    apiDocs: []
  };
</script>

<div class="px-8">
  <!-- Header -->
  <div class="mb-12 pt-8">
    <h1 class="text-4xl font-bold mb-4">Highlight Embedded Preview</h1>
    <p class="text-lg text-muted-foreground mb-2">
      Embedded preview handler for text highlights (Kind 9802 / NIP-84).
    </p>
    <p class="text-sm text-muted-foreground mb-6">
      <a href="/components/previews/introduction" class="text-primary hover:underline">
        ← Back to Embedded Previews
      </a>
    </p>

    <EditProps.Root>
      <EditProps.Prop
        name="Sample Note (Kind:1 embedding a highlight)"
        type="event"
        bind:value={sampleNote}
      />
    </EditProps.Root>

    {#if sampleNote}
      <div class="mt-4 p-4 border border-border rounded-lg bg-muted/30">
        <p class="text-sm text-muted-foreground mb-2">
          This note embeds a highlight (nevent1 of kind:9802) in its content. Scroll down to see how the embedded highlight renders.
        </p>
      </div>
    {/if}
  </div>

  <!-- Overview -->
  <section class="mb-12">
    <div class="p-6 border border-border rounded-lg bg-card">
      <h2 class="text-xl font-semibold mb-3">Overview</h2>
      <p class="text-sm text-muted-foreground mb-4">
        The Highlight embedded handler uses HighlightCard primitives to display highlighted
        text snippets with book-page style presentation and source attribution.
      </p>
      <div class="text-sm space-y-2">
        <div><strong>Supported Kinds:</strong> 9802 (Highlights / NIP-84)</div>
        <div><strong>Component:</strong> <code class="px-2 py-1 bg-muted rounded">HighlightEmbedded</code></div>
        <div><strong>Uses:</strong> HighlightCard primitives</div>
      </div>
    </div>
  </section>

  <!-- Visual Examples -->
  {#snippet cardPreview()}
    {#if sampleNote}
      <HighlightCardExample {ndk} event={sampleNote} />
    {:else}
      <div class="p-12 border border-dashed border-border rounded-lg bg-muted/20 text-center">
        <p class="text-sm text-muted-foreground">Select a sample note above to preview</p>
      </div>
    {/if}
  {/snippet}

  {#snippet inlinePreview()}
    {#if sampleNote}
      <HighlightInlineExample {ndk} event={sampleNote} />
    {:else}
      <div class="p-12 border border-dashed border-border rounded-lg bg-muted/20 text-center">
        <p class="text-sm text-muted-foreground">Select a sample note above to preview</p>
      </div>
    {/if}
  {/snippet}

  {#snippet compactPreview()}
    {#if sampleNote}
      <HighlightCompactExample {ndk} event={sampleNote} />
    {:else}
      <div class="p-12 border border-dashed border-border rounded-lg bg-muted/20 text-center">
        <p class="text-sm text-muted-foreground">Select a sample note above to preview</p>
      </div>
    {/if}
  {/snippet}

  <ComponentPageSectionTitle
    title="Visual Examples"
    description="Different display variants for embedded highlights."
  />

  <ComponentsShowcaseGrid
    blocks={[
      {
        name: 'Card Variant',
        description: 'Full book-page style',
        command: 'npx shadcn@latest add highlight-embedded-card',
        preview: cardPreview,
        cardData: cardData
      },
      {
        name: 'Inline Variant',
        description: 'Medium-sized display',
        command: 'npx shadcn@latest add highlight-embedded-inline',
        preview: inlinePreview,
        cardData: inlineData
      },
      {
        name: 'Compact Variant',
        description: 'Minimal truncated',
        command: 'npx shadcn@latest add highlight-embedded-compact',
        preview: compactPreview,
        cardData: compactData
      }
    ]}
  />

  <!-- Components Section -->
  <ComponentPageSectionTitle title="Components" description="Explore each variant in detail" />

  <section class="py-12 space-y-16">
    <ComponentCard inline data={cardData}>
      {#snippet preview()}
        {#if sampleNote}
          <HighlightCardExample {ndk} event={sampleNote} />
        {:else}
          <div class="p-12 border border-dashed border-border rounded-lg bg-muted/20 text-center">
            <p class="text-sm text-muted-foreground">Select a sample note above to preview</p>
          </div>
        {/if}
      {/snippet}
    </ComponentCard>

    <ComponentCard inline data={inlineData}>
      {#snippet preview()}
        {#if sampleNote}
          <HighlightInlineExample {ndk} event={sampleNote} />
        {:else}
          <div class="p-12 border border-dashed border-border rounded-lg bg-muted/20 text-center">
            <p class="text-sm text-muted-foreground">Select a sample note above to preview</p>
          </div>
        {/if}
      {/snippet}
    </ComponentCard>

    <ComponentCard inline data={compactData}>
      {#snippet preview()}
        {#if sampleNote}
          <HighlightCompactExample {ndk} event={sampleNote} />
        {:else}
          <div class="p-12 border border-dashed border-border rounded-lg bg-muted/20 text-center">
            <p class="text-sm text-muted-foreground">Select a sample note above to preview</p>
          </div>
        {/if}
      {/snippet}
    </ComponentCard>
  </section>

  <!-- When to Use -->
  <section class="mb-12">
    <h2 class="text-3xl font-bold mb-4">When to Use</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="p-6 border border-border rounded-lg bg-card">
        <h3 class="text-lg font-semibold mb-3">Card Variant</h3>
        <ul class="list-disc list-inside space-y-2 text-sm text-muted-foreground">
          <li>Highlight feeds and collections</li>
          <li>Reading notes and annotations</li>
          <li>Embedded quotes in discussions</li>
        </ul>
      </div>

      <div class="p-6 border border-border rounded-lg bg-card">
        <h3 class="text-lg font-semibold mb-3">Inline Variant</h3>
        <ul class="list-disc list-inside space-y-2 text-sm text-muted-foreground">
          <li>Citations within articles</li>
          <li>Inline quotes in notes</li>
          <li>Referenced highlights in content</li>
        </ul>
      </div>

      <div class="p-6 border border-border rounded-lg bg-card">
        <h3 class="text-lg font-semibold mb-3">Compact Variant</h3>
        <ul class="list-disc list-inside space-y-2 text-sm text-muted-foreground">
          <li>Sidebar highlight lists</li>
          <li>Dense annotation displays</li>
          <li>Mobile-optimized views</li>
        </ul>
      </div>
    </div>
  </section>

  <!-- How to Register -->
  <section class="mb-12">
    <h2 class="text-3xl font-bold mb-4">How to Register</h2>
    <div class="p-6 border border-border rounded-lg bg-card">
      <h3 class="text-lg font-semibold mb-4">Using Custom Registry</h3>
      <p class="text-sm text-muted-foreground mb-4">
        To use a specific variant, create a custom registry and register the variant component:
      </p>
      <div class="p-4 bg-muted rounded font-mono text-sm space-y-2">
        <div class="text-muted-foreground">// Import the variant component</div>
        <div>import HighlightEmbeddedInline from './highlight-embedded-inline.svelte';</div>
        <div>import {'{ ContentRenderer }'} from '$lib/registry/ui';</div>
        <div>import {'{ NDKHighlight }'} from '@nostr-dev-kit/ndk';</div>
        <div class="h-2"></div>
        <div class="text-muted-foreground">// Create custom registry</div>
        <div>const inlineRenderer = new ContentRenderer();</div>
        <div>inlineRenderer.addKind(NDKHighlight, HighlightEmbeddedInline);</div>
        <div class="h-2"></div>
        <div class="text-muted-foreground">// Pass to EventContent</div>
        <div>&lt;EventContent {'{ndk}'} {'{event}'} renderer={'{inlineRenderer}'} /&gt;</div>
      </div>
      <p class="text-sm text-muted-foreground mt-4">
        Now all embedded highlights will use the inline variant!
      </p>
    </div>
  </section>
</div>
