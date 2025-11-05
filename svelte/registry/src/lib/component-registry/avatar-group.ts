import type { ComponentCardData, ApiDoc } from '$lib/templates/types';

// Card data for avatar group
export const avatarGroupCard: ComponentCardData = {
  name: 'avatar-group',
  title: 'AvatarGroup',
  description: 'Display multiple user avatars with overflow count.',
  richDescription: 'Displays multiple user avatars in a stacked group with smart ordering (prioritizes followed users) and flexible overflow display options.',
  command: 'npx jsrepo add avatar-group',
  apiDocs: [
    {
      name: 'AvatarGroup',
      description: 'Display multiple user avatars in a stacked group with smart ordering and flexible overflow options',
      importPath: "import { AvatarGroup } from '$lib/registry/components/avatar-group'",
      props: [
        { name: 'ndk', type: 'NDKSvelte', required: true, description: 'NDK instance' },
        { name: 'pubkeys', type: 'string[]', required: true, description: 'Array of user pubkeys to display' },
        { name: 'skipCurrentUser', type: 'boolean', default: 'false', description: 'Whether to exclude the current user from the group' },
        { name: 'max', type: 'number', default: '5', description: 'Maximum number of avatars to show before overflow' },
        { name: 'size', type: 'number', default: '40', description: 'Avatar size in pixels' },
        { name: 'spacing', type: "'tight' | 'normal' | 'loose'", default: "'normal'", description: 'Spacing between avatars' },
        { name: 'overflowVariant', type: "'avatar' | 'text'", default: "'avatar'", description: 'How to display overflow count' },
        { name: 'direction', type: "'horizontal' | 'vertical'", default: "'horizontal'", description: 'Stack direction for avatars' },
        { name: 'onAvatarClick', type: '(user: NDKUser) => void', description: 'Click handler for individual avatars' },
        { name: 'onOverflowClick', type: '() => void', description: 'Click handler for overflow count' },
        { name: 'class', type: 'string', description: 'Additional CSS classes' }
      ]
    },
    {
      name: 'createAvatarGroup',
      description: 'Builder function that provides smart user ordering, prioritizing followed users',
      importPath: "import { createAvatarGroup } from '@nostr-dev-kit/svelte'",
      props: [
        {
          name: 'config',
          type: '() => { pubkeys: string[], skipCurrentUser?: boolean }',
          required: true,
          description: 'Reactive function returning configuration'
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
export const avatarGroupApiDocs: ApiDoc[] = [
  {
    name: 'createAvatarGroup',
    description: 'Builder function that provides smart user ordering, prioritizing followed users. Returns AvatarGroupState with: users (NDKUser[] - all users ordered with followed first), followedUsers (NDKUser[] - users current user follows), unfollowedUsers (NDKUser[] - users current user does not follow).',
    importPath: "import { createAvatarGroup } from '@nostr-dev-kit/svelte'",
    props: [
      {
        name: 'config',
        type: '() => { pubkeys: string[], skipCurrentUser?: boolean }',
        required: true,
        description: 'Reactive function returning configuration'
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
    name: 'AvatarGroup',
    description: 'Display multiple user avatars in a stacked group with smart ordering and flexible overflow options.',
    importPath: "import { AvatarGroup } from '$lib/registry/components/avatar-group'",
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
        description: 'Array of user pubkeys to display'
      },
      {
        name: 'skipCurrentUser',
        type: 'boolean',
        default: 'false',
        description: 'Whether to exclude the current user from the group'
      },
      {
        name: 'max',
        type: 'number',
        default: '5',
        description: 'Maximum number of avatars to show before overflow'
      },
      {
        name: 'size',
        type: 'number',
        default: '40',
        description: 'Avatar size in pixels'
      },
      {
        name: 'spacing',
        type: "'tight' | 'normal' | 'loose'",
        default: "'normal'",
        description: 'Spacing between avatars (tight: -8px, normal: -12px, loose: -6px)'
      },
      {
        name: 'overflowVariant',
        type: "'avatar' | 'text'",
        default: "'avatar'",
        description: 'How to display overflow count: circular avatar badge or text to the side'
      },
      {
        name: 'direction',
        type: "'horizontal' | 'vertical'",
        default: "'horizontal'",
        description: 'Stack direction for avatars'
      },
      {
        name: 'overflowSnippet',
        type: '(count: number) => any',
        description: 'Custom snippet for rendering overflow count (overrides overflowVariant)'
      },
      {
        name: 'onAvatarClick',
        type: '(user: NDKUser) => void',
        description: 'Click handler for individual avatars'
      },
      {
        name: 'onOverflowClick',
        type: '() => void',
        description: 'Click handler for overflow count'
      },
      {
        name: 'class',
        type: 'string',
        default: "''",
        description: 'Additional CSS classes'
      }
    ]
  }
];

// All metadata for the avatar group page
export const avatarGroupMetadata = {
  title: 'AvatarGroup',
  description: 'Display multiple user avatars in a stacked group with smart ordering and flexible overflow display options.',
  showcaseTitle: 'Showcase',
  showcaseDescription: 'Avatar group variants with different overflow display options.',
  cards: [avatarGroupCard],
  apiDocs: avatarGroupApiDocs
};
