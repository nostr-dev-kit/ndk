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
 * Uses a KindRegistry to map event kinds to rendering components.
 * Falls back to a generic renderer for unknown kinds.
 *
 * Supported kinds by default (via embedded-handlers.ts):
 * - 30023: Long-form articles (ArticleEmbedded)
 * - 1, 1111: Notes and replies (NoteEmbedded)
 * - 9802: Highlights (HighlightEmbedded)
 *
 * To add support for a new kind:
 * 1. Install: `npx shadcn-svelte@latest add video-embedded`
 * 2. Post-install automatically adds import to embedded-handlers.ts
 *
 * Or manually:
 *   Add `import '$lib/ndk/event/content/kinds/video-embedded'` to embedded-handlers.ts
 *
 * @example Basic usage (uses defaultKindRegistry):
 * ```svelte
 * <EmbeddedEvent {ndk} bech32="nevent1..." />
 * ```
 *
 * @example With custom registry (for variant-specific rendering):
 * ```svelte
 * <script>
 *   import { KindRegistry } from '.';
 *   import { NDKArticle } from '@nostr-dev-kit/ndk';
 *   import ArticleCompactPreview from './article-compact-preview.svelte';
 *
 *   const customRegistry = new KindRegistry();
 *   customRegistry.add(NDKArticle, ArticleCompactPreview);
 * </script>
 *
 * <EmbeddedEvent {ndk} bech32="naddr1..." {kindRegistry} />
 * ```
 */
export { default as EmbeddedEvent } from './event/event.svelte';

// Registry system
export { KindRegistry, defaultKindRegistry } from './registry.svelte';
export type { NDKWrapper, HandlerInfo } from './registry.svelte';

// Kind-specific embedded renderers
export { default as ArticleEmbedded } from './kinds/article-embedded/article-embedded.svelte';
export { default as NoteEmbedded } from './kinds/note-embedded/note-embedded.svelte';
export { default as HighlightEmbedded } from './kinds/highlight-embedded/highlight-embedded.svelte';
export { default as GenericEmbedded } from './event/generic-embedded.svelte';

// NIP-89 embedded renderers
export { default as AppRecommendationEmbedded } from './kinds/app-recommendation-embedded/app-recommendation-embedded.svelte';
export { default as HandlerInfoEmbedded } from './kinds/handler-info-embedded/handler-info-embedded.svelte';
