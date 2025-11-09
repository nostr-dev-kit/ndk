import type { ComponentCardData, ShowcaseBlock } from './types';
import type { Snippet } from 'svelte';

/**
 * Helper to create card data from a variant definition
 */
export function createCardData(config: {
  name: string;
  title: string;
  richDescription?: string;
  command: string;
  apiDoc?: any;
}): ComponentCardData {
  return {
    name: config.name,
    title: config.title,
    richDescription: config.richDescription,
    command: config.command,
    apiDoc: config.apiDoc
  };
}

/**
 * Helper to create showcase blocks from variant definitions
 */
export function createShowcaseBlock(config: {
  name: string;
  description: string;
  command: string;
  preview: Snippet;
  cardData?: ComponentCardData;
  orientation?: 'horizontal' | 'vertical';
  control?: Snippet;
}): ShowcaseBlock {
  return {
    name: config.name,
    description: config.description,
    command: config.command,
    preview: config.preview,
    cardData: config.cardData,
    orientation: config.orientation,
    control: config.control
  };
}

/**
 * Helper to auto-discover example files from a directory
 * Note: This requires the examples to be exported from an index.ts file
 */
export function loadExamples<T extends Record<string, any>>(
  examples: T
): Array<{ name: string; component: any }> {
  return Object.entries(examples).map(([name, component]) => ({
    name: name.replace(/Example$/, '').toLowerCase(),
    component
  }));
}

/**
 * Helper to extract metadata from existing cardData objects
 * Useful for migration from old pattern
 */
export function extractMetadataFromCardData(cardData: any): ComponentCardData {
  return {
    name: cardData.name || '',
    title: cardData.title || '',
    richDescription: cardData.richDescription,
    command: cardData.command || '',
    apiDoc: cardData.apiDoc
  };
}

/**
 * Helper to create a simple component preview snippet
 */
export function createPreviewSnippet(
  Component: any,
  props: Record<string, any> = {}
): Snippet {
  // Note: This is a conceptual helper - in practice, snippets
  // are created inline in Svelte components using {#snippet}
  // This function signature shows the pattern but actual implementation
  // would be in the component file
  return (() => {
    return { Component, props };
  }) as unknown as Snippet;
}

/**
 * Helper to determine if a page should use ComponentsShowcase vs ComponentsShowcaseGrid
 * based on the blocks configuration
 */
export function shouldUseShowcase(blocks: ShowcaseBlock[]): boolean {
  return blocks.some(b => b.orientation === 'vertical' || b.orientation === 'horizontal');
}

/**
 * Helper to group showcase blocks by orientation for better layout
 */
export function groupBlocksByOrientation(blocks: ShowcaseBlock[]): {
  horizontal: ShowcaseBlock[];
  vertical: ShowcaseBlock[];
  default: ShowcaseBlock[];
} {
  return blocks.reduce(
    (acc, block) => {
      if (block.orientation === 'horizontal') {
        acc.horizontal.push(block);
      } else if (block.orientation === 'vertical') {
        acc.vertical.push(block);
      } else {
        acc.default.push(block);
      }
      return acc;
    },
    { horizontal: [], vertical: [], default: [] } as {
      horizontal: ShowcaseBlock[];
      vertical: ShowcaseBlock[];
      default: ShowcaseBlock[];
    }
  );
}