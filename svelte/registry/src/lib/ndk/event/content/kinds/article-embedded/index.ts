import { NDKArticle } from '@nostr-dev-kit/ndk';
import ArticleEmbedded from './article-embedded.svelte';
import { defaultKindRegistry } from '../../registry.svelte';

// Self-register this handler for NDKArticle events
// Automatically uses NDKArticle.kinds [30023] and wraps with NDKArticle.from()
defaultKindRegistry.add(NDKArticle, ArticleEmbedded);

export { ArticleEmbedded };
export default ArticleEmbedded;
