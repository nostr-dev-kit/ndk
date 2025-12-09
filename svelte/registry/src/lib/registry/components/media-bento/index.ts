import MediaBento from './media-bento.svelte';
import { defaultContentRenderer } from '../../ui/content-renderer';
import type { ContentRenderer } from '../../ui/content-renderer';
import metadata from './metadata.json';

// Export registration metadata
export const registration = metadata.registration;

// Export register function
export function register(renderer: ContentRenderer = defaultContentRenderer) {
	renderer.setMediaComponent(MediaBento, registration.priority);
}

// Auto-register on import
register();

export { MediaBento };
export default MediaBento;
