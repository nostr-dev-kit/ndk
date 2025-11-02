<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { EmojiPicker, type EmojiData } from '$lib/registry/ui';

  const ndk = getContext<NDKSvelte>('ndk');

  let selectedEmoji = $state<string>('');

  function handleSelect(emoji: EmojiData) {
    selectedEmoji = emoji.emoji;
  }
</script>

<div class="emoji-picker-demo">
  <div class="selected-display">
    {#if selectedEmoji}
      <span class="selected-emoji">{selectedEmoji}</span>
      <span class="selected-label">Selected</span>
    {:else}
      <span class="placeholder">Click an emoji</span>
    {/if}
  </div>

  <EmojiPicker.Content {ndk} onSelect={handleSelect} class="emoji-grid" />
</div>

<style>
  .emoji-picker-demo {
    border: 1px solid #e5e7eb;
    border-radius: 0.75rem;
    padding: 1.5rem;
    background: white;
  }

  .selected-display {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
    padding: 1rem;
    background: #f9fafb;
    border-radius: 0.5rem;
  }

  .selected-emoji {
    font-size: 2rem;
  }

  .selected-label {
    font-size: 0.875rem;
    color: #6b7280;
  }

  .placeholder {
    font-size: 0.875rem;
    color: #9ca3af;
  }

  .emoji-picker-demo :global(.emoji-grid) {
    max-height: 300px;
    overflow-y: auto;
  }
</style>
