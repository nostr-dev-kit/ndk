<script lang="ts">
  import { setContext } from 'svelte';
  import type { NDKVoiceMessage } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { VOICE_MESSAGE_CONTEXT_KEY, type VoiceMessageContext } from './voice-message.context.js';
  import { getNDKFromContext } from '../../utils/ndk-context.svelte.js';
  import type { Snippet } from 'svelte';

  interface Props {
    ndk?: NDKSvelte;

    voiceMessage: NDKVoiceMessage;

    interactive?: boolean;

    onclick?: (e: MouseEvent) => void;

    class?: string;

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

  // Create reactive context with getters
  const context = {
    get ndk() { return ndk; },
    get voiceMessage() { return voiceMessage; },
    get interactive() { return interactive; },
    get onclick() { return onclick; }
  };

  setContext(VOICE_MESSAGE_CONTEXT_KEY, context);
</script>

<div class="contents {className}">
  {@render children()}
</div>
