import type { ComponentCardData, ApiDoc } from '$lib/templates/types';

// Card data for content tab
export const contentTabCard: ComponentCardData = {
  name: 'content-tab',
  title: 'ContentTab',
  description: 'Display tabs based on user content types.',
  richDescription: 'Automatically samples user content and displays tabs only for content types they actually publish. Useful for conditionally showing UI based on what content a user creates.',
  command: 'npx shadcn@latest add content-tab',
  apiDocs: []
};

// API documentation
export const contentTabApiDocs: ApiDoc[] = [
  {
    name: 'createContentSampler',
    description: 'Builder function that samples user content and returns active content types with counts. Creates a subscription with n+1 filters for efficient sampling. Returns ContentTabState with tabs (ContentTab[] - array of tabs with kind, count, and lastPublished timestamp).',
    importPath: "import { createContentSampler } from '$lib/registry/hooks/content-tab'",
    props: [
      {
        name: 'config',
        type: '() => ContentTabConfig',
        required: true,
        description: 'Reactive function returning configuration: { pubkeys, kinds, since?, subOpts?, sort? }'
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
    name: 'ContentTab',
    description: 'Component that displays tabs based on user content types with minimal default styling.',
    importPath: "import { ContentTab } from '$lib/registry/components/content-tab'",
    props: [
      {
        name: 'ndk',
        type: 'NDKSvelte',
        required: true,
        description: 'NDK instance'
      },
      {
        name: 'pubkeys',
        type: 'string[]',
        required: true,
        description: 'User pubkeys to sample content from'
      },
      {
        name: 'kinds',
        type: 'number[]',
        required: true,
        description: 'Event kinds to track (e.g., [1, 30023, 1063])'
      },
      {
        name: 'since',
        type: 'number',
        description: 'Unix timestamp to start sampling from'
      },
      {
        name: 'subOpts',
        type: 'NDKSubscriptionOptions',
        description: 'Additional subscription options'
      },
      {
        name: 'sort',
        type: '(tabs: ContentTab[]) => ContentTab[]',
        description: 'Sort function for tabs (use byCount or byRecency)'
      },
      {
        name: 'class',
        type: 'string',
        default: "''",
        description: 'Additional CSS classes'
      },
      {
        name: 'tab',
        type: 'Snippet<[ContentTab]>',
        description: 'Custom tab renderer snippet'
      },
      {
        name: 'onTabClick',
        type: '(tab: ContentTab) => void',
        description: 'Tab click handler'
      }
    ]
  },
  {
    name: 'byCount',
    description: 'Sort function that orders tabs by count (most published first)',
    importPath: "import { byCount } from '$lib/registry/hooks/content-tab'",
    props: []
  },
  {
    name: 'byRecency',
    description: 'Sort function that orders tabs by recency (most recently published first)',
    importPath: "import { byRecency } from '$lib/registry/hooks/content-tab'",
    props: []
  }
];

// All metadata for the content tab page
export const contentTabMetadata = {
  title: 'Content Tab',
  description: 'Conditionally display tabs based on the types of content a user actually publishes. Automatically samples content and shows only relevant tabs.',
  showcaseTitle: 'Showcase',
  showcaseDescription: 'Content tabs that adapt to what users actually publish.',
  cards: [contentTabCard],
  apiDocs: contentTabApiDocs
};
