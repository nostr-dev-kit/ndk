<script lang="ts">
  import type { NDKSvelte, EmojiData } from '@nostr-dev-kit/svelte';
  import { EmojiPicker } from '$lib/registry/ui/emoji-picker';
  import { Popover } from 'bits-ui';

  interface Props {
    ndk: NDKSvelte;
  }

  let { ndk }: Props = $props();
  let selected = $state<EmojiData | null>(null);
  let open = $state(false);

  function handleSelect(emoji: EmojiData) {
    selected = emoji;
    open = false;
  }
</script>

<div class="space-y-4">
  <Popover.Root bind:open>
    <Popover.Trigger>
      {#snippet child({ props })}
        <button
          {...props}
          class="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
        >
          <span>Pick Emoji</span>
          {#if selected}
            {#if selected.url}
              <img src={selected.url} alt={selected.shortcode} class="w-5 h-5 object-contain" />
            {:else}
              <span>{selected.emoji}</span>
            {/if}
          {/if}
        </button>
      {/snippet}
    </Popover.Trigger>

    <Popover.Content
      class="z-50 w-80 max-w-[calc(100vw-2rem)] max-h-[40vh] overflow-y-auto rounded-lg border bg-card p-4 shadow-md outline-none"
      sideOffset={8}
    >
      <EmojiPicker.Content {ndk} onSelect={handleSelect} />
    </Popover.Content>
  </Popover.Root>

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
