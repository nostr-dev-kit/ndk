<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { NDKEvent } from '@nostr-dev-kit/ndk';
  import { EditProps } from '$lib/ndk/edit-props';
  import Demo from '$site-components/Demo.svelte';

  import GenericFallbackExample from './examples/generic-fallback.svelte';

  const ndk = getContext<NDKSvelte>('ndk');

  // The sample should be a kind:1 event that EMBEDS an unknown/unsupported kind
  let sampleNote = $state<NDKEvent | undefined>();
</script>

<div class="container mx-auto p-8 max-w-7xl">
  <!-- Header -->
  <div class="mb-12">
    <h1 class="text-4xl font-bold mb-4">Generic Embedded Preview</h1>
    <p class="text-lg text-muted-foreground mb-2">
      Default fallback handler for event kinds without specific registered handlers.
    </p>
    <p class="text-sm text-muted-foreground mb-6">
      <a href="/components/embedded-previews" class="text-primary hover:underline">
        ← Back to Embedded Previews
      </a>
    </p>

    <EditProps.Root>
      <EditProps.Prop
        name="Sample Note (Kind:1 embedding an unknown kind)"
        type="event"
        bind:value={sampleNote}
      />
    </EditProps.Root>

    {#if sampleNote}
      <div class="mt-4 p-4 border border-border rounded-lg bg-muted/30">
        <p class="text-sm text-muted-foreground mb-2">
          This note embeds an event with an unknown/unsupported kind. Scroll down to see how it falls back to the generic renderer.
        </p>
      </div>
    {/if}
  </div>

  <!-- Overview -->
  <section class="mb-12">
    <div class="p-6 border border-border rounded-lg bg-card">
      <h2 class="text-xl font-semibold mb-3">Overview</h2>
      <p class="text-sm text-muted-foreground mb-4">
        When an event kind has no registered handler in the KIND_HANDLERS map, the system
        automatically falls back to GenericEmbedded. This ensures all events can be displayed,
        even if they don't have custom UI.
      </p>
      <div class="text-sm space-y-2">
        <div><strong>Handles:</strong> Any kind not in KIND_HANDLERS map</div>
        <div><strong>Component:</strong> <code class="px-2 py-1 bg-muted rounded">GenericEmbedded</code></div>
        <div><strong>Uses:</strong> EventCard primitives + kind badge</div>
      </div>
    </div>
  </section>

  <!-- Features -->
  <section class="mb-12">
    <h2 class="text-3xl font-bold mb-4">Features</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="p-6 border border-border rounded-lg bg-card">
        <h3 class="text-lg font-semibold mb-3">Universal Display</h3>
        <p class="text-sm text-muted-foreground">
          Uses EventCard primitives to display any event type with author, content, and timestamp.
        </p>
      </div>

      <div class="p-6 border border-border rounded-lg bg-card">
        <h3 class="text-lg font-semibold mb-3">Kind Badge</h3>
        <p class="text-sm text-muted-foreground">
          Shows a "Kind X" badge to indicate the event type, helping users identify unknown kinds.
        </p>
      </div>

      <div class="p-6 border border-border rounded-lg bg-card">
        <h3 class="text-lg font-semibold mb-3">Consistent Experience</h3>
        <p class="text-sm text-muted-foreground">
          Provides a predictable, usable fallback so no event reference breaks the UI.
        </p>
      </div>

      <div class="p-6 border border-border rounded-lg bg-card">
        <h3 class="text-lg font-semibold mb-3">Encourages Custom Handlers</h3>
        <p class="text-sm text-muted-foreground">
          The kind badge subtly prompts developers to create custom handlers for frequently encountered kinds.
        </p>
      </div>
    </div>
  </section>

  <!-- Visual Example -->
  <section class="mb-12">
    <h2 class="text-3xl font-bold mb-6">Visual Example</h2>

    <div class="space-y-8">
      <Demo
        title="Generic Fallback Rendering"
        description="Shows how unknown kinds are displayed with EventCard primitives and kind badge."
      >
        {#if sampleNote}
          <GenericFallbackExample {ndk} event={sampleNote} />
        {:else}
          <div class="p-12 border border-dashed border-border rounded-lg bg-muted/20 text-center">
            <p class="text-sm text-muted-foreground">Select a sample note above to preview</p>
          </div>
        {/if}
      </Demo>
    </div>
  </section>

  <!-- Adding Custom Handlers -->
  <section class="mb-12">
    <h2 class="text-3xl font-bold mb-4">Adding Custom Handlers</h2>
    <div class="p-6 border border-border rounded-lg bg-card">
      <p class="text-sm text-muted-foreground mb-4">
        If you frequently encounter a specific kind and want custom rendering, create a handler:
      </p>

      <div class="space-y-4">
        <div>
          <div class="text-sm font-semibold mb-2">1. Create the handler component</div>
          <code class="block p-3 bg-muted rounded text-xs font-mono">
            src/lib/ndk/event/content/kinds/my-kind-embedded.svelte
          </code>
        </div>

        <div>
          <div class="text-sm font-semibold mb-2">2. Register in KIND_HANDLERS map</div>
          <p class="text-xs text-muted-foreground mb-2">
            Edit <code class="px-1 py-0.5 bg-muted rounded">event/event.svelte</code>:
          </p>
          <div class="p-3 bg-muted rounded text-xs font-mono space-y-1">
            <div>import MyKindEmbedded from '../kinds/my-kind-embedded.svelte';</div>
            <div class="text-muted-foreground">// ...</div>
            <div>12345: MyKindEmbedded,  // Your custom kind</div>
          </div>
        </div>

        <p class="text-sm text-muted-foreground">
          <a href="/components/embedded-previews" class="text-primary hover:underline">
            See the main Embedded Previews page for detailed instructions →
          </a>
        </p>
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
              <td class="py-3">The event to render</td>
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
