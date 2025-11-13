import EventCardInline from './event-card-inline.svelte';
import { defaultContentRenderer } from '../../ui/content-renderer';
import type { ContentRenderer } from '../../ui/content-renderer';
import metadata from './metadata.json';

// Export registration metadata
export const registration = metadata.registration;

// Export register function
export function register(renderer: ContentRenderer = defaultContentRenderer) {
	renderer.addKind(registration.kinds, EventCardInline, registration.priority);
}

// Auto-register on import
register();

export { EventCardInline };
export default EventCardInline;
