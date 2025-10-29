<script lang="ts">
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import type { NDKEvent } from '@nostr-dev-kit/ndk';

  interface Props {
    ndk: NDKSvelte;
    event: NDKEvent;
    content: string;
    count: number;
  }

  let { ndk, event, content, count }: Props = $props();
</script>

<div class="bg-card border border-border rounded-xl p-6">
  <div class="mb-4">
    <p class="m-0 leading-relaxed text-foreground">{content}</p>
  </div>
  <div class="flex gap-2 pt-4 border-t border-border">
    <div class="text-sm font-medium text-muted-foreground">
      {count} {count === 1 ? 'reply' : 'replies'}
    </div>
  </div>
</div>


