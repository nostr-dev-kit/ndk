import type { ComponentCardData, ApiDoc } from '$lib/templates/types';

// Card data for relay card variants
export const relayCardPortraitCard: ComponentCardData = {
  name: 'relay-card-portrait',
  title: 'Portrait',
  description: 'Vertical relay card with icon on top.',
  richDescription: 'Vertical card layout with icon on top. Perfect for relay grids and discovery displays.',
  command: 'npx shadcn@latest add relay-card-portrait',
  apiDocs: []
};

export const relayCardCompactCard: ComponentCardData = {
  name: 'relay-card-compact',
  title: 'Compact',
  description: 'Small square relay card.',
  richDescription: 'Small square card with icon and name. Ideal for compact grids where space is limited.',
  command: 'npx shadcn@latest add relay-card-compact',
  apiDocs: []
};

export const relayCardListCard: ComponentCardData = {
  name: 'relay-card-list',
  title: 'List',
  description: 'Horizontal relay card for lists.',
  richDescription: 'Horizontal card layout. Perfect for relay lists and feeds with optional description.',
  command: 'npx shadcn@latest add relay-card-list',
  apiDocs: []
};

export const relayBasicCard: ComponentCardData = {
  name: 'relay-basic',
  title: 'Basic Usage',
  description: 'Minimal relay primitives example.',
  richDescription: 'Minimal example with Relay.Root and essential primitives. All primitives can be composed together: Icon, Name, Url, Description, BookmarkButton, and BookmarkedBy.',
  command: 'npx shadcn@latest add relay-card',
  apiDocs: []
};

export const relayBuilderCard: ComponentCardData = {
  name: 'relay-builder',
  title: 'Using the Builder',
  description: 'Bookmarked relay list builder.',
  richDescription: 'Use createBookmarkedRelayList() to create a reactive bookmarked relay list that tracks relays bookmarked by users you follow. Includes bookmark counts and toggle functionality.',
  command: 'npx shadcn@latest add relay-card',
  apiDocs: []
};

// API documentation
export const relayCardApiDocs: ApiDoc[] = [
  {
    name: 'Relay.Root',
    description: 'Root container that provides context to child components. Fetches NIP-11 relay information automatically.',
    importPath: "import { Relay } from '$lib/registry/ui/relay'",
    props: [
      {
        name: 'ndk',
        type: 'NDKSvelte',
        description: 'NDK instance. Optional if NDK is available in Svelte context (from parent components).'
      },
      {
        name: 'relayUrl',
        type: 'string',
        required: true,
        description: 'The relay WebSocket URL (e.g., "wss://relay.damus.io")'
      }
    ]
  },
  {
    name: 'Relay.Icon',
    description: 'Display relay icon from NIP-11 metadata with fallback.',
    importPath: "import { Relay } from '$lib/registry/ui/relay'",
    props: [
      {
        name: 'size',
        type: 'number',
        default: '48',
        description: 'Icon size in pixels'
      },
      {
        name: 'class',
        type: 'string',
        description: 'Additional CSS classes'
      }
    ]
  },
  {
    name: 'Relay.Name',
    description: 'Display relay name from NIP-11 metadata.',
    importPath: "import { Relay } from '$lib/registry/ui/relay'",
    props: [
      {
        name: 'fallback',
        type: 'string',
        default: '"Relay"',
        description: 'Fallback text when relay name is unavailable'
      },
      {
        name: 'class',
        type: 'string',
        description: 'Additional CSS classes'
      }
    ]
  },
  {
    name: 'Relay.Url',
    description: 'Display relay URL with optional domain-only mode.',
    importPath: "import { Relay } from '$lib/registry/ui/relay'",
    props: [
      {
        name: 'showProtocol',
        type: 'boolean',
        default: 'true',
        description: 'Show wss:// protocol prefix'
      },
      {
        name: 'class',
        type: 'string',
        description: 'Additional CSS classes'
      }
    ]
  },
  {
    name: 'Relay.Description',
    description: 'Display relay description from NIP-11 metadata with line clamping.',
    importPath: "import { Relay } from '$lib/registry/ui/relay'",
    props: [
      {
        name: 'maxLines',
        type: 'number',
        default: '2',
        description: 'Maximum number of lines to display'
      },
      {
        name: 'class',
        type: 'string',
        description: 'Additional CSS classes'
      }
    ]
  }
];

// All metadata for the relay card page
export const relayCardMetadata = {
  title: 'RelayCard',
  description: 'Composable relay display components with NIP-11 info and bookmark functionality. Build custom relay cards with flexible primitive components.',
  showcaseTitle: 'Blocks',
  showcaseDescription: 'Pre-composed relay card layouts ready to use.',
  cards: [relayCardPortraitCard, relayCardCompactCard, relayCardListCard, relayBasicCard, relayBuilderCard],
  apiDocs: relayCardApiDocs
};
