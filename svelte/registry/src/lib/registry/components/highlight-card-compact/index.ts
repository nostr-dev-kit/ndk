import { NDKHighlight } from '@nostr-dev-kit/ndk';
import HighlightCardCompact from './highlight-card-compact.svelte';
import { defaultContentRenderer } from '../../ui/content-renderer';
import type { ContentRenderer } from '../../ui/content-renderer';
import metadata from './metadata.json';

// Export registration metadata
export const registration = metadata.registration;

// Export register function
export function register(renderer: ContentRenderer = defaultContentRenderer) {
	renderer.addKind(NDKHighlight, HighlightCardCompact, registration.priority);
}

// Auto-register on import
register();

export { HighlightCardCompact };
export default HighlightCardCompact;
