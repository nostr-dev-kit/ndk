<!-- @ndk-version: time-ago@0.1.0 -->
<!--
  @component TimeAgo
  Displays a relative timestamp that updates automatically.

  Shows "now", "5m", "2h", "3d", or a formatted date for older timestamps.
  Updates every minute to keep the display current.

  @example
  ```svelte
  <TimeAgo timestamp={event.created_at} />

  // With custom class
  <TimeAgo timestamp={event.created_at} class="text-sm text-muted-foreground" />

  // As datetime element
  <TimeAgo timestamp={event.created_at} element="time" />
  ```
-->
<script lang="ts">
  import { onDestroy } from 'svelte';
  import { cn } from '$lib/utils';

  interface Props {
    /** Unix timestamp in seconds */
    timestamp: number | undefined;

    /** HTML element to render as (default: span) */
    element?: 'span' | 'time';

    /** Additional CSS classes */
    class?: string;
  }

  let {
    timestamp,
    element = 'span',
    class: className = ''
  }: Props = $props();

  // Force recalculation every minute
  let tick = $state(0);

  // Format the relative time
  const formatted = $derived.by(() => {
    // Access tick to trigger recalculation
    tick;

    if (!timestamp) return '';

    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 1) {
      const mins = Math.floor(diff / (1000 * 60));
      if (mins < 1) return 'now';
      return `${mins}m`;
    } else if (hours < 24) {
      return `${hours}h`;
    } else if (hours < 168) { // 7 days
      const days = Math.floor(hours / 24);
      return `${days}d`;
    } else {
      // Show date for older posts
      return date.toLocaleDateString();
    }
  });

  // ISO datetime for semantic HTML
  const datetime = $derived(
    timestamp ? new Date(timestamp * 1000).toISOString() : undefined
  );

  // Update every minute
  let interval: ReturnType<typeof setInterval> | undefined;

  $effect(() => {
    interval = setInterval(() => {
      tick++;
    }, 60000); // 60 seconds

    return () => {
      if (interval) clearInterval(interval);
    };
  });

  onDestroy(() => {
    if (interval) clearInterval(interval);
  });
</script>

{#if element === 'time'}
  <time datetime={datetime} class={cn(className)}>
    {formatted}
  </time>
{:else}
  <span class={cn(className)}>
    {formatted}
  </span>
{/if}
