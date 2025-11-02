<script lang="ts">
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import type { NDKVoiceMessage } from '@nostr-dev-kit/ndk';
  import { VoiceMessage } from '$lib/registry/ui/voice-message';

  interface Props {
    ndk: NDKSvelte;
    voiceMessage: NDKVoiceMessage;
  }

  let { ndk, voiceMessage }: Props = $props();
</script>

<VoiceMessage.Root {ndk} {voiceMessage}>
  <div class="flex items-center gap-3 p-3 bg-muted rounded-lg">
    <VoiceMessage.Player />
  </div>
</VoiceMessage.Root>
