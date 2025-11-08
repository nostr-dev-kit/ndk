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
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import type { NDKVoiceMessage } from '@nostr-dev-kit/ndk';
  import { VoiceMessage } from '$lib/registry/ui/voice-message';

  const ndk = getContext<NDKSvelte>('ndk');

  let voiceMessage = $state<NDKVoiceMessage | null>(null);
</script>

<div class="border border-gray-200 rounded-xl p-6 bg-white">
  {#if voiceMessage}
    <VoiceMessage.Root {ndk} {voiceMessage}>
      <div class="flex flex-col gap-4 p-5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl text-white">
        <div class="flex items-center gap-4">
          <VoiceMessage.Player />
          <VoiceMessage.Duration />
        </div>
        <VoiceMessage.Waveform class="h-[60px] rounded-md bg-white/10" />
      </div>
    </VoiceMessage.Root>
  {:else}
    <div class="p-8 text-center text-gray-500">
      <p>Load a voice message to see waveform visualization</p>
    </div>
  {/if}
</div>
