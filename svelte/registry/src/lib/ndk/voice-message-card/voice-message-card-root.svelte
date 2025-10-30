<!-- @ndk-version: voice-message-card@0.1.0 -->
<script lang="ts">
  import { setContext } from 'svelte';
  import type { NDKVoiceMessage } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { createProfileFetcher } from '@nostr-dev-kit/svelte';
  import { VOICE_MESSAGE_CARD_CONTEXT_KEY, type VoiceMessageCardContext } from './context.svelte.js';
  import { getNDKFromContext } from '../ndk-context.svelte.js';
  import type { Snippet } from 'svelte';

  interface Props {
    /** NDK instance (optional, falls back to context) */
    ndk?: NDKSvelte;

    /** Voice message instance */
    voiceMessage: NDKVoiceMessage;

    /** Whether clicking the card is interactive */
    interactive?: boolean;

    /** Click handler */
    onclick?: (e: MouseEvent) => void;

    /** Additional CSS classes */
    class?: string;

    /** Child components */
    children: Snippet;
  }

  let {
    ndk: providedNdk,
    voiceMessage,
    interactive = true,
    onclick,
    class: className = '',
    children
  }: Props = $props();

  const ndk = getNDKFromContext(providedNdk);

  // Fetch author profile (reactive to voice message changes)
  let authorProfile = $state<ReturnType<typeof createProfileFetcher> | null>(null);

  $effect(() => {
    if (voiceMessage.author) {
      authorProfile = createProfileFetcher(() => ({ user: voiceMessage.author }), ndk);
    } else {
      authorProfile = null;
    }
  });

  // Create reactive context with getters
  const context = {
    get ndk() { return ndk; },
    get voiceMessage() { return voiceMessage; },
    get authorProfile() { return authorProfile; },
    get interactive() { return interactive; },
    get onclick() { return onclick; }
  };

  setContext(VOICE_MESSAGE_CARD_CONTEXT_KEY, context);
</script>

<div class="voice-message-card-root {className}">
  {@render children()}
</div>

<style>
  .voice-message-card-root {
    display: contents;
  }
</style>
