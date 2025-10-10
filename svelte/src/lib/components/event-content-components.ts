/**
 * Component registry for EventContent segment renderers
 *
 * Allows developers to customize how different content segments are rendered
 * by providing their own components.
 *
 * @example
 * ```ts
 * import { setEventContentComponents } from '@nostr-dev-kit/ndk-svelte';
 * import MyCustomMention from './MyCustomMention.svelte';
 *
 * // Override globally
 * setEventContentComponents({
 *   mention: MyCustomMention
 * });
 *
 * // Or pass to EventContent directly
 * <EventContent {ndk} {content} components={{ mention: MyCustomMention }} />
 * ```
 */

import type { NDKEvent } from "@nostr-dev-kit/ndk";
import type { Component } from "svelte";
import type { NDKSvelte } from "$lib/ndk-svelte.svelte.js";
import EmbeddedEvent from "./embedded-event/EmbeddedEvent.svelte";
import HashtagPreview from "./embedded-event/HashtagPreview.svelte";
// Default component imports
import MentionPreview from "./embedded-event/MentionPreview.svelte";

/**
 * Props for mention components (npub/nprofile)
 */
export interface MentionComponentProps {
    ndk: NDKSvelte;
    bech32: string;
    onClick?: (bech32: string) => void;
    class?: string;
}

/**
 * Props for embedded event components (note/nevent/naddr)
 */
export interface EmbeddedEventComponentProps {
    ndk: NDKSvelte;
    bech32: string;
    onEventClick?: (bech32: string, event: NDKEvent) => void;
    class?: string;
}

/**
 * Props for hashtag components
 */
export interface HashtagComponentProps {
    hashtag: string;
    onClick?: (tag: string) => void;
    class?: string;
}

/**
 * Props for emoji components
 */
export interface EmojiComponentProps {
    url: string;
    name: string;
    class?: string;
}

/**
 * Props for link components
 */
export interface LinkComponentProps {
    url: string;
    onClick?: (url: string) => void;
    class?: string;
}

/**
 * Props for media components
 */
export interface MediaComponentProps {
    url: string;
    type: "image" | "video" | "youtube";
    videoId?: string; // For YouTube
    class?: string;
}

/**
 * Props for image grid components
 */
export interface ImageGridComponentProps {
    images: string[];
    maxImages?: number;
    class?: string;
}

/**
 * Registry of components for different content segment types
 */
export interface EventContentComponents {
    mention?: Component<MentionComponentProps>;
    embeddedEvent?: Component<EmbeddedEventComponentProps>;
    hashtag?: Component<HashtagComponentProps>;
    emoji?: Component<EmojiComponentProps>;
    link?: Component<LinkComponentProps>;
    media?: Component<MediaComponentProps>;
    imageGrid?: Component<ImageGridComponentProps>;
}

/**
 * Default components used by EventContent
 */
export const defaultComponents: EventContentComponents = {
    mention: MentionPreview as Component<MentionComponentProps>,
    embeddedEvent: EmbeddedEvent as Component<EmbeddedEventComponentProps>,
    hashtag: HashtagPreview as Component<HashtagComponentProps>,
    // Other defaults will remain as inline components for now
    // but can be extracted to separate files if needed
};

// Global component registry
let globalComponents: EventContentComponents = { ...defaultComponents };

/**
 * Set global EventContent components
 * These will be used by all EventContent instances unless overridden
 *
 * @param components - Partial registry of components to override
 */
export function setEventContentComponents(components: Partial<EventContentComponents>) {
    globalComponents = {
        ...globalComponents,
        ...components,
    };
}

/**
 * Get the current global EventContent components
 */
export function getEventContentComponents(): EventContentComponents {
    return globalComponents;
}

/**
 * Reset global components to defaults
 */
export function resetEventContentComponents() {
    globalComponents = { ...defaultComponents };
}

/**
 * Merge component registries, with later arguments taking precedence
 */
export function mergeComponentRegistries(...registries: Partial<EventContentComponents>[]): EventContentComponents {
    return Object.assign({}, defaultComponents, globalComponents, ...registries);
}
