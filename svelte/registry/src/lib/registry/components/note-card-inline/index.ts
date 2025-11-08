import NoteCardInline from './note-card-inline.svelte';
import { defaultContentRenderer } from '../../ui/content-renderer.svelte.js';

// Self-register this handler for kind 1 (notes) and kind 1111 (generic replies) if not already registered
if (!defaultContentRenderer.getKindHandler(1) && !defaultContentRenderer.getKindHandler(1111)) {
	defaultContentRenderer.addKind([1, 1111], NoteCardInline);
}

export { NoteCardInline };
export default NoteCardInline;
