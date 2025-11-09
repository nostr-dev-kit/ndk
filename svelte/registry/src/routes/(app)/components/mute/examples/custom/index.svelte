<!--
  IMPORTANT: Keep this file in sync with index.txt

  Rules for maintaining sync between index.svelte and index.txt:
  1. Both files must demonstrate the SAME functionality
  2. index.svelte = Full implementation (with TypeScript interfaces, all imports, complete styling)
  3. index.txt = Simplified documentation version with these changes:
     - Remove TypeScript interface definitions
     - Use inline prop destructuring: let { user, ndk } = $props();
     - Keep only essential imports (remove type imports unless needed)
     - Keep inline classes (class="...") but remove <style> blocks
     - Focus on showing component API usage, not implementation details
     - Keep the core component usage identical between both files

  When you modify this file, you MUST update index.txt to reflect the same changes
  following the simplification rules above.
-->
<script lang="ts">
  import { createMuteAction } from '$lib/registry/builders/mute-action/index.svelte.js';
  import type { NDKUser } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';

  interface Props {
    user: NDKUser;
    ndk: NDKSvelte;
  }

  let { user, ndk }: Props = $props();

  const muteState = createMuteAction(() => ({ target: user }), ndk);
</script>

<button
  class:text-red-500={muteState.isMuted}
  onclick={muteState.mute}
>
  {muteState.isMuted ? '🔇 Muted' : '🔊 Mute'}
</button>
