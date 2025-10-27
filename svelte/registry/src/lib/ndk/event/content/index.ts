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
export { default as EmbeddedEvent } from './event/event.svelte';
