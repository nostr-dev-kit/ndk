<script lang="ts">
  import type { NDKSvelte, EmojiData } from '@nostr-dev-kit/svelte';
  import { EmojiPicker } from '$lib/components/ndk/emoji-picker';

  interface Props {
    ndk: NDKSvelte;
  }

  let { ndk }: Props = $props();
  let selected = $state<string>('');

  function handleSelect(emoji: EmojiData) {
    selected = emoji.emoji || emoji.shortcode || '';
  }
</script>

<div class="space-y-4">
  <div class="p-4 border rounded-lg bg-card max-w-md">
    <EmojiPicker.Content {ndk} onSelect={handleSelect} />
  </div>

  {#if selected}
    <p class="text-sm text-muted-foreground">
      You selected: <span class="text-lg">{selected}</span>
    </p>
  {/if}
</div>
