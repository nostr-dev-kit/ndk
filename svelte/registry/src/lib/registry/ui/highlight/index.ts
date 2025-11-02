// @ndk-version: highlight@0.7.0
/**
 * Headless Highlight primitives
 */

import Root from './highlight-root.svelte';
import Content from './highlight-content.svelte';
import Source from './highlight-source.svelte';

export const Highlight = {
  Root,
  Content,
  Source,
};

export type { HighlightContext } from './context.svelte.js';
