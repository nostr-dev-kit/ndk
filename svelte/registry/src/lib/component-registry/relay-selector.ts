import type { ComponentCardData, ApiDoc } from '$lib/templates/types';

// Card data for relay selector variants
export const relaySelectorPopoverCard: ComponentCardData = {
  name: 'relay-selector-popover',
  title: 'Popover',
  description: 'Compact relay selection in dropdown.',
  richDescription: 'Use for compact relay selection in toolbars or settings. Opens in a dropdown.',
  command: 'npx shadcn@latest add relay-selector-popover',
  apiDocs: []
};

export const relaySelectorInlineCard: ComponentCardData = {
  name: 'relay-selector-inline',
  title: 'Inline',
  description: 'Inline relay selector without popover.',
  richDescription: 'Use for dedicated relay management pages or settings panels. Shows selector inline without popover.',
  command: 'npx shadcn@latest add relay-selector-inline',
  apiDocs: []
};

export const relaySelectorBasicUICard: ComponentCardData = {
  name: 'relay-selector-basic',
  title: 'Basic Usage',
  description: 'Minimal relay selector primitives.',
  richDescription: 'Minimal example with Relay.Selector.Root and essential primitives.',
  command: 'npx shadcn@latest add relay-selector',
  apiDocs: []
};

export const relaySelectorFullUICard: ComponentCardData = {
  name: 'relay-selector-full',
  title: 'Full Composition',
  description: 'All primitives together.',
  richDescription: 'All available primitives composed together with headers, chips, and helper text.',
  command: 'npx shadcn@latest add relay-selector',
  apiDocs: []
};

// API documentation
export const relaySelectorApiDocs: ApiDoc[] = [
  {
    name: 'Relay.Selector.Root',
    description: 'Context provider that manages relay selection state. Wraps all relay selector primitives.',
    importPath: "import { Relay } from '$lib/registry/ui/relay'",
    props: [
      {
        name: 'ndk',
        type: 'NDKSvelte',
        description: 'NDK instance (optional, falls back to context)'
      },
      {
        name: 'selected',
        type: 'string[]',
        default: '[]',
        description: 'Selected relay URLs (two-way binding)'
      },
      {
        name: 'multiple',
        type: 'boolean',
        default: 'true',
        description: 'Allow multiple relay selection'
      }
    ]
  },
  {
    name: 'Relay.Selector.List',
    description: 'Displays list of connected relays from NDK pool. Shows checkmarks for selected relays.',
    importPath: "import { Relay } from '$lib/registry/ui/relay'",
    props: [
      {
        name: 'compact',
        type: 'boolean',
        default: 'false',
        description: 'Use compact layout'
      },
      {
        name: 'class',
        type: 'string',
        description: 'Additional CSS classes'
      }
    ]
  },
  {
    name: 'Relay.Selector.Item',
    description: 'Individual selectable relay item. Use for custom relay list implementations.',
    importPath: "import { Relay } from '$lib/registry/ui/relay'",
    props: [
      {
        name: 'relayUrl',
        type: 'string',
        required: true,
        description: 'Relay URL to display'
      },
      {
        name: 'class',
        type: 'string',
        description: 'Additional CSS classes'
      }
    ]
  },
  {
    name: 'RelaySelectorPopover',
    description: 'Popover block for relay selection with customizable trigger button.',
    importPath: "import { RelaySelectorPopover } from '$lib/registry/blocks'",
    props: [
      {
        name: 'ndk',
        type: 'NDKSvelte',
        description: 'NDK instance (optional, falls back to context)'
      },
      {
        name: 'selected',
        type: 'string[]',
        default: '[]',
        description: 'Selected relay URLs (two-way binding)'
      },
      {
        name: 'multiple',
        type: 'boolean',
        default: 'true',
        description: 'Allow multiple relay selection'
      },
      {
        name: 'showAddRelay',
        type: 'boolean',
        default: 'true',
        description: 'Show add relay form'
      },
      {
        name: 'trigger',
        type: 'Snippet',
        description: 'Custom trigger element'
      },
      {
        name: 'variant',
        type: "'default' | 'secondary' | 'outline' | 'ghost'",
        default: "'outline'",
        description: 'Button variant for default trigger'
      },
      {
        name: 'size',
        type: "'sm' | 'md' | 'lg'",
        default: "'md'",
        description: 'Button size for default trigger'
      },
      {
        name: 'placement',
        type: "'top' | 'bottom' | 'left' | 'right'",
        default: "'bottom'",
        description: 'Popover placement direction'
      },
      {
        name: 'class',
        type: 'string',
        description: 'Additional CSS classes'
      }
    ]
  },
  {
    name: 'RelaySelectorInline',
    description: 'Inline block for relay selection without popover trigger.',
    importPath: "import { RelaySelectorInline } from '$lib/registry/blocks'",
    props: [
      {
        name: 'ndk',
        type: 'NDKSvelte',
        description: 'NDK instance (optional, falls back to context)'
      },
      {
        name: 'selected',
        type: 'string[]',
        default: '[]',
        description: 'Selected relay URLs (two-way binding)'
      },
      {
        name: 'multiple',
        type: 'boolean',
        default: 'true',
        description: 'Allow multiple relay selection'
      },
      {
        name: 'showAddRelay',
        type: 'boolean',
        default: 'true',
        description: 'Show add relay form'
      },
      {
        name: 'label',
        type: 'string',
        description: 'Label text above selector'
      },
      {
        name: 'helperText',
        type: 'string',
        description: 'Helper text below selector'
      },
      {
        name: 'showSelectedChips',
        type: 'boolean',
        default: 'false',
        description: 'Display selected relays as removable chips'
      },
      {
        name: 'class',
        type: 'string',
        description: 'Additional CSS classes'
      }
    ]
  }
];

// All metadata for the relay selector page
export const relaySelectorMetadata = {
  title: 'Relay Selector',
  description: 'Choose relays from your connected pool or add new ones. Supports both popover and inline layouts with multi-select and single-select modes.',
  showcaseTitle: 'Blocks',
  showcaseDescription: 'Pre-composed layouts ready to use.',
  cards: [relaySelectorPopoverCard, relaySelectorInlineCard, relaySelectorBasicUICard, relaySelectorFullUICard],
  apiDocs: relaySelectorApiDocs
};
