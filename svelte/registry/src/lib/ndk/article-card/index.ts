/**
 * ArticleCard - Composable article card components
 *
 * A flexible system for displaying NDKArticle content with customizable layouts.
 * Components support context mode (within ArticleCard.Root) for composable layouts,
 * or use preset components for common designs.
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
import ReadingTime from './article-card-reading-time.svelte';

// Preset layouts (blocks)
import Portrait from '../blocks/article-card-portrait.svelte';
import Medium from '../blocks/article-card-medium.svelte';
import Hero from '../blocks/article-card-hero.svelte';
import Neon from '../blocks/article-card-neon.svelte';

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
  Portrait,
  Medium,
  Hero,
  Neon,
};

// Export types
export type { ArticleCardContext } from './context.svelte.js';
