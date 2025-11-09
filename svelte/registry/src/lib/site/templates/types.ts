import type { Snippet } from 'svelte';
import type { ComponentType } from 'svelte';
import type { NDKSvelte } from '@nostr-dev-kit/svelte';

// Re-export types from ComponentCard
export type {
	ComponentCardData,
	ComponentDoc
} from '$lib/site/components/ComponentCard.svelte';

// Import for local use
import type {
	ComponentDoc as ComponentDocBase,
	ComponentCardData as ComponentCardDataBase
} from '$lib/site/components/ComponentCard.svelte';

// Alias ComponentDoc as ApiDoc for clarity
export type ApiDoc = ComponentDocBase;

export interface ApiProp {
  name: string;
  type: string;
  description?: string;
  required?: boolean;
  default?: string;
}

export interface ApiReturns {
  name: string;
  properties?: ApiProp[];
}

export interface ApiEvent {
  name: string;
  type: string;
  description: string;
}

// Showcase component structure - compatible with both ComponentsShowcase and ComponentsShowcaseGrid
export interface ShowcaseComponent {
  id: string;  // Unique identifier for this showcase item
  cardData: ComponentCardDataBase;  // Required: ComponentCardData containing all registry info (name, title, description, command, apiDocs)
  preview: Snippet | any;  // Snippet or any for compatibility - required by components
  orientation?: 'horizontal' | 'vertical';
  control?: Snippet;
  cellClass?: string;  // Custom classes for grid cell
  code?: string;  // Optional code example - can override cardData.code if needed
}

// Showcase block structure (simpler variant used in helpers)
export interface ShowcaseBlock {
  name: string;
  description: string;
  command: string;
  preview: Snippet;
  cardData?: ComponentCardDataBase;
  orientation?: 'horizontal' | 'vertical';
  control?: Snippet;
}

// Page metadata structure
export interface ComponentPageMetadata {
  title: string;
  description?: string;
}

// Component section configuration
export interface ComponentSection {
  title?: string;
  description?: string;
  cards: ComponentCardDataBase[];
  previews?: Record<string, Snippet>;
}

// Builder parameter structure
export interface BuilderParameter {
  name: string;
  type: string;
  description: string;
  required?: boolean;
  default?: string;
}

// Builder return property structure
export interface BuilderReturn {
  name: string;
  type: string;
  description: string;
}

// Builder card data structure
export interface BuilderCardData {
  name: string;
  title: string;
  oneLiner?: string;
  description?: string;
  importPath: string;
  command: string;
  dependencies?: string[];
  nips?: string[];
  parameters: BuilderParameter[];
  returns: BuilderReturn[];
  usageExample?: string;
}

// Builders section configuration
export interface BuildersSection {
  builders: BuilderCardData[];
}

// Template props interface
export interface ComponentPageTemplateProps {
  metadata: ComponentPageMetadata;
  ndk?: NDKSvelte;

  // Showcase configuration
  showcaseComponents?: ShowcaseComponent[];
  emptyState?: Snippet;

  // Content sections (in render order)
  overview?: Snippet;
  componentsSection?: ComponentSection;
  buildersSection?: BuildersSection;
  recipes?: Snippet;
  anatomy?: Snippet;
  primitives?: Snippet;

  // Children (EditProps.Prop components)
  children?: Snippet;
}

// Helper type for component examples
export interface ComponentExample {
  name: string;
  component: ComponentType;
  props?: Record<string, any>;
}

// Anatomy layer type (for pages with anatomy sections)
export interface AnatomyLayer {
  id: string;
  label: string;
  description: string;
  props?: string[];
}

// UI Primitive specific types
export interface PrimitiveCardData {
  name: string;
  title: string;
  description: string;
  preview?: Snippet;
  apiDocs?: ApiDoc[];
}

export interface UIPrimitiveMetadata {
  title: string;
  description: string;
  importPath: string;
  nips?: string[];  // NIP numbers if applicable
  primitives: PrimitiveCardData[];
  anatomyLayers: AnatomyLayer[];
  apiDocs?: ApiDoc[];
}

// UI Primitive template props interface
export interface UIPrimitivePageTemplateProps {
  metadata: UIPrimitiveMetadata;
  ndk?: NDKSvelte;

  // Anatomy is always present for UI primitives
  anatomyPreview: Snippet;

  // Content sections via snippets (predictable structure)
  topExample?: Snippet;
  overview?: Snippet;
  examples?: Snippet;
  contextSection?: Snippet;
  relatedComponents?: Snippet;

  // Children (for EditProps in PageTitle)
  children?: Snippet;
}