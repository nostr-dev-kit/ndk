<script lang="ts">
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import type { NDKVoiceMessage } from '@nostr-dev-kit/ndk';
  import { VoiceMessageCard } from '$lib/registry/components/voice-message-card';
  import { UserProfile } from '$lib/registry/components/user-profile';

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
  <div class="flex flex-col gap-4 p-4 bg-card border border-border rounded-xl max-w-md">
    <UserProfile.Root {ndk} user={voiceMessage.author}>
      <UserProfile.Avatar size={32} />
      <UserProfile.Name />
    </UserProfile.Root>
    <VoiceMessageCard.Waveform height={50} {progress} />
    <div class="flex items-center gap-3">
      <VoiceMessageCard.Player bind:audioRef />
      <VoiceMessageCard.Duration {currentTime} showCurrent={true} />
    </div>
  </div>
</VoiceMessageCard.Root>
