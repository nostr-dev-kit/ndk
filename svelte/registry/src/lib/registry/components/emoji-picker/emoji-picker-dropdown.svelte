<script lang="ts">
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import type { EmojiData } from './createEmojiPicker.svelte.js';
  import { DropdownMenu } from 'bits-ui';
  import EmojiPickerContent from './emoji-picker-content.svelte';
  import type { Snippet } from 'svelte';

  interface Props {
    ndk?: NDKSvelte;
    onEmojiSelect: (emoji: string) => void;
    open?: boolean;
    align?: 'start' | 'center' | 'end';
    sideOffset?: number;
    defaults?: EmojiData[];
    columns?: number;
    children: Snippet;
  }

  let {
    ndk,
    onEmojiSelect,
    open = $bindable(false),
    align = 'start',
    sideOffset = 4,
    defaults,
    columns = 6,
    children
  }: Props = $props();

  function handleEmojiSelect(emojiData: EmojiData) {
    onEmojiSelect(emojiData.emoji);
    open = false;
  }
</script>

<DropdownMenu.Root bind:open>
  <DropdownMenu.Trigger data-emoji-picker-dropdown-trigger="">
    {@render children()}
  </DropdownMenu.Trigger>
  <DropdownMenu.Content
    class="z-50 overflow-hidden rounded-md border border-border bg-popover p-3 text-popover-foreground shadow-md"
    {align}
    {sideOffset}
  >
    <EmojiPickerContent {ndk} onSelect={handleEmojiSelect} {defaults} {columns} />
  </DropdownMenu.Content>
</DropdownMenu.Root>
