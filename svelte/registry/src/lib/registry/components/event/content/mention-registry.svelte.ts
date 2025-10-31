import type { Component } from 'svelte';
import type { NDKSvelte } from '@nostr-dev-kit/svelte';

/**
 * Mention component interface
 */
export type MentionComponent = Component<{
  ndk: NDKSvelte;
  bech32: string;
  class?: string;
}>;

/**
 * Default mention component to use globally
 *
 * Set this to customize how mentions are rendered throughout your app.
 */
let defaultMentionComponent = $state<MentionComponent | null>(null);

/**
 * Set the default mention component globally
 *
 * @example
 * ```ts
 * import { setDefaultMention } from '$lib/registry/components/event/content';
 * import { MentionModern } from '$lib/registry/components/blocks';
 *
 * setDefaultMention(MentionModern);
 * ```
 */
export function setDefaultMention(component: MentionComponent | null): void {
  defaultMentionComponent = component;
}

/**
 * Get the current default mention component
 *
 * @internal - Used by EventContent component
 */
export function getDefaultMention(): MentionComponent | null {
  return defaultMentionComponent;
}
