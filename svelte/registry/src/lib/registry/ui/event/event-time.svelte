<script lang="ts">
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import { createTimeAgo } from '../../utils/time-ago.svelte.js';
  import { cn } from '../../utils/index.js';

  interface Props {
    /** The event to display the time for */
    event: NDKEvent;

    /** Additional CSS classes */
    class?: string;
  }

  let { event, class: className = '' }: Props = $props();

  const timeAgo = createTimeAgo(event.created_at);
  const datetime = $derived(event.created_at ? new Date(event.created_at * 1000).toISOString() : undefined);
</script>

<time datetime={datetime} class={cn(className)}>
  {timeAgo}
</time>
