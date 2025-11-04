<script lang="ts">
  import { createReplyAction } from '@nostr-dev-kit/svelte';
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';

  interface Props {
    ndk: NDKSvelte;
    event: NDKEvent;
  }

  let { ndk, event }: Props = $props();

  // Create the reply action using the builder
  const replyAction = createReplyAction(() => ({ event }), ndk);

  function handleClick() {
    // In your application, handle this however you want:
    // - Open a full-page composer
    // - Navigate to a reply route
    // - Trigger a global composer modal
    // - Show a toast with a textarea
    // etc.
    console.log('Reply button clicked!', {
      event,
      currentCount: replyAction.count,
      hasReplied: replyAction.hasReplied
    });

    // Example: You could dispatch a custom event
    // window.dispatchEvent(new CustomEvent('open-reply-composer', { detail: { event } }));
  }
</script>

<button
  onclick={handleClick}
  class="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-background hover:bg-accent transition-colors"
>
  <svg
    class="w-4 h-4 {replyAction.hasReplied ? 'text-primary' : 'text-muted-foreground'}"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
      d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
    />
  </svg>
  <span class="text-sm">{replyAction.count}</span>
  {#if replyAction.hasReplied}
    <span class="text-xs text-primary">✓</span>
  {/if}
</button>
