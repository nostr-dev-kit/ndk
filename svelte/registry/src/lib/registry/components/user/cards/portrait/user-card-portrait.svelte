<script lang="ts">
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { cn } from '../../utils/cn.js';
  import { User } from '../../ui/user';
  import FollowButtonPill from '../follow-button-pill/follow-button-pill.svelte';
  import { createUserStats } from '../../builders/user/stats.svelte.js';
  import { getContext } from 'svelte';
  import { USER_CONTEXT_KEY, type UserContext } from '../../ui/user/user.context.js';

  interface Props {
    ndk: NDKSvelte;

    pubkey: string;

    class?: string;
  }

  let {
    ndk,
    pubkey,
    class: className = ''
  }: Props = $props();

  const user = $derived(ndk.getUser({ pubkey }));
  const context = getContext<UserContext>(USER_CONTEXT_KEY);
  const ndkUser = $derived(context.ndkUser);
  const stats = createUserStats(() => ndkUser ? { user: ndkUser, follows: true, recentNotes: true } : undefined, ndk);
</script>

<User.Root {ndk} {pubkey}>

  <div data-user-card-portrait="" class={cn(
    'flex flex-col items-center text-center gap-3 p-6 bg-card border border-border rounded-xl w-80 shrink-0',
    className
  )}>
    <User.Avatar class="w-24 h-24" />
    <div class="flex flex-col items-center gap-1 min-w-0">
      <User.Name field="displayName" class="text-lg font-semibold" />
      <User.Field field="name" class="text-sm text-muted-foreground" />
    </div>
    <User.Field field="about" class="text-muted-foreground text-sm leading-relaxed line-clamp-2" />
    {#if stats.recentNoteCount > 0 || stats.followCount > 0}
      <div class="flex items-center gap-3 text-sm shrink-0">
        {#if stats.recentNoteCount > 0}
          <div class="flex flex-col items-center">
            <span class="font-semibold text-foreground">{stats.recentNoteCount}</span>
            <span class="text-muted-foreground text-xs">recent notes</span>
          </div>
        {/if}
        {#if stats.recentNoteCount > 0 && stats.followCount > 0}
          <div class="text-muted-foreground">•</div>
        {/if}
        {#if stats.followCount > 0}
          <div class="flex flex-col items-center">
            <span class="font-semibold text-foreground">{stats.followCount}</span>
            <span class="text-muted-foreground text-xs">following</span>
          </div>
        {/if}
      </div>
    {/if}
    <FollowButtonPill {ndk} target={user} variant="solid" />
  </div>
</User.Root>
