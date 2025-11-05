import type { ComponentCardData, ApiDoc } from '$lib/templates/types';

// Card data for relay input block variants
export const relayInputBasicBlockCard: ComponentCardData = {
  name: 'relay-input-basic',
  title: 'Basic Input Block',
  description: 'Simple relay input with NIP-11.',
  richDescription: 'Pre-configured relay input block with NIP-11 autocomplete ready for use.',
  command: 'npx jsrepo add relay-input',
  apiDocs: [
    {
      name: 'RelayInputBlock',
      description: 'Opinionated relay input with label and helper text',
      importPath: "import RelayInputBlock from '$lib/registry/components/relay-input/relay-input.svelte'",
      props: [
        {
          name: 'ndk',
          type: 'NDKSvelte',
          description: 'NDK instance (optional)'
        },
        {
          name: 'value',
          type: 'string',
          description: 'Relay URL value (two-way binding)'
        },
        {
          name: 'placeholder',
          type: 'string',
          default: "'relay.example.com'",
          description: 'Placeholder text'
        },
        {
          name: 'showRelayInfo',
          type: 'boolean',
          default: 'true',
          description: 'Show relay info on the right side'
        },
        {
          name: 'disabled',
          type: 'boolean',
          default: 'false',
          description: 'Disable the input'
        },
        {
          name: 'label',
          type: 'string',
          description: 'Label for the input'
        },
        {
          name: 'helperText',
          type: 'string',
          description: 'Helper text below the input'
        },
        {
          name: 'error',
          type: 'string',
          description: 'Error message to display'
        },
        {
          name: 'class',
          type: 'string',
          description: 'Additional CSS classes'
        }
      ]
    }
  ]
};

export const relayInputLabelBlockCard: ComponentCardData = {
  name: 'relay-input-label',
  title: 'With Label and Helper',
  description: 'Input with label and helper text.',
  richDescription: 'Relay input block with label and helper text for better UX.',
  command: 'npx jsrepo add relay-input',
  apiDocs: [
    {
      name: 'RelayInputBlock',
      description: 'Opinionated relay input with label and helper text',
      importPath: "import RelayInputBlock from '$lib/registry/components/relay-input/relay-input.svelte'",
      props: [
        {
          name: 'ndk',
          type: 'NDKSvelte',
          description: 'NDK instance (optional)'
        },
        {
          name: 'value',
          type: 'string',
          description: 'Relay URL value (two-way binding)'
        },
        {
          name: 'placeholder',
          type: 'string',
          default: "'relay.example.com'",
          description: 'Placeholder text'
        },
        {
          name: 'showRelayInfo',
          type: 'boolean',
          default: 'true',
          description: 'Show relay info on the right side'
        },
        {
          name: 'disabled',
          type: 'boolean',
          default: 'false',
          description: 'Disable the input'
        },
        {
          name: 'label',
          type: 'string',
          description: 'Label for the input'
        },
        {
          name: 'helperText',
          type: 'string',
          description: 'Helper text below the input'
        },
        {
          name: 'error',
          type: 'string',
          description: 'Error message to display'
        },
        {
          name: 'class',
          type: 'string',
          description: 'Additional CSS classes'
        }
      ]
    }
  ]
};

export const relayInputErrorBlockCard: ComponentCardData = {
  name: 'relay-input-error',
  title: 'With Validation Error',
  description: 'Input showing validation error.',
  richDescription: 'Relay input block displaying validation error state.',
  command: 'npx jsrepo add relay-input',
  apiDocs: [
    {
      name: 'RelayInputBlock',
      description: 'Opinionated relay input with label and helper text',
      importPath: "import RelayInputBlock from '$lib/registry/components/relay-input/relay-input.svelte'",
      props: [
        {
          name: 'ndk',
          type: 'NDKSvelte',
          description: 'NDK instance (optional)'
        },
        {
          name: 'value',
          type: 'string',
          description: 'Relay URL value (two-way binding)'
        },
        {
          name: 'placeholder',
          type: 'string',
          default: "'relay.example.com'",
          description: 'Placeholder text'
        },
        {
          name: 'showRelayInfo',
          type: 'boolean',
          default: 'true',
          description: 'Show relay info on the right side'
        },
        {
          name: 'disabled',
          type: 'boolean',
          default: 'false',
          description: 'Disable the input'
        },
        {
          name: 'label',
          type: 'string',
          description: 'Label for the input'
        },
        {
          name: 'helperText',
          type: 'string',
          description: 'Helper text below the input'
        },
        {
          name: 'error',
          type: 'string',
          description: 'Error message to display'
        },
        {
          name: 'class',
          type: 'string',
          description: 'Additional CSS classes'
        }
      ]
    }
  ]
};

