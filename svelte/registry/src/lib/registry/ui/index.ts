// Content rendering system
export {
	ContentRenderer,
	defaultContentRenderer,
	type NDKWrapper,
	type HandlerInfo,
	type MentionComponent,
	type HashtagComponent,
	type LinkComponent,
	type MediaComponent
} from './content-renderer.svelte.js';

export { default as EventContent } from './event-content.svelte';
export { default as EmbeddedEvent } from './embedded-event.svelte';

// Other UI primitives
export { default as Input } from './input.svelte';

// Namespaced primitives
export { User, type UserContext } from './user/index.js';
export { Article, type ArticleContext } from './article/index.js';
export { Highlight, type HighlightContext } from './highlight/index.js';
export { UserInput, type UserInputContext } from './user-input/index.js';
export { VoiceMessage, type VoiceMessageContext } from './voice-message/index.js';
export { MediaUpload, createMediaUpload, type MediaUploadResult, type MediaUploadOptions } from './media-upload/index.js';
export { Reaction } from './reaction/index.js';
export { FollowPack, FOLLOW_PACK_CONTEXT_KEY, type FollowPackContext } from './follow-pack/index.js';
export { Relay, type RelayContext } from './relay/index.js';

// Zap primitives (display only)
export { Amount as ZapAmount, Content as ZapContent } from './zap/index.js';

// Shared utilities
export { getNDKFromContext } from './ndk-context.svelte.js';
