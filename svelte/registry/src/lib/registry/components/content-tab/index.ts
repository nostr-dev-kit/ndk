/**
 * ContentTab - Display tabs based on user's published content
 *
 * Automatically samples user content and displays tabs only for content types
 * they actually publish. Requires a snippet for rendering each tab.
 *
 * @example Basic usage:
 * ```svelte
 * <script>
 *   import { ContentTab, byCount } from './';
 *
 *   const pubkeys = ['hexpubkey'];
 *   const kinds = [1, 30023, 1063]; // notes, long-form, images
 * </script>
 *
 * <ContentTab {ndk} {pubkeys} {kinds} sort={byCount}>
 *   {#snippet tab({ kind, name, count })}
 *     <button>{name} ({count})</button>
 *   {/snippet}
 * </ContentTab>
 * ```
 *
 * @example With custom styling:
 * ```svelte
 * <ContentTab {ndk} {pubkeys} {kinds}>
 *   {#snippet tab({ kind, name, count })}
 *     <button class="px-4 py-2 bg-primary text-primary-foreground rounded-md">
 *       {name} - {count} posts
 *     </button>
 *   {/snippet}
 * </ContentTab>
 * ```
 *
 * @example Using the builder directly:
 * ```svelte
 * <script>
 *   import { createContentSampler, byRecency } from '../../../builders/content-tab';
 *   import { kindLabel } from '../../../utils/kind-label.js';
 *
 *   const tabSampler = createContentSampler(() => ({
 *     pubkeys: ['hexpubkey'],
 *     kinds: [1, 30023, 1063],
 *     sort: byRecency
 *   }), ndk);
 * </script>
 *
 * {#each tabSampler.tabs as tab}
 *   <button>{kindLabel(tab.kind, tab.count)} - {tab.count} items</button>
 * {/each}
 * ```
 */

import ContentTab from './content-tab.svelte';

export { ContentTab };
export { createContentSampler, byCount, byRecency } from '../../../builders/content-tab';
export type { ContentTab as ContentTabType } from '../../../builders/content-tab';
export default ContentTab;
