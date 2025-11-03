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
  HighlighterIcon,
  Tag01Icon
} from '@hugeicons/core-free-icons';

export interface NavItem {
  name: string;
  path: string;
  icon: typeof Home01Icon;
  title?: string;
  description?: string;
  nip?: string;
}

export interface NavCategory {
  title: string;
  items: NavItem[];
  nip?: string;
}

export const mainNav: NavItem[] = [
  { name: 'Intro', path: '/', icon: Home01Icon },
  { name: 'Docs', path: '/docs', icon: Book02Icon },
  { name: 'UI Primitives', path: '/ui', icon: PaintBoardIcon },
  { name: 'Components', path: '/components', icon: CodeIcon },
  { name: 'Blocks', path: '/blocks', icon: Layers01Icon },
];

export const docs: NavItem[] = [
  { name: 'Introduction', path: '/docs', icon: Book02Icon, title: 'Introduction', description: 'Get started with NDK Svelte components and utilities' },
  { name: 'Architecture', path: '/docs/architecture', icon: Building01Icon, title: 'Architecture', description: 'Understand the reactive architecture and state management patterns' },
  { name: 'Builders', path: '/docs/builders', icon: Layers01Icon, title: 'Builders', description: 'Reactive state factories for managing Nostr data' },
  { name: 'Meta Subscriptions', path: '/docs/subscriptions', icon: RepeatIcon, title: 'Meta Subscriptions', description: 'Reactive meta-subscriptions that automatically track relationships between events' },
  { name: 'Components', path: '/docs/components', icon: CodeIcon, title: 'Components', description: 'Pre-built UI Primitives for common Nostr interactions' },
  { name: 'Utilities', path: '/docs/utilities', icon: PaintBoardIcon, title: 'Utilities', description: 'Helper functions and utilities for working with Nostr' },
];

