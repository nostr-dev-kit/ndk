import { NDKArticle } from '@nostr-dev-kit/ndk';
import ArticleEmbeddedCard from './article-embedded-card.svelte';
import { defaultContentRenderer } from '../../ui/content-renderer.svelte.js';

// Self-register this handler for NDKArticle events
// Automatically uses NDKArticle.kinds [30023] and wraps with NDKArticle.from()
defaultContentRenderer.addKind(NDKArticle, ArticleEmbeddedCard);

export { ArticleEmbeddedCard };
export default ArticleEmbeddedCard;
