import type { ContentRenderer } from './index.svelte';
import type { NDKEvent } from '@nostr-dev-kit/ndk';

export const CONTENT_RENDERER_CONTEXT_KEY = Symbol('content-renderer');

export interface ContentRendererContext {
	renderer: ContentRenderer;
	onEventClick?: (event: NDKEvent) => void;
	onUserClick?: (pubkey: string) => void;
}
