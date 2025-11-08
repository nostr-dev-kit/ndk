import { defaultContentRenderer } from '../../ui/content-renderer';
import Mention from './mention.svelte';

// Self-register when this file is imported
if (!defaultContentRenderer.mentionComponent) {
	defaultContentRenderer.mentionComponent = Mention;
}

export { Mention };
export default Mention;
