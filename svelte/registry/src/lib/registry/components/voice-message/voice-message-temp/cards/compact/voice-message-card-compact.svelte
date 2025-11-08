<script lang="ts">
  import type { NDKVoiceMessage } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { VoiceMessage } from '../../../../ui/voice-message/index.js';
  import { User } from '../../../../ui/user';

  interface Props {
    ndk: NDKSvelte;

    voiceMessage: NDKVoiceMessage;

    showAuthor?: boolean;

    class?: string;
  }

  let {
    ndk,
    voiceMessage,
    showAuthor = false,
    class: className = ''
  }: Props = $props();
</script>

<VoiceMessage.Root {ndk} {voiceMessage}>
  <div data-voice-message-card-compact="" class="flex flex-col gap-3 p-4 bg-card border border-border rounded-xl w-full max-w-[400px] {className}">
    {#if showAuthor}
      <div class="flex items-center gap-2 pb-2 border-b border-border">
        <User.Root {ndk} user={voiceMessage.author}>
          <User.Avatar class="w-8 h-8" />
          <User.Name />
        </User.Root>
      </div>
    {/if}

    <div class="flex items-center gap-3">
      <VoiceMessage.Player />
      <VoiceMessage.Duration />
    </div>
  </div>
</VoiceMessage.Root>
