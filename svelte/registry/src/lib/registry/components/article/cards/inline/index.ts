import { NDKArticle } from '@nostr-dev-kit/ndk';
import ArticleCardInline from './article-card-inline.svelte';
import { defaultContentRenderer } from '../../../ui/content-renderer.svelte.js';

// Self-register this handler for NDKArticle events if not already registered
if (!defaultContentRenderer.getKindHandler(30023)) {
	defaultContentRenderer.addKind(NDKArticle, ArticleCardInline);
}

export { ArticleCardInline };
export default ArticleCardInline;
