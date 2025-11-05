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
  CloudLoadingIcon,
  Tag01Icon,
  Download01Icon
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
  { name: 'Events', path: '/events', icon: Calendar01Icon },
  { name: 'Components', path: '/components', icon: CodeIcon },
  { name: 'Blocks', path: '/blocks', icon: Layers01Icon },
];

export const docs: NavItem[] = [
  { name: 'Introduction', path: '/docs', icon: Book02Icon, title: 'Introduction', description: 'Get started with NDK Svelte components and utilities' },
  { name: 'Installation', path: '/docs/installation', icon: Download01Icon, title: 'Installation', description: 'Complete guide to installing and configuring @nostr/svelte in your project' },
  { name: 'Architecture', path: '/docs/architecture', icon: Building01Icon, title: 'Architecture', description: 'Understand the reactive architecture and state management patterns' },
  { name: 'Builders', path: '/docs/builders', icon: Layers01Icon, title: 'Builders', description: 'Reactive state factories for managing Nostr data' },
  { name: 'Meta Subscriptions', path: '/docs/subscriptions', icon: RepeatIcon, title: 'Meta Subscriptions', description: 'Reactive meta-subscriptions that automatically track relationships between events' },
  { name: 'Components', path: '/docs/components', icon: CodeIcon, title: 'Components', description: 'Pre-built UI Primitives for common Nostr interactions' },
  { name: 'Utilities', path: '/docs/utilities', icon: PaintBoardIcon, title: 'Utilities', description: 'Helper functions and utilities for working with Nostr' },
];

export const eventCategories: NavCategory[] = [
  {
    title: 'Introduction',
    items: [
      { name: 'Overview', path: '/events', icon: Calendar01Icon, title: 'Event Rendering', description: 'The three-layer model: Chrome, Content, and Embeds' },
    ]
  },
  {
    title: 'Chromes (Cards)',
    items: [
      { name: 'EventCard', path: '/events/cards', icon: Calendar01Icon, title: 'EventCard Primitives', description: 'Composable primitives for displaying any NDKEvent type with flexible layouts and interactions.' },
      { name: 'Article', path: '/events/cards/article', icon: NewsIcon, title: 'ArticleCard', description: 'Composable article card components for displaying NDKArticle content with customizable layouts.', nip: 'NIP-23' },
      { name: 'Highlight', path: '/events/cards/highlight', icon: HighlighterIcon, title: 'HighlightCard', description: 'Composable highlight card components for displaying NDKHighlight content (kind 9802) with customizable layouts.', nip: 'NIP-84' },
      { name: 'Audio', path: '/events/cards/voice-message', icon: VoiceIcon, title: 'VoiceMessageCard', description: 'Composable voice message card components for displaying NIP-A0 voice messages with audio playback and waveform visualization.', nip: 'NIP-A0' },
      { name: 'Image', path: '/events/cards/image', icon: Image02Icon, title: 'ImageCard', description: 'Composable image card components for displaying NIP-68 image events (kind 20) with customizable layouts.', nip: 'NIP-68' },
    ]
  },
  {
    title: 'Content',
    items: [
      { name: 'Note', path: '/events/content/note', icon: File01Icon, title: 'Event Content', description: 'Rich event content renderer with automatic parsing of mentions, hashtags, links, media, and custom emojis.', nip: 'Kind:1' },
      { name: 'Article', path: '/events/content/article', icon: NewsIcon, title: 'ArticleContent', description: 'Render NIP-23 article content with markdown support, inline highlights, text selection, and floating avatars.', nip: 'NIP-23' },
    ]
  },
  {
    title: 'Embeds',
    items: [
      { name: 'Overview', path: '/events/embeds', icon: ViewIcon, title: 'ContentRenderer System', description: 'ContentRenderer architecture and embedded event handlers for rich previews.' },
      { name: 'Mention', path: '/events/embeds/mention', icon: AtIcon, title: 'Mention', description: 'Render inline user mentions with automatic profile fetching and customizable styling.' },
      { name: 'Hashtag', path: '/events/embeds/hashtag', icon: Tag01Icon, title: 'Hashtag', description: 'Render inline hashtags with customizable styling and click handlers.' },
      { name: 'Media', path: '/events/embeds/media', icon: Image02Icon, title: 'Media Components', description: 'Custom media renderers: elegant carousels and bento grids for grouped images and videos.' },
      { name: 'Links', path: '/events/embeds/links', icon: ViewIcon, title: 'Link Components', description: 'Rich link previews: hover previews and embedded OpenGraph cards for URLs.' },
      { name: 'Notes', path: '/events/embeds/notes', icon: Chat01Icon, title: 'Note Embedded Preview', description: 'Embedded preview handler for short text notes (Kind 1) and generic replies (Kind 1111).', nip: 'Kind:1' },
      { name: 'Articles', path: '/events/embeds/articles', icon: NewsIcon, title: 'Article Embedded Preview', description: 'Embedded preview handler for long-form articles (Kind 30023 / NIP-23).', nip: 'NIP-23' },
      { name: 'Highlights', path: '/events/embeds/highlights', icon: HighlighterIcon, title: 'Highlight Embedded Preview', description: 'Embedded preview handler for text highlights (Kind 9802 / NIP-84).', nip: 'NIP-84' },
      { name: 'Generic', path: '/events/embeds/generic', icon: ViewIcon, title: 'Generic Embedded Preview', description: 'Fallback preview handler for event kinds without specific preview components.' },
    ]
  },
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
    title: 'Bits',
    items: [
      { name: 'Threads', path: '/components/event-thread', icon: Chat01Icon, title: 'ThreadView', description: 'Display Nostr event threads with parent chains, focused events, and replies.' },
      { name: 'Content Tab', path: '/components/content-tab', icon: Layers01Icon, title: 'ContentTab', description: 'Conditionally display tabs based on the types of content a user actually publishes. Automatically samples content and shows only relevant tabs.' },
      { name: 'Emoji Picker', path: '/components/emoji-picker', icon: FavouriteIcon, title: 'Emoji Picker', description: 'Pick emojis from your custom NIP-51 emoji sets and defaults with search and categories.' },
      { name: 'Event Dropdown', path: '/components/event-dropdown', icon: Layers01Icon, title: 'EventDropdown', description: 'Dropdown menu for event actions including mute, report, copy, and raw event viewing with optional relay information display.' },
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
  {
    title: 'Negentropy',
    nip: 'NIP-77',
    items: [
      { name: 'Sync Progress', path: '/components/negentropy-sync', icon: CloudLoadingIcon, title: 'Negentropy Sync', description: 'Monitor Negentropy sync progress across multiple relays with real-time stats and relay status. Choose from minimal badges to detailed dashboards.', nip: 'NIP-77' },
    ]
  },
];

