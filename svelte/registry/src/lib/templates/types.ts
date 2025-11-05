import type { Snippet } from 'svelte';
import type { ComponentType } from 'svelte';
import type { NDKSvelte } from '@nostr-dev-kit/svelte';

// Re-export types from ComponentCard
export type {
	ComponentCardData,
	ComponentDoc
} from '$lib/site-components/ComponentCard.svelte';

// Import for local use
import type {
	ComponentDoc as ComponentDocBase,
	ComponentCardData as ComponentCardDataBase
} from '$lib/site-components/ComponentCard.svelte';

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

// Showcase block structure - compatible with both ComponentsShowcase and ComponentsShowcaseGrid
export interface ShowcaseBlock {
  name: string;
  description: string;
  command: string;
  preview: Snippet | any;  // Snippet or any for compatibility - required by components
  cardData?: ComponentCardDataBase | any;  // ComponentCardData or any for compatibility
  orientation?: 'horizontal' | 'vertical';
  control?: Snippet;
}

// Alias for BlockVariant (used by ComponentsShowcase)
export type BlockVariant = ShowcaseBlock;

// Alias for GridBlock (used by ComponentsShowcaseGrid)
export type GridBlock = ShowcaseBlock;

// Import PropType from edit-props
import type { PropType } from '$lib/site-components/edit-props';

// Page metadata structure
export interface ComponentPageMetadata {
  title: string;
  description?: string;
  showcaseTitle?: string;
  showcaseDescription?: string;
  componentsTitle?: string;
  componentsDescription?: string;
}

// Component section configuration
export interface ComponentSection {
  title?: string;
  description?: string;
  cards: ComponentCardDataBase[];
  previews?: Record<string, Snippet>;
}

// Template props interface
export interface ComponentPageTemplateProps {
  metadata: ComponentPageMetadata;
  ndk?: NDKSvelte;

  // Showcase configuration
  showcaseBlocks?: ShowcaseBlock[];
  showcaseComponent?: ComponentType | any;

  // Components section
  componentsSection?: ComponentSection;

  // API documentation
  apiDocs?: ApiDoc[];

  // Custom sections via snippets
  beforeShowcase?: Snippet;
  afterShowcase?: Snippet;
  beforeComponents?: Snippet;
  afterComponents?: Snippet;
  customSections?: Snippet;

  // Controls for showcase items
  showcaseControls?: Snippet<[block: ShowcaseBlock]>;

  // Empty state snippet (shown when no showcase blocks)
  emptyState?: Snippet;

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

  // Extension points via snippets
  beforeAnatomy?: Snippet;
  afterAnatomy?: Snippet;
  customSections?: Snippet;
}