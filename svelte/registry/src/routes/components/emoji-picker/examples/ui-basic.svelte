<script lang="ts">
  import { EmojiPicker, type EmojiData } from '$lib/registry/ui/emoji-picker';

  const emojis: EmojiData[] = [
    { emoji: '❤️' },
    { emoji: '👍' },
    { emoji: '😂' },
    { emoji: '🔥' },
    { emoji: '🚀' },
    { emoji: '🎉' },
  ];

  let selected = $state<EmojiData | null>(null);

  function handleSelect(emoji: EmojiData) {
    selected = emoji;
  }
</script>

<div class="space-y-4">
  <div class="max-w-xs">
    <EmojiPicker.List {emojis} onSelect={handleSelect} columns={6} />
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
