import type { ComponentCardData, ApiDoc } from '$lib/templates/types';

// Card data for avatar variants
export const avatarBasicCard: ComponentCardData = {
  name: 'user-avatar',
  title: 'User.Avatar',
  description: 'Display user avatars with customizable size.',
  richDescription: 'Images load in the background without showing broken states. The deterministic gradient fallback (based on pubkey) is displayed until the image loads, or when no image is available.',
  command: 'npx shadcn@latest add user',
  apiDocs: [
    {
      name: 'User.Avatar',
      description: 'User avatar component with background loading and automatic fallbacks',
      importPath: "import { User } from '$lib/registry/ui/user'",
      props: [
        { name: 'size', type: 'number', default: '48', description: 'Avatar size in pixels' },
        { name: 'fallback', type: 'string', description: 'Fallback image URL' },
        { name: 'alt', type: 'string', description: 'Alt text for the image' },
        { name: 'class', type: 'string', description: 'Additional CSS classes' },
        { name: 'customFallback', type: 'Snippet', description: 'Custom fallback snippet to replace the default gradient' }
      ]
    }
  ]
};

export const avatarFallbackCard: ComponentCardData = {
  name: 'user-avatar-fallback',
  title: 'Avatar with Fallback',
  description: 'Avatars with deterministic gradient fallback.',
  richDescription: 'When no profile picture is available, avatars automatically show initials with a gradient background generated from the pubkey. The gradient is deterministic - the same pubkey always produces the same gradient.',
  command: 'npx shadcn@latest add user',
  apiDocs: []
};

// API documentation
export const avatarApiDocs: ApiDoc[] = [
  {
    name: 'User.Avatar',
    description: 'Display user avatars with background loading and automatic fallbacks.',
    importPath: "import { User } from '$lib/registry/ui/user'",
    props: [
      { name: 'size', type: 'number', default: '48', description: 'Avatar size in pixels' },
      { name: 'fallback', type: 'string', description: 'Fallback image URL' },
      { name: 'alt', type: 'string', description: 'Alt text for the image' },
      { name: 'class', type: 'string', description: 'Additional CSS classes' },
      { name: 'customFallback', type: 'Snippet', description: 'Custom fallback snippet to replace the default gradient' }
    ]
  }
];

// All metadata for the avatar page
export const avatarMetadata = {
  title: 'User.Avatar',
  description: 'Display user avatars with background image loading and automatic fallbacks. Part of the UserProfile component system.',
  showcaseTitle: 'Showcase',
  showcaseDescription: 'User avatar variants with background loading and fallback states.',
  cards: [avatarBasicCard, avatarFallbackCard],
  apiDocs: avatarApiDocs
};