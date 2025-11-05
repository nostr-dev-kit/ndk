import Root from './note-composer-root.svelte';
import Textarea from './note-composer-textarea.svelte';
import MentionInput from './note-composer-mention-input.svelte';
import Media from './note-composer-media.svelte';
import Submit from './note-composer-submit.svelte';

export const NoteComposer = {
	Root,
	Textarea,
	MentionInput,
	Media,
	Submit
};

export { default as NoteComposerInline } from './note-composer-inline.svelte';
export { default as NoteComposerCard } from './note-composer-card.svelte';
export { default as NoteComposerMinimal } from './note-composer-minimal.svelte';
export { default as NoteComposerModal } from './note-composer-modal.svelte';
