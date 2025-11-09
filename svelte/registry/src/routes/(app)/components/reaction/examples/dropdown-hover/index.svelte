<!--
  IMPORTANT: Keep this file in sync with index.txt

  Rules for maintaining sync between index.svelte and index.txt:
  1. Both files must demonstrate the SAME functionality
  2. index.svelte = Full implementation (with TypeScript interfaces, all imports, complete styling)
  3. index.txt = Simplified documentation version with these changes:
     - Remove TypeScript interface definitions
     - Use inline prop destructuring: let { ndk, event } = $props();
     - Keep only essential imports (remove type imports unless needed)
     - Keep inline classes (class="...") but remove <style> blocks
     - Focus on showing component API usage, not implementation details
     - Keep the core component usage identical between both files

  When you modify this file, you MUST update index.txt to reflect the same changes
  following the simplification rules above.
-->
<script lang="ts">
  import { EmojiPicker } from '$lib/registry/components/emoji-picker';
  import ReactionButton from '$lib/registry/components/reaction-button/reaction-button.svelte';
  import { createReactionAction } from '$lib/registry/builders/reaction-action/index.svelte.js';
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';

  interface Props {
    ndk: NDKSvelte;
    event: NDKEvent;
  }

  let { ndk, event }: Props = $props();

  const reactionState = createReactionAction(() => ({ event }), ndk);

  function handleEmojiSelect(emoji: string) {
    reactionState.react(emoji);
  }
</script>

<EmojiPicker.Dropdown {ndk} onEmojiSelect={handleEmojiSelect}>
  <ReactionButton {ndk} {event} variant="ghost" />
</EmojiPicker.Dropdown>
