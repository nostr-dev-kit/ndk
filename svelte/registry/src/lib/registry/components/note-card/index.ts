import NoteCard from './note-card.svelte';
import { defaultContentRenderer } from '../../ui/content-renderer';

// Self-register this handler for kind 1 (notes) and kind 1111 (generic replies) with priority 10 (standard/full)
defaultContentRenderer.addKind([1, 1111], NoteCard, 10);

export { NoteCard };
export default NoteCard;
