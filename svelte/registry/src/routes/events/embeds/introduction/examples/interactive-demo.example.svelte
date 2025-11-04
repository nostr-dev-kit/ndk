<script lang="ts">
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { EmbeddedEvent } from '$lib/registry/ui';

  interface Props {
    ndk: NDKSvelte;
  }

  let { ndk }: Props = $props();

  let bech32Input = $state('');
  let selectedVariant = $state<'inline' | 'card' | 'compact'>('card');

  // Example bech32 strings for quick testing
  const examples = [
    { label: 'Note', value: 'note1testnotebech32' },
    { label: 'Article', value: 'naddr1testarticlebech32' },
    { label: 'Highlight', value: 'nevent1testhighlightbech32' },
  ];
</script>

<div class="space-y-4">
  <!-- Input Section -->
  <div class="space-y-3">
    <div>
      <label for="bech32-input" class="block text-sm font-medium mb-2">
        Event Reference (bech32)
      </label>
      <input
        id="bech32-input"
        type="text"
        bind:value={bech32Input}
        placeholder="note1... or nevent1... or naddr1..."
        class="w-full px-4 py-2 border border-border rounded-lg bg-card focus:outline-none focus:ring-2 focus:ring-primary"
      />
    </div>

    <!-- Quick Examples -->
    <div class="flex gap-2 flex-wrap">
      <span class="text-sm text-muted-foreground">Quick examples:</span>
      {#each examples as example (example.value)}
        <button
          type="button"
          onclick={() => bech32Input = example.value}
          class="text-xs px-3 py-1 border border-border rounded-full hover:bg-accent transition-colors"
        >
          {example.label}
        </button>
      {/each}
    </div>

    <!-- Variant Selector -->
    <div>
      <label class="block text-sm font-medium mb-2">Variant</label>
      <div class="flex gap-2">
        {#each ['card', 'inline', 'compact'] as variant (variant)}
          <button
            type="button"
            onclick={() => selectedVariant = variant as any}
            class="px-4 py-2 rounded-lg border transition-colors {selectedVariant === variant ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:bg-accent'}"
          >
            {variant}
          </button>
        {/each}
      </div>
    </div>
  </div>

  <!-- Preview Section -->
  {#if bech32Input}
    <div class="p-6 border border-border rounded-lg bg-muted/30">
      <div class="text-sm font-medium mb-4 text-muted-foreground">Preview:</div>
      <EmbeddedEvent {ndk} bech32={bech32Input} variant={selectedVariant} />
    </div>
  {:else}
    <div class="p-12 border border-dashed border-border rounded-lg bg-muted/20 text-center">
      <p class="text-sm text-muted-foreground">
        Enter a bech32 event reference above to see the preview
      </p>
    </div>
  {/if}
</div>
