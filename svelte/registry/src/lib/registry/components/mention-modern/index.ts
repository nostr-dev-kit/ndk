import MentionModern from './mention-modern.svelte';
import { defaultContentRenderer } from '../../ui/content-renderer';

// Self-register with priority 10 (modern/enhanced)
defaultContentRenderer.setMentionComponent(MentionModern, 10);

export { MentionModern };
export default MentionModern;
