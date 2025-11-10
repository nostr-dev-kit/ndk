import { NDKArticle } from '@nostr-dev-kit/ndk';
import ArticleCardCompact from './article-card-compact.svelte';
import { defaultContentRenderer } from '../../ui/content-renderer';

// Self-register this handler for NDKArticle events with priority 5 (compact)
defaultContentRenderer.addKind(NDKArticle, ArticleCardCompact, 5);

export { ArticleCardCompact };
export default ArticleCardCompact;
