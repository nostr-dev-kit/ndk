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

  // Example custom emoji (NIP-30 format)
  const customEmojis = [
    {
      emoji: ':party:',
      url: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14/assets/svg/1f389.svg',
      shortcode: 'party'
    },
    {
      emoji: ':fire:',
      url: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14/assets/svg/1f525.svg',
      shortcode: 'fire'
    },
    {
      emoji: ':rocket:',
      url: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14/assets/svg/1f680.svg',
      shortcode: 'rocket'
    }
  ];
</script>

<div class="custom-emoji-demo">
  <h3>Custom Emojis (NIP-30)</h3>
  <div class="emoji-row">
    {#each customEmojis as { emoji, url, shortcode } (shortcode)}
      <div class="emoji-item">
        <Reaction.Display {emoji} {url} {shortcode} class="w-8 h-8" />
        <span class="shortcode">{shortcode}</span>
      </div>
    {/each}
  </div>
</div>

<style>
  .custom-emoji-demo {
    border: 1px solid #e5e7eb;
    border-radius: 0.75rem;
    padding: 1.5rem;
    background: white;
  }

  .custom-emoji-demo h3 {
    font-size: 0.875rem;
    font-weight: 600;
    margin-bottom: 1rem;
    color: #374151;
  }

  .emoji-row {
    display: flex;
    gap: 1.5rem;
  }

  .emoji-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }

  .shortcode {
    font-size: 0.75rem;
    color: #6b7280;
    font-family: monospace;
  }
</style>
