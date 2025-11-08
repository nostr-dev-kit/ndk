<script lang="ts">
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { cn } from '$lib/registry/utils/cn';
  import { User } from '../../../ui/user';
  import FollowButton from '../follow-button/follow-button.svelte';

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
</script>

<User.Root {ndk} {pubkey}>
  <div data-user-card-compact="" class={cn(
    'flex items-center gap-3 p-3 rounded-lg transition-colors hover:bg-muted w-full',
    className
  )}>
    <User.Avatar />
    <div class="flex-1 min-w-0 flex flex-col gap-0.5">
      <User.Name class="text-base truncate" />
      <User.Field field="name" class="text-xs text-foreground/50" />
    </div>
    <FollowButton {ndk} target={user} class="shrink-0" />
  </div>
</User.Root>
