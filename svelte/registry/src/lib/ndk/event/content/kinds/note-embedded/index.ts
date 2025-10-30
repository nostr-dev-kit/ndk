import NoteEmbedded from './note-embedded.svelte';
import { defaultKindRegistry } from '../../registry.svelte';

// Self-register this handler for kind 1 (notes) and kind 1111 (generic replies)
// No NDK wrapper class exists for these, so we use manual kind numbers
defaultKindRegistry.add([1, 1111], NoteEmbedded);

export { NoteEmbedded };
export default NoteEmbedded;
