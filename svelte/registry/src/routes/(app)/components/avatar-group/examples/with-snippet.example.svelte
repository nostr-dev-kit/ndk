<script lang="ts">
  import { AvatarGroup } from '$lib/registry/components/article/cards/basic/index.ts';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';

  interface Props {
    ndk: NDKSvelte;
    pubkeys: string[];
  }

  let { ndk, pubkeys }: Props = $props();
</script>

<AvatarGroup {ndk} {pubkeys} max={4}>
  {#snippet overflowSnippet(count)}
    <div class="custom-overflow">
      <span class="overflow-badge">+{count}</span>
      <span class="overflow-label">more</span>
    </div>
  {/snippet}
</AvatarGroup>

<style>
  .custom-overflow {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-left: 8px;
  }

  .overflow-badge {
    font-weight: 700;
    font-size: 16px;
    color: var(--primary);
  }

  .overflow-label {
    font-size: 14px;
    color: var(--muted-foreground);
  }
</style>
