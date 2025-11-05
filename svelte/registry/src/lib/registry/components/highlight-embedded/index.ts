import { NDKHighlight } from '@nostr-dev-kit/ndk';
import HighlightEmbedded from './highlight-embedded.svelte';
import { defaultContentRenderer } from '../../ui/content-renderer.svelte.js';

// Self-register this handler for NDKHighlight events
// Automatically uses NDKHighlight.kinds [9802] and wraps with NDKHighlight.from()
defaultContentRenderer.addKind(NDKHighlight, HighlightEmbedded);

export { HighlightEmbedded };
export default HighlightEmbedded;
