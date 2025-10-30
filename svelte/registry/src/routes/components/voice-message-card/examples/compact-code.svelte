<script lang="ts">
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import type { NDKVoiceMessage } from '@nostr-dev-kit/ndk';
  import { VoiceMessageCard } from '$lib/ndk/voice-message-card';

  interface Props {
    ndk: NDKSvelte;
    voiceMessage: NDKVoiceMessage;
  }

  let { ndk, voiceMessage }: Props = $props();
</script>

<VoiceMessageCard.Root {ndk} {voiceMessage}>
  <div class="flex flex-col gap-3 p-4 bg-card border border-border rounded-xl w-full max-w-md">
    <div class="flex items-center gap-3">
      <VoiceMessageCard.Player showButton={true} />
      <VoiceMessageCard.Duration />
    </div>
  </div>
</VoiceMessageCard.Root>
