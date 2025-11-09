<script lang="ts">
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import { createReactionAction } from '../../../../builders/reaction-action/index.svelte.js';
  import { Tooltip } from 'bits-ui';
  import AvatarGroup from '../../../avatar-group/avatar-group.svelte';
  import { Reaction } from '../../../../ui/reaction';
  import { cn } from '../../../../utils/cn.js';

  interface Props {
    ndk: NDKSvelte;
    event: NDKEvent;
    variant?: 'horizontal' | 'vertical';
    showAvatars?: boolean;
    delayed?: number;
    class?: string;
  }

  let {
    ndk,
    event,
    variant = 'horizontal',
    showAvatars = true,
    delayed,
    class: className = ''
  }: Props = $props();

  const reactionState = createReactionAction(() => ({ event, delayed }), ndk);

  async function reactWith(emoji: string) {
    await reactionState.react(emoji);
  }
</script>

<div
  data-reaction-button-slack=""
  data-variant={variant}
  class={cn(
    'flex',
    variant === 'vertical' ? 'flex-col gap-1.5' : 'flex-row flex-wrap gap-2',
    className
  )}
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
              class={cn(
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full',
                'border transition-all hover:scale-105',
                reaction.hasReacted
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border bg-background hover:bg-accent'
              )}
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
        class={cn(
          'inline-flex items-center gap-2 px-3 py-1.5 rounded-lg',
          'transition-colors cursor-pointer',
          reaction.hasReacted
            ? 'bg-primary/10 text-primary'
            : 'bg-background hover:bg-accent'
        )}
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
        />
      </button>
    {/each}
  {:else}
    <!-- No avatars -->
    {#each reactionState.all as reaction (reaction.emoji)}
      <button
        data-reaction-item=""
        data-reacted={reaction.hasReacted || undefined}
        class={cn(
          'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full',
          'border transition-all hover:scale-105',
          reaction.hasReacted
            ? 'border-primary bg-primary/10 text-primary'
            : 'border-border bg-background hover:bg-accent'
        )}
        onclick={() => reactWith(reaction.emoji)}
      >
        <Reaction.Display emoji={reaction.emoji} url={reaction.url} shortcode={reaction.shortcode} class="text-lg w-[18px] h-[18px]" />
        <span class="text-sm font-medium">{reaction.count}</span>
      </button>
    {/each}
  {/if}
</div>
