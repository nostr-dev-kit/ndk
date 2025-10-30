/**
 * EventContent - Rich event content renderer
 *
 * Automatically detects and parses:
 * - User mentions (npub, nprofile)
 * - Event references (note, nevent, naddr)
 * - Media (images, videos, YouTube embeds)
 * - Custom emojis
 * - Hashtags
 * - Links
 *
 * @example Basic usage:
 * ```svelte
 * <EventContent {ndk} {event} />
 * ```
 *
 * @example With custom snippets:
 * ```svelte
 * <EventContent {ndk} {event}>
 *   {#snippet mention({ bech32 })}
 *     <Mention {ndk} {bech32} />
 *   {/snippet}
 *   {#snippet hashtag({ tag })}
 *     <Hashtag {tag} onclick={handleHashtagClick} />
 *   {/snippet}
 * </EventContent>
 * ```
 */

export { default as EventContent } from './event-content.svelte';
export { default as Mention } from './mention/mention.svelte';
export { default as Hashtag } from './hashtag/hashtag.svelte';

/**
 * EmbeddedEvent - Renders embedded Nostr events based on their kind
 *
 * Uses a simple KIND_HANDLERS map to determine which component renders each event kind.
 * Falls back to a generic renderer for unknown kinds.
 *
 * Supported kinds by default:
 * - 30023: Long-form articles (ArticleEmbedded)
 * - 1: Short text notes (NoteEmbedded)
 * - 1111: Generic replies (NoteEmbedded)
 * - 9802: Highlights (HighlightEmbedded)
 *
 * To add support for a new kind:
 * 1. Create a new kind handler component in `kinds/`
 * 2. Import it in `event/event.svelte`
 * 3. Add an entry to the KIND_HANDLERS map
 *
 * @example Basic usage:
 * ```svelte
 * <EmbeddedEvent {ndk} bech32="nevent1..." />
 * ```
 *
 * @example With variant:
 * ```svelte
 * <EmbeddedEvent {ndk} bech32="naddr1..." variant="compact" />
 * ```
 */
export { default as EmbeddedEvent } from './event/event.svelte';

// Kind-specific embedded renderers (use these directly or register in KIND_HANDLERS)
export { default as ArticleEmbedded } from './kinds/article-embedded.svelte';
export { default as NoteEmbedded } from './kinds/note-embedded.svelte';
export { default as HighlightEmbedded } from './kinds/highlight-embedded.svelte';
export { default as GenericEmbedded } from './event/generic-embedded.svelte';
