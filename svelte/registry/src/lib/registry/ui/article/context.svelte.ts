// @ndk-version: article-card@0.13.0
import type { NDKArticle } from '@nostr-dev-kit/ndk';
import type { NDKSvelte } from '@nostr-dev-kit/svelte';

/**
 * Context shared between ArticleCard components
 */
export interface ArticleCardContext {
    /** NDK instance */
    ndk: NDKSvelte;

    /** The article being displayed */
    article: NDKArticle;

    /** Whether the card is interactive (clickable) */
    interactive: boolean;

    /** Click handler */
    onclick?: (e: MouseEvent) => void;
}

export const ARTICLE_CARD_CONTEXT_KEY = Symbol('article-card');
