import type { ComponentCardData, ApiDoc } from '$lib/templates/types';

// Card data for input variants
export const searchComboboxCard: ComponentCardData = {
  name: 'user-search-combobox',
  title: 'Search Combobox',
  description: 'Accessible user search with keyboard navigation.',
  richDescription: 'Accessible user search with keyboard navigation using arrow keys, Enter, and Escape. Perfect for forms and user selection interfaces.',
  command: 'npx jsrepo add user-search-combobox',
  apiDocs: [
    {
      name: 'UserSearchCombobox',
      description: 'Pre-composed combobox block with keyboard navigation',
      importPath: "import UserSearchCombobox from '$lib/registry/components/user-search-combobox/user-search-combobox.svelte'",
      props: [
        {
          name: 'ndk',
          type: 'NDKSvelte',
          required: true,
          description: 'NDK instance for Nostr operations'
        },
        {
          name: 'onSelect',
          type: '(user: NDKUser) => void',
          description: 'Callback when user is selected'
        },
        {
          name: 'placeholder',
          type: 'string',
          default: "'Search users...'",
          description: 'Placeholder text for the input'
        },
        {
          name: 'debounceMs',
          type: 'number',
          default: '300',
          description: 'Debounce delay in milliseconds'
        },
        {
          name: 'class',
          type: 'string',
          description: 'Additional CSS classes'
        },
        {
          name: 'input',
          type: 'Snippet',
          description: 'Custom input snippet for custom rendering'
        }
      ]
    }
  ]
};

export const customTextareaCard: ComponentCardData = {
  name: 'custom-textarea',
  title: 'Custom Textarea Input',
  description: 'Use input snippet for custom textarea.',
  richDescription: 'Use the input snippet to provide a custom textarea instead of the default input. Perfect for multi-line search contexts or custom styling.',
  command: 'npx jsrepo add user-search-combobox',
  apiDocs: [
    {
      name: 'UserSearchCombobox',
      description: 'Pre-composed combobox block with keyboard navigation',
      importPath: "import UserSearchCombobox from '$lib/registry/components/user-search-combobox/user-search-combobox.svelte'",
      props: [
        {
          name: 'ndk',
          type: 'NDKSvelte',
          required: true,
          description: 'NDK instance for Nostr operations'
        },
        {
          name: 'onSelect',
          type: '(user: NDKUser) => void',
          description: 'Callback when user is selected'
        },
        {
          name: 'placeholder',
          type: 'string',
          default: "'Search users...'",
          description: 'Placeholder text for the input'
        },
        {
          name: 'debounceMs',
          type: 'number',
          default: '300',
          description: 'Debounce delay in milliseconds'
        },
        {
          name: 'class',
          type: 'string',
          description: 'Additional CSS classes'
        },
        {
          name: 'input',
          type: 'Snippet',
          description: 'Custom input snippet for custom rendering'
        }
      ]
    }
  ]
};

export const composablePartsCard: ComponentCardData = {
  name: 'composable-parts',
  title: 'Basic Usage',
  description: 'Minimal primitives example.',
  richDescription: 'Minimal example with UserInput.Root, Search, Results, and ResultItem primitives.',
  command: 'npx jsrepo add user-input',
  apiDocs: [
    {
      name: 'UserInput.Root',
      description: 'Root component that provides user input context to all child components',
      importPath: "import { UserInput } from '$lib/registry/ui/user-input'",
      props: [
        {
          name: 'ndk',
          type: 'NDKSvelte',
          description: 'NDK instance (optional, falls back to context)'
        },
        {
          name: 'onSelect',
          type: '(user: NDKUser) => void',
          description: 'Callback when user is selected'
        },
        {
          name: 'debounceMs',
          type: 'number',
          default: '300',
          description: 'Debounce delay for NIP-05/npub lookups'
        }
      ]
    }
  ]
};

export const builderBasicCard: ComponentCardData = {
  name: 'builder-basic',
  title: 'Basic Usage',
  description: 'Custom interfaces with builder.',
  richDescription: 'Use the builder to create custom user input interfaces with full control over state and rendering.',
  command: 'npx jsrepo add user-input',
  apiDocs: [
    {
      name: 'createUserInput',
      description: 'Create a reactive user input state and search functionality',
      importPath: "import { createUserInput } from '$lib/registry/builders/user-input'",
      props: [
        {
          name: 'config',
          type: '(ndk: NDKSvelte) => { query: string; onSelect: (user: NDKUser) => void; debounceMs: number; relaySearch: string[] }',
          required: true,
          description: 'Configuration function that returns query, onSelect callback, debounce delay, and relay search list'
        },
        {
          name: 'ndk',
          type: 'NDKSvelte',
          required: true,
          description: 'NDK instance for Nostr operations'
        }
      ]
    }
  ]
};

