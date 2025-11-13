import MediaBasic from './media-basic.svelte';
import { defaultContentRenderer } from '../../ui/content-renderer';
import type { ContentRenderer } from '../../ui/content-renderer';
import metadata from './metadata.json';

// Export registration metadata
export const registration = metadata.registration;

// Export register function
export function register(renderer: ContentRenderer = defaultContentRenderer) {
	renderer.setMediaComponent(MediaBasic, registration.priority);
}

// Auto-register on import
register();

export { MediaBasic };
export default MediaBasic;
