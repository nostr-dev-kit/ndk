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

<div class="border border-gray-200 rounded-xl overflow-hidden bg-white max-w-md">
  <User.Root {ndk} pubkey={userPubkey}>
    <div class="relative h-[120px]">
      <User.Banner class="w-full h-full object-cover" />
      <User.Avatar class="absolute -bottom-10 left-6 border-4 border-white rounded-full w-20 h-20" />
    </div>
    <div class="pt-12 px-6 pb-6">
      <User.Name class="text-xl font-bold mb-1 text-gray-900" />
      <User.Handle class="text-sm text-gray-500 mb-2" />
      <User.Nip05 class="text-sm text-emerald-500 mb-3" />
      <User.Bio class="text-[15px] leading-normal text-gray-600" />
    </div>
  </User.Root>
</div>
