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
  import { Reaction } from '$lib/registry/ui/reaction';
</script>

<div class="reaction-demo">
  <div class="emoji-row">
    <Reaction.Display emoji="❤️" class="text-2xl" />
    <Reaction.Display emoji="🔥" class="text-2xl" />
    <Reaction.Display emoji="👍" class="text-2xl" />
    <Reaction.Display emoji="🚀" class="text-2xl" />
    <Reaction.Display emoji="💯" class="text-2xl" />
  </div>

  <div class="size-demo">
    <span>Different sizes:</span>
    <Reaction.Display emoji="💜" class="text-base" />
    <Reaction.Display emoji="💜" />
    <Reaction.Display emoji="💜" class="text-2xl" />
    <Reaction.Display emoji="💜" class="text-3xl" />
  </div>
</div>

<style>
  .reaction-demo {
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    padding: 1.5rem;
    background: white;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .emoji-row {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .size-demo {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .size-demo span {
    font-size: 0.875rem;
    color: #6b7280;
    margin-right: 0.5rem;
  }
</style>
