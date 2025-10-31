<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { NDKEvent, NDKKind } from '@nostr-dev-kit/ndk';
  import { EditProps } from '$lib/components/ndk/edit-props';
  import Demo from '$site-components/Demo.svelte';

  import NoteCardExample from './examples/note-card.svelte';
  import NoteInlineExample from './examples/note-inline.svelte';
  import NoteCompactExample from './examples/note-compact.svelte';

  const ndk = getContext<NDKSvelte>('ndk');

  // The sample should be a kind:1 event that EMBEDS another kind:1 event
  let sampleNote = $state<NDKEvent | undefined>();
</script>

<div class="container mx-auto p-8 max-w-7xl">
  <!-- Header -->
  <div class="mb-12">
    <h1 class="text-4xl font-bold mb-4">Note Embedded Preview</h1>
    <p class="text-lg text-muted-foreground mb-2">
      Embedded preview handler for short text notes (Kind 1) and generic replies (Kind 1111).
    </p>
    <p class="text-sm text-muted-foreground mb-6">
      <a href="/components/embedded-previews" class="text-primary hover:underline">
        ← Back to Embedded Previews
      </a>
    </p>

    <EditProps.Root>
      <EditProps.Prop
        name="Sample Note (Kind:1 embedding another note)"
        type="event"
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
  <section class="mb-12">
    <div class="p-6 border border-border rounded-lg bg-card">
      <h2 class="text-xl font-semibold mb-3">Overview</h2>
      <p class="text-sm text-muted-foreground mb-4">
        The Note embedded handler uses EventCard primitives to display short-form content.
        It shows the author with avatar, the note content (truncated based on variant), and timestamp.
      </p>
      <div class="text-sm space-y-2">
        <div><strong>Supported Kinds:</strong> 1 (Notes), 1111 (Generic Replies)</div>
        <div><strong>Component:</strong> <code class="px-2 py-1 bg-muted rounded">NoteEmbedded</code></div>
        <div><strong>Uses:</strong> EventCard primitives</div>
      </div>
    </div>
  </section>

  <!-- Visual Examples -->
  <section class="mb-12">
    <h2 class="text-3xl font-bold mb-6">Visual Examples</h2>

    <div class="space-y-8">
      <!-- Card Variant -->
      <Demo
        title="Card Variant"
        description="Full display with maximum detail. Default variant for embedded notes."
        component="note-embedded-card"
        usageOneLiner="import './kinds/note-embedded-card'  // Add to embedded-handlers.ts"
      >
        {#if sampleNote}
          <NoteCardExample {ndk} event={sampleNote} />
        {:else}
          <div class="p-12 border border-dashed border-border rounded-lg bg-muted/20 text-center">
            <p class="text-sm text-muted-foreground">Select a sample note above to preview</p>
          </div>
        {/if}
      </Demo>

      <!-- Inline Variant -->
      <Demo
        title="Inline Variant"
        description="Constrained width for inline display within flowing content."
        component="note-embedded-inline"
        usageOneLiner="import './kinds/note-embedded-inline'  // Add to embedded-handlers.ts"
      >
        {#if sampleNote}
          <NoteInlineExample {ndk} event={sampleNote} />
        {:else}
          <div class="p-12 border border-dashed border-border rounded-lg bg-muted/20 text-center">
            <p class="text-sm text-muted-foreground">Select a sample note above to preview</p>
          </div>
        {/if}
      </Demo>

      <!-- Compact Variant -->
      <Demo
        title="Compact Variant"
        description="Minimal display with heavily truncated content for dense layouts."
        component="note-embedded-compact"
        usageOneLiner="import './kinds/note-embedded-compact'  // Add to embedded-handlers.ts"
      >
        {#if sampleNote}
          <NoteCompactExample {ndk} event={sampleNote} />
        {:else}
          <div class="p-12 border border-dashed border-border rounded-lg bg-muted/20 text-center">
            <p class="text-sm text-muted-foreground">Select a sample note above to preview</p>
          </div>
        {/if}
      </Demo>
    </div>
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
        <div>import {'{ KindRegistry }'} from '$lib/components/ndk/event/content';</div>
        <div class="h-2"></div>
        <div class="text-muted-foreground">// Create custom registry</div>
        <div>const compactRegistry = new KindRegistry();</div>
        <div>compactRegistry.add([1, 1111], NoteEmbeddedCompact);</div>
        <div class="h-2"></div>
        <div class="text-muted-foreground">// Pass to EventContent</div>
        <div>&lt;EventContent {'{ndk}'} {'{event}'} kindRegistry={'{compactRegistry}'} /&gt;</div>
      </div>
      <p class="text-sm text-muted-foreground mt-4">
        Now all embedded notes will use the compact variant!
      </p>
    </div>
  </section>
</div>