export const relayInputDisabledBlockCard: ComponentCardData = {
  name: 'relay-input-disabled',
  title: 'Disabled Input',
  description: 'Disabled relay input state.',
  richDescription: 'Relay input block in disabled state for read-only scenarios.',
  command: 'npx jsrepo add relay-input',
  apiDocs: [
    {
      name: 'RelayInputBlock',
      description: 'Opinionated relay input with label and helper text',
      importPath: "import RelayInputBlock from '$lib/registry/components/relay-input/relay-input.svelte'",
      props: [
        {
          name: 'ndk',
          type: 'NDKSvelte',
          description: 'NDK instance (optional)'
        },
        {
          name: 'value',
          type: 'string',
          description: 'Relay URL value (two-way binding)'
        },
        {
          name: 'placeholder',
          type: 'string',
          default: "'relay.example.com'",
          description: 'Placeholder text'
        },
        {
          name: 'showRelayInfo',
          type: 'boolean',
          default: 'true',
          description: 'Show relay info on the right side'
        },
        {
          name: 'disabled',
          type: 'boolean',
          default: 'false',
          description: 'Disable the input'
        },
        {
          name: 'label',
          type: 'string',
          description: 'Label for the input'
        },
        {
          name: 'helperText',
          type: 'string',
          description: 'Helper text below the input'
        },
        {
          name: 'error',
          type: 'string',
          description: 'Error message to display'
        },
        {
          name: 'class',
          type: 'string',
          description: 'Additional CSS classes'
        }
      ]
    }
  ]
};

// Card data for component usage
export const relayInputBasicCard: ComponentCardData = {
  name: 'relay-input-component-basic',
  title: 'Basic Component',
  description: 'Basic relay input component.',
  richDescription: 'Use individual components to build custom relay input experiences.',
  command: 'npx jsrepo add relay-input',
  apiDocs: [
    {
      name: 'Relay.Input',
      description: 'Input field for relay URLs with NIP-11 autocomplete',
      importPath: "import { Relay } from '$lib/registry/ui/relay'",
      props: [
        {
          name: 'ndk',
          type: 'NDKSvelte',
          description: 'NDK instance (optional, falls back to context)'
        },
        {
          name: 'value',
          type: 'string',
          description: 'Relay URL value (two-way binding)'
        },
        {
          name: 'placeholder',
          type: 'string',
          description: 'Placeholder text'
        },
        {
          name: 'iconSize',
          type: 'number',
          default: '24',
          description: 'Icon size in pixels'
        },
        {
          name: 'showRelayInfo',
          type: 'boolean',
          default: 'true',
          description: 'Show relay info on the right side'
        },
        {
          name: 'debounceMs',
          type: 'number',
          default: '1500',
          description: 'Debounce delay in milliseconds'
        },
        {
          name: '...rest',
          type: 'HTMLInputAttributes',
          description: 'All standard input attributes (disabled, etc.)'
        }
      ]
    }
  ]
};

export const relayInputWithLabelCard: ComponentCardData = {
  name: 'relay-input-component-label',
  title: 'With Label',
  description: 'Component with label.',
  richDescription: 'Relay input component with custom label implementation.',
  command: 'npx jsrepo add relay-input',
  apiDocs: [
    {
      name: 'Relay.Input',
      description: 'Input field for relay URLs with NIP-11 autocomplete',
      importPath: "import { Relay } from '$lib/registry/ui/relay'",
      props: [
        {
          name: 'ndk',
          type: 'NDKSvelte',
          description: 'NDK instance (optional, falls back to context)'
        },
        {
          name: 'value',
          type: 'string',
          description: 'Relay URL value (two-way binding)'
        },
        {
          name: 'placeholder',
          type: 'string',
          description: 'Placeholder text'
        },
        {
          name: 'iconSize',
          type: 'number',
          default: '24',
          description: 'Icon size in pixels'
        },
        {
          name: 'showRelayInfo',
          type: 'boolean',
          default: 'true',
          description: 'Show relay info on the right side'
        },
        {
          name: 'debounceMs',
          type: 'number',
          default: '1500',
          description: 'Debounce delay in milliseconds'
        },
        {
          name: '...rest',
          type: 'HTMLInputAttributes',
          description: 'All standard input attributes (disabled, etc.)'
        }
      ]
    }
  ]
};

export const relayInputValidationCard: ComponentCardData = {
  name: 'relay-input-component-validation',
  title: 'With Validation',
  description: 'Component with validation.',
  richDescription: 'Relay input component with custom validation logic.',
  command: 'npx jsrepo add relay-input',
  apiDocs: [
    {
      name: 'Relay.Input',
      description: 'Input field for relay URLs with NIP-11 autocomplete',
      importPath: "import { Relay } from '$lib/registry/ui/relay'",
      props: [
        {
          name: 'ndk',
          type: 'NDKSvelte',
          description: 'NDK instance (optional, falls back to context)'
        },
        {
          name: 'value',
          type: 'string',
          description: 'Relay URL value (two-way binding)'
        },
        {
          name: 'placeholder',
          type: 'string',
          description: 'Placeholder text'
        },
        {
          name: 'iconSize',
          type: 'number',
          default: '24',
          description: 'Icon size in pixels'
        },
        {
          name: 'showRelayInfo',
          type: 'boolean',
          default: 'true',
          description: 'Show relay info on the right side'
        },
        {
          name: 'debounceMs',
          type: 'number',
          default: '1500',
          description: 'Debounce delay in milliseconds'
        },
        {
          name: '...rest',
          type: 'HTMLInputAttributes',
          description: 'All standard input attributes (disabled, etc.)'
        }
      ]
    }
  ]
};

