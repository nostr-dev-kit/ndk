import type { ComponentCardData, ApiDoc } from '$lib/templates/types';

// Card data for thread view variants
export const threadViewTwitterCard: ComponentCardData = {
  name: 'thread-view-twitter',
  title: 'Twitter Style',
  richDescription: 'Vertical thread view with continuous connector lines, perfect for social media-style conversations. Shows parent chain, focused event, and all replies.',
  command: 'npx jsrepo add thread-view-twitter',
  apiDocs: [
    {
      name: 'ThreadViewTwitter',
      description: 'Twitter-style thread view block with vertical connector lines and focused event highlighting.',
      importPath: "import { ThreadViewTwitter } from '$lib/registry/blocks'",
      props: [
        { name: 'ndk', type: 'NDKSvelte', required: true, description: 'NDK instance for Nostr operations' },
        { name: 'thread', type: 'ThreadView', required: true, description: 'Thread view instance from createThreadView builder' },
        { name: 'class', type: 'string', description: 'Additional CSS classes to apply to container' }
      ]
    },
    {
      name: 'createThreadView',
      description: 'Builder function for creating reactive thread views with parent chains, focused events, and replies',
      importPath: "import { createThreadView } from '@nostr-dev-kit/svelte'",
      props: [
        {
          name: 'config',
          type: '() => { focusedEvent: NDKEvent | string }',
          required: true,
          description: 'Reactive function returning the focused event (NDKEvent or event ID)'
        },
        {
          name: 'ndk',
          type: 'NDKSvelte',
          required: true,
          description: 'NDK instance'
        }
      ]
    }
  ]
};

export const threadViewBasicCard: ComponentCardData = {
  name: 'thread-view-basic',
  title: 'Basic Usage',
  richDescription: 'Minimal thread view with EventCard.Root, EventCard.Header, and EventCard.Content. Shows the essential composition for displaying thread events.',
  command: 'npx jsrepo add thread-view',
  apiDocs: [
    {
      name: 'createThreadView',
      description: 'Builder function for creating reactive thread views with parent chains, focused events, and replies',
      importPath: "import { createThreadView } from '@nostr-dev-kit/svelte'",
      props: [
        {
          name: 'config',
          type: '() => { focusedEvent: NDKEvent | string }',
          required: true,
          description: 'Reactive function returning the focused event (NDKEvent or event ID)'
        },
        {
          name: 'ndk',
          type: 'NDKSvelte',
          required: true,
          description: 'NDK instance'
        }
      ]
    }
  ]
};

export const threadViewFullCard: ComponentCardData = {
  name: 'thread-view-full',
  title: 'Full Composition',
  richDescription: 'Complete thread view showing parent chain with thread lines, focused event highlighting, reply sections, and interactive navigation. Demonstrates all available primitives working together.',
  command: 'npx jsrepo add thread-view',
  apiDocs: [
    {
      name: 'createThreadView',
      description: 'Builder function for creating reactive thread views with parent chains, focused events, and replies',
      importPath: "import { createThreadView } from '@nostr-dev-kit/svelte'",
      props: [
        {
          name: 'config',
          type: '() => { focusedEvent: NDKEvent | string }',
          required: true,
          description: 'Reactive function returning the focused event (NDKEvent or event ID)'
        },
        {
          name: 'ndk',
          type: 'NDKSvelte',
          required: true,
          description: 'NDK instance'
        }
      ]
    }
  ]
};

// API documentation
export const threadViewApiDocs: ApiDoc[] = [
  {
    name: 'ThreadViewTwitter',
    description: 'Twitter-style thread view block with vertical connector lines and focused event highlighting.',
    importPath: "import { ThreadViewTwitter } from '$lib/registry/blocks'",
    props: [
      {
        name: 'ndk',
        type: 'NDKSvelte',
        description: 'NDK instance for Nostr operations',
        required: true
      },
      {
        name: 'thread',
        type: 'ThreadView',
        description: 'Thread view instance from createThreadView builder',
        required: true
      },
      {
        name: 'class',
        type: 'string',
        default: "''",
        description: 'Additional CSS classes to apply to container'
      }
    ]
  }
];

// All metadata for the thread view page
export const threadViewMetadata = {
  title: 'ThreadView',
  showcaseTitle: 'Blocks',
  showcaseDescription: 'Pre-composed thread layouts ready to use.',
  cards: [threadViewTwitterCard, threadViewBasicCard, threadViewFullCard],
  apiDocs: threadViewApiDocs
};
