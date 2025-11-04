import type { ComponentCardData, ApiDoc } from '$lib/templates/types';

// Card data for thread view variants
export const threadViewTwitterCard: ComponentCardData = {
  name: 'thread-view-twitter',
  title: 'Twitter Style',
  description: 'Vertical thread with connector lines.',
  richDescription: 'Vertical thread view with continuous connector lines, perfect for social media-style conversations. Shows parent chain, focused event, and all replies.',
  command: 'npx shadcn@latest add thread-view-twitter',
  apiDocs: []
};

export const threadViewBasicCard: ComponentCardData = {
  name: 'thread-view-basic',
  title: 'Basic Usage',
  description: 'Minimal thread view primitives.',
  richDescription: 'Minimal thread view with EventCard.Root, EventCard.Header, and EventCard.Content. Shows the essential composition for displaying thread events.',
  command: 'npx shadcn@latest add thread-view',
  apiDocs: []
};

export const threadViewFullCard: ComponentCardData = {
  name: 'thread-view-full',
  title: 'Full Composition',
  description: 'All primitives together.',
  richDescription: 'Complete thread view showing parent chain with thread lines, focused event highlighting, reply sections, and interactive navigation. Demonstrates all available primitives working together.',
  command: 'npx shadcn@latest add thread-view',
  apiDocs: []
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
  description: 'Display Nostr event threads with parent chains, focused events, and replies. Built using EventCard primitives with the createThreadView builder.',
  showcaseTitle: 'Blocks',
  showcaseDescription: 'Pre-composed thread layouts ready to use.',
  cards: [threadViewTwitterCard, threadViewBasicCard, threadViewFullCard],
  apiDocs: threadViewApiDocs
};
