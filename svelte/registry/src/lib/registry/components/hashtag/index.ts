import { defaultContentRenderer } from '../../ui/content-renderer';
import Hashtag from './hashtag.svelte';

// Self-register when this file is imported
if (!defaultContentRenderer.hashtagComponent) {
	defaultContentRenderer.hashtagComponent = Hashtag;
}

export { Hashtag };
export default Hashtag;
