<script lang="ts">
  import type { NDKSvelte, EmojiData } from '@nostr-dev-kit/svelte';
  import { EmojiPicker } from '$lib/components/ndk/emoji-picker';
  import { Popover } from 'bits-ui';

  interface Props {
    ndk: NDKSvelte;
  }

  let { ndk }: Props = $props();
  let selected = $state<string>('');
  let open = $state(false);

  function handleSelect(emoji: EmojiData) {
    selected = emoji.emoji || emoji.shortcode || '';
    open = false;
  }
</script>

<div class="space-y-4">
  <Popover.Root bind:open>
    <Popover.Trigger>
      {#snippet child({ props })}
        <button
          {...props}
          class="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          Pick Emoji {selected ? `(${selected})` : ''}
        </button>
      {/snippet}
    </Popover.Trigger>

    <Popover.Content
      class="z-50 w-80 rounded-lg border bg-card p-4 shadow-md outline-none"
      sideOffset={8}
    >
      <EmojiPicker.Content {ndk} onSelect={handleSelect} />
    </Popover.Content>
  </Popover.Root>

  {#if selected}
    <p class="text-sm text-muted-foreground">
      You selected: <span class="text-lg">{selected}</span>
    </p>
  {/if}
</div>
