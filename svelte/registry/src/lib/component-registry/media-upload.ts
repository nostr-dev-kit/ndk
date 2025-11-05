import type { ComponentCardData, ApiDoc } from '$lib/templates/types';

// Card data for media upload variants
export const uploadButtonCard: ComponentCardData = {
  name: 'upload-button',
  title: 'Upload Button',
  description: 'Simple file uploads without previews.',
  richDescription: 'Use for simple file uploads without showing previews. Perfect for forms where uploaded files are managed elsewhere.',
  command: 'npx jsrepo add upload-button',
  apiDocs: [
    {
      name: 'UploadButton',
      description: 'Simple upload button block without preview UI',
      importPath: "import { UploadButton } from '$lib/registry/blocks'",
      props: [
        { name: 'ndk', type: 'NDKSvelte', description: 'NDK instance (optional if provided via context)' },
        { name: 'uploads', type: 'MediaUploadResult[]', required: true, description: 'Bindable array of uploaded files' },
        { name: 'fallbackServer', type: 'string', default: 'https://blossom.primal.net', description: 'Blossom server for uploads' },
        { name: 'accept', type: 'string', default: '*/*', description: 'Accepted file types' },
        { name: 'buttonText', type: 'string', default: 'Upload Files', description: 'Button text' },
        { name: 'multiple', type: 'boolean', default: 'true', description: 'Allow multiple files' },
        { name: 'maxFiles', type: 'number', description: 'Maximum files allowed' }
      ]
    }
  ]
};

export const mediaUploadCarouselCard: ComponentCardData = {
  name: 'media-upload-carousel',
  title: 'Media Upload Carousel',
  description: 'Upload with visual previews.',
  richDescription: 'Use for uploading and managing multiple media files with visual previews. Shows a + button that expands into a carousel as files are uploaded.',
  command: 'npx jsrepo add media-upload-carousel',
  apiDocs: [
    {
      name: 'MediaUploadCarousel',
      description: 'Carousel block with + button, previews, and drag-to-reorder',
      importPath: "import { MediaUploadCarousel } from '$lib/registry/blocks'",
      props: [
        { name: 'ndk', type: 'NDKSvelte', description: 'NDK instance (optional if provided via context)' },
        { name: 'uploads', type: 'MediaUploadResult[]', required: true, description: 'Bindable array of uploaded files' },
        { name: 'fallbackServer', type: 'string', default: 'https://blossom.primal.net', description: 'Blossom server for uploads' },
        { name: 'accept', type: 'string', default: '*/*', description: 'Accepted file types' },
        { name: 'maxFiles', type: 'number', description: 'Maximum files allowed' },
        { name: 'showProgress', type: 'boolean', default: 'true', description: 'Show upload progress' }
      ]
    }
  ]
};

export const basicUICard: ComponentCardData = {
  name: 'media-upload-basic',
  title: 'Basic Usage',
  description: 'Minimal upload primitives.',
  richDescription: 'Minimal example with MediaUpload.Root, Button, and Preview components.',
  command: 'npx jsrepo add media-upload',
  apiDocs: [
    {
      name: 'MediaUpload.Root',
      description: 'Root component that initializes the upload context and manages upload state',
      importPath: "import { MediaUpload } from '$lib/registry/ui/media-upload'",
      props: [
        { name: 'ndk', type: 'NDKSvelte', description: 'NDK instance (optional if available in context)' },
        { name: 'fallbackServer', type: 'string', default: 'https://blossom.primal.net', description: 'Blossom server to use for uploads' },
        { name: 'accept', type: 'string', description: 'Accepted file types (MIME types or extensions)' },
        { name: 'maxFiles', type: 'number', description: 'Maximum number of files allowed' },
        { name: 'uploads', type: 'MediaUploadResult[]', required: true, description: 'Bindable array of uploaded files' }
      ]
    },
    {
      name: 'MediaUpload.Button',
      description: 'File picker button that triggers the upload flow',
      importPath: "import { MediaUpload } from '$lib/registry/ui/media-upload'",
      props: [
        { name: 'multiple', type: 'boolean', default: 'true', description: 'Allow multiple file selection' },
        { name: 'accept', type: 'string', default: '*/*', description: 'Accepted file types' },
        { name: 'disabled', type: 'boolean', default: 'false', description: 'Disable the button' }
      ]
    },
    {
      name: 'MediaUpload.Preview',
      description: 'Displays preview of uploaded media with appropriate rendering',
      importPath: "import { MediaUpload } from '$lib/registry/ui/media-upload'",
      props: [
        { name: 'upload', type: 'MediaUploadResult', required: true, description: 'Upload result object to preview' },
        { name: 'showProgress', type: 'boolean', default: 'true', description: 'Show upload progress indicator' },
        { name: 'showError', type: 'boolean', default: 'true', description: 'Show error states' }
      ]
    }
  ]
};

