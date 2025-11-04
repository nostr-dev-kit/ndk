<script lang="ts">
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { User } from '$lib/registry/ui';

  interface Props {
    ndk: NDKSvelte;
    userPubkey: string;
  }

  let { ndk, userPubkey }: Props = $props();
</script>

<!-- User.Avatar with minimal Root wrapper for standalone usage -->
<User.Root {ndk} pubkey={userPubkey}>
  <div class="flex items-center gap-3">
    <User.Avatar class="rounded-full w-10 h-10" />
    <div>
      <div class="font-medium">Avatar with Root</div>
      <div class="text-sm text-gray-500">Minimal wrapper for context</div>
    </div>
  </div>
</User.Root>

<style>
  .flex {
    display: flex;
  }
  .items-center {
    align-items: center;
  }
  .gap-3 {
    gap: 0.75rem;
  }
  .font-medium {
    font-weight: 500;
  }
  .text-sm {
    font-size: 0.875rem;
  }
  .text-gray-500 {
    color: #6b7280;
  }
</style>
