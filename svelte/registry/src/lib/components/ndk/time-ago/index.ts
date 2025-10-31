/**
 * TimeAgo - Relative timestamp display with auto-update
 *
 * Displays relative timestamps (e.g., "5m", "2h", "3d") that automatically
 * update every minute to stay current.
 *
 * @example Basic usage:
 * ```svelte
 * <script>
 *   import { TimeAgo } from '.';
 * </script>
 *
 * <TimeAgo timestamp={event.created_at} />
 * ```
 *
 * @example As semantic time element:
 * ```svelte
 * <TimeAgo
 *   timestamp={event.created_at}
 *   element="time"
 *   class="text-sm text-muted-foreground"
 * />
 * ```
 */

import TimeAgo from './time-ago.svelte';

export { TimeAgo };
export default TimeAgo;
