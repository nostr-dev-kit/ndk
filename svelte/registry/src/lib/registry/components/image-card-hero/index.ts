import { NDKImage } from '@nostr-dev-kit/ndk';
import ImageCardHero from './image-card-hero.svelte';
import { defaultContentRenderer } from '../../ui/content-renderer';
import type { ContentRenderer } from '../../ui/content-renderer';
import metadata from './metadata.json';

// Export registration metadata
export const registration = metadata.registration;

// Export register function
export function register(renderer: ContentRenderer = defaultContentRenderer) {
	renderer.addKind(NDKImage, ImageCardHero, registration.priority);
}

// Auto-register on import
register();

export { ImageCardHero };
export default ImageCardHero;
