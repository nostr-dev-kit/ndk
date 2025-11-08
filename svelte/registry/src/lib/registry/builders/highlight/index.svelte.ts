/**
 * @module builders/highlight
 * Builder for managing highlight events (kind 9802)
 */

import type { NDKEvent, NDKArticle } from '@nostr-dev-kit/ndk';
import { NDKArticle as NDKArticleClass } from '@nostr-dev-kit/ndk';
import type { NDKSvelte } from '@nostr-dev-kit/svelte';
import { resolveNDK } from '../resolve-ndk.svelte.js';

export interface UrlMetadata {
    title?: string;
    description?: string;
    image?: string;
    siteName?: string;
}

export interface HighlightPosition {
    before: string;
    highlight: string;
    after: string;
}

export interface SourceInfo {
    type: 'web' | 'article' | 'event';
    displayText: string;
    value: string;
    url?: string;
}

export interface HighlightState {
    /** The highlight content */
    content: string;

    /** The full context text */
    context: string;

    /** Highlight position within context */
    position: HighlightPosition;

    /** Source information (from a/e/r tags) */
    source: SourceInfo | null;

    /** Referenced article (if source is 'a' tag) */
    article: NDKArticle | null;

    /** URL metadata (if source is 'r' tag) */
    urlMetadata: UrlMetadata | null;

    /** Loading state */
    loading: boolean;
}

export interface HighlightConfig {
    /** The highlight event (kind 9802) */
    event: NDKEvent;
}

/**
 * Fetch URL metadata using a simple approach
 * In production, this should use a proper metadata service
 */
async function fetchUrlMetadata(url: string): Promise<UrlMetadata | null> {
    try {
        // For now, extract basic info from URL
        // In production, you'd want to fetch og:tags from the URL
        const urlObj = new URL(url);
        return {
            siteName: urlObj.hostname.replace('www.', ''),
            title: urlObj.hostname.replace('www.', ''),
        };
    } catch {
        return null;
    }
}

/**
 * Calculate highlight position within context
 */
function calculatePosition(content: string, context: string): HighlightPosition {
    if (!context || context === content) {
        return { before: '', highlight: content, after: '' };
    }

    const startIndex = context.indexOf(content);
    if (startIndex === -1) {
        return { before: '', highlight: content, after: '' };
    }

    return {
        before: context.slice(0, startIndex),
        highlight: content,
        after: context.slice(startIndex + content.length),
    };
}

/**
 * Create a highlight builder
 *
 * @example
 * ```svelte
 * <script>
 *   import { createHighlight } from '$lib/registry/builders/highlight/index.svelte.js';
 *
 *   const highlight = createHighlight(() => ({ event: highlightEvent }), ndk);
 * </script>
 *
 * {highlight.content}
 * {highlight.source?.displayText}
 * ```
 */
export function createHighlight(
    config: () => HighlightConfig,
    ndk?: NDKSvelte
): HighlightState {
    const resolvedNDK = resolveNDK(ndk);

    const state = $state({
        content: '',
        context: '',
        position: { before: '', highlight: '', after: '' } as HighlightPosition,
        source: null as SourceInfo | null,
        article: null as NDKArticle | null,
        urlMetadata: null as UrlMetadata | null,
        loading: false,
    });

    $effect(() => {
        const { event } = config();

        // Extract content
        state.content = event.content || '';

        // Get context tag if available
        const contextTag = event.tags.find(t => t[0] === 'context');
        state.context = contextTag?.[1] || state.content;

        // Calculate position
        state.position = calculatePosition(state.content, state.context);

        // Get source tag (a, e, or r)
        const aTag = event.tags.find(t => t[0] === 'a');
        const eTag = event.tags.find(t => t[0] === 'e');
        const rTag = event.tags.find(t => t[0] === 'r');
        const sourceTag = aTag || eTag || rTag;

        if (!sourceTag) {
            state.source = null;
            state.article = null;
            state.urlMetadata = null;
            return;
        }

        const type = sourceTag[0];
        const value = sourceTag[1];

        if (type === 'r') {
            // Web URL
            state.source = {
                type: 'web',
                displayText: value,
                value,
                url: value,
            };

            // Fetch URL metadata
            state.loading = true;
            fetchUrlMetadata(value)
                .then(metadata => {
                    state.urlMetadata = metadata;
                    if (metadata?.title && state.source?.type === 'web') {
                        state.source.displayText = metadata.title;
                    } else if (metadata?.siteName && state.source?.type === 'web') {
                        state.source.displayText = metadata.siteName;
                    } else {
                        try {
                            const url = new URL(value);
                            if (state.source?.type === 'web') {
                                state.source.displayText = url.hostname.replace('www.', '');
                            }
                        } catch {
                            // Keep original value
                        }
                    }
                })
                .finally(() => {
                    state.loading = false;
                });
        } else if (type === 'a') {
            // Article reference
            state.source = {
                type: 'article',
                displayText: 'Article',
                value,
            };

            // Parse a tag format: "kind:pubkey:d-tag"
            const parts = value.split(':');
            if (parts.length === 3) {
                const [kind, pubkey, dTag] = parts;

                state.loading = true;
                resolvedNDK
                    .guardrailOff()
                    .fetchEvent({
                        kinds: [parseInt(kind)],
                        authors: [pubkey],
                        '#d': [dTag],
                    })
                    .then(articleEvent => {
                        if (articleEvent) {
                            state.article = NDKArticleClass.from(articleEvent);
                            const title = articleEvent.tags.find(t => t[0] === 'title')?.[1];
                            if (title && state.source?.type === 'article') {
                                state.source.displayText = title;
                            }
                        }
                    })
                    .finally(() => {
                        state.loading = false;
                    });
            }
        } else if (type === 'e') {
            // Event reference
            state.source = {
                type: 'event',
                displayText: 'Note',
                value,
            };
        }
    });

    return {
        get content() {
            return state.content;
        },
        get context() {
            return state.context;
        },
        get position() {
            return state.position;
        },
        get source() {
            return state.source;
        },
        get article() {
            return state.article;
        },
        get urlMetadata() {
            return state.urlMetadata;
        },
        get loading() {
            return state.loading;
        },
    };
}
