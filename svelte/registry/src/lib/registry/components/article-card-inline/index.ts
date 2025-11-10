import { NDKArticle } from '@nostr-dev-kit/ndk';
import ArticleCardInline from './article-card-inline.svelte';
import { defaultContentRenderer } from '../../ui/content-renderer';

// Self-register this handler for NDKArticle events with priority 1 (basic/inline)
defaultContentRenderer.addKind(NDKArticle, ArticleCardInline, 1);

export { ArticleCardInline };
export default ArticleCardInline;
