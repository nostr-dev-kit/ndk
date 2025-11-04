<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { NDKEvent } from '@nostr-dev-kit/ndk';
  import { EditProps } from '$lib/site-components/edit-props';
  import ComponentsShowcaseGrid from '$site-components/ComponentsShowcaseGrid.svelte';
  import ComponentCard from '$site-components/ComponentCard.svelte';
  import ComponentPageSectionTitle from '$site-components/ComponentPageSectionTitle.svelte';

  import GenericCardExample from './examples/generic-card.example.svelte';
  import GenericInlineExample from './examples/generic-inline.example.svelte';
  import GenericCompactExample from './examples/generic-compact.example.svelte';

  const ndk = getContext<NDKSvelte>('ndk');

  // The sample should be a kind:1 event that EMBEDS an unknown/unsupported kind
  let sampleNote = $state<NDKEvent | undefined>();

  const cardData = {
    name: 'generic-embedded-card',
    title: 'Card Variant',
    description: 'Full display with kind badge.',
    richDescription: 'Full display with event content and kind badge. Shows NIP-31 alt tag when available.',
    command: 'npx shadcn@latest add generic-embedded-card',
    apiDocs: []
  };

  const inlineData = {
    name: 'generic-embedded-inline',
    title: 'Inline Variant',
    description: 'Medium-sized display.',
    richDescription: 'Medium-sized display suitable for inline references within content.',
    command: 'npx shadcn@latest add generic-embedded-inline',
    apiDocs: []
  };

  const compactData = {
    name: 'generic-embedded-compact',
    title: 'Compact Variant',
    description: 'Minimal with truncated content.',
    richDescription: 'Minimal display with truncated content and compact header.',
    command: 'npx shadcn@latest add generic-embedded-compact',
    apiDocs: []
  };
</script>