export const fullUICard: ComponentCardData = {
  name: 'media-upload-full',
  title: 'Full Composition',
  description: 'All primitives together.',
  richDescription: 'All available primitives composed together with carousel, drag-to-reorder, and remove capabilities.',
  command: 'npx jsrepo add media-upload',
  apiDocs: [
    {
      name: 'MediaUpload.Carousel',
      description: 'Container for displaying multiple media items in a scrollable layout',
      importPath: "import { MediaUpload } from '$lib/registry/ui/media-upload'",
      props: [
        { name: 'itemClass', type: 'string', description: 'CSS classes to apply to carousel items' }
      ]
    },
    {
      name: 'MediaUpload.Item',
      description: 'Individual carousel item with drag-to-reorder and remove capabilities',
      importPath: "import { MediaUpload } from '$lib/registry/ui/media-upload'",
      props: [
        { name: 'upload', type: 'MediaUploadResult', required: true, description: 'Upload result object' },
        { name: 'index', type: 'number', required: true, description: 'Item index in the carousel' },
        { name: 'onRemove', type: '(index: number) => void', description: 'Callback when remove button is clicked' },
        { name: 'onReorder', type: '(fromIndex: number, toIndex: number) => void', description: 'Callback when item is dragged to reorder' }
      ]
    }
  ]
};

