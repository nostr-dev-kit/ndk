<!-- @ndk-version: reaction-emoji-button@0.1.0 -->
<!--
  @component ReactionEmojiButton
  Reaction button with emoji picker popover using bits-ui.
  By default uses ReactionButton as trigger, but allows custom trigger via children.

  @example Default trigger (ReactionButton)
  ```svelte
  <ReactionEmojiButton {ndk} {event} />
  <ReactionEmojiButton {ndk} {event} emoji="🔥" />
  ```

  @example Custom trigger
  ```svelte
  <ReactionEmojiButton {ndk} {event}>
    <button>Pick an emoji</button>
  </ReactionEmojiButton>
  ```
-->
<script lang="ts">
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte, EmojiData } from '@nostr-dev-kit/svelte';
  import { createReactionAction } from '@nostr-dev-kit/svelte';
  import { getContext, type Snippet } from 'svelte';
  import { Popover } from 'bits-ui';
  import { EmojiPicker } from '../emoji-picker';
  import ReactionButton from './reaction-button.svelte';

  interface Props {
    ndk?: NDKSvelte;
    event: NDKEvent;
    emoji?: string;
    showCount?: boolean;
    delayed?: number;
    class?: string;
    children?: Snippet;
  }

  let {
    ndk: ndkProp,
    event,
    emoji = '❤️',
    showCount = true,
    delayed,
    class: className = '',
    children
  }: Props = $props();

  const ndkContext = getContext<NDKSvelte>('ndk');
  const ndk = $derived(ndkProp || ndkContext);

  const reactionState = $derived.by(() => {
    if (!ndk) return null;
    return createReactionAction(() => ({ event, delayed }), ndk);
  });

  let showPicker = $state(false);

  async function handleEmojiSelect(emojiData: EmojiData) {
    if (!ndk?.$currentPubkey || !reactionState) return;
    try {
      await reactionState.react(emojiData);
      showPicker = false;
    } catch (error) {
      console.error('Failed to react:', error);
    }
  }

  function handleMouseEnter() {
    showPicker = true;
  }

  function handleMouseLeave() {
    showPicker = false;
  }
</script>

<Popover.Root bind:open={showPicker}>
  <Popover.Trigger>
    {#snippet child({ props })}
      {#if children}
        <div {...props} onmouseenter={handleMouseEnter} onmouseleave={handleMouseLeave}>
          {@render children()}
        </div>
      {:else}
        <div {...props} onmouseenter={handleMouseEnter} onmouseleave={handleMouseLeave}>
          <ReactionButton {ndk} {event} {emoji} {showCount} {delayed} class={className} />
        </div>
      {/if}
    {/snippet}
  </Popover.Trigger>

  {#if ndk}
    <Popover.Content
      class="z-50 w-80 max-h-96 overflow-y-auto rounded-lg border bg-card p-4 shadow-md outline-none"
      sideOffset={8}
      onmouseenter={handleMouseEnter}
      onmouseleave={handleMouseLeave}
    >
      <EmojiPicker.Content
        {ndk}
        onSelect={handleEmojiSelect}
      />
    </Popover.Content>
  {/if}
</Popover.Root>