export const relayInputDisabledComponentCard: ComponentCardData = {
  name: 'relay-input-component-disabled',
  title: 'Disabled State',
  description: 'Disabled component state.',
  richDescription: 'Relay input component in disabled state.',
  command: 'npx jsrepo add relay-input',
  apiDocs: [
    {
      name: 'Relay.Input',
      description: 'Input field for relay URLs with NIP-11 autocomplete',
      importPath: "import { Relay } from '$lib/registry/ui/relay'",
      props: [
        {
          name: 'ndk',
          type: 'NDKSvelte',
          description: 'NDK instance (optional, falls back to context)'
        },
        {
          name: 'value',
          type: 'string',
          description: 'Relay URL value (two-way binding)'
        },
        {
          name: 'placeholder',
          type: 'string',
          description: 'Placeholder text'
        },
        {
          name: 'iconSize',
          type: 'number',
          default: '24',
          description: 'Icon size in pixels'
        },
        {
          name: 'showRelayInfo',
          type: 'boolean',
          default: 'true',
          description: 'Show relay info on the right side'
        },
        {
          name: 'debounceMs',
          type: 'number',
          default: '1500',
          description: 'Debounce delay in milliseconds'
        },
        {
          name: '...rest',
          type: 'HTMLInputAttributes',
          description: 'All standard input attributes (disabled, etc.)'
        }
      ]
    }
  ]
};

// API documentation
export const relayInputApiDocs: ApiDoc[] = [
  {
    name: 'Relay.Input',
    description: 'Input field for relay URLs with NIP-11 autocomplete',
    importPath: "import { Relay } from '$lib/registry/ui/relay'",
    props: [
      {
        name: 'ndk',
        type: 'NDKSvelte',
        description: 'NDK instance (optional, falls back to context)'
      },
      {
        name: 'value',
        type: 'string',
        description: 'Relay URL value (two-way binding)'
      },
      {
        name: 'placeholder',
        type: 'string',
        default: 'wss://relay.example.com',
        description: 'Placeholder text'
      },
      {
        name: 'iconSize',
        type: 'number',
        default: '24',
        description: 'Icon size in pixels'
      },
      {
        name: 'showRelayInfo',
        type: 'boolean',
        default: 'true',
        description: 'Show relay info on the right side'
      },
      {
        name: 'debounceMs',
        type: 'number',
        default: '300',
        description: 'Debounce delay in milliseconds'
      },
      {
        name: 'disabled',
        type: 'boolean',
        default: 'false',
        description: 'Disable the input'
      },
      {
        name: 'class',
        type: 'string',
        description: 'Additional CSS classes'
      }
    ]
  },
  {
    name: 'RelayInputBlock',
    description: 'Opinionated relay input with label and helper text',
    importPath: "import RelayInputBlock from '$lib/registry/components/relay-input/relay-input.svelte'",
    props: [
      {
        name: 'ndk',
        type: 'NDKSvelte',
        description: 'NDK instance (optional)'
      },
      {
        name: 'value',
        type: 'string',
        description: 'Relay URL value (two-way binding)'
      },
      {
        name: 'label',
        type: 'string',
        description: 'Label for the input'
      },
      {
        name: 'helperText',
        type: 'string',
        description: 'Helper text below the input'
      },
      {
        name: 'error',
        type: 'string',
        description: 'Error message to display'
      },
      {
        name: 'disabled',
        type: 'boolean',
        default: 'false',
        description: 'Disable the input'
      },
      {
        name: 'showRelayInfo',
        type: 'boolean',
        default: 'true',
        description: 'Show relay info'
      },
      {
        name: 'placeholder',
        type: 'string',
        description: 'Placeholder text'
      },
      {
        name: 'class',
        type: 'string',
        description: 'Additional CSS classes'
      }
    ]
  }
];

// All metadata for the relay input page
export const relayInputMetadata = {
  title: 'Relay Input',
  description: 'Input field for Nostr relay URLs with NIP-11 autocomplete and relay information display.',
  showcaseTitle: 'Block Presets',
  showcaseDescription: 'Pre-configured relay input blocks ready for use.',
  cards: [
    relayInputBasicBlockCard,
    relayInputLabelBlockCard,
    relayInputErrorBlockCard,
    relayInputDisabledBlockCard,
    relayInputBasicCard,
    relayInputWithLabelCard,
    relayInputValidationCard,
    relayInputDisabledComponentCard
  ],
  apiDocs: relayInputApiDocs
};