<div class="px-8">
  <!-- Header -->
  <div class="mb-12 pt-8">
    <h1 class="text-4xl font-bold mb-4">Generic Embedded Preview</h1>
    <p class="text-lg text-muted-foreground mb-2">
      Intelligent fallback handler for unknown event kinds, powered by NIP-31 (Alt Tags) and NIP-89 (App Discovery).
    </p>
    <p class="text-sm text-muted-foreground mb-6">
      <a href="/components/previews/introduction" class="text-primary hover:underline">
        ← Back to Embedded Previews
      </a>
    </p>

    <EditProps.Root>
      <EditProps.Prop
        name="Sample Note (Kind:1 embedding an unknown kind)"
        type="event"
        bind:value={sampleNote}
        default="nevent1qgsqtz6ppckw2rm8k60tsnwgh3nak0gzcw557umvxmw3ncgmhusgesspz4mhxue69uhhyetvv9ujuerpd46hxtnfduhsz9mhwden5te0wfjkccte9ehx7um5wghxyctwvshsqgyf9rkgypyhwk0qqd7dfymhtelq2t4xwe72zm89wxqlp3vlffr9ygegmhfp"
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
  <section class="mb-12 max-w-3xl">
    <h2 class="text-3xl font-bold mb-6">Overview</h2>
    <p class="text-base leading-relaxed mb-6">
      When an event kind has no registered handler, <code class="px-1.5 py-0.5 bg-muted/50 rounded text-sm font-mono">GenericEmbedded</code> provides an intelligent fallback
      that leverages NIP-31 and NIP-89 to help users understand and interact with unknown event kinds.
    </p>
    <p class="text-base leading-relaxed mb-4">
      <strong class="font-semibold">Handles:</strong> Any kind not in the registry
    </p>
    <p class="text-base leading-relaxed mb-4">
      <strong class="font-semibold">Component:</strong> <code class="px-1.5 py-0.5 bg-muted/50 rounded text-sm font-mono">GenericEmbedded</code>
    </p>
    <p class="text-base leading-relaxed mb-4">
      <strong class="font-semibold">NIP-31:</strong> Displays human-readable alt tag summaries
    </p>
    <p class="text-base leading-relaxed mb-4">
      <strong class="font-semibold">NIP-89:</strong> Discovers and lists compatible apps that can handle the event
    </p>
    <p class="text-base leading-relaxed">
      <strong class="font-semibold">Features:</strong> One-click links to open events in compatible apps (web, iOS, Android)
    </p>
  </section>

  <!-- Features -->
  <section class="mb-12">
    <h2 class="text-3xl font-bold mb-4">Features</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="p-6 border border-border rounded-lg bg-card">
        <h3 class="text-lg font-semibold mb-3">🏷️ NIP-31 Alt Tag Support</h3>
        <p class="text-sm text-muted-foreground">
          Displays human-readable summary from the alt tag, helping users understand custom event kinds.
        </p>
      </div>

      <div class="p-6 border border-border rounded-lg bg-card">
        <h3 class="text-lg font-semibold mb-3">🔍 NIP-89 App Discovery</h3>
        <p class="text-sm text-muted-foreground">
          Automatically discovers and lists compatible apps that can handle the unknown event kind.
        </p>
      </div>

      <div class="p-6 border border-border rounded-lg bg-card">
        <h3 class="text-lg font-semibold mb-3">🔗 One-Click App Links</h3>
        <p class="text-sm text-muted-foreground">
          Platform-specific links (Web, iOS, Android) to open the event in compatible applications.
        </p>
      </div>

      <div class="p-6 border border-border rounded-lg bg-card">
        <h3 class="text-lg font-semibold mb-3">📱 Universal Display</h3>
        <p class="text-sm text-muted-foreground">
          Uses EventCard primitives to display any event with author, content, and timestamp.
        </p>
      </div>

      <div class="p-6 border border-border rounded-lg bg-card">
        <h3 class="text-lg font-semibold mb-3">🎨 Variant Support</h3>
        <p class="text-sm text-muted-foreground">
          Supports card, inline, and compact variants for different display contexts.
        </p>
      </div>

      <div class="p-6 border border-border rounded-lg bg-card">
        <h3 class="text-lg font-semibold mb-3">⚡ Smart Fallback</h3>
        <p class="text-sm text-muted-foreground">
          Ensures no event breaks the UI, providing a consistent experience for all event types.
        </p>
      </div>
    </div>
  </section>

  <!-- Visual Examples -->
  {#snippet cardPreview()}
    {#if sampleNote}
      <GenericCardExample {ndk} event={sampleNote} />
    {:else}
      <div class="p-12 border border-dashed border-border rounded-lg bg-muted/20 text-center">
        <p class="text-sm text-muted-foreground">Select a sample note above to preview</p>
      </div>
    {/if}
  {/snippet}

  {#snippet inlinePreview()}
    {#if sampleNote}
      <GenericInlineExample {ndk} event={sampleNote} />
    {:else}
      <div class="p-12 border border-dashed border-border rounded-lg bg-muted/20 text-center">
        <p class="text-sm text-muted-foreground">Select a sample note above to preview</p>
      </div>
    {/if}
  {/snippet}

  {#snippet compactPreview()}
    {#if sampleNote}
      <GenericCompactExample {ndk} event={sampleNote} />
    {:else}
      <div class="p-12 border border-dashed border-border rounded-lg bg-muted/20 text-center">
        <p class="text-sm text-muted-foreground">Select a sample note above to preview</p>
      </div>
    {/if}
  {/snippet}

  <ComponentPageSectionTitle
    title="Visual Examples"
    description="Different display variants for unknown event kinds."
  />

  <ComponentsShowcaseGrid
    blocks={[
      {
        name: 'Card Variant',
        description: 'Full display',
        command: 'npx shadcn@latest add generic-embedded-card',
        preview: cardPreview,
        cardData: cardData
      },
      {
        name: 'Inline Variant',
        description: 'Medium-sized display',
        command: 'npx shadcn@latest add generic-embedded-inline',
        preview: inlinePreview,
        cardData: inlineData
      },
      {
        name: 'Compact Variant',
        description: 'Minimal truncated',
        command: 'npx shadcn@latest add generic-embedded-compact',
        preview: compactPreview,
        cardData: compactData
      }
    ]}
  />

  <!-- Components Section -->
  <ComponentPageSectionTitle title="Components" description="Explore each variant in detail" />

  <section class="py-12 space-y-16">
    <ComponentCard data={cardData}>
      {#snippet preview()}
        {#if sampleNote}
          <GenericCardExample {ndk} event={sampleNote} />
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
          <GenericInlineExample {ndk} event={sampleNote} />
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
          <GenericCompactExample {ndk} event={sampleNote} />
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
          <li>Main feed displaying unknown event kinds</li>
          <li>Showcasing events with NIP-31 alt tags</li>
          <li>Testing custom event kinds during development</li>
        </ul>
      </div>

      <div class="p-6 border border-border rounded-lg bg-card">
        <h3 class="text-lg font-semibold mb-3">Inline Variant</h3>
        <ul class="list-disc list-inside space-y-2 text-sm text-muted-foreground">
          <li>References to unknown kinds within content</li>
          <li>Embedded custom events in conversations</li>
          <li>Medium-sized previews in sidebars</li>
        </ul>
      </div>

      <div class="p-6 border border-border rounded-lg bg-card">
        <h3 class="text-lg font-semibold mb-3">Compact Variant</h3>
        <ul class="list-disc list-inside space-y-2 text-sm text-muted-foreground">
          <li>Lists of mixed unknown event kinds</li>
          <li>Mobile-optimized fallback displays</li>
          <li>Dense event listings with minimal space</li>
        </ul>
      </div>
    </div>
  </section>

  <!-- NIP-31 Example -->
  <section class="mb-12">
    <h2 class="text-3xl font-bold mb-4">NIP-31: Alt Tag</h2>
    <div class="p-6 border border-border rounded-lg bg-card">
      <p class="text-sm text-muted-foreground mb-4">
        NIP-31 defines how custom event kinds should include a human-readable summary in an <code class="px-2 py-1 bg-muted rounded">alt</code> tag.
        When GenericEmbedded encounters an event with an alt tag, it displays the summary prominently:
      </p>

      <div class="space-y-4">
        <div>
          <div class="text-sm font-semibold mb-2">Event with alt tag:</div>
          <div class="p-3 bg-muted rounded text-xs font-mono space-y-1">
            <div>{`{`}</div>
            <div>  "kind": 9999,</div>
            <div>  "content": "...",</div>
            <div>  "tags": [</div>
            <div>    ["alt", "This is a custom video sharing event"]</div>
            <div>  ]</div>
            <div>{`}`}</div>
          </div>
        </div>

        <div class="p-4 bg-primary/10 border border-primary/20 rounded">
          <p class="text-sm">
            <strong>Result:</strong> The alt text "This is a custom video sharing event" is displayed
            prominently with a colored border, followed by the event author and timestamp.
            This helps users understand what the event is about, even if their client doesn't
            support kind 9999.
          </p>
        </div>
      </div>
    </div>
  </section>

  <!-- NIP-89 App Discovery -->
  <section class="mb-12">
    <h2 class="text-3xl font-bold mb-4">NIP-89: App Discovery</h2>
    <div class="p-6 border border-border rounded-lg bg-card">
      <p class="text-sm text-muted-foreground mb-4">
        NIP-89 enables automatic discovery of applications that can handle unknown event kinds.
        When GenericEmbedded renders an event, it automatically:
      </p>

      <div class="space-y-4">
        <div class="p-4 bg-muted rounded">
          <div class="text-sm font-semibold mb-2">Step 1: Query for Recommendations</div>
          <p class="text-xs text-muted-foreground">
            Searches for kind 31989 events with a <code class="px-1 py-0.5 bg-card rounded">d</code> tag
            matching the event's kind number. These events contain recommendations from users about
            which apps can handle this type of content.
          </p>
        </div>

        <div class="p-4 bg-muted rounded">
          <div class="text-sm font-semibold mb-2">Step 2: Fetch Handler Information</div>
          <p class="text-xs text-muted-foreground">
            Retrieves kind 31990 events referenced by the recommendations. These events contain
            app metadata (name, description, icon) and platform-specific URL handlers.
          </p>
        </div>

        <div class="p-4 bg-muted rounded">
          <div class="text-sm font-semibold mb-2">Step 3: Display Compatible Apps</div>
          <p class="text-xs text-muted-foreground">
            Shows a list of discovered apps with clickable platform badges (Web, iOS, Android).
            Each link opens the event in the respective app using the handler's URL template.
          </p>
        </div>
      </div>

      <div class="mt-6 p-4 bg-primary/10 border border-primary/20 rounded">
        <p class="text-sm">
          <strong>User Benefit:</strong> When encountering an unknown event kind, users can immediately
          see which apps support it and open the event in their preferred app with one click—without
          needing to manually search for compatible clients.
        </p>
      </div>
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
            src/lib/ndk/event/content/kinds/my-kind-embedded/my-kind-embedded.svelte
          </code>
        </div>

        <div>
          <div class="text-sm font-semibold mb-2">2. Create index.ts and register the handler</div>
          <div class="p-3 bg-muted rounded text-xs font-mono space-y-1">
            <div>import MyKindEmbedded from './my-kind-embedded.svelte';</div>
            <div>import {`{ defaultContentRenderer }`} from '$lib/registry/ui';</div>
            <div class="h-2"></div>
            <div>defaultContentRenderer.addKind([9999], MyKindEmbedded);</div>
            <div class="h-2"></div>
            <div>export {`{ MyKindEmbedded }`};</div>
          </div>
        </div>

        <div>
          <div class="text-sm font-semibold mb-2">3. Import in embedded-handlers.ts</div>
          <div class="p-3 bg-muted rounded text-xs font-mono">
            import './kinds/my-kind-embedded';
          </div>
        </div>

        <p class="text-sm text-muted-foreground">
          <a href="/components/previews/introduction" class="text-primary hover:underline">
            See the Embedded Previews introduction for detailed instructions →
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
