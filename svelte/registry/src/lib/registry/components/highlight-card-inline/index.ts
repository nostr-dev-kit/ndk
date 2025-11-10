import { NDKHighlight } from '@nostr-dev-kit/ndk';
import HighlightCardInline from './highlight-card-inline.svelte';
import { defaultContentRenderer } from '../../ui/content-renderer';

// Self-register this handler for NDKHighlight events with priority 1 (basic/inline)
defaultContentRenderer.addKind(NDKHighlight, HighlightCardInline, 1);

export { HighlightCardInline };
export default HighlightCardInline;
