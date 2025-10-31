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
  CloudUploadIcon
} from '@hugeicons/core-free-icons';

export interface NavItem {
  name: string;
  path: string;
  icon: typeof Home01Icon;
}

export interface NavCategory {
  title: string;
  items: NavItem[];
}

export const docs: NavItem[] = [
  { name: 'Introduction', path: '/docs', icon: Book02Icon },
  { name: 'Architecture', path: '/docs/architecture', icon: Building01Icon },
  { name: 'Builders', path: '/docs/builders', icon: Layers01Icon },
  { name: 'Meta Subscriptions', path: '/docs/subscriptions', icon: RepeatIcon },
  { name: 'Components', path: '/docs/components', icon: CodeIcon },
  { name: 'Utilities', path: '/docs/utilities', icon: PaintBoardIcon },
];

export const componentCategories: NavCategory[] = [
  {
    title: 'Actions',
    items: [
      { name: 'Follow', path: '/components/follow-action', icon: UserAdd01Icon },
      { name: 'Reaction', path: '/components/reaction-action', icon: FavouriteIcon },
      { name: 'Reply', path: '/components/reply-action', icon: MailReply01Icon },
      { name: 'Repost', path: '/components/repost-action', icon: RepeatIcon },
      { name: 'Mute', path: '/components/mute-action', icon: VolumeMute01Icon },
      { name: 'Zap', path: '/components/zap-action', icon: ZapIcon },
    ]
  },
  {
    title: 'Previews',
    items: [
      { name: 'Introduction', path: '/components/previews/introduction', icon: ViewIcon },
      { name: 'Notes', path: '/components/previews/notes', icon: Chat01Icon },
      { name: 'Articles', path: '/components/previews/articles', icon: NewsIcon },
      { name: 'Highlights', path: '/components/previews/highlights', icon: File01Icon },
      { name: 'App Recommendations', path: '/components/previews/app-recommendations', icon: ViewIcon },
      { name: 'Handler Info', path: '/components/previews/handler-info', icon: ViewIcon },
      { name: 'Generic', path: '/components/previews/generic', icon: ViewIcon },
    ]
  },
  // Components organized by type (Content/Cards) then by NIP/Kind
  {
    title: 'Content',
    items: [
      { name: 'Introduction', path: '/components/content/introduction', icon: ViewIcon },
      { name: 'Note (Kind:1)', path: '/components/content/note', icon: File01Icon },
      { name: 'Article (NIP-23)', path: '/components/content/article', icon: NewsIcon },
      { name: 'Image (NIP-68)', path: '/components/content/image', icon: Image02Icon },
    ]
  },
  {
    title: 'Cards',
    items: [
      { name: 'Introduction', path: '/components/cards/introduction', icon: ViewIcon },
      { name: 'Generic', path: '/components/cards/generic', icon: Calendar01Icon },
      { name: 'Article (NIP-23)', path: '/components/cards/article', icon: NewsIcon },
      { name: 'Highlight (NIP-84)', path: '/components/cards/highlight', icon: File01Icon },
      { name: 'Voice Message (NIP-A0)', path: '/components/cards/voice-message', icon: VoiceIcon },
    ]
  },
  {
    title: 'Events',
    items: [
      { name: 'EventCard Thread', path: '/components/event-thread', icon: Chat01Icon },
    ]
  },
  {
    title: 'User',
    items: [
      { name: 'Card', path: '/components/user-card', icon: IdentificationIcon },
      { name: 'UserInput', path: '/components/user-input', icon: Search01Icon },
      { name: 'UserHeader', path: '/components/user-header', icon: UserCircleIcon },
      { name: 'Profile', path: '/components/user-profile', icon: UserIcon },
    ]
  },
  {
    title: 'Relay',
    items: [
      { name: 'Card', path: '/components/relay-card', icon: ServerStack01Icon },
    ]
  },
  {
    title: 'Lists (NIP-51)',
    items: [
      { name: 'Follow Pack', path: '/components/follow-pack', icon: UserGroupIcon },
    ]
  },
  {
    title: 'Media',
    items: [
      { name: 'Upload', path: '/components/media-upload', icon: CloudUploadIcon },
    ]
  },
];

export const homeNavItem: NavItem = {
  name: 'Home',
  path: '/',
  icon: Home01Icon
};
