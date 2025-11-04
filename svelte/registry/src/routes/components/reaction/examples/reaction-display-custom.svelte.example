<script lang="ts">
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import { Reaction } from '$lib/registry/ui/reaction';

  let { event }: { event: NDKEvent } = $props();
</script>

<div class="flex flex-wrap items-center gap-6">
  <!-- Automatically handles NIP-30 custom emoji from event -->
  <Reaction.Display {event} class="text-3xl" />

  <!-- Standard emoji for comparison -->
  <Reaction.Display emoji="⚡" class="text-3xl" />
</div>

<p class="text-sm text-muted-foreground mt-4">
  Reaction.Display automatically detects and renders NIP-30 custom emojis from reaction events.
</p>
