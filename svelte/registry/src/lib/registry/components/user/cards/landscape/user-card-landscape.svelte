<script lang="ts">
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { cn } from '$lib/registry/utils/cn';
  import { User } from '$lib/registry/ui/user';
  import FollowButtonPill from '$lib/registry/components/follow/buttons/pill/follow-button-pill.svelte';

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
  <div data-user-card-landscape="" class={cn(
    'flex gap-4 p-6 bg-card border border-border rounded-xl min-w-96',
    className
  )}>
    <User.Avatar class="w-16 h-16 rounded-md" />
    <div class="flex-1 flex flex-col gap-3 min-w-0">
      <div class="flex items-start gap-4">
        <div class="flex flex-col gap-1 items-start flex-1 min-w-0">
          <User.Name field="displayName" />
          <User.Nip05 class="text-muted-foreground" />
        </div>
        <FollowButtonPill {ndk} target={user} variant="solid" class="shrink-0" />
      </div>
      <User.Field field="about" class="text-muted-foreground text-sm leading-relaxed line-clamp-2" />
    </div>
  </div>
</User.Root>
