<script lang="ts">
  import { User } from '$lib/registry/ui/user';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';

  interface Props {
    ndk: NDKSvelte;
    pubkey: string;
  }

  let { ndk, pubkey }: Props = $props();
</script>

<User.Root {ndk} {pubkey}>
  <div class="flex flex-col gap-4 max-w-md">
    <div class="flex items-center gap-3">
      <User.Avatar size={64} />
      <div class="flex-1 min-w-0">
        <User.Name class="font-bold text-lg" />
        <User.Handle class="text-sm text-muted-foreground" />
      </div>
    </div>
    <User.Bio maxLines={3} />
  </div>
</User.Root>
