<script lang="ts">
  import { Hashtag } from '$lib/registry/components/hashtag';

  let lastClicked = $state<string>('');

  function handleHashtagClick(tag: string) {
    lastClicked = tag;
    console.log('Hashtag clicked:', tag);
  }
</script>

<div class="flex flex-col gap-4">
  <p class="text-sm">
    Click on hashtags: <Hashtag tag="nostr" onclick={handleHashtagClick} /> and <Hashtag tag="bitcoin" onclick={handleHashtagClick} />
  </p>

  {#if lastClicked}
    <p class="text-sm text-muted-foreground">
      Last clicked: <span class="font-semibold">#{lastClicked}</span>
    </p>
  {/if}
</div>
