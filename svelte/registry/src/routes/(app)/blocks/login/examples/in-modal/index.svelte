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
  import LoginCompact from '$lib/registry/blocks/login-compact.svelte';
  import { ndk } from '$lib/site/ndk.svelte';

  let showLoginModal = $state(false);

  function handleSuccess() {
    showLoginModal = false;
    console.log('Login successful!');
  }
</script>

{#if showLoginModal}
  <div class="modal-backdrop" onclick={() => showLoginModal = false} onkeydown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      showLoginModal = false;
    }
  }} role="button" tabindex="0">
    <div onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.stopPropagation()} role="presentation">
      <LoginCompact {ndk} onSuccess={handleSuccess} />
    </div>
  </div>
{/if}
