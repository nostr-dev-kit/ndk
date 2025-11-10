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
  import { ndk } from '$lib/site/ndk.svelte';
  import type { NDKPrivateKeySigner } from '@nostr-dev-kit/ndk';

  let showModal = $state(false);

  function handleSignupSuccess(signer: NDKPrivateKeySigner) {
    console.log('Profile created!');
    showModal = false;
    // Login with the new signer
    ndk.$sessions?.login(signer);
  }
</script>

<button onclick={() => showModal = true}>Create Account</button>

{#if showModal}
  <div class="modal-overlay" onclick={() => showModal = false} onkeydown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      showModal = false;
    }
  }} role="button" tabindex="0">
    <div class="modal-content" onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.stopPropagation()} role="presentation">
      <SignupBlock {ndk} onSuccess={handleSignupSuccess} />
    </div>
  </div>
{/if}

<style>
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 50;
  }

  .modal-content {
    max-width: 90vw;
    max-height: 90vh;
    overflow: auto;
    border-radius: 1rem;
  }
</style>
