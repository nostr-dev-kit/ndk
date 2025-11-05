import type { ComponentCardData, ApiDoc, AnatomyLayer } from '$lib/templates/types';

// Card data for all user card variants
export const userCardClassicCard: ComponentCardData = {
  name: 'user-card-classic',
  title: 'UserCardClassic',
  description: 'Classic user card with banner, avatar, name, bio, and stats.',
  richDescription: 'Perfect for popovers, dialogs, and standalone displays. This card provides a complete user profile view with banner image, avatar overlay, display name, bio, and follower/following stats.',
  command: 'npx jsrepo add user-card-classic',
  apiDocs: []
};

export const userCardCompactCard: ComponentCardData = {
  name: 'user-card-compact',
  title: 'UserCardCompact',
  description: 'Minimal user card for lists.',
  richDescription: 'Shows avatar, name, and follow button. Ideal for sidebars and compact layouts where space is limited but user identity needs to be clear.',
  command: 'npx jsrepo add user-card-compact',
  apiDocs: []
};

export const userCardListItemCard: ComponentCardData = {
  name: 'user-list-item',
  title: 'UserListItem',
  description: 'Ultra-compact list item showing avatar, name, and follow status badge.',
  richDescription: 'Perfect for dense user lists and search results. Minimal design with just the essentials: avatar, name, and follow status indicator.',
  command: 'npx jsrepo add user-list-item',
  apiDocs: []
};

export const userCardPortraitCard: ComponentCardData = {
  name: 'user-card-portrait',
  title: 'UserCardPortrait',
  description: 'Vertical card layout showing avatar, name, bio, and stats.',
  richDescription: 'Great for grids and profile galleries. This portrait-oriented card presents user information in a vertical layout ideal for grid displays and gallery views.',
  command: 'npx jsrepo add user-card-portrait',
  apiDocs: []
};

export const userCardLandscapeCard: ComponentCardData = {
  name: 'user-card-landscape',
  title: 'UserCardLandscape',
  description: 'Horizontal card layout with avatar on left.',
  richDescription: 'Perfect for feed views and detailed lists. This horizontal layout places the avatar on the left with name, bio, and stats flowing to the right.',
  command: 'npx jsrepo add user-card-landscape',
  apiDocs: []
};

export const userCardNeonCard: ComponentCardData = {
  name: 'user-card-neon',
  title: 'UserCardNeon',
  description: 'Neon-style card with full background image and glossy top border.',
  richDescription: 'Features a full background image with darkening gradient and a neon glow effect at the top border. Perfect for modern, visually striking user displays.',
  command: 'npx jsrepo add user-card-neon',
  apiDocs: []
};

export const userCardGlassCard: ComponentCardData = {
  name: 'user-card-glass',
  title: 'UserCardGlass',
  description: 'Glassmorphic card with frosted glass effect and gradient mesh background.',
  richDescription: 'Features a translucent frosted glass card over an animated gradient mesh background with sparkle effects. Modern, elegant design with soft glows and blur effects.',
  command: 'npx jsrepo add user-card-glass',
  apiDocs: []
};

// Anatomy layers for the anatomy section
export const userCardAnatomyLayers: Record<string, AnatomyLayer> = {
  avatar: {
    id: 'avatar',
    label: 'User.Avatar',
    description: 'Displays user avatar image with automatic loading and fallback handling.',
    props: ['size', 'class']
  },
  banner: {
    id: 'banner',
    label: 'User.Banner',
    description: 'Renders user banner/header image from profile metadata.',
    props: ['class']
  },
  name: {
    id: 'name',
    label: 'User.Name',
    description: 'Renders the user display name or handle from profile metadata.',
    props: ['class']
  },
  handle: {
    id: 'handle',
    label: 'User.Handle',
    description: 'Displays the user handle/username.',
    props: ['class']
  },
  bio: {
    id: 'bio',
    label: 'User.Bio',
    description: 'Shows user biography text from profile with automatic truncation support.',
    props: ['maxLength', 'class']
  },
  nip05: {
    id: 'nip05',
    label: 'User.Nip05',
    description: 'Displays verified NIP-05 identifier with verification badge.',
    props: ['class']
  },
  field: {
    id: 'field',
    label: 'User.Field',
    description: 'Renders a custom field from user profile metadata.',
    props: ['name', 'class']
  }
};

// Primitive data for the primitives section
export const userCardPrimitiveData = {
  root: {
    name: 'User.Root',
    description: 'Root container component that provides user context and manages state for all child primitives. Must wrap all other User primitives.',
    props: [
      { name: 'ndk', type: 'NDKSvelte', desc: 'NDK instance (required)' },
      { name: 'pubkey', type: 'string', desc: 'User public key in hex format (required)' },
      { name: 'user', type: 'NDKUser', desc: 'NDKUser instance (alternative to pubkey)' },
      { name: 'class', type: 'string', desc: 'Additional CSS classes' }
    ]
  },
  avatar: {
    name: 'User.Avatar',
    description: 'Displays user avatar image with automatic loading and fallback handling.',
    props: [
      { name: 'size', type: "'sm' | 'md' | 'lg'", desc: 'Avatar size (default: md)' },
      { name: 'class', type: 'string', desc: 'Additional CSS classes for styling' }
    ]
  },
  banner: {
    name: 'User.Banner',
    description: 'Renders user banner/header image from profile metadata.',
    props: [{ name: 'class', type: 'string', desc: 'Additional CSS classes' }]
  },
  name: {
    name: 'User.Name',
    description: 'Renders the user display name or handle from profile metadata.',
    props: [{ name: 'class', type: 'string', desc: 'Additional CSS classes' }]
  },
  handle: {
    name: 'User.Handle',
    description: 'Displays the user handle/username.',
    props: [{ name: 'class', type: 'string', desc: 'Additional CSS classes' }]
  },
  bio: {
    name: 'User.Bio',
    description: 'Shows user biography text from profile with automatic truncation support.',
    props: [
      { name: 'maxLength', type: 'number', desc: 'Maximum character length (optional)' },
      { name: 'class', type: 'string', desc: 'Additional CSS classes' }
    ]
  },
  nip05: {
    name: 'User.Nip05',
    description: 'Displays verified NIP-05 identifier with verification badge.',
    props: [{ name: 'class', type: 'string', desc: 'Additional CSS classes' }]
  },
  field: {
    name: 'User.Field',
    description: 'Renders a custom field from user profile metadata.',
    props: [
      { name: 'name', type: 'string', desc: 'Field name to display (required)' },
      { name: 'class', type: 'string', desc: 'Additional CSS classes' }
    ]
  }
};

// API documentation
export const userCardApiDocs: ApiDoc[] = [
  // No general API docs for this page - they're included in the card data
];

// All metadata for the user card page
export const userCardMetadata = {
  title: 'User Card',
  description: 'Display user information in card layouts. Choose from compact list items, portrait cards, or landscape layouts for different contexts.',
  showcaseTitle: 'Components Showcase',
  showcaseDescription: 'Seven carefully crafted variants. From ultra-compact list items to full-featured glassmorphic cards. Choose the perfect fit for your layout.',
  cards: [
    userCardClassicCard,
    userCardCompactCard,
    userCardListItemCard,
    userCardPortraitCard,
    userCardLandscapeCard,
    userCardNeonCard,
    userCardGlassCard
  ],
  apiDocs: userCardApiDocs
};