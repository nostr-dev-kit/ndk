<script lang="ts">
  import { createRepostAction } from '@nostr-dev-kit/svelte';

  const repostState = createRepostAction(() => ({ event }), ndk);
</script>

<div class="flex gap-2 pt-4 border-t border-border">
  <button
    onclick={repostState.repost}
    disabled={repostState.hasReposted}
  >
    🔄 Repost ({repostState.count} times)
  </button>
</div>
