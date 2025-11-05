import type { ComponentCardData, ApiDoc } from '$lib/templates/types';

// Card data for negentropy sync progress variants
export const negentropySyncProgressMinimalCard: ComponentCardData = {
  name: 'negentropy-sync-progress-minimal',
  title: 'NegentropySyncProgressMinimal',
  richDescription: 'Clean, simple progress bar showing sync completion percentage and basic stats. Perfect for inline use in headers or status bars.',
  command: 'npx jsrepo add negentropy-sync-progress-minimal',
  apiDocs: [
    {
      name: 'NegentropySyncProgressMinimal',
      description: 'Minimal progress bar block with basic sync stats',
      importPath: "import { NegentropySyncProgressMinimal } from '$lib/registry/components/negentropy-sync'",
      props: [
        { name: 'syncBuilder', type: 'ReturnType<typeof createNegentropySync>', required: true, description: 'Negentropy sync builder instance' },
        { name: 'class', type: 'string', description: 'Additional CSS classes' }
      ]
    },
    {
      name: 'createNegentropySync',
      description: 'Builder function that manages Negentropy sync state across multiple relays',
      importPath: "import { createNegentropySync } from '$lib/registry/builders/negentropy-sync'",
      props: [
        {
          name: 'config',
          type: '() => NegentropySyncConfig',
          required: true,
          description: 'Reactive function returning sync configuration with filters and optional relay URLs'
        },
        {
          name: 'ndk',
          type: 'NDKSvelte',
          description: 'NDK instance (uses context if not provided)'
        }
      ]
    }
  ]
};

export const negentropySyncProgressDetailedCard: ComponentCardData = {
  name: 'negentropy-sync-progress-detailed',
  title: 'NegentropySyncProgressDetailed',
  richDescription: 'Comprehensive sync progress display showing overall stats, progress bar, and individual relay status with event counts. Ideal for debugging and monitoring.',
  command: 'npx jsrepo add negentropy-sync-progress-detailed',
  apiDocs: [
    {
      name: 'NegentropySyncProgressDetailed',
      description: 'Detailed progress block showing overall stats, progress bar, and individual relay status',
      importPath: "import { NegentropySyncProgressDetailed } from '$lib/registry/components/negentropy-sync'",
      props: [
        { name: 'syncBuilder', type: 'ReturnType<typeof createNegentropySync>', required: true, description: 'Negentropy sync builder instance' },
        { name: 'class', type: 'string', description: 'Additional CSS classes' }
      ]
    },
    {
      name: 'createNegentropySync',
      description: 'Builder function that manages Negentropy sync state across multiple relays',
      importPath: "import { createNegentropySync } from '$lib/registry/builders/negentropy-sync'",
      props: [
        {
          name: 'config',
          type: '() => NegentropySyncConfig',
          required: true,
          description: 'Reactive function returning sync configuration with filters and optional relay URLs'
        },
        {
          name: 'ndk',
          type: 'NDKSvelte',
          description: 'NDK instance (uses context if not provided)'
        }
      ]
    }
  ]
};

export const negentropySyncProgressAnimatedCard: ComponentCardData = {
  name: 'negentropy-sync-progress-animated',
  title: 'NegentropySyncProgressAnimated',
  richDescription: 'Eye-catching animated progress display with shimmer effects, pulse animations, and gradient backgrounds. Great for prominent placement and user engagement.',
  command: 'npx jsrepo add negentropy-sync-progress-animated',
  apiDocs: [
    {
      name: 'NegentropySyncProgressAnimated',
      description: 'Animated progress block with shimmer effects and smooth transitions',
      importPath: "import { NegentropySyncProgressAnimated } from '$lib/registry/components/negentropy-sync'",
      props: [
        { name: 'syncBuilder', type: 'ReturnType<typeof createNegentropySync>', required: true, description: 'Negentropy sync builder instance' },
        { name: 'class', type: 'string', description: 'Additional CSS classes' }
      ]
    },
    {
      name: 'createNegentropySync',
      description: 'Builder function that manages Negentropy sync state across multiple relays',
      importPath: "import { createNegentropySync } from '$lib/registry/builders/negentropy-sync'",
      props: [
        {
          name: 'config',
          type: '() => NegentropySyncConfig',
          required: true,
          description: 'Reactive function returning sync configuration with filters and optional relay URLs'
        },
        {
          name: 'ndk',
          type: 'NDKSvelte',
          description: 'NDK instance (uses context if not provided)'
        }
      ]
    }
  ]
};

