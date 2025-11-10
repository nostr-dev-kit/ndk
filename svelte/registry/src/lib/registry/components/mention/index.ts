import { defaultContentRenderer } from '../../ui/content-renderer';
import Mention from './mention.svelte';

// Self-register with priority 1 (basic)
defaultContentRenderer.setMentionComponent(Mention, 1);

export { Mention };
export default Mention;
