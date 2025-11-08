import { NDKArticle } from '@nostr-dev-kit/ndk';
import ArticleCardCompact from './article-card-compact.svelte';
import { defaultContentRenderer } from '../../../ui/content-renderer.svelte.js';

// Self-register this handler for NDKArticle events if not already registered
if (!defaultContentRenderer.getKindHandler(30023)) {
	defaultContentRenderer.addKind(NDKArticle, ArticleCardCompact);
}

export { ArticleCardCompact };
export default ArticleCardCompact;
