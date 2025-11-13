import { NDKArticle } from '@nostr-dev-kit/ndk';
import ArticleCardCompact from './article-card-compact.svelte';
import { defaultContentRenderer } from '../../ui/content-renderer';
import type { ContentRenderer } from '../../ui/content-renderer';
import metadata from './metadata.json';

// Export registration metadata
export const registration = metadata.registration;

// Export register function
export function register(renderer: ContentRenderer = defaultContentRenderer) {
	renderer.addKind(NDKArticle, ArticleCardCompact, registration.priority);
}

// Auto-register on import
register();

export { ArticleCardCompact };
export default ArticleCardCompact;
