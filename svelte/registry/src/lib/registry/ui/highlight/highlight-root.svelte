<script lang="ts">
  import { setContext } from 'svelte';
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { createHighlight } from '@nostr-dev-kit/svelte';
  import type { Snippet } from 'svelte';
  import { cn } from '../../utils/cn.js';
  import {
    HIGHLIGHT_CONTEXT_KEY,
    type HighlightContext,
  } from './highlight.context.js';
  import { getNDKFromContext } from '../../utils/ndk-context.svelte.js';

  interface Props {
    /** NDK instance (optional, falls back to context) */
    ndk?: NDKSvelte;

    /** Highlight event (kind 9802) */
    event: NDKEvent;

    /** Display variant */
    variant?: 'feed' | 'compact' | 'grid';

    /** Additional CSS classes */
    class?: string;

    /** Child components */
    children?: Snippet;
  }

  let {
    ndk: providedNdk,
    event,
    variant = 'feed',
    class: className = '',
    children,
  }: Props = $props();

  const ndk = getNDKFromContext(providedNdk);

  // Create highlight builder
  const state = createHighlight(() => ({ event }), ndk);

  // Create context with getters for reactivity
  const context: HighlightContext = {
    get ndk() {
      return ndk;
    },
    get event() {
      return event;
    },
    get state() {
      return state;
    },
    get variant() {
      return variant;
    },
  };

  setContext(HIGHLIGHT_CONTEXT_KEY, context);
</script>

<div class={className}>
  {#if children}
    {@render children()}
  {/if}
</div>
