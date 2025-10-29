<script lang="ts">
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import EventContent from '$lib/ndk/event/content/event-content.svelte';

  interface Props {
    ndk: NDKSvelte;
    event: NDKEvent;
  }

  let { ndk, event }: Props = $props();
</script>

<EventContent {ndk} {event}>
  {#snippet link({ url })}
    <a href={url} target="_blank" rel="noopener noreferrer" class="custom-link">
      🔗 {url}
    </a>
  {/snippet}
</EventContent>

<style>
  :global(.custom-link) {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    color: #7c3aed;
    text-decoration: none;
    font-weight: 500;
  }

  :global(.custom-link:hover) {
    text-decoration: underline;
  }
</style>
