import {
  Home01Icon,
  Book02Icon,
  Building01Icon,
  Layers01Icon,
  CodeIcon,
  UserAdd01Icon,
  FavouriteIcon,
  MailReply01Icon,
  RepeatIcon,
  VolumeMute01Icon,
  ZapIcon,
  Calendar01Icon,
  Chat01Icon,
  File01Icon,
  UserCircleIcon,
  IdentificationIcon,
  UserIcon,
  NewsIcon,
  ServerStack01Icon,
  Search01Icon,
  PaintBoardIcon,
  Image02Icon,
  ViewIcon,
  VoiceIcon,
  UserGroupIcon,
  CloudUploadIcon,
  AtIcon,
  HighlighterIcon
} from '@hugeicons/core-free-icons';

export interface NavItem {
  name: string;
  path: string;
  icon: typeof Home01Icon;
  title?: string;
  description?: string;
}

export interface NavCategory {
  title: string;
  items: NavItem[];
}

export const mainNav: NavItem[] = [
  { name: 'Intro', path: '/', icon: Home01Icon },
  { name: 'Docs', path: '/docs', icon: Book02Icon },
  { name: 'Blocks', path: '/blocks', icon: Layers01Icon },
];

export const docs: NavItem[] = [
  { name: 'Introduction', path: '/docs', icon: Book02Icon, title: 'Introduction', description: 'Get started with NDK Svelte components and utilities' },
  { name: 'Architecture', path: '/docs/architecture', icon: Building01Icon, title: 'Architecture', description: 'Understand the reactive architecture and state management patterns' },
  { name: 'Builders', path: '/docs/builders', icon: Layers01Icon, title: 'Builders', description: 'Reactive state factories for managing Nostr data' },
  { name: 'Meta Subscriptions', path: '/docs/subscriptions', icon: RepeatIcon, title: 'Meta Subscriptions', description: 'Reactive meta-subscriptions that automatically track relationships between events' },
  { name: 'Components', path: '/docs/components', icon: CodeIcon, title: 'Components', description: 'Pre-built UI components for common Nostr interactions' },
  { name: 'Utilities', path: '/docs/utilities', icon: PaintBoardIcon, title: 'Utilities', description: 'Helper functions and utilities for working with Nostr' },
];

