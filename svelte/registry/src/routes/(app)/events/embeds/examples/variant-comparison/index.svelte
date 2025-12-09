<!--
  IMPORTANT: Keep this file in sync with index.txt

  Rules for maintaining sync between index.svelte and index.txt:
  1. Both files must demonstrate the SAME functionality
  2. index.svelte = Full implementation (with TypeScript interfaces, all imports, complete styling)
  3. index.txt = Simplified documentation version with these changes:
     - Remove TypeScript interface definitions
     - Use inline prop destructuring: let { ndk } = $props();
     - Keep only essential imports (remove type imports unless needed)
     - Keep inline classes (class="...") but remove <style> blocks
     - Focus on showing component API usage, not implementation details
     - Keep the core component usage identical between both files

  When you modify this file, you MUST update index.txt to reflect the same changes
  following the simplification rules above.
-->
<script lang="ts">
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { NDKEvent, NDKKind } from '@nostr-dev-kit/ndk';
  import EmbeddedEvent from '$lib/registry/ui/embedded-event.svelte';

  interface Props {
    ndk: NDKSvelte;
  }

  let { ndk }: Props = $props();

  // Create example event with embedded reference
  const exampleContent = `Check out this embedded note:

nostr:nevent1qqstnye37cpucx6zcjqfj25c2htufvhw5suqj3542dxgguzt9l3dppcujac6k`;

  const exampleEvent = new NDKEvent(ndk, {
    kind: NDKKind.Text,
    content: exampleContent,
    pubkey: 'fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52',
    created_at: Math.floor(Date.now() / 1000),
    tags: []
  } as any);

  const sampleBech32 = 'nevent1qqstnye37cpucx6zcjqfj25c2htufvhw5suqj3542dxgguzt9l3dppcujac6k';
</script>

<div class="space-y-8">
  <!-- Card Variant -->
  <div>
    <div class="flex items-center gap-2 mb-3">
      <h4 class="text-lg font-semibold">Card</h4>
      <span class="text-xs px-2 py-1 bg-muted rounded">default</span>
    </div>
    <p class="text-sm text-muted-foreground mb-4">
      Full-width display with maximum detail. Best for feeds and standalone views.
    </p>
    <div class="p-4 border border-border rounded-lg bg-card">
      <EmbeddedEvent {ndk} bech32={sampleBech32} />
    </div>
  </div>

  <!-- Inline Variant -->
  <div>
    <div class="flex items-center gap-2 mb-3">
      <h4 class="text-lg font-semibold">Inline</h4>
    </div>
    <p class="text-sm text-muted-foreground mb-4">
      Constrained width for inline display. Best for embedded within paragraphs or flowing content.
    </p>
    <div class="p-4 border border-border rounded-lg bg-card">
      <EmbeddedEvent {ndk} bech32={sampleBech32} />
    </div>
  </div>

  <!-- Compact Variant -->
  <div>
    <div class="flex items-center gap-2 mb-3">
      <h4 class="text-lg font-semibold">Compact</h4>
    </div>
    <p class="text-sm text-muted-foreground mb-4">
      Minimal display with truncated content. Best for dense layouts like sidebars or lists.
    </p>
    <div class="p-4 border border-border rounded-lg bg-card">
      <EmbeddedEvent {ndk} bech32={sampleBech32} />
    </div>
  </div>
</div>
