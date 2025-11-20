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

<User.Root {ndk} pubkey={userPubkey} class="flex flex-col gap-4">
  <div class="flex items-center gap-3">
    <User.Avatar class="w-12 h-12 rounded-full" />
    <div class="flex flex-col">
      <User.Name class="font-semibold" />
      <User.Nip05 class="text-sm text-muted-foreground">
        {#snippet verificationSnippet({ status, isVerifying })}
          {#if isVerifying}
            <span class="ml-1 text-xs text-blue-500">VERIFYING...</span>
          {:else if status === true}
            <span class="ml-1 text-xs text-green-500">VERIFIED</span>
          {:else if status === false}
            <span class="ml-1 text-xs text-red-500">NOT VERIFIED</span>
          {/if}
        {/snippet}
      </User.Nip05>
    </div>
  </div>
</User.Root>
