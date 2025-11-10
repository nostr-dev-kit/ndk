import type { NDKEvent } from '@nostr-dev-kit/ndk';

/**
 * Callback types for entity click handlers.
 * These types are shared between EventCardContext and EntityClickContext.
 */

/** Callback when a user (mention or avatar) is clicked */
export type UserClickCallback = (pubkey: string) => void;

/** Callback when an event (reply indicator or embedded event) is clicked */
export type EventClickCallback = (event: NDKEvent) => void;

/** Callback when a hashtag is clicked */
export type HashtagClickCallback = (tag: string) => void;

/** Callback when a link is clicked */
export type LinkClickCallback = (url: string) => void;

/** Callback when media is clicked */
export type MediaClickCallback = (url: string | string[]) => void;
