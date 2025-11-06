import type { UIPrimitiveMetadata, PrimitiveCardData, AnatomyLayer } from '$lib/templates/types';

// Primitive cards for the article namespace
export const articleRootCard: PrimitiveCardData = {
  name: 'article-root',
  title: 'Article.Root',
  description: 'Context provider for all article primitives. Must wrap other Article components.',
  apiDocs: [
    {
      name: 'Article.Root',
      description: 'Root component that provides context to all child Article primitives. Required wrapper for all other Article components.',
      importPath: "import { Article } from '$lib/registry/ui/article'",
      props: [
        {
          name: 'ndk',
          type: 'NDKSvelte',
          default: 'from context',
          description: 'NDK instance (optional if provided via Svelte context)'
        },
        {
          name: 'article',
          type: 'NDKArticle',
          required: true,
          description: 'The article event to display'
        },
        {
          name: 'onclick',
          type: '(event: MouseEvent) => void',
          description: 'Click handler for the root element'
        },
        {
          name: 'class',
          type: 'string',
          default: "''",
          description: 'Additional CSS classes'
        },
        {
          name: 'children',
          type: 'Snippet',
          required: true,
          description: 'Child components (Article primitives)'
        }
      ]
    }
  ]
};

export const articleImageCard: PrimitiveCardData = {
  name: 'article-image',
  title: 'Article.Image',
  description: "Displays the article's cover image from the `image` tag.",
  apiDocs: [
    {
      name: 'Article.Image',
      description: "Displays the article's cover image from the `image` tag.",
      importPath: "import { Article } from '$lib/registry/ui/article'",
      props: [
        {
          name: 'class',
          type: 'string',
          default: "''",
          description: 'Additional CSS classes'
        },
        {
          name: 'alt',
          type: 'string',
          default: 'article title',
          description: 'Image alt text'
        },
        {
          name: 'fallback',
          type: 'string',
          description: 'Fallback image URL if article has no image'
        }
      ]
    }
  ]
};

export const articleTitleCard: PrimitiveCardData = {
  name: 'article-title',
  title: 'Article.Title',
  description: 'Displays the article title from the `title` tag.',
  apiDocs: [
    {
      name: 'Article.Title',
      description: 'Displays the article title from the `title` tag.',
      importPath: "import { Article } from '$lib/registry/ui/article'",
      props: [
        {
          name: 'class',
          type: 'string',
          default: "''",
          description: 'Additional CSS classes'
        }
      ]
    }
  ]
};

export const articleSummaryCard: PrimitiveCardData = {
  name: 'article-summary',
  title: 'Article.Summary',
  description: 'Displays the article summary from the `summary` tag.',
  apiDocs: [
    {
      name: 'Article.Summary',
      description: 'Displays the article summary from the `summary` tag.',
      importPath: "import { Article } from '$lib/registry/ui/article'",
      props: [
        {
          name: 'class',
          type: 'string',
          default: "''",
          description: 'Additional CSS classes'
        }
      ]
    }
  ]
};

export const articleReadingTimeCard: PrimitiveCardData = {
  name: 'article-reading-time',
  title: 'Article.ReadingTime',
  description: 'Calculates and displays estimated reading time based on article content length.',
  apiDocs: [
    {
      name: 'Article.ReadingTime',
      description: 'Calculates and displays estimated reading time based on article content length.',
      importPath: "import { Article } from '$lib/registry/ui/article'",
      props: [
        {
          name: 'class',
          type: 'string',
          default: "''",
          description: 'Additional CSS classes'
        },
        {
          name: 'wordsPerMinute',
          type: 'number',
          default: '200',
          description: 'Reading speed for calculation'
        }
      ]
    }
  ]
};

// Anatomy layers for the article primitive
export const articleAnatomyLayers: AnatomyLayer[] = [
  {
    id: 'root',
    label: 'Article.Root',
    description: 'Context provider that wraps all article primitives',
    props: ['article', 'ndk', 'onclick', 'class']
  },
  {
    id: 'image',
    label: 'Article.Image',
    description: 'Cover image display component',
    props: ['alt', 'fallback', 'class']
  },
  {
    id: 'title',
    label: 'Article.Title',
    description: 'Article title display',
    props: ['class']
  },
  {
    id: 'summary',
    label: 'Article.Summary',
    description: 'Article summary/description display',
    props: ['class']
  },
  {
    id: 'reading-time',
    label: 'Article.ReadingTime',
    description: 'Reading time estimate',
    props: ['wordsPerMinute', 'class']
  }
];

// All metadata for the article UI primitive page
export const articleMetadata: UIPrimitiveMetadata = {
  title: 'Article',
  description: 'Headless, composable primitives for displaying long-form articles (NIP-23). Complete control over styling and layout.',
  importPath: "import { Article } from '$lib/registry/ui/embedded-event.svelte';",
  nips: ['23'],
  primitives: [
    articleRootCard,
    articleImageCard,
    articleTitleCard,
    articleSummaryCard,
    articleReadingTimeCard
  ],
  anatomyLayers: articleAnatomyLayers
};
