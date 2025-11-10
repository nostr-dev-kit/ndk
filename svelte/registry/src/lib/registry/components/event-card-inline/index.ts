export { default as EventCardInline } from './event-card-inline.svelte';

import { defaultContentRenderer } from '../../ui/content-renderer/index.js';
import EventCardInline from './event-card-inline.svelte';

// Register with content renderer for kinds 1 and 1111 with high priority (10)
// This ensures it takes precedence over other event card components
defaultContentRenderer.addKind([1, 1111], EventCardInline, 10);
