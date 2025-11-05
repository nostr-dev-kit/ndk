import type { ComponentCardData, ApiDoc } from '$lib/templates/types';

// Card data for follow button variants
export const followButtonMinimalCard: ComponentCardData = {
  name: 'follow-button',
  title: 'FollowButton',
  richDescription: 'Minimal icon-first design. Best for inline use in feeds or alongside user names. Supports showTarget mode to display avatar/icon and target name.',
  command: 'npx jsrepo add follow-button',
  apiDocs: [
    {
      name: 'FollowButton',
      description: 'Minimal follow button component with icon-first design.',
      importPath: "import { FollowButton } from '$lib/registry/components/follow-button.svelte'",
      props: [
        {
          name: 'ndk',
          type: 'NDKSvelte',
          required: false,
          description: 'NDK instance. If not provided, will use context.'
        },
        {
          name: 'target',
          type: 'NDKUser | string',
          required: true,
          description: 'User to follow (NDKUser object) or hashtag to follow (string).'
        },
        {
          name: 'showIcon',
          type: 'boolean',
          default: 'true',
          required: false,
          description: 'Whether to show the follow/unfollow icon.'
        },
        {
          name: 'showTarget',
          type: 'boolean',
          default: 'false',
          required: false,
          description: 'Whether to display target avatar/icon and name.'
        },
        {
          name: 'class',
          type: 'string',
          required: false,
          description: 'Additional CSS classes to apply to the button.'
        }
      ]
    }
  ]
};

export const followButtonPillCard: ComponentCardData = {
  name: 'follow-button-pill',
  title: 'FollowButtonPill',
  richDescription: 'Rounded pill-style button with solid and outline variants. Supports compact mode for icon-only display and showTarget mode for avatar/icon and target name.',
  command: 'npx jsrepo add follow-button-pill',
  apiDocs: [
    {
      name: 'FollowButtonPill',
      description: 'Rounded pill-style follow button with multiple variants and display modes.',
      importPath: "import { FollowButtonPill } from '$lib/registry/components/follow-button-pill.svelte'",
      props: [
        {
          name: 'ndk',
          type: 'NDKSvelte',
          required: false,
          description: 'NDK instance. If not provided, will use context.'
        },
        {
          name: 'target',
          type: 'NDKUser | string',
          required: true,
          description: 'User to follow (NDKUser object) or hashtag to follow (string).'
        },
        {
          name: 'variant',
          type: "'solid' | 'outline'",
          default: "'solid'",
          required: false,
          description: 'Button style variant. Solid has filled background, outline has transparent background with border.'
        },
        {
          name: 'showIcon',
          type: 'boolean',
          default: 'true',
          required: false,
          description: 'Whether to show the follow/unfollow icon.'
        },
        {
          name: 'showTarget',
          type: 'boolean',
          default: 'false',
          required: false,
          description: 'Whether to display target avatar/icon and name.'
        },
        {
          name: 'compact',
          type: 'boolean',
          default: 'false',
          required: false,
          description: 'Compact mode shows only the icon. Expands on hover when showTarget is true.'
        },
        {
          name: 'class',
          type: 'string',
          required: false,
          description: 'Additional CSS classes to apply to the button.'
        }
      ]
    }
  ]
};

export const followButtonAnimatedCard: ComponentCardData = {
  name: 'follow-button-animated',
  title: 'FollowButtonAnimated',
  richDescription: 'Animated follow button with smooth transitions and visual feedback. Features icon animations and checkmark confirmation on follow.',
  command: 'npx jsrepo add follow-button-animated',
  apiDocs: [
    {
      name: 'FollowButtonAnimated',
      description: 'Follow button with smooth animations and visual feedback on state changes.',
      importPath: "import { FollowButtonAnimated } from '$lib/registry/components/follow-button-animated.svelte'",
      props: [
        {
          name: 'ndk',
          type: 'NDKSvelte',
          required: false,
          description: 'NDK instance. If not provided, will use context.'
        },
        {
          name: 'target',
          type: 'NDKUser | string',
          required: true,
          description: 'User to follow (NDKUser object) or hashtag to follow (string).'
        },
        {
          name: 'showTarget',
          type: 'boolean',
          default: 'false',
          required: false,
          description: 'Whether to display target avatar/icon and name.'
        },
        {
          name: 'class',
          type: 'string',
          required: false,
          description: 'Additional CSS classes to apply to the button.'
        }
      ]
    }
  ]
};

// API documentation
export const followApiDocs: ApiDoc[] = [
  {
    name: 'createFollowAction',
    description: 'Builder function that provides follow/unfollow state and methods. Use directly in custom components or with FollowButton blocks. Returns FollowActionState with isFollowing (boolean - current follow state) and follow (() => Promise<void> - toggle follow/unfollow).',
    importPath: "import { createFollowAction } from '@nostr-dev-kit/svelte'",
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
    ],
    events: [
      {
        name: 'followsuccess',
        description: 'Fired when follow/unfollow operation succeeds. Detail: { target, isFollowing, isHashtag }'
      },
      {
        name: 'followerror',
        description: 'Fired when follow/unfollow operation fails. Detail: { error, target, isHashtag }'
      }
    ]
  }
];

// All metadata for the follow page
export const followMetadata = {
  title: 'Follow',
  showcaseTitle: 'Showcase',
  showcaseDescription: 'Follow button variants for users and hashtags. From minimal to animated.',
  cards: [followButtonMinimalCard, followButtonPillCard, followButtonAnimatedCard],
  apiDocs: followApiDocs
};
