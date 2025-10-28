<script lang="ts">
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import EventContent from '$lib/ndk/event/content/event-content.svelte';

  interface Props {
    ndk: NDKSvelte;
  }

  let { ndk }: Props = $props();
</script>

<EventContent
  {ndk}
  content="Simple text with #hashtags and links: https://example.com"
/>
