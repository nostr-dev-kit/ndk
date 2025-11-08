/**
 * Creates a reactive time ago string that updates automatically every minute.
 *
 * @param timestamp - Unix timestamp in seconds
 * @returns Reactive string showing relative time ("now", "5m", "2h", "3d", or formatted date)
 *
 * @example
 * ```svelte
 * <script>
 *   const timeAgo = createTimeAgo(event.created_at);
 * </script>
 *
 * <time datetime={new Date(event.created_at * 1000).toISOString()}>
 *   {timeAgo}
 * </time>
 * ```
 */
export function createTimeAgo(timestamp: number | undefined) {
  let tick = $state(0);

  const formatted = $derived.by(() => {
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
      return date.toLocaleDateString();
    }
  });

  $effect(() => {
    const interval = setInterval(() => {
      tick++;
    }, 60000); // 60 seconds

    return () => clearInterval(interval);
  });

  return formatted;
}
