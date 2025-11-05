import type { ComponentCardData, ApiDoc } from '$lib/templates/types';

// Card data for zap variants
export const zapBasicCard: ComponentCardData = {
  name: 'zap-basic',
  title: 'Basic Usage',
  description: 'Simple zap button with amount tracking.',
  richDescription: 'Simple zap button with automatic amount tracking using the ZapButton component.',
  command: 'npx jsrepo add zap-button',
  apiDocs: [
    {
      name: 'ZapButton',
      description: 'Pre-built zap button component with automatic amount tracking.',
      importPath: "import { ZapButton } from '$lib/registry/ui'",
      props: [
        { name: 'ndk', type: 'NDKSvelte', description: 'NDK instance (optional if provided via context)' },
        { name: 'event', type: 'NDKEvent', required: true, description: 'Event to zap' },
        { name: 'class', type: 'string', description: 'Custom CSS classes' }
      ]
    }
  ]
};

export const zapCustomCard: ComponentCardData = {
  name: 'zap-custom',
  title: 'Custom Implementation',
  description: 'Custom zap button with full control.',
  richDescription: 'Build custom zap buttons using ZapSend and Zaps namespaces for full control over styling and behavior.',
  command: 'npx jsrepo add zap-button',
  apiDocs: [
    {
      name: 'ZapSend',
      description: 'Namespace for sending zaps with full control.',
      importPath: "import { ZapSend } from '$lib/registry/ui'",
      props: [
        { name: 'ndk', type: 'NDKSvelte', description: 'NDK instance' },
        { name: 'target', type: 'NDKEvent | NDKUser', required: true, description: 'Target to zap' },
        { name: 'amount', type: 'number', required: true, description: 'Amount in satoshis' }
      ]
    },
    {
      name: 'Zaps',
      description: 'Namespace for querying and displaying zap amounts.',
      importPath: "import { Zaps } from '$lib/registry/ui'",
      props: [
        { name: 'ndk', type: 'NDKSvelte', description: 'NDK instance' },
        { name: 'event', type: 'NDKEvent', required: true, description: 'Event to query zaps for' }
      ]
    }
  ]
};

// API documentation
export const zapApiDocs: ApiDoc[] = [
  {
    name: 'ZapButton',
    description: 'Pre-built zap button component with automatic amount tracking.',
    importPath: "import { ZapButton } from '$lib/registry/ui'",
    props: [
      { name: 'ndk', type: 'NDKSvelte', description: 'NDK instance (optional if provided via context)' },
      { name: 'event', type: 'NDKEvent', required: true, description: 'Event to zap' },
      { name: 'class', type: 'string', description: 'Custom CSS classes' }
    ]
  },
  {
    name: 'ZapSend',
    description: 'Namespace for sending zaps with full control.',
    importPath: "import { ZapSend } from '$lib/registry/ui'",
    props: [
      { name: 'ndk', type: 'NDKSvelte', description: 'NDK instance' },
      { name: 'target', type: 'NDKEvent | NDKUser', required: true, description: 'Target to zap' },
      { name: 'amount', type: 'number', required: true, description: 'Amount in satoshis' }
    ]
  },
  {
    name: 'Zaps',
    description: 'Namespace for querying and displaying zap amounts.',
    importPath: "import { Zaps } from '$lib/registry/ui'",
    props: [
      { name: 'ndk', type: 'NDKSvelte', description: 'NDK instance' },
      { name: 'event', type: 'NDKEvent', required: true, description: 'Event to query zaps for' }
    ]
  }
];

// All metadata for the zap page
export const zapMetadata = {
  title: 'Zap',
  description: 'Zap (lightning payment) button with amount display. Send sats to support events and users on Nostr.',
  showcaseTitle: 'Showcase',
  showcaseDescription: 'Zap button variants from basic to custom implementations.',
  cards: [zapBasicCard, zapCustomCard],
  apiDocs: zapApiDocs
};