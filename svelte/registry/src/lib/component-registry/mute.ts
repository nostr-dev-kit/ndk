import type { ComponentCardData, ApiDoc } from '$lib/templates/types';

// Card data for mute button variants
export const muteButtonCard: ComponentCardData = {
  name: 'mute-button',
  title: 'MuteButton',
  richDescription: 'Minimal icon-first design. Best for inline use in feeds or alongside user names. Supports showTarget mode to display avatar and name.',
  command: 'npx jsrepo add mute-button',
  apiDocs: [
    {
      name: 'MuteButton',
      description: 'Minimal mute button block with icon-first design',
      importPath: "import MuteButton from '$lib/registry/components/mute-button.svelte'",
      props: [
        { name: 'ndk', type: 'NDKSvelte', description: 'NDK instance (optional if provided via context)' },
        { name: 'target', type: 'NDKUser | string', required: true, description: 'User to mute' },
        { name: 'showIcon', type: 'boolean', default: 'true', description: 'Whether to show icon' },
        { name: 'showTarget', type: 'boolean', default: 'false', description: 'When true, shows user avatar and name' },
        { name: 'class', type: 'string', description: 'Custom CSS classes' }
      ]
    },
    {
      name: 'createMuteAction',
      description: 'Builder function that provides mute/unmute state and methods',
      importPath: "import { createMuteAction } from '@nostr-dev-kit/svelte'",
      props: [
        {
          name: 'config',
          type: '() => { target: NDKUser | string }',
          required: true,
          description: 'Reactive function returning target configuration'
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

export const muteCustomCard: ComponentCardData = {
  name: 'mute-custom',
  title: 'Custom Implementation',
  richDescription: 'Use the createMuteAction builder directly to create custom mute buttons with full control over appearance and behavior.',
  command: 'npx jsrepo add mute-button',
  apiDocs: [
    {
      name: 'createMuteAction',
      description: 'Builder function that provides mute/unmute state and methods',
      importPath: "import { createMuteAction } from '@nostr-dev-kit/svelte'",
      props: [
        {
          name: 'config',
          type: '() => { target: NDKUser | string }',
          required: true,
          description: 'Reactive function returning target configuration'
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
export const muteApiDocs: ApiDoc[] = [
  {
    name: 'createMuteAction',
    description: 'Builder function that provides mute/unmute state and methods. Use directly in custom components or with MuteButton blocks. Returns MuteActionState with isMuted (boolean - current mute state) and mute (() => Promise<void> - toggle mute/unmute).',
    importPath: "import { createMuteAction } from '@nostr-dev-kit/svelte'",
    props: [
      {
        name: 'config',
        type: '() => { target: NDKUser | string }',
        required: true,
        description: 'Reactive function returning target configuration'
      },
      {
        name: 'ndk',
        type: 'NDKSvelte',
        required: true,
        description: 'NDK instance'
      }
    ]
  },
  {
    name: 'MuteButton',
    description: 'Minimal mute button block with icon-first design.',
    importPath: "import MuteButton from '$lib/registry/components/mute-button.svelte'",
    props: [
      {
        name: 'ndk',
        type: 'NDKSvelte',
        description: 'NDK instance (optional if provided via context)'
      },
      {
        name: 'target',
        type: 'NDKUser | string',
        required: true,
        description: 'User to mute'
      },
      {
        name: 'showIcon',
        type: 'boolean',
        default: 'true',
        description: 'Whether to show icon'
      },
      {
        name: 'showTarget',
        type: 'boolean',
        default: 'false',
        description: 'When true, shows user avatar and name. Format: "Mute Name" with bold Mute text'
      },
      {
        name: 'class',
        type: 'string',
        description: 'Custom CSS classes'
      }
    ]
  }
];

// All metadata for the mute page
export const muteMetadata = {
  title: 'Mute',
  showcaseTitle: 'Showcase',
  showcaseDescription: 'Mute button variants from minimal to custom implementations.',
  cards: [muteButtonCard, muteCustomCard],
  apiDocs: muteApiDocs
};
