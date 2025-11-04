import type { Snippet } from 'svelte';
import type { ComponentType } from 'svelte';
import type { NDKSvelte } from '@nostr-dev-kit/svelte';

// Card data structure that mirrors existing ComponentCard expectations
export interface ComponentCardData {
  name: string;
  title: string;
  description: string;
  richDescription?: string;
  command: string;
  apiDocs?: ApiDoc[];
}

// API documentation structure
export interface ApiDoc {
  name: string;
  description: string;
  importPath: string;
  props?: ApiProp[];
  returns?: ApiReturns;
  events?: ApiEvent[];
}

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

// Showcase block structure
export interface ShowcaseBlock {
  name: string;
  description: string;
  command: string;
  preview?: Snippet;
  cardData?: ComponentCardData;
  orientation?: 'horizontal' | 'vertical';
  control?: Snippet;
}

// EditProps configuration
export interface EditPropConfig {
  name: string;
  type: 'text' | 'number' | 'event' | 'user' | 'boolean';
  default?: string | number | boolean;
  options?: any[];
  bind?: {
    get: () => any;
    set: (value: any) => void;
  };
}

// Page metadata structure
export interface ComponentPageMetadata {
  title: string;
  description: string;
  showcaseTitle?: string;
  showcaseDescription?: string;
  editProps?: EditPropConfig[];
}

// Component section configuration
export interface ComponentSection {
  title?: string;
  description?: string;
  cards: ComponentCardData[];
  previews?: Record<string, Snippet>;
}

// Template props interface
export interface ComponentPageTemplateProps {
  metadata: ComponentPageMetadata;
  ndk?: NDKSvelte;

  // Showcase configuration
  showcaseBlocks?: ShowcaseBlock[];
  showcaseComponent?: ComponentType;

  // Components section
  componentsSection?: ComponentSection;

  // API documentation
  apiDocs?: ApiDoc[];

  // Custom sections via snippets
  editPropsSection?: Snippet;
  beforeShowcase?: Snippet;
  afterShowcase?: Snippet;
  beforeComponents?: Snippet;
  afterComponents?: Snippet;
  customSections?: Snippet;

  // Controls for showcase items
  showcaseControls?: Snippet<[block: ShowcaseBlock]>;

  // Escape hatch - replace entire template
  customContent?: Snippet;
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