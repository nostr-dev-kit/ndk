export { default as EventCardCompact } from './event-card-compact.svelte';

import { defaultContentRenderer } from '../../ui/content-renderer/index.js';
import EventCardCompact from './event-card-compact.svelte';

// Register with content renderer for kinds 1 and 1111 with priority 5
// Lower than inline (10) but still available as an option
defaultContentRenderer.addKind([1, 1111], EventCardCompact, 5);
