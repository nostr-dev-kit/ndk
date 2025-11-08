<script lang="ts">
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import type { EmojiData } from './createEmojiPicker.svelte.js';
  import { createEmojiPicker } from './createEmojiPicker.svelte.js';
  import { cn } from '../../utils/cn';
  import { getNDKFromContext } from '../../utils/ndk-context.svelte.js';
  import List from './emoji-picker-list.svelte';

  interface Props {
    ndk?: NDKSvelte;

    onSelect: (emoji: EmojiData) => void;

    defaults?: EmojiData[];

    columns?: number;

    class?: string;
  }

  let { ndk: providedNdk, onSelect, defaults, columns = 6, class: className = '' }: Props = $props();

  const ndk = getNDKFromContext(providedNdk);

  // Hardcoded defaults - same as original emoji picker
  const hardcodedDefaults: EmojiData[] = [
    { emoji: '❤️' },
    { emoji: '👍' },
    { emoji: '😂' },
    { emoji: '🔥' },
    { emoji: '🚀' },
    { emoji: '🎉' },
    { emoji: '👏' },
    { emoji: '💯' },
    { emoji: '🤔' },
    { emoji: '😍' },
    { emoji: '🙏' },
    { emoji: '💜' },
  ];

  // Use builder with closure pattern
  const emojiState = createEmojiPicker(() => ({
    defaults: defaults ?? hardcodedDefaults,
    from: ndk.$follows
  }), ndk);

  // Helper to create unique key for emoji (matching createEmojiPicker logic)
  const getEmojiKey = (emoji: EmojiData): string => {
    return emoji.url ? emoji.url : emoji.emoji;
  };

  // Split emojis into user's and defaults
  const userEmojis = $derived.by((): EmojiData[] => {
    const allEmojis = emojiState.emojis;
    const defaultSet = new Set((defaults ?? hardcodedDefaults).map(e => e.emoji));
    return allEmojis.filter(e => !defaultSet.has(e.emoji));
  });

  const defaultEmojis = $derived.by((): EmojiData[] => {
    const allEmojis = emojiState.emojis;
    const defaultSet = new Set((defaults ?? hardcodedDefaults).map(e => e.emoji));
    return allEmojis.filter(e => defaultSet.has(e.emoji));
  });

  // Responsive columns
  let isMobile = $state(false);
  $effect(() => {
    const mediaQuery = window.matchMedia('(max-width: 640px)');
    isMobile = mediaQuery.matches;
    const handler = (e: MediaQueryListEvent) => {
      isMobile = e.matches;
    };
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  });

  const effectiveColumns = $derived(isMobile ? 5 : columns);
</script>

<div data-emoji-picker-content="" class={cn('h-64 sm:h-80 overflow-y-auto w-full max-w-full', className)}>
  {#if userEmojis.length > 0}
    <div class="mb-6 last:mb-0">
      <div class="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Your Emojis</div>
      <List emojis={userEmojis} {onSelect} columns={effectiveColumns} />
    </div>
  {/if}

  <div class="mb-6 last:mb-0">
    <div class="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Standard</div>
    <List emojis={defaultEmojis} {onSelect} columns={effectiveColumns} />
  </div>
</div>
