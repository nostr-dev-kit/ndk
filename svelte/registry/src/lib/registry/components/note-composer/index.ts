// @ndk-version: note-composer@0.1.0
/**
 * NoteComposer - Composable note/reply composer components
 *
 * A flexible system for composing notes and replies with mentions and media.
 *
 * The `ndk` prop is optional on Root components - if not provided, it will be retrieved from Svelte context.
 *
 * @example Basic usage (ndk from context):
 * ```svelte
 * <NoteComposer.Root>
 *   <NoteComposer.Textarea />
 *   <NoteComposer.Media />
 *   <NoteComposer.Submit />
 * </NoteComposer.Root>
 * ```
 *
 * @example With reply:
 * ```svelte
 * <NoteComposer.Root replyTo={event}>
 *   <NoteComposer.Textarea placeholder="Write your reply..." />
 *   <NoteComposer.Submit />
 * </NoteComposer.Root>
 * ```
 *
 * @example With mentions:
 * ```svelte
 * <NoteComposer.Root onPublish={(event) => console.log('Published!', event)}>
 *   <NoteComposer.Textarea />
 *   <NoteComposer.MentionInput />
 *   <NoteComposer.Media />
 *   <NoteComposer.Submit />
 * </NoteComposer.Root>
 * ```
 */

import Root from './note-composer-root.svelte';
import Textarea from './note-composer-textarea.svelte';
import MentionInput from './note-composer-mention-input.svelte';
import Media from './note-composer-media.svelte';
import Submit from './note-composer-submit.svelte';

export { createNoteComposer, type NoteComposerInstance, type NoteComposerOptions } from './createNoteComposer.svelte';
export type { NoteComposerContext } from './context.svelte';

export const NoteComposer = {
	Root,
	Textarea,
	MentionInput,
	Media,
	Submit
};
