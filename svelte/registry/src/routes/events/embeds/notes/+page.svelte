<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { NDKEvent, NDKKind } from '@nostr-dev-kit/ndk';
  import { EditProps } from '$lib/site-components/edit-props';
  import ComponentsShowcaseGrid from '$site-components/ComponentsShowcaseGrid.svelte';
  import ComponentCard from '$site-components/ComponentCard.svelte';
  import SectionTitle from '$site-components/SectionTitle.svelte';

  import NoteCardExample from './examples/note-card.example.svelte';
  import NoteInlineExample from './examples/note-inline.example.svelte';
  import NoteCompactExample from './examples/note-compact.example.svelte';

  const ndk = getContext<NDKSvelte>('ndk');

  // The sample should be a kind:1 event that EMBEDS another kind:1 event
  let sampleNote = $state<NDKEvent | undefined>();

  const cardData = {
    name: 'note-embedded-card',
    title: 'Card Variant',
    description: 'Full display with maximum detail.',
    richDescription: 'Full display with maximum detail. Default variant for embedded notes.',
    command: 'npx jsrepo add note-embedded-card',
    apiDocs: []
  };

  const inlineData = {
    name: 'note-embedded-inline',
    title: 'Inline Variant',
    description: 'Constrained width for inline.',
    richDescription: 'Constrained width for inline display within flowing content.',
    command: 'npx jsrepo add note-embedded-inline',
    apiDocs: []
  };

  const compactData = {
    name: 'note-embedded-compact',
    title: 'Compact Variant',
    description: 'Minimal with truncated content.',
    richDescription: 'Minimal display with heavily truncated content for dense layouts.',
    command: 'npx jsrepo add note-embedded-compact',
    apiDocs: []
  };
</script>

