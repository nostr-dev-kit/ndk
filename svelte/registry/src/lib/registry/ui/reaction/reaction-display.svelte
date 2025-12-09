<script lang="ts">
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import { cn } from '../../utils/cn.js';

  interface Props {
    emoji?: string;
    url?: string;
    shortcode?: string;

    event?: NDKEvent;

    class?: string;
  }

  let { emoji: emojiProp, url: urlProp, shortcode: shortcodeProp, event, class: className = '' }: Props = $props();

  // Extract emoji data from NDKEvent if provided
  const emojiData = $derived.by(() => {
    if (event) {
      const emoji = event.content;
      // Extract NIP-30 custom emoji tag: ["emoji", "<shortcode>", "<image-url>"]
      const emojiTag = event.tags.find(t => t[0] === 'emoji' && t.length >= 3);

      if (emojiTag) {
        return {
          emoji,
          shortcode: emojiTag[1],
          url: emojiTag[2]
        };
      }

      return { emoji, shortcode: undefined, url: undefined };
    }

    // Use direct props
    return {
      emoji: emojiProp || '',
      shortcode: shortcodeProp,
      url: urlProp
    };
  });
</script>

{#if emojiData.url}
  <img
    data-reaction-display=""
    src={emojiData.url}
    alt={emojiData.shortcode || emojiData.emoji}
    class={cn('inline-block object-contain w-5 h-5', className)}
  />
{:else}
  <span data-reaction-display="" class={cn('inline-block leading-none text-xl', className)}>
    {emojiData.emoji}
  </span>
{/if}
