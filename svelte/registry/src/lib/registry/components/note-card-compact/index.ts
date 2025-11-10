import NoteCardCompact from './note-card-compact.svelte';
import { defaultContentRenderer } from '../../ui/content-renderer';

// Self-register this handler for kind 1 (notes) and kind 1111 (generic replies) with priority 5 (compact)
defaultContentRenderer.addKind([1, 1111], NoteCardCompact, 5);

export { NoteCardCompact };
export default NoteCardCompact;
