import MentionModern from './mention-modern.svelte';
import { defaultContentRenderer } from '../../../../ui/content-renderer';

// Self-register this component as the default mention handler
defaultContentRenderer.mentionComponent = MentionModern;

export { MentionModern };
export default MentionModern;
