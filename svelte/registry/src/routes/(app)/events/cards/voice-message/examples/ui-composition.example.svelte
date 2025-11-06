<script lang="ts">
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import type { NDKVoiceMessage } from '@nostr-dev-kit/ndk';
  import { VoiceMessage } from '$lib/registry/ui/voice-message';
  import { User } from '$lib/registry/ui/user';

  interface Props {
    ndk: NDKSvelte;
    voiceMessage: NDKVoiceMessage;
  }

  let { ndk, voiceMessage }: Props = $props();

  let audioRef = $state<HTMLAudioElement>();
  let currentTime = $state(0);
  let duration = $state(0);

  $effect(() => {
    if (!audioRef) return;

    const handleTimeUpdate = () => {
      currentTime = audioRef!.currentTime;
      duration = audioRef!.duration || voiceMessage.duration || 0;
    };

    audioRef.addEventListener('timeupdate', handleTimeUpdate);
    audioRef.addEventListener('loadedmetadata', handleTimeUpdate);

    return () => {
      audioRef?.removeEventListener('timeupdate', handleTimeUpdate);
      audioRef?.removeEventListener('loadedmetadata', handleTimeUpdate);
    };
  });

  const progress = $derived(duration > 0 ? (currentTime / duration) * 100 : 0);
</script>

<VoiceMessage.Root {ndk} {voiceMessage}>
  <div class="flex flex-col gap-4 p-4 bg-card border border-border rounded-xl max-w-md">
    <User.Root {ndk} user={voiceMessage.author}>
      <User.Avatar class="w-8 h-8" />
      <User.Name />
    </User.Root>
    <VoiceMessage.Waveform height={50} {progress} />
    <div class="flex items-center gap-3">
      <VoiceMessage.Player bind:audioRef />
      <VoiceMessage.Duration {currentTime} showCurrent={true} />
    </div>
  </div>
</VoiceMessage.Root>
