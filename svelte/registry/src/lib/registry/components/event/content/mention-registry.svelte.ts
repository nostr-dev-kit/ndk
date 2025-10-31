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
 * MentionRegistry - Configure which mention component to use globally
 *
 * This allows you to set a default mention component that will be used
 * throughout your app without needing to provide custom snippets everywhere.
 *
 * @example Basic usage:
 * ```ts
 * import { defaultMentionRegistry } from '$lib/ndk/event/content';
 * import { MentionModern } from '$lib/ndk/blocks';
 *
 * // Set globally at app startup
 * defaultMentionRegistry.set(MentionModern);
 * ```
 *
 * @example Using in EventContent:
 * ```svelte
 * <EventContent {ndk} {event} />
 * <!-- Will automatically use MentionModern if registered -->
 * ```
 *
 * @example Custom registry per component:
 * ```svelte
 * <script>
 *   import { MentionRegistry } from '$lib/ndk/event/content';
 *   import { MentionModern } from '$lib/ndk/blocks';
 *
 *   const customRegistry = new MentionRegistry();
 *   customRegistry.set(MentionModern);
 * </script>
 *
 * <EventContent {ndk} {event} mentionRegistry={customRegistry} />
 * ```
 */
export class MentionRegistry {
  private component: MentionComponent | null = null;

  /**
   * Set the mention component to use
   *
   * @param component - Svelte component that accepts ndk, bech32, and optional class props
   */
  set(component: MentionComponent): void {
    this.component = component;
  }

  /**
   * Get the registered mention component
   *
   * @returns The registered component, or null if none is set
   */
  get(): MentionComponent | null {
    return this.component;
  }

  /**
   * Check if a component is registered
   */
  has(): boolean {
    return this.component !== null;
  }

  /**
   * Clear the registered component
   */
  clear(): void {
    this.component = null;
  }
}

/**
 * Default global mention registry instance
 *
 * Use this to set the mention component globally for your entire app.
 *
 * @example
 * ```ts
 * import { defaultMentionRegistry } from '$lib/ndk/event/content';
 * import { MentionModern } from '$lib/ndk/blocks';
 *
 * defaultMentionRegistry.set(MentionModern);
 * ```
 */
export const defaultMentionRegistry = new MentionRegistry();
