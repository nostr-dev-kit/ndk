/**
 * ContentTab - Display tabs based on user's published content
 *
 * Automatically samples user content and displays tabs only for content types
 * they actually publish. Useful for conditionally showing UI based on what
 * content a user creates.
 *
 * @example Basic usage:
 * ```svelte
 * <script>
 *   import { ContentTab, byCount } from '$lib/registry/components/misc/content-tab';
 *
 *   const pubkeys = ['hexpubkey'];
 *   const kinds = [1, 30023, 1063]; // notes, long-form, images
 * </script>
 *
 * <ContentTab {ndk} {pubkeys} {kinds} sort={byCount} />
 * ```
 *
 * @example With custom tab renderer:
 * ```svelte
 * <ContentTab {ndk} {pubkeys} {kinds}>
 *   {#snippet tab({ kind, count })}
 *     <button>Kind {kind} ({count} posts)</button>
 *   {/snippet}
 * </ContentTab>
 * ```
 *
 * @example Using the builder directly:
 * ```svelte
 * <script>
 *   import { createContentSampler, byRecency } from '$lib/registry/builders/content-tab';
 *
 *   const tabSampler = createContentSampler(() => ({
 *     pubkeys: ['hexpubkey'],
 *     kinds: [1, 30023, 1063],
 *     sort: byRecency
 *   }), ndk);
 * </script>
 *
 * {#each tabSampler.tabs as tab}
 *   <button>Kind {tab.kind} - {tab.count} items</button>
 * {/each}
 * ```
 */

import ContentTab from './content-tab.svelte';

export { ContentTab };
export { createContentSampler, byCount, byRecency } from '$lib/registry/builders/content-tab';
export type { ContentTab as ContentTabType } from '$lib/registry/builders/content-tab';
export default ContentTab;
