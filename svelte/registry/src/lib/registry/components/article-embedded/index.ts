import { NDKArticle } from '@nostr-dev-kit/ndk';
import ArticleEmbedded from './article-embedded.svelte';
import { defaultContentRenderer } from '../../ui/content-renderer.svelte.js';

// Self-register this handler for NDKArticle events
// Automatically uses NDKArticle.kinds [30023] and wraps with NDKArticle.from()
defaultContentRenderer.addKind(NDKArticle, ArticleEmbedded);

export { ArticleEmbedded };
export default ArticleEmbedded;
