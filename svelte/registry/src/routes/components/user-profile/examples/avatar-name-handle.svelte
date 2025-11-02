<script lang="ts">
  import { User } from '$lib/registry/ui/user';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';

  interface Props {
    ndk: NDKSvelte;
    pubkey: string;
  }

  let { ndk, pubkey }: Props = $props();
</script>

<User.Root {ndk} {pubkey} showHoverCard={true}>
  <div class="flex items-center gap-3">
    <User.Avatar size={40} />
    <div class="flex flex-col">
      <User.Name class="font-semibold" />
      <User.Handle class="text-sm text-muted-foreground" />
    </div>
  </div>
</User.Root>
