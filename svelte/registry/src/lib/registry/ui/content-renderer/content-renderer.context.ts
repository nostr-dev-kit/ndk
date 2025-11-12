import type {
	ContentRenderer,
	UserClickCallback,
	EventClickCallback,
	HashtagClickCallback,
	LinkClickCallback,
	MediaClickCallback
} from './index.svelte';

export const CONTENT_RENDERER_CONTEXT_KEY = Symbol('content-renderer');

export interface ContentRendererContext {
	renderer: ContentRenderer;
	onUserClick?: UserClickCallback;
	onEventClick?: EventClickCallback;
	onHashtagClick?: HashtagClickCallback;
	onLinkClick?: LinkClickCallback;
	onMediaClick?: MediaClickCallback;
}
