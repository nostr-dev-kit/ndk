/**
 * ArticleCard - Composable article card components
 *
 * A flexible system for displaying NDKArticle content with customizable layouts.
 * Components support context mode (within ArticleCard.Root) for composable layouts,
 * or use preset components for common designs.
 *
 * @example Composable mode:
 * ```svelte
 * <ArticleCard.Root {ndk} {article}>
 *   <div class="card">
 *     <ArticleCard.Image class="h-48" />
 *     <div class="p-4">
 *       <ArticleCard.Title />
 *       <ArticleCard.Summary maxLength={200} />
 *       <ArticleCard.Meta />
 *     </div>
 *   </div>
 * </ArticleCard.Root>
 * ```
 *
 * @example Portrait preset:
 * ```svelte
 * <ArticleCard.Portrait {ndk} {article} />
 * ```
 *
 * @example Medium-style preset:
 * ```svelte
 * <ArticleCard.Medium {ndk} {article} imageSize="large" />
 * ```
 */

// Core components
import Root from './article-card-root.svelte';
import Image from './article-card-image.svelte';
import Title from './article-card-title.svelte';
import Summary from './article-card-summary.svelte';
import Author from './article-card-author.svelte';
import Date from './article-card-date.svelte';
import Meta from './article-card-meta.svelte';

// Preset layouts
import Portrait from './presets/portrait.svelte';
import Medium from './presets/medium.svelte';
import MediumWithStats from './presets/medium-with-stats.svelte';

// Export as namespace for dot notation
export const ArticleCard = {
  Root,
  Image,
  Title,
  Summary,
  Author,
  Date,
  Meta,
  Portrait,
  Medium,
  MediumWithStats,
};

// Export types
export type { ArticleCardContext } from './context.svelte.js';
