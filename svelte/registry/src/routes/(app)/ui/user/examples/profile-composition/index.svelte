<!--
  IMPORTANT: Keep this file in sync with index.txt

  Rules for maintaining sync between index.svelte and index.txt:
  1. Both files must demonstrate the SAME functionality
  2. index.svelte = Full implementation (with TypeScript interfaces, all imports, complete styling)
  3. index.txt = Simplified documentation version with these changes:
     - Remove TypeScript interface definitions
     - Use inline prop destructuring: let { ndk, userPubkey } = $props();
     - Keep only essential imports (remove type imports unless needed)
     - Keep inline classes (class="...") but remove <style> blocks
     - Focus on showing component API usage, not implementation details
     - Keep the core component usage identical between both files

  When you modify this file, you MUST update index.txt to reflect the same changes
  following the simplification rules above.
-->
<script lang="ts">
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { User } from '$lib/registry/ui/user';

  interface Props {
    ndk: NDKSvelte;
    userPubkey: string;
  }

  let { ndk, userPubkey }: Props = $props();
</script>

<!-- User.Avatar with minimal Root wrapper for standalone usage -->
<User.Root {ndk} pubkey={userPubkey} class="flex items-center gap-3">
  <User.Avatar class="rounded-full w-10 h-10" />
  <div>
    <div class="font-medium">Avatar with Root</div>
    <div class="text-sm text-gray-500">Minimal wrapper for context</div>
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
