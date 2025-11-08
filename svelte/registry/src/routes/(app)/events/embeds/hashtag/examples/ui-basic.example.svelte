<script lang="ts">
  import { Hashtag } from '$lib/registry/components/hashtag/displays/basic';
</script>

<div class="flex flex-col gap-4">
  <p class="text-sm text-muted-foreground">
    Inline hashtag in text: Check out <Hashtag tag="nostr" /> and <Hashtag tag="bitcoin" /> for great content!
  </p>

  <p class="text-sm text-muted-foreground">
    Another example: Trending topics include <Hashtag tag="grownostr" /> and <Hashtag tag="plebchain" />.
  </p>
</div>
