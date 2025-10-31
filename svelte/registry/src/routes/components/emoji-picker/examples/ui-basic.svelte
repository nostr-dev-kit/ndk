<script lang="ts">
  import { EmojiPicker, type EmojiData } from '$lib/registry/components/emoji-picker';

  const emojis: EmojiData[] = [
    { emoji: '❤️' },
    { emoji: '👍' },
    { emoji: '😂' },
    { emoji: '🔥' },
    { emoji: '🚀' },
    { emoji: '🎉' },
  ];

  let selected = $state<string>('');

  function handleSelect(emoji: EmojiData) {
    selected = emoji.emoji;
  }
</script>

<div class="space-y-4">
  <EmojiPicker.List {emojis} onSelect={handleSelect} columns={6} />

  {#if selected}
    <p class="text-sm text-muted-foreground">
      You selected: <span class="text-lg">{selected}</span>
    </p>
  {/if}
</div>
