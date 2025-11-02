// @ndk-version: article@0.14.0
import Root from './article-root.svelte';
import Image from './article-image.svelte';
import Title from './article-title.svelte';
import Summary from './article-summary.svelte';
import ReadingTime from './article-reading-time.svelte';

export const Article = {
    Root,
    Image,
    Title,
    Summary,
    ReadingTime
};

export type { ArticleContext } from './context.svelte.js';
