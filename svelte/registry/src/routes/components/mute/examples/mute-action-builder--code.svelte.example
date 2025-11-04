<script lang="ts">
  import { createMuteAction } from '@nostr-dev-kit/svelte';

  let { ndk, user } = $props();

  const muteState = createMuteAction(() => ({ target: user }), ndk);
</script>

<button
  class="px-4 py-2 bg-card border border-border rounded-lg cursor-pointer transition-all text-foreground hover:bg-muted"
  class:text-red-500={muteState.isMuted}
  class:border-red-500={muteState.isMuted}
  onclick={muteState.mute}
>
  {muteState.isMuted ? '🔇 Muted' : '🔊 Mute'}
</button>
