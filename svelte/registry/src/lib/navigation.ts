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
  PaintBoardIcon
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
    title: 'Events',
    items: [
      { name: 'EventCard', path: '/components/event-card', icon: Calendar01Icon },
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
  // NIP/Kind-specific components are organized as: [Title] (NIP-XX or Kind:xx) > {Card, Content, ...}
  {
    title: 'Note (Kind:1)',
    items: [
      { name: 'Content', path: '/components/event-content', icon: File01Icon },
    ]
  },
  {
    title: 'Article (NIP-23)',
    items: [
      { name: 'Card', path: '/components/article-card', icon: NewsIcon },
    ]
  },
  {
    title: 'Highlight (NIP-84)',
    items: [
      { name: 'Card', path: '/components/highlight-card', icon: File01Icon },
    ]
  },
];

export const homeNavItem: NavItem = {
  name: 'Home',
  path: '/',
  icon: Home01Icon
};