// API documentation
export const inputApiDocs: ApiDoc[] = [
  {
    name: 'UserInput.Root',
    description: 'Root component that provides user input context to all child components',
    importPath: "import { UserInput } from '$lib/registry/ui/user-input'",
    props: [
      {
        name: 'ndk',
        type: 'NDKSvelte',
        description: 'NDK instance (optional, falls back to context)'
      },
      {
        name: 'onSelect',
        type: '(user: NDKUser) => void',
        description: 'Callback when user is selected'
      },
      {
        name: 'debounceMs',
        type: 'number',
        default: '300',
        description: 'Debounce delay for NIP-05/npub lookups'
      }
    ]
  },
  {
    name: 'UserInput.Search',
    description: 'Search input field with loading indicator',
    importPath: "import { UserInput } from '$lib/registry/ui/user-input'",
    props: [
      {
        name: 'placeholder',
        type: 'string',
        default: "'Search users by name, NIP-05, npub...'",
        description: 'Placeholder text'
      },
      {
        name: 'autofocus',
        type: 'boolean',
        default: 'false',
        description: 'Whether to autofocus the input'
      },
      {
        name: 'class',
        type: 'string',
        default: "''",
        description: 'Additional CSS classes'
      }
    ]
  },
  {
    name: 'UserInput.Results',
    description: 'Container for search results with empty state',
    importPath: "import { UserInput } from '$lib/registry/ui/user-input'",
    props: [
      {
        name: 'maxResults',
        type: 'number',
        description: 'Maximum number of results to show'
      },
      {
        name: 'class',
        type: 'string',
        default: "''",
        description: 'Additional CSS classes'
      }
    ]
  },
  {
    name: 'UserInput.Item',
    description: 'Headless item primitive for user selection with bits-ui pattern support',
    importPath: "import { UserInput } from '$lib/registry/ui/user-input'",
    props: [
      {
        name: 'result',
        type: 'UserInputResult',
        required: true,
        description: 'Result object containing user and metadata'
      },
      {
        name: 'child',
        type: 'Snippet<[{ props: Record<string, any>; result: UserInputResult }]>',
        description: 'Custom rendering with access to merged props (bits-ui pattern)'
      },
      {
        name: 'children',
        type: 'Snippet<[{ result: UserInputResult }]>',
        description: 'Default children rendering'
      },
      {
        name: 'onclick',
        type: '(e: MouseEvent) => void',
        description: 'Custom click handler (merged with selection logic)'
      },
      {
        name: 'class',
        type: 'string',
        default: "''",
        description: 'Additional CSS classes'
      }
    ]
  },
  {
    name: 'UserSearchCombobox',
    description: 'Pre-composed combobox block with keyboard navigation',
    importPath: "import UserSearchCombobox from '$lib/registry/components/user-search-combobox/user-search-combobox.svelte'",
    props: [
      {
        name: 'ndk',
        type: 'NDKSvelte',
        required: true,
        description: 'NDK instance'
      },
      {
        name: 'onSelect',
        type: '(user: NDKUser) => void',
        description: 'Callback when user is selected'
      },
      {
        name: 'placeholder',
        type: 'string',
        default: "'Search users by name, NIP-05, npub...'",
        description: 'Placeholder text for the input'
      },
      {
        name: 'debounceMs',
        type: 'number',
        default: '300',
        description: 'Debounce delay in milliseconds'
      },
      {
        name: 'class',
        type: 'string',
        default: "''",
        description: 'Additional CSS classes'
      }
    ]
  }
];

// All metadata for the input page
export const inputMetadata = {
  title: 'User Input',
  description: 'Search and select Nostr users with autocomplete functionality. Searches cached profiles and supports NIP-05/npub/nprofile lookups.',
  showcaseTitle: 'Blocks',
  showcaseDescription: 'Pre-composed layouts ready to use.',
  cards: [searchComboboxCard, customTextareaCard, composablePartsCard, builderBasicCard],
  apiDocs: inputApiDocs
};
