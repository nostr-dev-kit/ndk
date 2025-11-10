import NoteCardInline from './note-card-inline.svelte';
import { defaultContentRenderer } from '../../ui/content-renderer';

// Self-register this handler for kind 1 (notes) and kind 1111 (generic replies) with priority 1 (basic/inline)
defaultContentRenderer.addKind([1, 1111], NoteCardInline, 1);

export { NoteCardInline };
export default NoteCardInline;
