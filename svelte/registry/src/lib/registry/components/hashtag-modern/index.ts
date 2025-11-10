import HashtagModern from './hashtag-modern.svelte';
import { defaultContentRenderer } from '../../ui/content-renderer';

// Self-register with priority 10 (modern/enhanced)
defaultContentRenderer.setHashtagComponent(HashtagModern, 10);

export { HashtagModern };
export default HashtagModern;
