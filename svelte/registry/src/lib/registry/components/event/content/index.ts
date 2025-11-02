/**
 * @deprecated This module path is deprecated. Import from the correct locations:
 * - EventContent, EmbeddedEvent: from '$lib/registry/ui'
 * - Mention: from '$lib/registry/components/mention'
 * - Embedded components: from '$lib/registry/components/*-embedded'
 *
 * This file provides backwards compatibility but will be removed in a future version.
 */

// Re-export from UI
export { default as EventContent } from '../../../ui/event-content.svelte';
export { default as EmbeddedEvent } from '../../../ui/embedded-event.svelte';

// Re-export Mention
export { Mention } from '../../mention';

// Re-export embedded components
export { ArticleEmbedded } from '../../article-embedded';
export { NoteEmbedded } from '../../note-embedded';
export { HighlightEmbedded } from '../../highlight-embedded';

// GenericEmbedded doesn't exist - it's just the default EmbeddedEvent
export { default as GenericEmbedded } from '../../../ui/embedded-event.svelte';
