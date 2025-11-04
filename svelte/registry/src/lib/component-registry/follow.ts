import type { ComponentCardData, ApiDoc } from '$lib/templates/types';

// Card data for follow button variants
export const followButtonMinimalCard: ComponentCardData = {
  name: 'follow-button',
  title: 'FollowButton',
  description: 'Minimal icon-first follow button.',
  richDescription: 'Minimal icon-first design. Best for inline use in feeds or alongside user names. Supports showTarget mode to display avatar/icon and target name.',
  command: 'npx shadcn@latest add follow-button',
  apiDocs: []
};

export const followButtonPillCard: ComponentCardData = {
  name: 'follow-button-pill',
  title: 'FollowButtonPill',
  description: 'Rounded pill-style follow button.',
  richDescription: 'Rounded pill-style button with solid and outline variants. Supports compact mode for icon-only display and showTarget mode for avatar/icon and target name.',
  command: 'npx shadcn@latest add follow-button-pill',
  apiDocs: []
};

export const followButtonAnimatedCard: ComponentCardData = {
  name: 'follow-button-animated',
  title: 'FollowButtonAnimated',
  description: 'Animated follow button with transitions.',
  richDescription: 'Animated follow button with smooth transitions and visual feedback. Features icon animations and checkmark confirmation on follow.',
  command: 'npx shadcn@latest add follow-button-animated',
  apiDocs: []
};

// API documentation
export const followApiDocs: ApiDoc[] = [
  {
    name: 'createFollowAction',
    description: 'Builder function that provides follow/unfollow state and methods. Use directly in custom components or with FollowButton blocks.',
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
    returns: {
      name: 'FollowActionState',
      properties: [
        {
          name: 'isFollowing',
          type: 'boolean',
          description: 'Current follow state'
        },
        {
          name: 'follow',
          type: '() => Promise<void>',
          description: 'Toggle follow/unfollow'
        }
      ]
    },
    events: [
      {
        name: 'followsuccess',
        type: '{ target, isFollowing, isHashtag }',
        description: 'Fired when follow/unfollow operation succeeds'
      },
      {
        name: 'followerror',
        type: '{ error, target, isHashtag }',
        description: 'Fired when follow/unfollow operation fails'
      }
    ]
  }
];

// All metadata for the follow page
export const followMetadata = {
  title: 'Follow',
  description: 'Follow/unfollow buttons for users and hashtags. Choose from pre-built block variants or compose custom layouts using primitives.',
  showcaseTitle: 'Showcase',
  showcaseDescription: 'Follow button variants for users and hashtags. From minimal to animated.',
  cards: [followButtonMinimalCard, followButtonPillCard, followButtonAnimatedCard],
  apiDocs: followApiDocs
};
