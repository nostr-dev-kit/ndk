// @ndk-version: article-card@0.13.0
/**
 * ArticleCard - Composable article card components
 *
 * A flexible system for displaying NDKArticle content with customizable layouts.
 * Components support context mode (within ArticleCard.Root) for composable layouts.
 *
 * The `ndk` prop is optional on Root components - if not provided, it will be retrieved from Svelte context.
 *
 * @example Composable mode (ndk from context):
 * ```svelte
 * <ArticleCard.Root {article}>
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
 * @example Using preset blocks (import separately from blocks):
 * ```svelte
 * import { ArticleCardPortrait, ArticleCardMedium } from '../blocks';
 *
 * <ArticleCardPortrait {ndk} {article} />
 * <ArticleCardMedium {ndk} {article} imageSize="large" />
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
import ReadingTime from './article-card-reading-time.svelte';

// Export as namespace for dot notation
export const ArticleCard = {
  Root,
  Image,
  Title,
  Summary,
  Author,
  Date,
  Meta,
  ReadingTime,
};

// Export types
export type { ArticleCardContext } from './context.svelte.js';
