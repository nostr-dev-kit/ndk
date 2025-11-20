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
    url: string | string[];
    class?: string;
  }

  let { url, class: className = '' }: Props = $props();

  // Normalize to array
  const urls = $derived(Array.isArray(url) ? url : [url]);
</script>

{#each urls as linkUrl, i (i)}
  <a href={linkUrl} class="custom-link {className}" target="_blank" rel="noopener noreferrer">
    {linkUrl}
  </a>
{/each}

<style>
  .custom-link {
    color: #3b82f6;
    text-decoration: underline;
  }

  .custom-link:hover {
    color: #2563eb;
  }
</style>
