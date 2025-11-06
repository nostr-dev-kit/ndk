<script lang="ts">
  import { EventCard } from '$lib/registry/components/event-card';
  import { ReactionAction } from '$lib/registry/components/reaction';
  import type { NDKSvelte, ThreadingMetadata } from '@nostr-dev-kit/svelte';
  import type { NDKEvent } from '@nostr-dev-kit/ndk';

  interface Props {
    ndk: NDKSvelte;
    threadNote: NDKEvent;
    selfThreadNote: NDKEvent;
    threadingMetadata: ThreadingMetadata;
    selfThreadingMetadata: ThreadingMetadata;
  }

  let { ndk, threadNote, selfThreadNote, threadingMetadata, selfThreadingMetadata }: Props = $props();
</script>

<!-- Parent -->
<div class="relative">
  {#if threadingMetadata?.showLineToNext}
    <div class="thread-line" style:left="20px" aria-hidden="true" ></div>
  {/if}
  <EventCard.Root {ndk} event={threadNote}>
    <EventCard.Header variant="compact" />
    <EventCard.Content />
    <EventCard.Actions>
      <ReactionAction />
    </EventCard.Actions>
  </EventCard.Root>
</div>

<!-- Self-thread reply -->
<div class="relative">
  {#if selfThreadingMetadata?.showLineToNext}
    <div class="thread-line" style:left="20px" aria-hidden="true" ></div>
  {/if}
  <EventCard.Root {ndk} event={selfThreadNote}>
    <EventCard.Header variant="compact" />
    <EventCard.Content />
    <EventCard.Actions>
      <ReactionAction emoji="❤️" />
    </EventCard.Actions>
  </EventCard.Root>
</div>

<style>
  .thread-line {
    position: absolute;
    top: 48px;
    bottom: 0;
    width: 2px;
    background: var(--border);
    pointer-events: none;
    z-index: 0;
  }
</style>
