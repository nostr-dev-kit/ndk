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
	}>;
	wrapper: NDKWrapper | null;
	priority: number;
};

/**
 * Mention component interface
 */
export type MentionComponent = Component<{
	ndk: NDKSvelte;
	bech32: string;
	onclick?: (pubkey: string) => void;
	class?: string;
}>;

/**
 * Hashtag component interface
 */
export type HashtagComponent = Component<{
	ndk: NDKSvelte;
	tag: string;
	onclick?: (tag: string) => void;
	class?: string;
}>;

/**
 * Link component interface
 * Accepts a single URL only
 */
export type LinkComponent = Component<{
	url: string;
	onclick?: (url: string) => void;
	class?: string;
}>;

/**
 * Media component interface
 * Accepts an array of URLs with the ability to handle clicks with index information
 */
export type MediaComponent = Component<{
	url: string[];
	type?: string;
	onclick?: (urls: string[], clickedIndex: number) => void;
	class?: string;
}>;

/**
 * Entity click callback types
 */
export type UserClickCallback = (pubkey: string) => void;
export type EventClickCallback = (event: NDKEvent) => void;
export type HashtagClickCallback = (tag: string) => void;
export type LinkClickCallback = (url: string) => void;
export type MediaClickCallback = (urls: string[], clickedIndex: number) => void;

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
	 * Global configuration for NSFW content blocking
	 * When true, content with content-warning tags will be blurred by default
	 */
	blockNsfw: boolean = true;

	/**
	 * Component for rendering npub/nprofile mentions
	 * If null, renders raw bech32 string
	 */
	mentionComponent: MentionComponent | null = null;

	/**
	 * Component for rendering hashtags
	 * If null, renders raw #tag
	 */
	hashtagComponent: HashtagComponent | null = null;

	/**
	 * Component for rendering links
	 * If null, renders raw URL
	 */
	linkComponent: LinkComponent | null = null;

	/**
	 * Component for rendering media (images, videos)
	 * If null, renders raw URL
	 */
	mediaComponent: MediaComponent | null = null;

	/**
	 * Fallback component for rendering embedded events with no registered kind handler
	 * If null, renders raw bech32 string
	 * Users can register fallback-embedded or any other component as the fallback
	 */
	fallbackComponent: Component<{
		ndk: NDKSvelte;
		event: NDKEvent;
		class?: string;
	}> | null = null;

	/**
	 * Click callbacks for interactive content
	 * These are passed to components as onclick props
	 */
	onUserClick?: UserClickCallback;
	onEventClick?: EventClickCallback;
	onHashtagClick?: HashtagClickCallback;
	onLinkClick?: LinkClickCallback;
	onMediaClick?: MediaClickCallback;

	/**
	 * Registry of embedded event kind handlers
	 * Maps event kind → { component, wrapper, priority }
	 */
	private handlers = new Map<number, HandlerInfo>();

	/**
	 * Priority tracking for inline components
	 */
	private mentionPriority = 0;
	private hashtagPriority = 0;
	private linkPriority = 0;
	private mediaPriority = 0;
	private fallbackPriority = 0;

	/**
	 * Register a handler for one or more event kinds
	 *
	 * Supports two patterns:
	 * 1. NDK wrapper classes (automatic kind extraction + wrapping)
	 * 2. Manual kind arrays (for kinds without wrapper classes)
	 *
	 * @param target - NDK wrapper class (with .kinds and .from()) or array of kind numbers
	 * @param component - Svelte component to render this kind
	 * @param priority - Priority for this handler (default: 1). Higher priority handlers replace lower ones.
	 *
	 * @example With NDK wrapper class:
	 * ```ts
	 * import { NDKArticle } from '@nostr-dev-kit/ndk';
	 * import ArticleEmbedded from './article-embedded.svelte';
	 *
	 * defaultContentRenderer.addKind(NDKArticle, ArticleEmbedded, 10);
	 * // Auto-registers kind 30023, wraps with NDKArticle.from()
	 * ```
	 *
	 * @example With manual kinds:
	 * ```ts
	 * import NoteEmbedded from './note-embedded.svelte';
	 *
	 * defaultContentRenderer.addKind([1, 1111], NoteEmbedded, 5);
	 * // Registers kinds 1 and 1111 without wrapping
	 * ```
	 */
	addKind(target: NDKWrapper | number[], component: Component<any>, priority: number = 1): void {
		if (Array.isArray(target)) {
			// Manual kind numbers - no wrapper
			for (const kind of target) {
				const existing = this.handlers.get(kind);
				if (!existing || priority >= existing.priority) {
					this.handlers.set(kind, { component, wrapper: null, priority });
				}
			}
		} else {
			// NDK wrapper class
			const kinds = target.kinds || [];
			const wrapper = target.from ? target : null;

			for (const kind of kinds) {
				const existing = this.handlers.get(kind);
				if (!existing || priority >= existing.priority) {
					this.handlers.set(kind, { component, wrapper, priority });
				}
			}
		}
	}

	/**
	 * Set the mention component with priority
	 * @param component - Component to render mentions
	 * @param priority - Priority for this component (default: 1)
	 */
	setMentionComponent(component: MentionComponent | null, priority: number = 1): void {
		if (priority >= this.mentionPriority) {
			this.mentionComponent = component;
			this.mentionPriority = priority;
		}
	}

	/**
	 * Set the hashtag component with priority
	 * @param component - Component to render hashtags
	 * @param priority - Priority for this component (default: 1)
	 */
	setHashtagComponent(component: HashtagComponent | null, priority: number = 1): void {
		if (priority >= this.hashtagPriority) {
			this.hashtagComponent = component;
			this.hashtagPriority = priority;
		}
	}

	/**
	 * Set the link component with priority
	 * @param component - Component to render links
	 * @param priority - Priority for this component (default: 1)
	 */
	setLinkComponent(component: LinkComponent | null, priority: number = 1): void {
		if (priority >= this.linkPriority) {
			this.linkComponent = component;
			this.linkPriority = priority;
		}
	}

	/**
	 * Set the media component with priority
	 * @param component - Component to render media
	 * @param priority - Priority for this component (default: 1)
	 */
	setMediaComponent(component: MediaComponent | null, priority: number = 1): void {
		if (priority >= this.mediaPriority) {
			this.mediaComponent = component;
			this.mediaPriority = priority;
		}
	}

	/**
	 * Set the fallback component with priority
	 * @param component - Component to render unhandled events
	 * @param priority - Priority for this component (default: 1)
	 */
	setFallbackComponent(component: Component<any> | null, priority: number = 1): void {
		if (priority >= this.fallbackPriority) {
			this.fallbackComponent = component;
			this.fallbackPriority = priority;
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
	 * Get current priorities for inline components (for debugging)
	 *
	 * @returns Object with component names and their priorities
	 */
	getInlinePriorities(): Record<string, number> {
		return {
			mention: this.mentionPriority,
			hashtag: this.hashtagPriority,
			link: this.linkPriority,
			media: this.mediaPriority,
			fallback: this.fallbackPriority
		};
	}

	/**
	 * Get current priorities for event kind handlers (for debugging)
	 *
	 * @returns Map of kind numbers to their priorities
	 */
	getKindPriorities(): Map<number, number> {
		const priorities = new Map<number, number>();
		for (const [kind, info] of this.handlers) {
			priorities.set(kind, info.priority);
		}
		return priorities;
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
		this.fallbackComponent = null;
		this.onUserClick = undefined;
		this.onEventClick = undefined;
		this.onHashtagClick = undefined;
		this.onLinkClick = undefined;
		this.onMediaClick = undefined;
		this.mentionPriority = 0;
		this.hashtagPriority = 0;
		this.linkPriority = 0;
		this.mediaPriority = 0;
		this.fallbackPriority = 0;
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
