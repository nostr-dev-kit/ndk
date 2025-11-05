import type { ComponentCardData, ApiDoc } from '$lib/templates/types';

// Card data for relay card variants
export const relayCardPortraitCard: ComponentCardData = {
  name: 'relay-card-portrait',
  title: 'Portrait',
  richDescription: 'Vertical card layout with icon on top. Perfect for relay grids and discovery displays.',
  command: 'npx jsrepo add relay-card-portrait',
  apiDocs: [
    {
      name: 'RelayCardPortrait',
      description: 'Vertical relay card component with icon on top.',
      importPath: "import RelayCardPortrait from '$lib/registry/components/relay-card-portrait/relay-card-portrait.svelte'",
      props: [
        {
          name: 'ndk',
          type: 'NDKSvelte',
          required: true,
          description: 'NDK instance for Nostr operations'
        },
        {
          name: 'relayUrl',
          type: 'string',
          required: true,
          description: 'The relay WebSocket URL (e.g., "wss://relay.damus.io")'
        },
        {
          name: 'width',
          type: 'string',
          default: "'w-[220px]'",
          description: 'Width CSS classes'
        },
        {
          name: 'height',
          type: 'string',
          default: "'h-[320px]'",
          description: 'Height CSS classes'
        },
        {
          name: 'onclick',
          type: '(e: MouseEvent) => void',
          description: 'Optional click handler'
        },
        {
          name: 'class',
          type: 'string',
          description: 'Additional CSS classes'
        }
      ]
    }
  ]
};

export const relayCardCompactCard: ComponentCardData = {
  name: 'relay-card-compact',
  title: 'Compact',
  richDescription: 'Small square card with icon and name. Ideal for compact grids where space is limited.',
  command: 'npx jsrepo add relay-card-compact',
  apiDocs: [
    {
      name: 'RelayCardCompact',
      description: 'Small square relay card component.',
      importPath: "import RelayCardCompact from '$lib/registry/components/relay-card-compact/relay-card-compact.svelte'",
      props: [
        {
          name: 'ndk',
          type: 'NDKSvelte',
          required: true,
          description: 'NDK instance for Nostr operations'
        },
        {
          name: 'relayUrl',
          type: 'string',
          required: true,
          description: 'The relay WebSocket URL (e.g., "wss://relay.damus.io")'
        },
        {
          name: 'size',
          type: 'string',
          default: "'w-[160px] h-[160px]'",
          description: 'Size CSS classes'
        },
        {
          name: 'onclick',
          type: '(e: MouseEvent) => void',
          description: 'Optional click handler'
        },
        {
          name: 'class',
          type: 'string',
          description: 'Additional CSS classes'
        }
      ]
    }
  ]
};

export const relayCardListCard: ComponentCardData = {
  name: 'relay-card-list',
  title: 'List',
  richDescription: 'Horizontal card layout. Perfect for relay lists and feeds with optional description.',
  command: 'npx jsrepo add relay-card-list',
  apiDocs: [
    {
      name: 'RelayCardList',
      description: 'Horizontal relay card component for lists.',
      importPath: "import RelayCardList from '$lib/registry/components/relay-card-list/relay-card-list.svelte'",
      props: [
        {
          name: 'ndk',
          type: 'NDKSvelte',
          required: true,
          description: 'NDK instance for Nostr operations'
        },
        {
          name: 'relayUrl',
          type: 'string',
          required: true,
          description: 'The relay WebSocket URL (e.g., "wss://relay.damus.io")'
        },
        {
          name: 'showDescription',
          type: 'boolean',
          default: 'true',
          description: 'Whether to show relay description'
        },
        {
          name: 'compact',
          type: 'boolean',
          default: 'false',
          description: 'Compact mode with reduced spacing'
        },
        {
          name: 'onclick',
          type: '(e: MouseEvent) => void',
          description: 'Optional click handler'
        },
        {
          name: 'class',
          type: 'string',
          description: 'Additional CSS classes'
        }
      ]
    }
  ]
};

export const relayBasicCard: ComponentCardData = {
  name: 'relay-basic',
  title: 'Basic Usage',
  richDescription: 'Minimal example with Relay.Root and essential primitives. All primitives can be composed together: Icon, Name, Url, Description, BookmarkButton, and BookmarkedBy.',
  command: 'npx jsrepo add relay-card',
  apiDocs: [
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
        },
        {
          name: 'onclick',
          type: '(e: MouseEvent) => void',
          description: 'Optional click handler. Makes the root element interactive when provided.'
        },
        {
          name: 'class',
          type: 'string',
          description: 'Additional CSS classes'
        }
      ]
    }
  ]
};

export const relayBuilderCard: ComponentCardData = {
  name: 'relay-builder',
  title: 'Using the Builder',
  richDescription: 'Use createBookmarkedRelayList() to create a reactive bookmarked relay list that tracks relays bookmarked by users you follow. Includes bookmark counts and toggle functionality.',
  command: 'npx jsrepo add relay-card',
  apiDocs: [
    {
      name: 'createBookmarkedRelayList',
      description: 'Create a reactive bookmarked relay list that tracks relays bookmarked by users you follow.',
      importPath: "import { createBookmarkedRelayList } from '$lib/registry/builders/bookmarked-relay-list'",
      props: [
        {
          name: 'config',
          type: '(ndk: NDKSvelte) => { authors: string[]; includeCurrentUser?: boolean }',
          required: true,
          description: 'Configuration function that returns authors to track and whether to include current user'
        },
        {
          name: 'ndk',
          type: 'NDKSvelte',
          required: true,
          description: 'NDK instance for Nostr operations'
        }
      ]
    }
  ]
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
  showcaseTitle: 'Blocks',
  showcaseDescription: 'Pre-composed relay card layouts ready to use.',
  cards: [relayCardPortraitCard, relayCardCompactCard, relayCardListCard, relayBasicCard, relayBuilderCard],
  apiDocs: relayCardApiDocs
};
