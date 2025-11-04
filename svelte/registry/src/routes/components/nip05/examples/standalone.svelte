<script lang="ts">
  import { User } from '$lib/registry/ui/user';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { NDKUser } from '@nostr-dev-kit/ndk';

  let { ndk, pubkey }: { ndk: NDKSvelte; pubkey: string } = $props();

  const user = $derived(ndk.getUser({ pubkey }));
</script>

<div class="flex flex-col gap-2">
  <div class="text-sm text-muted-foreground">Standalone mode (no User.Root context):</div>
  <User.Nip05 {ndk} {user} showVerified={true} />
</div>
