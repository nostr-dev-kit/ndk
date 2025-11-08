<script lang="ts">
  import { Hashtag } from '$lib/registry/components/hashtag/displays/basic';
</script>

<div class="flex flex-col gap-4">
  <p class="text-sm">
    Custom styling: Check out <Hashtag tag="nostr" class="font-bold text-purple-600 hover:text-purple-800" />, this hashtag has custom classes!
  </p>

  <p class="text-sm">
    Another style: Explore <Hashtag tag="bitcoin" class="bg-orange-100 px-2 py-1 rounded" /> for related content!
  </p>
</div>
