import type {
	UserClickCallback,
	EventClickCallback,
	HashtagClickCallback,
	LinkClickCallback,
	MediaClickCallback
} from './entity-click-types.js';

/**
 * Context for entity click handlers.
 * This context is set by EventCard components and consumed by UI-level components
 * (like embedded-event, event-reply-indicator, etc.) to handle user interactions
 * with clickable entities without creating circular dependencies.
 */
export interface EntityClickContext {
	/** Callback when a user (mention or avatar) is clicked */
	onUserClick?: UserClickCallback;

	/** Callback when an event (reply indicator or embedded event) is clicked */
	onEventClick?: EventClickCallback;

	/** Callback when a hashtag is clicked */
	onHashtagClick?: HashtagClickCallback;

	/** Callback when a link is clicked */
	onLinkClick?: LinkClickCallback;

	/** Callback when media is clicked */
	onMediaClick?: MediaClickCallback;
}

export const ENTITY_CLICK_CONTEXT_KEY = Symbol.for('entity-click');
