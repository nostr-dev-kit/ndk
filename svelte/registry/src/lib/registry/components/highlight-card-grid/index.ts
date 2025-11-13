import { NDKHighlight } from '@nostr-dev-kit/ndk';
import HighlightCardGrid from './highlight-card-grid.svelte';
import { defaultContentRenderer } from '../../ui/content-renderer';
import type { ContentRenderer } from '../../ui/content-renderer';
import metadata from './metadata.json';

// Export registration metadata
export const registration = metadata.registration;

// Export register function
export function register(renderer: ContentRenderer = defaultContentRenderer) {
	renderer.addKind(NDKHighlight, HighlightCardGrid, registration.priority);
}

// Auto-register on import
register();

export { HighlightCardGrid };
export default HighlightCardGrid;
