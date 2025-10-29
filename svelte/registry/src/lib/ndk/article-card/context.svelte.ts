// @ndk-version: article-card@0.12.0
import type { NDKArticle } from '@nostr-dev-kit/ndk';
import type { NDKSvelte, ProfileFetcherState } from '@nostr-dev-kit/svelte';

/**
 * Context shared between ArticleCard components
 */
export interface ArticleCardContext {
    /** NDK instance */
    ndk: NDKSvelte;

    /** The article being displayed */
    article: NDKArticle;

    /** Author profile fetcher (reactive) */
    authorProfile: ProfileFetcherState | null;

    /** Whether the card is interactive (clickable) */
    interactive: boolean;

    /** Click handler */
    onclick?: (e: MouseEvent) => void;
}

export const ARTICLE_CARD_CONTEXT_KEY = Symbol('article-card');
