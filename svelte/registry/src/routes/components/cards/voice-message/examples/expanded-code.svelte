<script lang="ts">
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import type { NDKVoiceMessage } from '@nostr-dev-kit/ndk';
  import { VoiceMessageCard } from '$lib/registry/components/voice-message-card';
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
      audioRef.removeEventListener('timeupdate', handleTimeUpdate);
      audioRef.removeEventListener('loadedmetadata', handleTimeUpdate);
    };
  });

  const progress = $derived(duration > 0 ? (currentTime / duration) * 100 : 0);
</script>

<VoiceMessageCard.Root {ndk} {voiceMessage}>
  <div class="flex flex-col gap-4 p-5 bg-card border border-border rounded-2xl w-full max-w-lg">
    <div class="flex items-center justify-between">
      <User.Root {ndk} user={voiceMessage.author}>
        <User.Avatar size={40} />
        <User.Name />
      </User.Root>
      <VoiceMessageCard.Duration {currentTime} showCurrent={true} />
    </div>

    <div class="py-2">
      <VoiceMessageCard.Waveform height={60} {progress} />
    </div>

    <div class="flex items-center gap-3">
      <VoiceMessageCard.Player bind:audioRef />
    </div>
  </div>
</VoiceMessageCard.Root>
