/**
 * ID generation system for UI components.
 * Based on bits-ui's ID system for accessibility and component coordination.
 *
 * Generates unique IDs for:
 * - ARIA relationships (aria-labelledby, aria-describedby, aria-controls)
 * - Roving focus management
 * - Content-trigger associations
 */

/**
 * Global ID counter stored on globalThis to persist across module reloads.
 * Ensures IDs remain unique throughout the application lifecycle.
 */
declare global {
	interface Window {
		__registryIdCounter?: { current: number };
	}
}

if (typeof globalThis !== 'undefined') {
	(globalThis as any).__registryIdCounter ??= { current: 0 };
}

/**
 * Generates a unique ID with optional prefix.
 *
 * @param prefix - Optional prefix for the ID (default: "bits")
 * @returns A unique ID string like "bits-1", "bits-2", etc.
 *
 * @example
 * ```ts
 * const id = useId("article");  // "article-1"
 * const id2 = useId("article"); // "article-2"
 * const id3 = useId();          // "bits-3"
 * ```
 */
export function useId(prefix = "bits"): string {
	if (typeof globalThis === 'undefined') {
		// Fallback for SSR - generate random ID
		return `${prefix}-${Math.random().toString(36).substring(2, 9)}`;
	}

	const counter = (globalThis as any).__registryIdCounter;
	counter.current++;
	return `${prefix}-${counter.current}`;
}

/**
 * Creates an ID generation function with a fixed prefix.
 * Useful when you need multiple IDs for the same component type.
 *
 * @example
 * ```ts
 * const createArticleId = createIdGenerator("article");
 * const titleId = createArticleId();     // "article-1"
 * const summaryId = createArticleId();   // "article-2"
 * ```
 */
export function createIdGenerator(prefix: string) {
	return () => useId(prefix);
}
