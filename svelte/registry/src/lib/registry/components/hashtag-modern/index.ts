import HashtagModern from './hashtag-modern.svelte';
import { defaultContentRenderer } from '../../../../ui/content-renderer';

// Self-register this component as the default hashtag handler
defaultContentRenderer.hashtagComponent = HashtagModern;

export { HashtagModern };
export default HashtagModern;
