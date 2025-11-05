import type { ComponentCardData, ApiDoc, AnatomyLayer } from '$lib/templates/types';

// Card data for follow pack variants
export const followPackHeroCard: ComponentCardData = {
  name: 'follow-pack-hero',
  title: 'FollowPackHero',
  richDescription: 'The Follow Pack Hero component is designed to showcase follow packs in a dramatic, full-width layout. It features large imagery with overlaid text, making it perfect for landing pages, featured sections, and hero areas where you want to make a strong visual impact.',
  command: 'npx jsrepo add follow-pack-hero',
  apiDocs: [
    {
      name: 'FollowPackHero',
      description: 'Featured display with full-bleed imagery for landing pages and hero sections.',
      importPath: "import FollowPackHero from '$lib/registry/components/follow-pack-hero/follow-pack-hero.svelte'",
      props: [
        {
          name: 'ndk',
          type: 'NDKSvelte',
          description: 'NDK instance (optional if available in context)'
        },
        {
          name: 'followPack',
          type: 'NDKFollowPack',
          required: true,
          description: 'The follow pack event (kind 39089)'
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

export const followPackPortraitCard: ComponentCardData = {
  name: 'follow-pack-portrait',
  title: 'FollowPackPortrait',
  richDescription: 'The Follow Pack Portrait component presents follow packs in a vertical card format, perfect for grid layouts and gallery displays. Its portrait orientation makes it ideal for showing multiple packs side-by-side.',
  command: 'npx jsrepo add follow-pack-portrait',
  apiDocs: [
    {
      name: 'FollowPackPortrait',
      description: 'Vertical card format perfect for grid layouts and gallery displays.',
      importPath: "import FollowPackPortrait from '$lib/registry/components/follow-pack-portrait/follow-pack-portrait.svelte'",
      props: [
        {
          name: 'ndk',
          type: 'NDKSvelte',
          description: 'NDK instance (optional if available in context)'
        },
        {
          name: 'followPack',
          type: 'NDKFollowPack',
          required: true,
          description: 'The follow pack event (kind 39089)'
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

export const followPackCompactCard: ComponentCardData = {
  name: 'follow-pack-compact',
  title: 'FollowPackCompact',
  richDescription: 'The Follow Pack Compact component provides a horizontal, information-dense display perfect for content feeds and streams. It efficiently uses horizontal space while presenting all essential information.',
  command: 'npx jsrepo add follow-pack-compact',
  apiDocs: [
    {
      name: 'FollowPackCompact',
      description: 'Horizontal, information-dense display for content feeds and streams.',
      importPath: "import FollowPackCompact from '$lib/registry/components/follow-pack-compact/follow-pack-compact.svelte'",
      props: [
        {
          name: 'ndk',
          type: 'NDKSvelte',
          description: 'NDK instance (optional if available in context)'
        },
        {
          name: 'followPack',
          type: 'NDKFollowPack',
          required: true,
          description: 'The follow pack event (kind 39089)'
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

export const followPackListItemCard: ComponentCardData = {
  name: 'follow-pack-list-item',
  title: 'FollowPackListItem',
  richDescription: 'The Follow Pack List Item component provides a minimal, space-efficient display designed for sidebar navigation and compact lists. It delivers essential information in a clean format.',
  command: 'npx jsrepo add follow-pack-list-item',
  apiDocs: [
    {
      name: 'FollowPackListItem',
      description: 'Minimal, space-efficient display for sidebar navigation and compact lists.',
      importPath: "import FollowPackListItem from '$lib/registry/components/follow-pack-list-item/follow-pack-list-item.svelte'",
      props: [
        {
          name: 'ndk',
          type: 'NDKSvelte',
          description: 'NDK instance (optional if available in context)'
        },
        {
          name: 'followPack',
          type: 'NDKFollowPack',
          required: true,
          description: 'The follow pack event (kind 39089)'
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

// Anatomy layers
export const followPackAnatomyLayers: Record<string, AnatomyLayer> = {
  image: {
    id: 'image',
    label: 'FollowPack.Image',
    description: 'Displays the follow pack image. Automatically handles missing images with a fallback icon. Supports gradient overlays for better text readability.',
    props: ['class', 'showGradient', 'fallback']
  },
  title: {
    id: 'title',
    label: 'FollowPack.Title',
    description: 'Displays the follow pack title. Shows "Untitled Pack" if no title is set. Supports line clamping for overflow control.',
    props: ['class', 'lines']
  },
  description: {
    id: 'description',
    label: 'FollowPack.Description',
    description: 'Displays the follow pack description. Automatically hidden if no description exists. Supports both character truncation and line clamping.',
    props: ['class', 'maxLength', 'lines']
  },
  memberCount: {
    id: 'memberCount',
    label: 'FollowPack.MemberCount',
    description: 'Displays the number of people in the follow pack. Counts the pubkeys array from the event. Supports both short (number only) and long (formatted with "people") formats.',
    props: ['class', 'format']
  }
};

// API documentation
export const followPackApiDocs: ApiDoc[] = [
  {
    name: 'FollowPack.Root',
    description: 'Context provider component that wraps all FollowPack primitives. Makes NDK instance and follow pack data available to child components.',
    importPath: "import { FollowPack } from '$lib/registry/ui/follow-pack'",
    props: [
      {
        name: 'ndk',
        type: 'NDKSvelte',
        description: 'NDK instance for Nostr operations. Optional if already provided via Svelte context.'
      },
      {
        name: 'followPack',
        type: 'NDKFollowPack',
        required: true,
        description: 'The follow pack event (kind 39089) containing pack metadata and member list'
      },
      {
        name: 'onclick',
        type: '(e: MouseEvent) => void',
        description: 'Optional click handler. Makes the root element interactive when provided. Use for navigation or triggering follow actions.'
      },
      {
        name: 'class',
        type: 'string',
        default: "''",
        description: 'Additional CSS classes to apply to the root element'
      }
    ]
  },
  {
    name: 'FollowPack.Image',
    description: 'Displays the follow pack image. Automatically handles missing images with a fallback icon. Supports gradient overlays for better text readability.',
    importPath: "import { FollowPack } from '$lib/registry/ui/follow-pack'",
    props: [
      {
        name: 'class',
        type: 'string',
        default: "''",
        description: 'Additional CSS classes for sizing and styling the image container'
      },
      {
        name: 'showGradient',
        type: 'boolean',
        default: 'false',
        description: 'Adds a gradient overlay from bottom to top for better text contrast when overlaying content'
      },
      {
        name: 'fallback',
        type: 'string',
        description: 'Custom fallback image URL. If not provided and pack has no image, shows default group icon.'
      }
    ]
  },
  {
    name: 'FollowPack.Title',
    description: 'Displays the follow pack title. Shows "Untitled Pack" if no title is set. Supports line clamping for overflow control.',
    importPath: "import { FollowPack } from '$lib/registry/ui/follow-pack'",
    props: [
      {
        name: 'class',
        type: 'string',
        default: "''",
        description: 'Additional CSS classes for styling the title text'
      },
      {
        name: 'lines',
        type: 'number',
        description: 'Number of lines to show before truncating with ellipsis. Uses Tailwind line-clamp utilities.'
      }
    ]
  },
  {
    name: 'FollowPack.Description',
    description: 'Displays the follow pack description. Automatically hidden if no description exists. Supports both character truncation and line clamping.',
    importPath: "import { FollowPack } from '$lib/registry/ui/follow-pack'",
    props: [
      {
        name: 'class',
        type: 'string',
        default: "''",
        description: 'Additional CSS classes for styling the description text'
      },
      {
        name: 'maxLength',
        type: 'number',
        description: 'Maximum character length before truncating with ellipsis'
      },
      {
        name: 'lines',
        type: 'number',
        description: 'Number of lines to show before truncating. Uses Tailwind line-clamp utilities.'
      }
    ]
  },
  {
    name: 'FollowPack.MemberCount',
    description: 'Displays the number of people in the follow pack. Counts the pubkeys array from the event. Supports both short (number only) and long (formatted with "people") formats.',
    importPath: "import { FollowPack } from '$lib/registry/ui/follow-pack'",
    props: [
      {
        name: 'class',
        type: 'string',
        default: "''",
        description: 'Additional CSS classes for styling the count display'
      },
      {
        name: 'format',
        type: "'short' | 'long'",
        default: "'short'",
        description: 'Display format. "short" shows number only (e.g., "23"). "long" shows formatted text (e.g., "23 people").'
      }
    ]
  }
];

// All metadata for the follow pack page
export const followPackMetadata = {
  title: 'FollowPack',
  showcaseTitle: 'Components Showcase',
  showcaseDescription: 'Four follow pack variants. Hero for landing pages, portrait for grids, compact for feeds, and list item for sidebars.',
  cards: [followPackHeroCard, followPackPortraitCard, followPackCompactCard, followPackListItemCard],
  apiDocs: followPackApiDocs
};
