import type { Component } from 'svelte';
import type { NDKEvent } from '@nostr-dev-kit/ndk';
import type { NDKSvelte } from '@nostr-dev-kit/svelte';

/**
 * NDK wrapper class with static properties
 */
export type NDKWrapper = {
	kinds?: number[];
	from?: (event: NDKEvent) => NDKEvent;
};

/**
 * Handler information for embedded event kinds
 */
export type HandlerInfo = {
	component: Component<{
		ndk: NDKSvelte;
		event: NDKEvent;
		variant?: 'inline' | 'card' | 'compact';
	}>;
	wrapper: NDKWrapper | null;
};

/**
 * Mention component interface
 */
export type MentionComponent = Component<{
	ndk: NDKSvelte;
	bech32: string;
	class?: string;
}>;

/**
 * Hashtag component interface
 */
export type HashtagComponent = Component<{
	tag: string;
	onclick?: (tag: string) => void;
	class?: string;
}>;

/**
 * Link component interface
 * Accepts either a single URL or an array of URLs (for grouped links)
 */
export type LinkComponent = Component<{
	url: string | string[];
	class?: string;
}>;

/**
 * Media component interface
 * Accepts either a single URL or an array of URLs (for grouped media)
 */
export type MediaComponent = Component<{
	url: string | string[];
	type?: string;
	class?: string;
}>;

/**
 * ContentRenderer - Unified system for customizing content rendering
 *
 * A single, cohesive system for all content customization.
 *
 * Features:
 * - Inline handler properties (mentions, hashtags, links, media)
 * - Embedded event kind registry (articles, highlights, notes, etc.)
 * - All handlers start as null (raw rendering by default)
 * - Progressive enhancement via imports
 *
 * @example Minimal usage (raw rendering):
 * ```svelte
 * <EventContent ndk={ndk} event={event} />
 * <!-- Renders: "hello nostr:npub1..." -->
 * ```
 *
 * @example With handlers:
 * ```ts
 * import { defaultContentRenderer } from '$lib/ui';
 * import Mention from '$lib/components/mention.svelte';
 * // Import embedded components to auto-register handlers
 * import '$lib/registry/components/article-embedded';
 * import '$lib/registry/components/note-embedded';
 *
 * defaultContentRenderer.mentionComponent = Mention;
 * ```
 *
 * @example Custom renderer:
 * ```ts
 * const customRenderer = new ContentRenderer();
 * customRenderer.mentionComponent = MyMention;
 * ```
 */
export class ContentRenderer {
	/**
	 * Component for rendering npub/nprofile mentions
	 * If null, renders raw bech32 string
	 */
	mentionComponent = $state<MentionComponent | null>(null);

	/**
	 * Component for rendering hashtags
	 * If null, renders raw #tag
	 */
	hashtagComponent = $state<HashtagComponent | null>(null);

	/**
	 * Component for rendering links
	 * If null, renders raw URL
	 */
	linkComponent = $state<LinkComponent | null>(null);

	/**
	 * Component for rendering media (images, videos)
	 * If null, renders raw URL
	 */
	mediaComponent = $state<MediaComponent | null>(null);

	/**
	 * Registry of embedded event kind handlers
	 * Maps event kind → { component, wrapper }
	 */
	private handlers = new Map<number, HandlerInfo>();

	/**
	 * Register a handler for one or more event kinds
	 *
	 * Supports two patterns:
	 * 1. NDK wrapper classes (automatic kind extraction + wrapping)
	 * 2. Manual kind arrays (for kinds without wrapper classes)
	 *
	 * @param target - NDK wrapper class (with .kinds and .from()) or array of kind numbers
	 * @param component - Svelte component to render this kind
	 *
	 * @example With NDK wrapper class:
	 * ```ts
	 * import { NDKArticle } from '@nostr-dev-kit/ndk';
	 * import ArticleEmbedded from './article-embedded.svelte';
	 *
	 * defaultContentRenderer.addKind(NDKArticle, ArticleEmbedded);
	 * // Auto-registers kind 30023, wraps with NDKArticle.from()
	 * ```
	 *
	 * @example With manual kinds:
	 * ```ts
	 * import NoteEmbedded from './note-embedded.svelte';
	 *
	 * defaultContentRenderer.addKind([1, 1111], NoteEmbedded);
	 * // Registers kinds 1 and 1111 without wrapping
	 * ```
	 */
	addKind(target: NDKWrapper | number[], component: Component<any>): void {
		if (Array.isArray(target)) {
			// Manual kind numbers - no wrapper
			for (const kind of target) {
				this.handlers.set(kind, { component, wrapper: null });
			}
		} else {
			// NDK wrapper class
			const kinds = target.kinds || [];
			const wrapper = target.from ? target : null;

			for (const kind of kinds) {
				this.handlers.set(kind, { component, wrapper });
			}
		}
	}

	/**
	 * Get handler information for a specific event kind
	 *
	 * @returns Handler info with component and optional wrapper, or undefined if not registered
	 */
	getKindHandler(kind: number | undefined): HandlerInfo | undefined {
		if (kind === undefined) return undefined;
		return this.handlers.get(kind);
	}

	/**
	 * Check if a kind has a registered handler
	 *
	 * @param kind - Event kind number
	 * @returns true if handler exists, false otherwise
	 */
	hasKindHandler(kind: number | undefined): boolean {
		if (kind === undefined) return false;
		return this.handlers.has(kind);
	}

	/**
	 * Get all registered kinds (for debugging)
	 *
	 * @returns Sorted array of registered kind numbers
	 */
	getRegisteredKinds(): number[] {
		return Array.from(this.handlers.keys()).sort((a, b) => a - b);
	}

	/**
	 * Clear all registered handlers (useful for testing)
	 */
	clear(): void {
		this.handlers.clear();
		this.mentionComponent = null;
		this.hashtagComponent = null;
		this.linkComponent = null;
		this.mediaComponent = null;
	}
}

/**
 * Default global ContentRenderer instance
 *
 * This is used when no custom renderer is provided to EventContent.
 * Starts empty - import handler components to populate it.
 *
 * @example
 * ```ts
 * import '$lib/components/mention';
 * import '$lib/components/hashtag';
 * // Import embedded components to auto-register handlers
 * import '$lib/registry/components/article-embedded';
 * import '$lib/registry/components/note-embedded';
 * import '$lib/registry/components/highlight-embedded';
 * ```
 */
export const defaultContentRenderer = new ContentRenderer();
