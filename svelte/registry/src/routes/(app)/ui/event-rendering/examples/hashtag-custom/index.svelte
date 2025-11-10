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
  interface Props {
    tag: string;
    onclick?: (tag: string) => void;
    class?: string;
  }

  let { tag, onclick, class: className = '' }: Props = $props();
</script>

<span class="custom-hashtag {className}" onclick={() => onclick?.(tag)} onkeydown={(e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    onclick?.(tag);
  }
}} role="button" tabindex="0">
  #{tag}
</span>

<style>
  .custom-hashtag {
    color: #8b5cf6;
    font-weight: 600;
    cursor: pointer;
  }

  .custom-hashtag:hover {
    color: #7c3aed;
  }
</style>
