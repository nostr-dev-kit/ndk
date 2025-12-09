import { NDKImage } from '@nostr-dev-kit/ndk';
import ImageCardInstagram from './image-card-instagram.svelte';
import { defaultContentRenderer } from '../../ui/content-renderer';
import type { ContentRenderer } from '../../ui/content-renderer';
import metadata from './metadata.json';

// Export registration metadata
export const registration = metadata.registration;

// Export register function
export function register(renderer: ContentRenderer = defaultContentRenderer) {
	renderer.addKind(NDKImage, ImageCardInstagram, registration.priority);
}

// Auto-register on import
register();

export { ImageCardInstagram };
export default ImageCardInstagram;
