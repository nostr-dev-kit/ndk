<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import { EditProps } from '$lib/ndk/edit-props';
  import Demo from '$site-components/Demo.svelte';

  import HighlightCardExample from './examples/highlight-card.svelte';
  import HighlightInlineExample from './examples/highlight-inline.svelte';
  import HighlightCompactExample from './examples/highlight-compact.svelte';

  const ndk = getContext<NDKSvelte>('ndk');

  let sampleHighlight = $state<NDKEvent | undefined>();
</script>

<div class="container mx-auto p-8 max-w-7xl">
  <!-- Header -->
  <div class="mb-12">
    <h1 class="text-4xl font-bold mb-4">Highlight Embedded Preview</h1>
    <p class="text-lg text-muted-foreground mb-2">
      Embedded preview handler for text highlights (Kind 9802 / NIP-84).
    </p>
    <p class="text-sm text-muted-foreground mb-6">
      <a href="/components/embedded-previews" class="text-primary hover:underline">
        ← Back to Embedded Previews
      </a>
    </p>

    <EditProps.Root>
      <EditProps.Prop name="Sample Highlight" type="event" bind:value={sampleHighlight} />
    </EditProps.Root>
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
  <section class="mb-12">
    <h2 class="text-3xl font-bold mb-6">Visual Examples</h2>

    <div class="space-y-8">
      <!-- Card Variant -->
      <Demo
        title="Card Variant"
        description="Full book-page style display with source badge. Default variant for embedded highlights."
      >
        {#if sampleHighlight}
          <HighlightCardExample {ndk} event={sampleHighlight} />
        {:else}
          <div class="p-12 border border-dashed border-border rounded-lg bg-muted/20 text-center">
            <p class="text-sm text-muted-foreground">Select a sample highlight above to preview</p>
          </div>
        {/if}
      </Demo>

      <!-- Inline Variant -->
      <Demo
        title="Inline Variant"
        description="Medium-sized display for inline references with line clamping."
      >
        {#if sampleHighlight}
          <HighlightInlineExample {ndk} event={sampleHighlight} />
        {:else}
          <div class="p-12 border border-dashed border-border rounded-lg bg-muted/20 text-center">
            <p class="text-sm text-muted-foreground">Select a sample highlight above to preview</p>
          </div>
        {/if}
      </Demo>

      <!-- Compact Variant -->
      <Demo
        title="Compact Variant"
        description="Minimal display with heavily truncated content (2 lines)."
      >
        {#if sampleHighlight}
          <HighlightCompactExample {ndk} event={sampleHighlight} />
        {:else}
          <div class="p-12 border border-dashed border-border rounded-lg bg-muted/20 text-center">
            <p class="text-sm text-muted-foreground">Select a sample highlight above to preview</p>
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

  <!-- Quick Reference -->
  <section class="mb-12">
    <h2 class="text-3xl font-bold mb-4">Quick Reference</h2>
    <div class="p-6 border border-border rounded-lg bg-card">
      <h3 class="text-lg font-semibold mb-4">Props</h3>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="border-b border-border">
            <tr class="text-left">
              <th class="pb-2 pr-4 font-semibold">Prop</th>
              <th class="pb-2 pr-4 font-semibold">Type</th>
              <th class="pb-2 pr-4 font-semibold">Default</th>
              <th class="pb-2 font-semibold">Description</th>
            </tr>
          </thead>
          <tbody class="text-muted-foreground">
            <tr class="border-b border-border">
              <td class="py-3 pr-4 font-mono text-xs">ndk</td>
              <td class="py-3 pr-4">NDKSvelte</td>
              <td class="py-3 pr-4">-</td>
              <td class="py-3">NDK instance</td>
            </tr>
            <tr class="border-b border-border">
              <td class="py-3 pr-4 font-mono text-xs">event</td>
              <td class="py-3 pr-4">NDKEvent</td>
              <td class="py-3 pr-4">-</td>
              <td class="py-3">The highlight event to render</td>
            </tr>
            <tr>
              <td class="py-3 pr-4 font-mono text-xs">variant</td>
              <td class="py-3 pr-4">'card' | 'inline' | 'compact'</td>
              <td class="py-3 pr-4">'card'</td>
              <td class="py-3">Display variant</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</div>
