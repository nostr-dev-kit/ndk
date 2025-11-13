import LinkEmbed from './link-embed.svelte';
import { defaultContentRenderer } from '../../ui/content-renderer';
import type { ContentRenderer } from '../../ui/content-renderer';
import metadata from './metadata.json';

// Export registration metadata
export const registration = metadata.registration;

// Export register function
export function register(renderer: ContentRenderer = defaultContentRenderer) {
	renderer.setLinkComponent(LinkEmbed, registration.priority);
}

// Auto-register on import
register();

export { LinkEmbed };
export default LinkEmbed;
