<!--
  IMPORTANT: Keep this file in sync with index.txt

  Rules for maintaining sync between index.svelte and index.txt:
  1. Both files must demonstrate the SAME functionality
  2. index.svelte = Full implementation (with TypeScript interfaces, all imports, complete styling)
  3. index.txt = Simplified documentation version with these changes:
     - Remove TypeScript interface definitions
     - Use inline prop destructuring: let { ndk } = $props();
     - Keep only essential imports (remove type imports unless needed)
     - Keep inline classes (class="...") but remove <style> blocks
     - Focus on showing component API usage, not implementation details
     - Keep the core component usage identical between both files

  When you modify this file, you MUST update index.txt to reflect the same changes
  following the simplification rules above.
-->
<script lang="ts">
  import SignupBlock from '$lib/registry/blocks/signup-block.svelte';
  import { ndk } from '$lib/ndk.svelte';
  import type { NDKPrivateKeySigner } from '@nostr-dev-kit/ndk';

  function handleSignupSuccess(signer: NDKPrivateKeySigner) {
    console.log('Profile created!');
    console.log('nsec:', signer.privateKey);
    // Redirect to app
    goto('/dashboard');
  }
</script>

<SignupBlock {ndk} onSuccess={handleSignupSuccess} />
