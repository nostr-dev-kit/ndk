import { NDKHighlight } from '@nostr-dev-kit/ndk';
import HighlightEmbedded from './highlight-embedded.svelte';
import { defaultKindRegistry } from '../../registry.svelte';

// Self-register this handler for NDKHighlight events
// Automatically uses NDKHighlight.kinds [9802] and wraps with NDKHighlight.from()
defaultKindRegistry.add(NDKHighlight, HighlightEmbedded);

export { HighlightEmbedded };
export default HighlightEmbedded;
