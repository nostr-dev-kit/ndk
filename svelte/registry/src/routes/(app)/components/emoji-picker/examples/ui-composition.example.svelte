<script lang="ts">
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { EmojiPicker, type EmojiData } from '$lib/registry/components/misc/emoji-picker';

  interface Props {
    ndk: NDKSvelte;
  }

  let { ndk }: Props = $props();
  let selected = $state<EmojiData | null>(null);

  function handleSelect(emoji: EmojiData) {
    selected = emoji;
  }
</script>

<div class="space-y-4">
  <div class="p-4 border rounded-lg bg-card max-w-md overflow-y-auto max-h-[40vh]">
    <EmojiPicker.Content {ndk} onSelect={handleSelect} />
  </div>

  {#if selected}
    <div class="flex items-center justify-center">
      {#if selected.url}
        <img src={selected.url} alt={selected.shortcode} class="w-12 h-12 object-contain" />
      {:else}
        <span class="text-5xl">{selected.emoji}</span>
      {/if}
    </div>
  {/if}
</div>
