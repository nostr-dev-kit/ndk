// @ndk-version: article@0.14.0
import type { NDKArticle } from '@nostr-dev-kit/ndk';
import type { NDKSvelte } from '@nostr-dev-kit/svelte';

/**
 * Context shared between Article components
 */
export interface ArticleContext {
    /** NDK instance */
    ndk: NDKSvelte;

    /** The article being displayed */
    article: NDKArticle;

    /** Click handler */
    onclick?: (e: MouseEvent) => void;
}

export const ARTICLE_CONTEXT_KEY = Symbol('article');
