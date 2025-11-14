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
  { name: 'Components', path: '/docs/components', icon: CodeIcon, title: 'Components', description: 'Pre-built UI templates that copy into your project' },
  { name: 'Utilities', path: '/docs/utilities', icon: PaintBoardIcon, title: 'Utilities', description: 'Helper functions and utilities for working with Nostr' },
];

export const eventCategories: NavCategory[] = [
  {
    title: 'Introduction',
    items: [
      { name: 'Overview', path: '/events', icon: Calendar01Icon, title: 'Event Rendering', description: 'The three-layer model: Chrome, Content, and Embeds' },
      { name: 'Basics', path: '/events/basics', icon: Book02Icon, title: 'Getting Started', description: 'Configure the content renderer in your app layout' },
    ]
  },
  {
    title: 'Chromes (Cards)',
    items: [
      { name: 'EventCard', path: '/events/cards', icon: Calendar01Icon, title: 'EventCard Primitives', description: 'Composable primitives for displaying any NDKEvent type with flexible layouts and interactions.' },
      { name: 'Fallback Card', path: '/events/cards/fallback-card', icon: Calendar01Icon, title: 'Fallback Event Card', description: 'Fallback card for unknown event kinds with NIP-31 alt tag and NIP-89 app handler discovery.' },
      { name: 'Article', path: '/events/cards/article', icon: NewsIcon, title: 'ArticleCard', description: 'Composable article card components for displaying NDKArticle content with customizable layouts.', nip: 'NIP-23' },
      { name: 'Highlight', path: '/events/cards/highlight', icon: HighlighterIcon, title: 'HighlightCard', description: 'Composable highlight card components for displaying NDKHighlight content (kind 9802) with customizable layouts.', nip: 'NIP-84' },
      { name: 'Image', path: '/events/cards/image', icon: Image02Icon, title: 'ImageCard', description: 'Composable image card components for displaying NIP-68 image events (kind 20) with customizable layouts.', nip: 'NIP-68' },
    ]
  },
  {
    title: 'Content',
    items: [
      { name: 'Plain Text', path: '/events/content/plain-text', icon: File01Icon, title: 'Plain Text Content', description: 'Rich event content renderer with automatic parsing of mentions, hashtags, links, media, and custom emojis.' },
      { name: 'Markdown', path: '/events/content/markdown', icon: NewsIcon, title: 'Markdown Content', description: 'Render markdown content with Nostr extensions, inline highlights, text selection, and floating avatars.' },
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
      { name: 'Zap', path: '/ui/zap', icon: ZapIcon, title: 'Zap Primitives', description: 'Headless primitives for displaying lightning payments.' },
      { name: 'Notification', path: '/ui/notification', icon: Chat01Icon, title: 'Notification Primitives', description: 'Composable primitives for building notification UIs with grouped interactions.' },
      { name: 'Event Rendering', path: '/ui/event-rendering', icon: File01Icon, title: 'Event Rendering Primitives', description: 'Render rich event content, embedded events, and markdown with one renderer.' },
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
      { name: 'Zap Send', path: '/components/zap-send-classic', icon: ZapIcon, title: 'ZapSendClassic', description: 'Complete zap dialog with amount selection, recipient splits, and comment support.' },
    ]
  },
  {
    title: 'Bits',
    items: [
      { name: 'Notification', path: '/components/notification', icon: Chat01Icon, title: 'Notification', description: 'Real-time notification feed using $metaSubscription. Groups interactions by target event and provides composable primitives for custom layouts.' },
      { name: 'Content Tab', path: '/components/content-tab', icon: Layers01Icon, title: 'ContentTab', description: 'Conditionally display tabs based on the types of content a user actually publishes. Automatically samples content and shows only relevant tabs.' },
      { name: 'Emoji Picker', path: '/components/emoji-picker', icon: FavouriteIcon, title: 'Emoji Picker', description: 'Pick emojis from your custom NIP-51 emoji sets and defaults with search and categories.' },
      { name: 'Unpublished Events', path: '/components/unpublished-events', icon: CloudUploadIcon, title: 'Unpublished Events', description: 'Track and retry events that failed to publish to Nostr relays. Displays badge with count and popover with retry/discard actions.' },
    ]
  },
  {
    title: 'User',
    items: [
      { name: 'Card', path: '/components/user-card', icon: IdentificationIcon, title: 'User Card', description: 'Display user information in card layouts. Choose from compact list items, portrait cards, or landscape layouts.' },
      { name: 'Avatar Group', path: '/components/avatar-group', icon: UserGroupIcon, title: 'Avatar Group', description: 'Display a group of avatars.' },
    ]
  },
  {
    title: 'Relay',
    items: [
      { name: 'Card', path: '/components/relay-card', icon: ServerStack01Icon, title: 'RelayCard', description: 'Composable relay display components with NIP-11 info and bookmark functionality.' },
      { name: 'Input', path: '/components/relay-input', icon: Search01Icon, title: 'RelayInput', description: 'Input field for relay URLs with NIP-11 autocomplete and relay information display.' },
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
