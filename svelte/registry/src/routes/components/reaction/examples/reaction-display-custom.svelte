<script lang="ts">
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import { Reaction } from '$lib/registry/components/reaction';

  let { event }: { event: NDKEvent } = $props();
</script>

<div class="flex flex-wrap items-center gap-6">
  <!-- Automatically handles NIP-30 custom emoji from event -->
  <Reaction.Display {event} size={32} />

  <!-- Standard emoji for comparison -->
  <Reaction.Display emoji="⚡" size={32} />
</div>

<p class="text-sm text-muted-foreground mt-4">
  Reaction.Display automatically detects and renders NIP-30 custom emojis from reaction events.
</p>
