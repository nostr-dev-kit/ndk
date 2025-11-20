import { NDKArticle } from '@nostr-dev-kit/ndk';
import ArticleCardHero from './article-card-hero.svelte';
import { defaultContentRenderer } from '../../ui/content-renderer';
import type { ContentRenderer } from '../../ui/content-renderer';
import metadata from './metadata.json';

// Export registration metadata
export const registration = metadata.registration;

// Export register function
export function register(renderer: ContentRenderer = defaultContentRenderer) {
	renderer.addKind(NDKArticle, ArticleCardHero, registration.priority);
}

// Auto-register on import
register();

export { ArticleCardHero };
export default ArticleCardHero;
