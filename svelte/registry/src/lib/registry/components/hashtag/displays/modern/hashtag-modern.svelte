<script lang="ts">
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { cn } from '../../utils/cn.js';
  import { hashtagGradient, formatHashtag } from '../../utils/hashtag.js';
  import HashtagCardCompact from '../hashtag-card-compact/hashtag-card-compact.svelte';
  import { Popover } from 'bits-ui';

  interface Props {
    ndk: NDKSvelte;

    tag: string;

    onclick?: (tag: string) => void;

    class?: string;
  }

  let {
    ndk,
    tag,
    onclick,
    class: className = ''
  }: Props = $props();

  const formattedHashtag = $derived(formatHashtag(tag));
  const gradient = $derived(hashtagGradient(tag));

  let open = $state(false);
  let hoverTimeout: ReturnType<typeof setTimeout> | null = null;

  function handleMouseEnter() {
    if (hoverTimeout) clearTimeout(hoverTimeout);
    hoverTimeout = setTimeout(() => {
      open = true;
    }, 200);
  }

  function handleMouseLeave() {
    if (hoverTimeout) clearTimeout(hoverTimeout);
    hoverTimeout = setTimeout(() => {
      open = false;
    }, 150);
  }

  function handleClick() {
    if (onclick) {
      onclick(tag);
    }
  }
</script>

<Popover.Root bind:open>
  <Popover.Trigger
    class="inline-flex items-center"
    onmouseenter={handleMouseEnter}
    onmouseleave={handleMouseLeave}
  >
    <span
      data-hashtag-modern=""
    class={cn(
        'inline-flex items-center gap-1 text-primary hover:underline cursor-pointer transition-all',
        className
      )}
      onclick={handleClick}
      onkeydown={(e) => e.key === 'Enter' && handleClick()}
      role="button"
      tabindex="0"
    >
      <span
        class="w-2 h-2 rounded-full"
        style="background: {gradient}"
      ></span>
      <span>{formattedHashtag}</span>
    </span>
  </Popover.Trigger>
  <Popover.Content
    class="z-50"
    sideOffset={8}
    onmouseenter={handleMouseEnter}
    onmouseleave={handleMouseLeave}
  >
    <HashtagCardCompact {ndk} hashtag={tag} />
  </Popover.Content>
</Popover.Root>
