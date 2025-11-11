<script lang="ts">
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import { createReactionAction } from '../../builders/reaction-action/index.svelte.js';
  import { Tooltip } from 'bits-ui';
  import AvatarGroup from '../avatar-group/avatar-group.svelte';
  import { Reaction } from '../../ui/reaction';
  import { tv } from 'tailwind-variants';

  interface Props {
    ndk: NDKSvelte;
    event: NDKEvent;
    variant?: 'horizontal' | 'vertical';
    showAvatars?: boolean;
    onlyFollows?: boolean;
    delayed?: number;
    class?: string;
  }

  let {
    ndk,
    event,
    variant = 'horizontal',
    showAvatars = true,
    onlyFollows = true,
    delayed,
    class: className = ''
  }: Props = $props();

  const reactionState = createReactionAction(() => ({ event, delayed }), ndk);

  const containerStyles = tv({
    base: 'flex',
    variants: {
      variant: {
        horizontal: 'flex-row flex-wrap gap-2',
        vertical: 'flex-col gap-1.5'
      }
    }
  });

  const buttonStyles = tv({
    base: 'inline-flex items-center cursor-pointer transition-all',
    variants: {
      variant: {
        horizontal: 'gap-1.5 px-3 py-1.5 rounded-full border hover:scale-105',
        vertical: 'gap-2 px-3 py-1.5 rounded-lg transition-colors'
      },
      active: {
        true: 'bg-primary/10 text-primary',
        false: 'bg-background hover:bg-accent'
      }
    },
    compoundVariants: [
      {
        variant: 'horizontal',
        active: true,
        class: 'border-primary'
      },
      {
        variant: 'horizontal',
        active: false,
        class: 'border-border'
      }
    ]
  });

  async function reactWith(emoji: string) {
    await reactionState.react(emoji);
  }
</script>

<div
  data-reaction-button-slack=""
  data-variant={variant}
  class={containerStyles({ variant, class: className })}
>
  {#if showAvatars && variant === 'horizontal'}
    <!-- Horizontal with popover avatars -->
    <Tooltip.Provider delayDuration={100}>
      {#each reactionState.all as reaction (reaction.emoji)}
        <Tooltip.Root>
          <Tooltip.Trigger>
            <button
              data-reaction-item=""
              data-reacted={reaction.hasReacted || undefined}
              class={buttonStyles({ variant: 'horizontal', active: reaction.hasReacted })}
              onclick={() => reactWith(reaction.emoji)}
            >
              <Reaction.Display emoji={reaction.emoji} url={reaction.url} shortcode={reaction.shortcode} class="text-lg w-[18px] h-[18px]" />
              <span class="text-sm font-medium">{reaction.count}</span>
            </button>
          </Tooltip.Trigger>

          <Tooltip.Content
            class="z-50 rounded-lg border border-border bg-popover px-3 py-2 shadow-lg"
          >
            <AvatarGroup
              {ndk}
              pubkeys={reaction.pubkeys}
              max={5}
              size={24}
              spacing="tight"
              {onlyFollows}
            />
          </Tooltip.Content>
        </Tooltip.Root>
      {/each}
    </Tooltip.Provider>
  {:else if showAvatars && variant === 'vertical'}
    <!-- Vertical with inline avatars -->
    {#each reactionState.all as reaction (reaction.emoji)}
      <button
        data-reaction-item=""
        data-reacted={reaction.hasReacted || undefined}
        class={buttonStyles({ variant: 'vertical', active: reaction.hasReacted })}
        onclick={() => reactWith(reaction.emoji)}
      >
        <Reaction.Display emoji={reaction.emoji} url={reaction.url} shortcode={reaction.shortcode} class="text-lg w-[18px] h-[18px]" />
        <span class="text-sm font-medium">{reaction.count}</span>
        <AvatarGroup
          {ndk}
          pubkeys={reaction.pubkeys}
          max={15}
          size={20}
          spacing="tight"
          {onlyFollows}
        />
      </button>
    {/each}
  {:else}
    <!-- No avatars -->
    {#each reactionState.all as reaction (reaction.emoji)}
      <button
        data-reaction-item=""
        data-reacted={reaction.hasReacted || undefined}
        class={buttonStyles({ variant: 'horizontal', active: reaction.hasReacted })}
        onclick={() => reactWith(reaction.emoji)}
      >
        <Reaction.Display emoji={reaction.emoji} url={reaction.url} shortcode={reaction.shortcode} class="text-lg w-[18px] h-[18px]" />
        <span class="text-sm font-medium">{reaction.count}</span>
      </button>
    {/each}
  {/if}
</div>
