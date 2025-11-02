<script lang="ts">
  import { EmojiPicker, type EmojiData } from '$lib/registry/components/emoji-picker';

  const emojis: EmojiData[] = [
    { emoji: '❤️' },
    { emoji: '👍' },
    { emoji: '🔥' },
    { emoji: '💯' },
    { emoji: '😂' },
    { emoji: '🎉' },
    { emoji: '🚀' },
    { emoji: '⚡' },
    { emoji: '🌟' },
    { emoji: '💜' },
    { emoji: '🙏' },
    { emoji: '✨' },
  ];

  function handleSelect(emoji: EmojiData) {
    alert(`Selected: ${emoji.emoji}`);
  }
</script>

<EmojiPicker.List {emojis} onSelect={handleSelect} columns={6} />
