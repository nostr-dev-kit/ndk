<script lang="ts">
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { User } from '$lib/registry/ui/user';

  interface Props {
    ndk: NDKSvelte;
    userPubkey: string;
  }

  let { ndk, userPubkey }: Props = $props();
</script>

<User.Root {ndk} pubkey={userPubkey}>
  <User.Avatar class="rounded-full" />
  <User.Name class="font-semibold" />
  <User.Handle class="text-sm text-gray-500" />
</User.Root>

<style>
  /* Add your custom styles */
</style>