<div class="px-8">
  <!-- Header -->
  <div class="mb-12 pt-8">
    <h1 class="text-4xl font-bold mb-4">Note Embedded Preview</h1>
    <p class="text-lg text-muted-foreground mb-6">
      Embedded preview handler for short text notes (Kind 1) and generic replies (Kind 1111).
    </p>

    <EditProps.Root>
      <EditProps.Prop
        name="Sample Note (Kind:1 embedding another note)"
        type="event"
        default="nevent1qvzqqqqqqypzq0mgmm0gz4yuczzyltl99rc4wj63uz27wjglg69aj6ylsamehwqaqqst6h0tdve9v0xwwpz4d4ckwfc9ksjtjjjutc4smjzewp85u7a9v0qhd8czh"
        bind:value={sampleNote}
      />
    </EditProps.Root>

    {#if sampleNote}
      <div class="mt-4 p-4 border border-border rounded-lg bg-muted/30">
        <p class="text-sm text-muted-foreground mb-2">
          This note embeds another note in its content. Scroll down to see how the embedded event renders.
        </p>
      </div>
    {/if}
  </div>

  <!-- Overview -->
  <section class="mb-12 max-w-3xl">
    <h2 class="text-3xl font-bold mb-6">Overview</h2>
    <p class="text-base leading-relaxed mb-6">
      The Note embedded handler uses <code class="px-1.5 py-0.5 bg-muted/50 rounded text-sm font-mono">EventCard</code> primitives to display short-form content.
      It shows the author with avatar, the note content (truncated based on variant), and timestamp.
    </p>
    <p class="text-base leading-relaxed mb-4">
      <strong class="font-semibold">Supported Kinds:</strong> 1 (Notes), 1111 (Generic Replies)
    </p>
    <p class="text-base leading-relaxed mb-4">
      <strong class="font-semibold">Component:</strong> <code class="px-1.5 py-0.5 bg-muted/50 rounded text-sm font-mono">NoteEmbedded</code>
    </p>
    <p class="text-base leading-relaxed">
      <strong class="font-semibold">Uses:</strong> <code class="px-1.5 py-0.5 bg-muted/50 rounded text-sm font-mono">EventCard</code> primitives
    </p>
  </section>

  <!-- Visual Examples -->
  {#snippet cardPreview()}
    {#if sampleNote}
      <NoteCardExample {ndk} event={sampleNote} />
    {:else}
      <div class="p-12 border border-dashed border-border rounded-lg bg-muted/20 text-center">
        <p class="text-sm text-muted-foreground">Select a sample note above to preview</p>
      </div>
    {/if}
  {/snippet}

  {#snippet inlinePreview()}
    {#if sampleNote}
      <NoteInlineExample {ndk} event={sampleNote} />
    {:else}
      <div class="p-12 border border-dashed border-border rounded-lg bg-muted/20 text-center">
        <p class="text-sm text-muted-foreground">Select a sample note above to preview</p>
      </div>
    {/if}
  {/snippet}

  {#snippet compactPreview()}
    {#if sampleNote}
      <NoteCompactExample {ndk} event={sampleNote} />
    {:else}
      <div class="p-12 border border-dashed border-border rounded-lg bg-muted/20 text-center">
        <p class="text-sm text-muted-foreground">Select a sample note above to preview</p>
      </div>
    {/if}
  {/snippet}

  <SectionTitle
    title="Visual Examples"
    description="Different display variants for embedded notes."
  />

  <ComponentsShowcaseGrid
    blocks={[
      {
        name: 'Card Variant',
        description: 'Full display',
        command: 'npx jsrepo add note-embedded-card',
        preview: cardPreview,
        cardData: cardData
      },
      {
        name: 'Inline Variant',
        description: 'Constrained width',
        command: 'npx jsrepo add note-embedded-inline',
        preview: inlinePreview,
        cardData: inlineData
      },
      {
        name: 'Compact Variant',
        description: 'Minimal truncated',
        command: 'npx jsrepo add note-embedded-compact',
        preview: compactPreview,
        cardData: compactData
      }
    ]}
  />

  <!-- Components Section -->
  <SectionTitle title="Components" description="Explore each variant in detail" />

  <section class="py-12 space-y-16">
    <ComponentCard data={cardData}>
      {#snippet preview()}
        {#if sampleNote}
          <NoteCardExample {ndk} event={sampleNote} />
        {:else}
          <div class="p-12 border border-dashed border-border rounded-lg bg-muted/20 text-center">
            <p class="text-sm text-muted-foreground">Select a sample note above to preview</p>
          </div>
        {/if}
      {/snippet}
    </ComponentCard>

    <ComponentCard data={inlineData}>
      {#snippet preview()}
        {#if sampleNote}
          <NoteInlineExample {ndk} event={sampleNote} />
        {:else}
          <div class="p-12 border border-dashed border-border rounded-lg bg-muted/20 text-center">
            <p class="text-sm text-muted-foreground">Select a sample note above to preview</p>
          </div>
        {/if}
      {/snippet}
    </ComponentCard>

    <ComponentCard data={compactData}>
      {#snippet preview()}
        {#if sampleNote}
          <NoteCompactExample {ndk} event={sampleNote} />
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
          <li>Thread views showing quoted/replied notes</li>
          <li>Feed displays with embedded references</li>
          <li>Standalone embedded note previews</li>
        </ul>
      </div>

      <div class="p-6 border border-border rounded-lg bg-card">
        <h3 class="text-lg font-semibold mb-3">Inline Variant</h3>
        <ul class="list-disc list-inside space-y-2 text-sm text-muted-foreground">
          <li>Embedded within article or long-form content</li>
          <li>Inline quotes in conversations</li>
          <li>Reference previews in rich text</li>
        </ul>
      </div>

      <div class="p-6 border border-border rounded-lg bg-card">
        <h3 class="text-lg font-semibold mb-3">Compact Variant</h3>
        <ul class="list-disc list-inside space-y-2 text-sm text-muted-foreground">
          <li>Sidebar references</li>
          <li>Dense lists of related notes</li>
          <li>Mobile-optimized layouts</li>
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
        <div>import NoteEmbeddedCompact from './note-embedded-compact.svelte';</div>
        <div>import {'{ ContentRenderer }'} from '$lib/registry/ui';</div>
        <div class="h-2"></div>
        <div class="text-muted-foreground">// Create custom registry</div>
        <div>const compactRenderer = new ContentRenderer();</div>
        <div>compactRenderer.addKind([1, 1111], NoteEmbeddedCompact);</div>
        <div class="h-2"></div>
        <div class="text-muted-foreground">// Pass to EventContent</div>
        <div>&lt;EventContent {'{ndk}'} {'{event}'} renderer={'{compactRenderer}'} /&gt;</div>
      </div>
      <p class="text-sm text-muted-foreground mt-4">
        Now all embedded notes will use the compact variant!
      </p>
    </div>
  </section>
</div>