// API documentation
export const mediaUploadApiDocs: ApiDoc[] = [
  {
    name: 'MediaUpload.Root',
    description: 'Root component that initializes the upload context and manages upload state.',
    importPath: "import { MediaUpload } from '$lib/registry/ui/media-upload'",
    props: [
      {
        name: 'ndk',
        type: 'NDKSvelte',
        description: 'NDK instance (optional if available in context)'
      },
      {
        name: 'fallbackServer',
        type: 'string',
        default: 'https://blossom.primal.net',
        description: 'Blossom server to use for uploads'
      },
      {
        name: 'accept',
        type: 'string',
        description: 'Accepted file types (MIME types or extensions)'
      },
      {
        name: 'maxFiles',
        type: 'number',
        description: 'Maximum number of files allowed'
      },
      {
        name: 'uploads',
        type: 'MediaUploadResult[]',
        required: true,
        description: 'Bindable array of uploaded files'
      }
    ]
  },
  {
    name: 'MediaUpload.Button',
    description: 'File picker button that triggers the upload flow.',
    importPath: "import { MediaUpload } from '$lib/registry/ui/media-upload'",
    props: [
      {
        name: 'multiple',
        type: 'boolean',
        default: 'true',
        description: 'Allow multiple file selection'
      },
      {
        name: 'accept',
        type: 'string',
        default: '*/*',
        description: 'Accepted file types'
      },
      {
        name: 'disabled',
        type: 'boolean',
        default: 'false',
        description: 'Disable the button'
      }
    ]
  },
  {
    name: 'MediaUpload.Preview',
    description: 'Displays preview of uploaded media with appropriate rendering for images, videos, and audio.',
    importPath: "import { MediaUpload } from '$lib/registry/ui/media-upload'",
    props: [
      {
        name: 'upload',
        type: 'MediaUploadResult',
        required: true,
        description: 'Upload result object to preview'
      },
      {
        name: 'showProgress',
        type: 'boolean',
        default: 'true',
        description: 'Show upload progress indicator'
      },
      {
        name: 'showError',
        type: 'boolean',
        default: 'true',
        description: 'Show error states'
      }
    ]
  },
  {
    name: 'MediaUpload.Carousel',
    description: 'Container for displaying multiple media items in a scrollable layout.',
    importPath: "import { MediaUpload } from '$lib/registry/ui/media-upload'",
    props: [
      {
        name: 'itemClass',
        type: 'string',
        description: 'CSS classes to apply to carousel items'
      }
    ]
  },
  {
    name: 'MediaUpload.Item',
    description: 'Individual carousel item with drag-to-reorder and remove capabilities.',
    importPath: "import { MediaUpload } from '$lib/registry/ui/media-upload'",
    props: [
      {
        name: 'upload',
        type: 'MediaUploadResult',
        required: true,
        description: 'Upload result object'
      },
      {
        name: 'index',
        type: 'number',
        required: true,
        description: 'Item index in the carousel'
      },
      {
        name: 'onRemove',
        type: '(index: number) => void',
        description: 'Callback when remove button is clicked'
      },
      {
        name: 'onReorder',
        type: '(fromIndex: number, toIndex: number) => void',
        description: 'Callback when item is dragged to reorder'
      }
    ]
  },
  {
    name: 'UploadButton',
    description: 'Simple upload button block without preview UI.',
    importPath: "import { UploadButton } from '$lib/registry/blocks'",
    props: [
      {
        name: 'ndk',
        type: 'NDKSvelte',
        description: 'NDK instance (optional if provided via context)'
      },
      {
        name: 'uploads',
        type: 'MediaUploadResult[]',
        required: true,
        description: 'Bindable array of uploaded files'
      },
      {
        name: 'fallbackServer',
        type: 'string',
        default: 'https://blossom.primal.net',
        description: 'Blossom server for uploads'
      },
      {
        name: 'accept',
        type: 'string',
        default: '*/*',
        description: 'Accepted file types'
      },
      {
        name: 'buttonText',
        type: 'string',
        default: 'Upload Files',
        description: 'Button text'
      },
      {
        name: 'multiple',
        type: 'boolean',
        default: 'true',
        description: 'Allow multiple files'
      },
      {
        name: 'maxFiles',
        type: 'number',
        description: 'Maximum files allowed'
      }
    ]
  },
  {
    name: 'MediaUploadCarousel',
    description: 'Carousel block with + button, previews, and drag-to-reorder.',
    importPath: "import { MediaUploadCarousel } from '$lib/registry/blocks'",
    props: [
      {
        name: 'ndk',
        type: 'NDKSvelte',
        description: 'NDK instance (optional if provided via context)'
      },
      {
        name: 'uploads',
        type: 'MediaUploadResult[]',
        required: true,
        description: 'Bindable array of uploaded files'
      },
      {
        name: 'fallbackServer',
        type: 'string',
        default: 'https://blossom.primal.net',
        description: 'Blossom server for uploads'
      },
      {
        name: 'accept',
        type: 'string',
        default: '*/*',
        description: 'Accepted file types'
      },
      {
        name: 'maxFiles',
        type: 'number',
        description: 'Maximum files allowed'
      },
      {
        name: 'showProgress',
        type: 'boolean',
        default: 'true',
        description: 'Show upload progress'
      }
    ]
  }
];

// All metadata for the media upload page
export const mediaUploadMetadata = {
  title: 'Media Upload',
  description: 'Upload media files to Blossom servers. Support for images, videos, audio, and other file types with progress tracking, drag-to-reorder, and remove capabilities.',
  showcaseTitle: 'Blocks',
  showcaseDescription: 'Pre-composed upload components ready to use.',
  cards: [uploadButtonCard, mediaUploadCarouselCard, basicUICard, fullUICard],
  apiDocs: mediaUploadApiDocs
};