export const componentCategories: NavCategory[] = [
  {
    title: 'UI Primitives',
    items: [
      { name: 'Introduction', path: '/ui', icon: PaintBoardIcon, title: 'UI Primitives', description: 'Headless, composable building blocks for creating Nostr interfaces.' },
      { name: 'Article', path: '/ui/article', icon: NewsIcon, title: 'Article Primitives', description: 'Headless primitives for displaying long-form articles (NIP-23).', nip: 'NIP-23' },
      { name: 'User', path: '/ui/user', icon: UserIcon, title: 'User Primitives', description: 'Headless primitives for displaying user profiles and metadata.' },
      { name: 'Highlight', path: '/ui/highlight', icon: HighlighterIcon, title: 'Highlight Primitives', description: 'Headless primitives for displaying text highlights (NIP-84).', nip: 'NIP-84' },
      { name: 'Relay', path: '/ui/relay', icon: ServerStack01Icon, title: 'Relay Primitives', description: 'Headless primitives for displaying relay information and controls.' },
      { name: 'Media Upload', path: '/ui/media-upload', icon: CloudUploadIcon, title: 'Media Upload Primitives', description: 'Headless primitives for uploading files to Blossom servers.' },
      { name: 'Reaction', path: '/ui/reaction', icon: FavouriteIcon, title: 'Reaction Primitives', description: 'Headless primitives for displaying event reactions.' },
      { name: 'Follow Pack', path: '/ui/follow-pack', icon: UserGroupIcon, title: 'Follow Pack Primitives', description: 'Headless primitives for displaying curated user lists.' },
      { name: 'User Input', path: '/ui/user-input', icon: Search01Icon, title: 'User Input Primitives', description: 'Headless primitives for searching and selecting users.' },
      { name: 'Voice Message', path: '/ui/voice-message', icon: VoiceIcon, title: 'Voice Message Primitives', description: 'Headless primitives for playing voice messages with waveforms.' },
      { name: 'Zap', path: '/ui/zap', icon: ZapIcon, title: 'Zap Primitives', description: 'Headless primitives for displaying lightning payments.' },
      { name: 'Event Content', path: '/ui/event-content', icon: File01Icon, title: 'Event Content Primitive', description: 'Render event content with rich formatting, mentions, and embedded media.' },
      { name: 'Embedded Event', path: '/ui/embedded-event', icon: ViewIcon, title: 'Embedded Event Primitive', description: 'Load and display embedded Nostr events.' },
    ]
  },
  {
    title: 'Actions',
    items: [
      { name: 'Follow', path: '/components/follow', icon: UserAdd01Icon, title: 'Follow', description: 'Follow/unfollow buttons for users. Choose from pre-built block variants or compose custom layouts using the builder.' },
      { name: 'Reaction', path: '/components/reaction', icon: FavouriteIcon, title: 'Reaction', description: 'Like/reaction buttons for events. Choose from pre-built block variants or compose custom layouts using the builder.' },
      { name: 'Reply', path: '/components/reply', icon: MailReply01Icon, title: 'Reply', description: 'Reply buttons for events. Choose from pre-built block variants or compose custom layouts using the builder.' },
      { name: 'Repost', path: '/components/repost', icon: RepeatIcon, title: 'Repost', description: 'Repost/quote buttons for events. Choose from pre-built block variants or compose custom layouts using the builder.' },
      { name: 'Mute', path: '/components/mute', icon: VolumeMute01Icon, title: 'Mute', description: 'Mute/unmute buttons for users. Choose from pre-built block variants or compose custom layouts using the builder.' },
      { name: 'Zap', path: '/components/zap', icon: ZapIcon, title: 'Zap', description: 'Lightning tip buttons for users and events. Choose from pre-built block variants or compose custom layouts using the builder.' },
    ]
  },
  {
    title: 'Previews',
    items: [
      { name: 'Introduction', path: '/components/previews/introduction', icon: ViewIcon, title: 'Embedded Event Previews', description: 'Automatically render rich previews of embedded Nostr events based on their kind.' },
      { name: 'Notes', path: '/components/previews/notes', icon: Chat01Icon, title: 'Note Embedded Preview', description: 'Embedded preview handler for short text notes (Kind 1) and generic replies (Kind 1111).', nip: 'Kind:1' },
      { name: 'Articles', path: '/components/previews/articles', icon: NewsIcon, title: 'Article Embedded Preview', description: 'Embedded preview handler for long-form articles (Kind 30023 / NIP-23).', nip: 'NIP-23' },
      { name: 'Highlights', path: '/components/previews/highlights', icon: HighlighterIcon, title: 'Highlight Embedded Preview', description: 'Embedded preview handler for text highlights (Kind 9802 / NIP-84).', nip: 'NIP-84' },
      { name: 'Generic', path: '/components/previews/generic', icon: ViewIcon, title: 'Generic Embedded Preview', description: 'Fallback preview handler for event kinds without specific preview components.' },
    ]
  },
  // Components organized by type (Content/Cards) then by NIP/Kind
  {
    title: 'Content',
    items: [
      { name: 'Introduction', path: '/components/content/introduction', icon: ViewIcon, title: 'Content Components', description: 'Render different types of Nostr event content with rich formatting and embedded media.' },
      { name: 'Note', path: '/components/content/note', icon: File01Icon, title: 'Event Content', description: 'Rich event content renderer with automatic parsing of mentions, hashtags, links, media, and custom emojis.', nip: 'Kind:1' },
      { name: 'Article', path: '/components/content/article', icon: NewsIcon, title: 'ArticleContent', description: 'Render NIP-23 article content with markdown support, inline highlights, text selection, and floating avatars.', nip: 'NIP-23' },
      { name: 'Image', path: '/components/content/image', icon: Image02Icon, title: 'Image Content', description: 'Display image events with metadata and interactions. Renders images from NIP-68 events (kind 20).', nip: 'NIP-68' },
      { name: 'Mention', path: '/components/content/mention', icon: AtIcon, title: 'Mention', description: 'Render inline user mentions with automatic profile fetching and customizable styling.' },
      { name: 'Event Content', path: '/components/event-content', icon: File01Icon, title: 'Event Content', description: 'Render the content of a Nostr event.' },
      { name: 'Emoji Picker', path: '/components/emoji-picker', icon: FavouriteIcon, title: 'Emoji Picker', description: 'A component to pick emojis.'},
    ]
  },
  {
    title: 'Cards',
    items: [
      { name: 'Introduction', path: '/components/cards/introduction', icon: ViewIcon, title: 'Card Components', description: 'Composable card components for displaying different types of Nostr events with flexible layouts.' },
      { name: 'Generic', path: '/components/cards/generic', icon: Calendar01Icon, title: 'EventCard', description: 'Composable components for displaying any NDKEvent type with flexible layouts and interactions.' },
      { name: 'Article', path: '/components/cards/article', icon: NewsIcon, title: 'ArticleCard', description: 'Composable article card components for displaying NDKArticle content with customizable layouts.', nip: 'NIP-23' },
      { name: 'Highlight', path: '/components/cards/highlight', icon: HighlighterIcon, title: 'HighlightCard', description: 'Composable highlight card components for displaying NDKHighlight content (kind 9802) with customizable layouts.', nip: 'NIP-84' },
      { name: 'Audio', path: '/components/cards/voice-message', icon: VoiceIcon, title: 'VoiceMessageCard', description: 'Composable voice message card components for displaying NIP-A0 voice messages with audio playback and waveform visualization.', nip: 'NIP-A0' },
    ]
  },
  {
    title: 'Bits',
    items: [
      { name: 'Threads', path: '/components/event-thread', icon: Chat01Icon, title: 'ThreadView', description: 'Display Nostr event threads with parent chains, focused events, and replies.' },
    ]
  },
  {
    title: 'User',
    items: [
      { name: 'Card', path: '/components/user-card', icon: IdentificationIcon, title: 'User Card', description: 'Display user information in card layouts. Choose from compact list items, portrait cards, or landscape layouts.' },
      { name: 'Input', path: '/components/input', icon: Search01Icon, title: 'Input', description: 'Search and select Nostr users with autocomplete functionality. Searches cached profiles and supports NIP-05/npub/nprofile lookups.' },
      { name: 'Avatar Group', path: '/components/avatar-group', icon: UserGroupIcon, title: 'Avatar Group', description: 'Display a group of avatars.' },
    ]
  },
  {
    title: 'Hashtag',
    items: [
      { name: 'Card', path: '/components/hashtag-card', icon: Tag01Icon, title: 'Hashtag Card', description: 'Display hashtag activity and statistics. Track conversations, see contributors, and follow topics with portrait and compact variants.' },
    ]
  },
  {
    title: 'Relay',
    items: [
      { name: 'Card', path: '/components/relay-card', icon: ServerStack01Icon, title: 'RelayCard', description: 'Composable relay display components with NIP-11 info and bookmark functionality.' },
      { name: 'Input', path: '/components/relay-input', icon: Search01Icon, title: 'RelayInput', description: 'Input field for relay URLs with NIP-11 autocomplete and relay information display.' },
      { name: 'Selector', path: '/components/relay-selector', icon: ServerStack01Icon, title: 'RelaySelector', description: 'Dropdown selector for choosing relays from connected pool with ability to add new ones.' },
    ]
  },
  {
    title: 'Lists',
    nip: 'NIP-51',
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

