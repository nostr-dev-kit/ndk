<!--
  @component Reaction.Display
  Renders emoji reactions - supports both standard emojis and custom NIP-30 emojis.
  Can extract emoji data from NDKEvent (kind:7) or accept direct props.

  @example Standard emoji
  ```svelte
  <Reaction.Display emoji="❤️" />
  ```

  @example Custom emoji with URL
  ```svelte
  <Reaction.Display emoji=":custom:" url="https://example.com/emoji.png" shortcode="custom" />
  ```

  @example From NDKEvent (kind:7)
  ```svelte
  <Reaction.Display event={reactionEvent} />
  ```
-->
<script lang="ts">
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import { cn } from '../../utils/index.js';

  interface Props {
    /** Direct emoji data (Option 1) */
    emoji?: string;
    url?: string;
    shortcode?: string;

    /** NDKEvent kind:7 reaction (Option 2) */
    event?: NDKEvent;

    /** Display size in pixels */
    size?: number;

    /** Additional CSS classes */
    class?: string;
  }

  let { emoji: emojiProp, url: urlProp, shortcode: shortcodeProp, event, size = 20, class: className = '' }: Props = $props();

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
    src={emojiData.url}
    alt={emojiData.shortcode || emojiData.emoji}
    class={cn('inline-block object-contain', className)}
    style="width: {size}px; height: {size}px;"
  />
{:else}
  <span class={cn('inline-block', className)} style="font-size: {size}px; line-height: 1;">
    {emojiData.emoji}
  </span>
{/if}
