import { NDKHighlight } from '@nostr-dev-kit/ndk';
import HighlightCardInline from './highlight-card-inline.svelte';
import { defaultContentRenderer } from '$lib/registry/ui/content-renderer.svelte.js';

// Self-register this handler for NDKHighlight events if not already registered
if (!defaultContentRenderer.getKindHandler(9802)) {
	defaultContentRenderer.addKind(NDKHighlight, HighlightCardInline);
}

export { HighlightCardInline };
export default HighlightCardInline;