export const negentropySyncProgressCompactCard: ComponentCardData = {
  name: 'negentropy-sync-progress-compact',
  title: 'NegentropySyncProgressCompact',
  richDescription: 'Space-efficient badge showing sync status and percentage. Expands on hover to reveal detailed stats. Perfect for navigation bars and toolbars.',
  command: 'npx jsrepo add negentropy-sync-progress-compact',
  apiDocs: [
    {
      name: 'NegentropySyncProgressCompact',
      description: 'Compact badge block showing sync status with expandable details on hover',
      importPath: "import { NegentropySyncProgressCompact } from '$lib/registry/components/negentropy-sync-progress-compact'",
      props: [
        { name: 'syncBuilder', type: 'ReturnType<typeof createNegentropySync>', required: true, description: 'Negentropy sync builder instance' },
        { name: 'class', type: 'string', description: 'Additional CSS classes' }
      ]
    },
    {
      name: 'createNegentropySync',
      description: 'Builder function that manages Negentropy sync state across multiple relays',
      importPath: "import { createNegentropySync } from '$lib/registry/builders/negentropy-sync'",
      props: [
        {
          name: 'config',
          type: '() => NegentropySyncConfig',
          required: true,
          description: 'Reactive function returning sync configuration with filters and optional relay URLs'
        },
        {
          name: 'ndk',
          type: 'NDKSvelte',
          description: 'NDK instance (uses context if not provided)'
        }
      ]
    }
  ]
};

// API documentation
export const negentropySyncApiDocs: ApiDoc[] = [
  {
    name: 'createNegentropySync',
    description: 'Builder function that manages Negentropy sync state across multiple relays. Provides real-time progress tracking, relay status, and error handling. Returns NegentropySyncState with: syncing (boolean), totalRelays (number), completedRelays (number), totalEvents (number), progress (number 0-100), relays (RelayProgress[]), errors (Map<string, Error>), subscription (NDKSubscription | null), startSync (() => Promise<NDKSubscription>), stopSync (() => void).',
    importPath: "import { createNegentropySync } from '@/registry/builders/negentropy-sync'",
    props: [
      {
        name: 'config',
        type: '() => NegentropySyncConfig',
        required: true,
        description: 'Reactive function returning sync configuration with filters and optional relay URLs'
      },
      {
        name: 'ndk',
        type: 'NDKSvelte',
        required: false,
        description: 'NDK instance (uses context if not provided)'
      }
    ]
  },
  {
    name: 'NegentrogySync.Root',
    description: 'Root component that initializes sync context. Wrap all other NegentrogySync primitives within this component.',
    importPath: "import { NegentrogySync } from '@/registry/ui/negentropy-sync'",
    props: [
      {
        name: 'ndk',
        type: 'NDKSvelte',
        required: true,
        description: 'NDK instance'
      },
      {
        name: 'filters',
        type: 'NDKFilter | NDKFilter[]',
        required: true,
        description: 'Nostr filters to sync'
      },
      {
        name: 'relayUrls',
        type: 'string[]',
        required: false,
        description: 'Optional relay URLs (defaults to all NDK relays)'
      },
      {
        name: 'class',
        type: 'string',
        required: false,
        description: 'Additional CSS classes'
      }
    ]
  },
  {
    name: 'NegentrogySync.ProgressBar',
    description: 'Progress bar primitive showing sync completion percentage.',
    importPath: "import { NegentrogySync } from '@/registry/ui/negentropy-sync'",
    props: [
      {
        name: 'class',
        type: 'string',
        required: false,
        description: 'Additional CSS classes for container'
      },
      {
        name: 'barClass',
        type: 'string',
        required: false,
        description: 'Additional CSS classes for progress bar'
      },
      {
        name: 'showPercentage',
        type: 'boolean',
        required: false,
        description: 'Show percentage text overlay'
      }
    ]
  },
  {
    name: 'NegentrogySync.RelayStatus',
    description: 'List of individual relay sync status with event counts.',
    importPath: "import { NegentrogySync } from '@/registry/ui/negentropy-sync'",
    props: [
      {
        name: 'class',
        type: 'string',
        required: false,
        description: 'Additional CSS classes'
      },
      {
        name: 'showCounts',
        type: 'boolean',
        required: false,
        description: 'Show event counts per relay'
      }
    ]
  },
  {
    name: 'NegentrogySync.Stats',
    description: 'Summary statistics showing relay count, event count, and sync status.',
    importPath: "import { NegentrogySync } from '@/registry/ui/negentropy-sync'",
    props: [
      {
        name: 'class',
        type: 'string',
        required: false,
        description: 'Additional CSS classes'
      },
      {
        name: 'direction',
        type: "'horizontal' | 'vertical'",
        required: false,
        description: 'Layout direction (default: horizontal)'
      }
    ]
  }
];

// All metadata for the negentropy-sync page
export const negentropySyncMetadata = {
  title: 'Negentropy Sync',
  showcaseTitle: 'Showcase',
  showcaseDescription: 'Negentropy sync progress variants. From minimal badges to detailed monitoring dashboards.',
  cards: [
    negentropySyncProgressMinimalCard,
    negentropySyncProgressDetailedCard,
    negentropySyncProgressAnimatedCard,
    negentropySyncProgressCompactCard
  ],
  apiDocs: negentropySyncApiDocs
};
