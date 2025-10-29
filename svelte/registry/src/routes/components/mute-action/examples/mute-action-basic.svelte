<script lang="ts">
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import type { NDKUser } from '@nostr-dev-kit/ndk';
  import MuteAction from '$lib/ndk/actions/mute-action.svelte';

  interface Props {
    ndk: NDKSvelte;
    user: NDKUser;
  }

  let { ndk, user }: Props = $props();
</script>

<div class="bg-card border border-border rounded-xl p-6 flex justify-between items-center">
  <p class="m-0 text-foreground">User: {user.npub.slice(0, 16)}...</p>
  <MuteAction {ndk} target={user} />
</div>
