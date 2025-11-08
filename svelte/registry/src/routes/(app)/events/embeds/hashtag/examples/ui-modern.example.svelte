<script lang="ts">
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import HashtagModern from '$lib/registry/components/hashtag/displays/modern/hashtag-modern.svelte';

  interface Props {
    ndk: NDKSvelte;
  }

  let { ndk }: Props = $props();
</script>

<div class="flex flex-col gap-4">
  <p class="text-sm">
    Hover over hashtags: Check out <HashtagModern {ndk} tag="nostr" /> and <HashtagModern {ndk} tag="bitcoin" /> for great content!
  </p>

  <p class="text-sm text-muted-foreground">
    Explore trending: <HashtagModern {ndk} tag="grownostr" /> and <HashtagModern {ndk} tag="plebchain" />
  </p>
</div>