export const componentCategories: NavCategory[] = [
  {
    title: 'Actions',
    items: [
      { name: 'Follow', path: '/components/follow-action', icon: UserAdd01Icon, title: 'Follow Action', description: 'Follow/unfollow buttons for users. Choose from pre-built block variants or compose custom layouts using the builder.' },
      { name: 'Reaction', path: '/components/reaction-action', icon: FavouriteIcon, title: 'Reaction Action', description: 'Like/reaction buttons for events. Choose from pre-built block variants or compose custom layouts using the builder.' },
      { name: 'Reply', path: '/components/reply-action', icon: MailReply01Icon, title: 'Reply Action', description: 'Reply buttons for events. Choose from pre-built block variants or compose custom layouts using the builder.' },
      { name: 'Repost', path: '/components/repost-action', icon: RepeatIcon, title: 'Repost Action', description: 'Repost/quote buttons for events. Choose from pre-built block variants or compose custom layouts using the builder.' },
      { name: 'Mute', path: '/components/mute-action', icon: VolumeMute01Icon, title: 'Mute Action', description: 'Mute/unmute buttons for users. Choose from pre-built block variants or compose custom layouts using the builder.' },
      { name: 'Zap', path: '/components/zap-action', icon: ZapIcon, title: 'Zap Action', description: 'Lightning tip buttons for users and events. Choose from pre-built block variants or compose custom layouts using the builder.' },
    ]
  },
  {
    title: 'Previews',
    items: [
      { name: 'Introduction', path: '/components/previews/introduction', icon: ViewIcon, title: 'Embedded Event Previews', description: 'Automatically render rich previews of embedded Nostr events based on their kind.' },
      { name: 'Notes', path: '/components/previews/notes', icon: Chat01Icon, title: 'Note Embedded Preview', description: 'Embedded preview handler for short text notes (Kind 1) and generic replies (Kind 1111).' },
      { name: 'Articles', path: '/components/previews/articles', icon: NewsIcon, title: 'Article Embedded Preview', description: 'Embedded preview handler for long-form articles (Kind 30023 / NIP-23).' },
      { name: 'Highlights', path: '/components/previews/highlights', icon: HighlighterIcon, title: 'Highlight Embedded Preview', description: 'Embedded preview handler for text highlights (Kind 9802 / NIP-84).' },
      { name: 'Generic', path: '/components/previews/generic', icon: ViewIcon, title: 'Generic Embedded Preview', description: 'Fallback preview handler for event kinds without specific preview components.' },
    ]
  },
  // Components organized by type (Content/Cards) then by NIP/Kind
  {
    title: 'Content',
    items: [
      { name: 'Introduction', path: '/components/content/introduction', icon: ViewIcon, title: 'Content Components', description: 'Render different types of Nostr event content with rich formatting and embedded media.' },
      { name: 'Note (Kind:1)', path: '/components/content/note', icon: File01Icon, title: 'Event Content', description: 'Rich event content renderer with automatic parsing of mentions, hashtags, links, media, and custom emojis.' },
      { name: 'Article (NIP-23)', path: '/components/content/article', icon: NewsIcon, title: 'ArticleContent', description: 'Render NIP-23 article content with markdown support, inline highlights, text selection, and floating avatars.' },
      { name: 'Image (NIP-68)', path: '/components/content/image', icon: Image02Icon, title: 'Image Content', description: 'Display image events with metadata and interactions. Renders images from NIP-68 events (kind 20).' },
      { name: 'Mention', path: '/components/content/mention', icon: AtIcon, title: 'Mention', description: 'Render inline user mentions with automatic profile fetching and customizable styling.' },
      { name: 'Event Content', path: '/components/event-content', icon: File01Icon, title: 'Event Content', description: 'Render the content of a Nostr event.' },
      { name: 'Emoji Picker', path: '/components/emoji-picker', icon: FavouriteIcon, title: 'Emoji Picker', description: 'A component to pick emojis.'},
      { name: 'Time Ago', path: '/components/time-ago', icon: Calendar01Icon, title: 'Time Ago', description: 'Display time in a human-readable format.'},
    ]
  },
  {
    title: 'Cards',
    items: [
      { name: 'Introduction', path: '/components/cards/introduction', icon: ViewIcon, title: 'Card Components', description: 'Composable card components for displaying different types of Nostr events with flexible layouts.' },
      { name: 'Generic', path: '/components/cards/generic', icon: Calendar01Icon, title: 'EventCard', description: 'Composable components for displaying any NDKEvent type with flexible layouts and interactions.' },
      { name: 'Article (NIP-23)', path: '/components/cards/article', icon: NewsIcon, title: 'ArticleCard', description: 'Composable article card components for displaying NDKArticle content with customizable layouts.' },
      { name: 'Highlight (NIP-84)', path: '/components/cards/highlight', icon: HighlighterIcon, title: 'HighlightCard', description: 'Composable highlight card components for displaying NDKHighlight content (kind 9802) with customizable layouts.' },
      { name: 'Voice Message (NIP-A0)', path: '/components/cards/voice-message', icon: VoiceIcon, title: 'VoiceMessageCard', description: 'Composable voice message card components for displaying NIP-A0 voice messages with audio playback and waveform visualization.' },
    ]
  },
  {
    title: 'Events',
    items: [
      { name: 'EventCard Thread', path: '/components/event-thread', icon: Chat01Icon, title: 'ThreadView', description: 'Display Nostr event threads with parent chains, focused events, and replies.' },
    ]
  },
  {
    title: 'User',
    items: [
      { name: 'Card', path: '/components/user-card', icon: IdentificationIcon, title: 'User Card', description: 'Display user information in card layouts. Choose from compact list items, portrait cards, or landscape layouts.' },
      { name: 'UserInput', path: '/components/user-input', icon: Search01Icon, title: 'UserInput', description: 'Search and select Nostr users with autocomplete functionality. Searches cached profiles and supports NIP-05/npub/nprofile lookups.' },
      { name: 'Profile', path: '/components/user-profile', icon: UserIcon, title: 'UserProfile', description: 'Composable user profile display components with multiple layout variants.' },
      { name: 'Avatar Group', path: '/components/avatar-group', icon: UserGroupIcon, title: 'Avatar Group', description: 'Display a group of avatars.' },
    ]
  },
  {
    title: 'Relay',
    items: [
      { name: 'Card', path: '/components/relay-card', icon: ServerStack01Icon, title: 'RelayCard', description: 'Composable relay display components with NIP-11 info and bookmark functionality.' },
    ]
  },
  {
    title: 'Lists (NIP-51)',
    items: [
      { name: 'Follow Pack', path: '/components/follow-pack', icon: UserGroupIcon, title: 'FollowPack', description: 'Display curated lists of people (kind 39089). Follow packs are collections of users grouped by topic, interest, or community.' },
    ]
  },
  {
    title: 'Media',
    items: [
      { name: 'Upload', path: '/components/media-upload', icon: CloudUploadIcon, title: 'Media Upload', description: 'Upload media files to Blossom servers. Support for images, videos, audio, and other file types with progress tracking.' },
    ]
  },
];

