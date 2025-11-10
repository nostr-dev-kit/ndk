import { defaultContentRenderer } from '../../ui/content-renderer';
import Hashtag from './hashtag.svelte';

// Self-register with priority 1 (basic)
defaultContentRenderer.setHashtagComponent(Hashtag, 1);

export { Hashtag };
export default Hashtag;
