import type { ComponentCardData, ApiDoc } from '$lib/templates/types';

// Card data for emoji picker variants
export const emojiPickerListCard: ComponentCardData = {
  name: 'emoji-picker-list',
  title: 'EmojiPicker.List',
  description: 'Basic emoji list primitive',
  richDescription: 'A primitive component that renders a grid of clickable emojis. Perfect for custom layouts when you need full control over the emoji picker behavior.',
  command: 'npx shadcn@latest add emoji-picker',
  apiDocs: []
};

export const emojiPickerContentCard: ComponentCardData = {
  name: 'emoji-picker-content',
  title: 'EmojiPicker.Content',
  description: 'Complete emoji picker with builder integration',
  richDescription: 'An opinionated component that integrates with the createEmojiPicker builder to show user\'s custom emojis and defaults in organized sections.',
  command: 'npx shadcn@latest add emoji-picker',
  apiDocs: []
};

export const emojiPickerPopoverCard: ComponentCardData = {
  name: 'emoji-picker-popover',
  title: 'EmojiPicker in Popover',
  description: 'Emoji picker in a dropdown popover',
  richDescription: 'Use EmojiPicker.Content with bits-ui Popover for a dropdown picker. This is how ReactionAction uses it internally.',
  command: 'npx shadcn@latest add emoji-picker',
  apiDocs: []
};

export const emojiPickerAutocompleteCard: ComponentCardData = {
  name: 'emoji-picker-autocomplete',
  title: 'Textarea Autocomplete',
  description: 'Emoji autocomplete in textarea',
  richDescription: 'Type : followed by text to autocomplete with your custom emojis. Supports keyboard navigation (arrows, tab/enter to select, escape to close).',
  command: 'npx shadcn@latest add emoji-picker',
  apiDocs: []
};

// API documentation
export const emojiPickerApiDocs: ApiDoc[] = [
  {
    name: 'createEmojiPicker',
    description: 'Builder function for aggregating emojis from multiple sources with smart ordering. Returns EmojiPickerState with emojis (EmojiData[] - ordered emojis: user saved, aggregated from pubkeys, then defaults).',
    importPath: "import { createEmojiPicker } from '@nostr-dev-kit/svelte'",
    props: [
      {
        name: 'config',
        type: '() => EmojiPickerConfig',
        required: true,
        description: 'Reactive function returning configuration'
      },
      {
        name: 'ndk',
        type: 'NDKSvelte',
        required: true,
        description: 'NDK instance'
      }
    ]
  },
  {
    name: 'EmojiPicker.List',
    description: 'Primitive component for rendering a grid of clickable emojis.',
    importPath: "import { EmojiPicker } from '$lib/registry/ui/emoji-picker'",
    props: [
      {
        name: 'emojis',
        type: 'EmojiData[]',
        required: true,
        description: 'Array of emojis to display'
      },
      {
        name: 'onSelect',
        type: '(emoji: EmojiData) => void',
        required: true,
        description: 'Callback when emoji is clicked'
      },
      {
        name: 'columns',
        type: 'number',
        default: '6',
        description: 'Number of columns in grid'
      },
      {
        name: 'class',
        type: 'string',
        description: 'Additional CSS classes'
      }
    ]
  },
  {
    name: 'EmojiPicker.Content',
    description: 'Complete emoji picker with builder integration and organized sections.',
    importPath: "import { EmojiPicker } from '$lib/registry/ui/emoji-picker'",
    props: [
      {
        name: 'ndk',
        type: 'NDKSvelte',
        description: 'NDK instance (optional, falls back to context)'
      },
      {
        name: 'onSelect',
        type: '(emoji: EmojiData) => void',
        required: true,
        description: 'Callback when emoji is selected'
      },
      {
        name: 'defaults',
        type: 'EmojiData[]',
        description: 'Default emojis to show'
      },
      {
        name: 'columns',
        type: 'number',
        default: '6 (5 on mobile)',
        description: 'Number of columns in grid'
      },
      {
        name: 'class',
        type: 'string',
        description: 'Additional CSS classes'
      }
    ]
  }
];

// All metadata for the emoji picker page
export const emojiPickerMetadata = {
  title: 'EmojiPicker',
  description: 'Flexible emoji selection components with support for user\'s custom emojis from Nostr (NIP-51 kind:10030) and aggregated emojis from specified pubkeys.',
  showcaseTitle: 'Showcase',
  showcaseDescription: 'Emoji picker variants from basic primitives to autocomplete.',
  cards: [
    emojiPickerListCard,
    emojiPickerContentCard,
    emojiPickerPopoverCard,
    emojiPickerAutocompleteCard
  ],
  apiDocs: emojiPickerApiDocs
};
