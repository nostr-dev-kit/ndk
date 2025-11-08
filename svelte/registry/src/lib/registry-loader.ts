import type { ComponentCardData } from '$lib/templates/types';
import registryIndex from './registry-index.json';

// Type for the registry.json structure
interface RegistryComponent {
  name: string;
  title: string;
  category: string;
  subcategory?: string;
  variant?: string;
  description: string;
  showcaseTitle?: string;
  showcaseDescription?: string;
  richDescription?: string;
  command: string;
  dependencies?: string[];
  registryDependencies?: string[];
  components?: Array<{
    name: string;
    description: string;
    importPath: string;
    props?: Array<{
      name: string;
      type: string;
      default?: any;
      required?: boolean;
      description: string;
    }>;
  }>;
  examples?: Array<{
    name: string;
    title: string;
    description: string;
    file: string;
  }>;
  useCases?: string[];
  apiDocs?: Array<{
    name: string;
    description: string;
    importPath: string;
    props?: Array<{
      name: string;
      type: string;
      default?: any;
      required?: boolean;
      description: string;
    }>;
  }>;
  cards?: ComponentCardData[];
}

interface ComponentMetadata {
  title: string;
  showcaseTitle?: string;
  showcaseDescription?: string;
  cards: ComponentCardData[];
  apiDocs: Array<{
    name: string;
    description: string;
    importPath: string;
    props?: Array<{
      name: string;
      type: string;
      default?: any;
      required?: boolean;
      description: string;
    }>;
  }>;
}

// Cache for loaded registry files
const registryCache = new Map<string, RegistryComponent>();

/**
 * Load a registry.json file for a component
 */
async function loadRegistryFile(path: string): Promise<RegistryComponent | null> {
  if (registryCache.has(path)) {
    return registryCache.get(path)!;
  }

  try {
    // Dynamic import of the registry.json file
    const module = await import(`./registry/components/${path}/registry.json`);
    const registry = module.default as RegistryComponent;
    registryCache.set(path, registry);
    return registry;
  } catch (error) {
    console.error(`Failed to load registry for ${path}:`, error);
    return null;
  }
}

/**
 * Get component metadata in the format expected by route pages
 */
export async function getComponentMetadata(componentName: string): Promise<ComponentMetadata | null> {
  // First check if it's in the registry index
  const indexEntry = (registryIndex as any).components[componentName];
  if (!indexEntry) {
    console.error(`Component ${componentName} not found in registry index`);
    return null;
  }

  // Load the full registry.json file
  const registry = await loadRegistryFile(indexEntry.path);
  if (!registry) {
    return null;
  }

  // Transform to ComponentMetadata format
  const metadata: ComponentMetadata = {
    title: registry.title,
    showcaseTitle: registry.showcaseTitle || registry.title,
    showcaseDescription: registry.showcaseDescription || registry.description,
    cards: registry.cards || [],
    apiDocs: registry.apiDocs || registry.components || []
  };

  // If cards are not defined but we have examples, create cards from them
  if (metadata.cards.length === 0 && registry.examples) {
    metadata.cards = registry.examples.map(example => ({
      name: `${registry.name}-${example.name}`,
      title: example.title,
      richDescription: example.description,
      command: registry.command,
      apiDocs: registry.apiDocs || registry.components || []
    }));
  }

  return metadata;
}

/**
 * Get individual card data for a component
 */
export async function getComponentCard(componentName: string, cardName: string): Promise<ComponentCardData | null> {
  const metadata = await getComponentMetadata(componentName);
  if (!metadata) {
    return null;
  }

  return metadata.cards.find(card => card.name === cardName) || null;
}

/**
 * Get all cards for a category
 */
export async function getCategoryCards(category: string): Promise<ComponentCardData[]> {
  const cards: ComponentCardData[] = [];
  const categoryData = (registryIndex as any).categories[category];

  if (!categoryData) {
    return cards;
  }

  // Load all components in this category
  for (const componentName of categoryData.components) {
    const indexEntry = (registryIndex as any).components[componentName];
    if (!indexEntry) continue;

    const registry = await loadRegistryFile(indexEntry.path);
    if (!registry) continue;

    // Add cards or create default card
    if (registry.cards && registry.cards.length > 0) {
      cards.push(...registry.cards);
    } else {
      // Create a default card from the registry data
      cards.push({
        name: registry.name,
        title: registry.title,
        richDescription: registry.description,
        command: registry.command,
        apiDocs: registry.apiDocs || registry.components || []
      });
    }
  }

  return cards;
}

/**
 * Get metadata for multiple components at once
 */
export async function getMultipleComponentMetadata(...componentNames: string[]): Promise<Record<string, ComponentMetadata>> {
  const results: Record<string, ComponentMetadata> = {};

  await Promise.all(
    componentNames.map(async (name) => {
      const metadata = await getComponentMetadata(name);
      if (metadata) {
        results[name] = metadata;
      }
    })
  );

  return results;
}

/**
 * Helper to get the registry entry from the index
 */
export function getRegistryEntry(componentName: string): any {
  return (registryIndex as any).components[componentName];
}

/**
 * Get all components in a category
 */
export function getCategoryComponents(category: string): string[] {
  const categoryData = (registryIndex as any).categories[category];
  return categoryData?.components || [];
}

// Export specific card data for backwards compatibility
// These will be populated from registry.json files

export async function getReactionMetadata(): Promise<ComponentMetadata> {
  const base = await loadRegistryFile('reaction/buttons/longpress');
  if (!base) {
    return {
      title: 'Reaction',
      showcaseTitle: 'Reaction with Long-Press',
      showcaseDescription: 'Sophisticated reaction component with long-press emoji picker.',
      cards: [],
      apiDocs: []
    };
  }

  return {
    title: base.title,
    showcaseTitle: base.showcaseTitle || 'Reaction with Long-Press',
    showcaseDescription: base.showcaseDescription || base.description,
    cards: [
      {
        name: 'reaction-basic',
        title: 'Reaction with Long-Press',
        richDescription: 'Click to react with a heart, long-press to open emoji picker. Shows current reaction count.',
        command: base.command,
        apiDocs: base.apiDocs || base.components || []
      },
      {
        name: 'reaction-delayed',
        title: 'Cancellable Delayed Reactions',
        richDescription: 'Set delayed: 5 to show reactions immediately but wait 5 seconds before publishing.',
        command: base.command,
        apiDocs: base.apiDocs || []
      },
      {
        name: 'reaction-builder',
        title: 'Using the Reaction Builder',
        richDescription: 'Use createReactionAction() for full control over your UI markup.',
        command: base.command,
        apiDocs: base.apiDocs || []
      }
    ],
    apiDocs: base.apiDocs || base.components || []
  };
}