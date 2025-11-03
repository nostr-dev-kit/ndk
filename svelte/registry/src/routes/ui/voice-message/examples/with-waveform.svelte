<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import type { NDKVoiceMessage } from '@nostr-dev-kit/ndk';
  import { VoiceMessage } from '$lib/registry/ui';

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
