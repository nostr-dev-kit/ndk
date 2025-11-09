import NoteCardCompact from './note-card-compact.svelte';
import { defaultContentRenderer } from '../../../../ui/content-renderer';

// Self-register this handler for kind 1 (notes) and kind 1111 (generic replies) if not already registered
if (!defaultContentRenderer.getKindHandler(1) && !defaultContentRenderer.getKindHandler(1111)) {
	defaultContentRenderer.addKind([1, 1111], NoteCardCompact);
}

export { NoteCardCompact };
export default NoteCardCompact;
