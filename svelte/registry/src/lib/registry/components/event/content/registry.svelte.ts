import type { Component } from 'svelte';
import type { NDKEvent } from '@nostr-dev-kit/ndk';
import type { NDKSvelte } from '@nostr-dev-kit/svelte';

/**
 * NDK wrapper class with static properties
 */
export type NDKWrapper = {
  kinds?: number[];
  from?: (event: NDKEvent) => NDKEvent;
};

/**
 * Handler information stored in the registry
 */
export type HandlerInfo = {
  component: Component<{
    ndk: NDKSvelte;
    event: NDKEvent;
    variant?: 'inline' | 'card' | 'compact';
  }>;
  wrapper: NDKWrapper | null;
};

/**
 * KindRegistry - Maps Nostr event kinds to rendering components
 *
 * Supports two registration patterns:
 * 1. NDK wrapper classes (automatic kind extraction + type-safe wrapping)
 * 2. Manual kind arrays (for kinds without wrapper classes)
 *
 * @example With NDK wrapper class:
 * ```ts
 * import { NDKArticle } from '@nostr-dev-kit/ndk';
 * import ArticleEmbedded from './article-embedded.svelte';
 *
 * registry.add(NDKArticle, ArticleEmbedded);
 * // Automatically registers kind 30023 and wraps events with NDKArticle.from()
 * ```
 *
 * @example With manual kind numbers:
 * ```ts
 * import NoteEmbedded from './note-embedded.svelte';
 *
 * registry.add([1, 1111], NoteEmbedded);
 * // Registers kinds 1 and 1111 without wrapping
 * ```
 */
export class KindRegistry {
  private handlers = new Map<number, HandlerInfo>();

  /**
   * Register a handler for one or more event kinds
   *
   * @param target - NDK wrapper class (with .kinds and .from()) or array of kind numbers
   * @param component - Svelte component to render this kind
   */
  add(target: NDKWrapper | number[], component: Component<any>): void {
    if (Array.isArray(target)) {
      // Manual kind numbers - no wrapper
      for (const kind of target) {
        this.handlers.set(kind, { component, wrapper: null });
      }
    } else {
      // NDK wrapper class
      const kinds = target.kinds || [];
      const wrapper = target.from ? target : null;

      for (const kind of kinds) {
        this.handlers.set(kind, { component, wrapper });
      }
    }
  }

  /**
   * Get handler information for a specific kind
   *
   * @returns Handler info with component and optional wrapper, or undefined if not registered
   */
  get(kind: number | undefined): HandlerInfo | undefined {
    if (kind === undefined) return undefined;
    return this.handlers.get(kind);
  }

  /**
   * Check if a kind has a registered handler
   */
  has(kind: number): boolean {
    return this.handlers.has(kind);
  }

  /**
   * Get all registered kinds (for debugging)
   */
  getRegisteredKinds(): number[] {
    return Array.from(this.handlers.keys()).sort((a, b) => a - b);
  }

  /**
   * Clear all registered handlers (useful for testing)
   */
  clear(): void {
    this.handlers.clear();
  }
}

/**
 * Default global registry instance
 *
 * This is used when no custom registry is provided.
 * Import embedded-handlers.ts to populate it with default handlers.
 */
export const defaultKindRegistry = new KindRegistry();
