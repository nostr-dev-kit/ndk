<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import UIPrimitivePageTemplate from '$lib/site/templates/UIPrimitivePageTemplate.svelte';
  import Preview from '$site-components/Demo.svelte';
  import CodeBlock from '$site-components/CodeBlock.svelte';
  import * as ComponentAnatomy from '$site-components/component-anatomy';
  import { Article } from '$lib/registry/ui/article';

  import Basic from './examples/basic-usage/index.svelte';
  import BasicRaw from './examples/basic-usage/index.txt?raw';
  import FullCard from './examples/full-card/index.svelte';
  import FullCardRaw from './examples/full-card/index.txt?raw';

  const ndk = getContext<NDKSvelte>('ndk');

  // Mock article for anatomy visualization
  const mockArticle = {
    title: 'Building Decentralized Social Networks',
    summary: 'An in-depth exploration of how Nostr enables truly decentralized social media without central authorities or single points of failure.',
    image: 'https://via.placeholder.com/800x400',
    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(50),
    published_at: Date.now() / 1000 - 86400, // 1 day ago
    tags: [['t', 'nostr'], ['t', 'decentralization']]
  };

  // Page metadata
  const metadata = {
    title: 'Article',
    description: 'Headless, composable primitives for displaying long-form articles (NIP-23). Render article metadata including title, summary, cover image, and reading time with full styling control.',
    importPath: 'ui/article',
    nips: ['23'],
    primitives: [
      {
        name: 'Article.Root',
        title: 'Article.Root',
        description: 'Context provider that manages article data and provides it to child components. Required wrapper for all Article primitives.',
        apiDocs: [
          { name: 'ndk', type: 'NDKSvelte', default: 'from context', description: 'NDK instance' },
          { name: 'article', type: 'NDKArticle', default: 'required', description: 'Article event instance' },
          { name: 'onclick', type: '(e: MouseEvent) => void', default: 'optional', description: 'Click handler for the root element' },
          { name: 'class', type: 'string', default: "''", description: 'Additional CSS classes' },
          { name: 'children', type: 'Snippet', default: 'required', description: 'Child components' }
        ]
      },
      {
        name: 'Article.Title',
        title: 'Article.Title',
        description: 'Displays the article title from the title tag in the event.',
        apiDocs: [
          { name: 'class', type: 'string', default: "''", description: 'Additional CSS classes' }
        ]
      },
      {
        name: 'Article.Summary',
        title: 'Article.Summary',
        description: 'Displays the article summary/description from the summary tag. Automatically handles missing summaries gracefully.',
        apiDocs: [
          { name: 'class', type: 'string', default: "''", description: 'Additional CSS classes' }
        ]
      },
      {
        name: 'Article.Image',
        title: 'Article.Image',
        description: 'Displays the article cover image from the image tag in the event metadata.',
        apiDocs: [
          { name: 'class', type: 'string', default: "''", description: 'Additional CSS classes' },
          { name: 'fallback', type: 'string', default: 'undefined', description: 'Fallback image URL if cover image is missing' }
        ]
      },
      {
        name: 'Article.ReadingTime',
        title: 'Article.ReadingTime',
        description: 'Calculates and displays estimated reading time based on article word count. Assumes average reading speed of 200 words per minute.',
        apiDocs: [
          { name: 'class', type: 'string', default: "''", description: 'Additional CSS classes' }
        ]
      },
      {
        name: 'Article.PublishedAt',
        title: 'Article.PublishedAt',
        description: 'Displays the article publication date from the published_at tag. Uses createTimeAgo for relative time display.',
        apiDocs: [
          { name: 'format', type: "'relative' | 'absolute'", default: "'relative'", description: 'Display format: relative ("2 days ago") or absolute date' },
          { name: 'class', type: 'string', default: "''", description: 'Additional CSS classes' }
        ]
      }
    ],
    anatomyLayers: [
      {
        id: 'root',
        label: 'Article.Root',
        description: 'Container that provides article context to all child primitives.',
        props: ['ndk', 'article', 'onclick', 'class']
      },
      {
        id: 'image',
        label: 'Article.Image',
        description: 'Cover image from article metadata.',
        props: ['class', 'fallback']
      },
      {
        id: 'title',
        label: 'Article.Title',
        description: 'Article title text.',
        props: ['class']
      },
      {
        id: 'summary',
        label: 'Article.Summary',
        description: 'Article summary/description.',
        props: ['class']
      },
      {
        id: 'reading-time',
        label: 'Article.ReadingTime',
        description: 'Estimated reading time.',
        props: ['class']
      },
      {
        id: 'published-at',
        label: 'Article.PublishedAt',
        description: 'Publication date/time.',
        props: ['format', 'class']
      }
    ]
  };
</script>

<svelte:head>
  <title>Article Primitives - NDK Svelte</title>
  <meta name="description" content="Headless, composable primitives for displaying long-form articles (NIP-23)." />
</svelte:head>

<UIPrimitivePageTemplate {metadata} {ndk}>
  {#snippet topExample()}
    <Preview code={BasicRaw}>
      <Basic />
    </Preview>
  {/snippet}

  {#snippet overview()}
    <section>
      <h2 class="text-2xl font-semibold mb-4">Overview</h2>
      <p class="text-lg leading-relaxed text-muted-foreground mb-8">
        Article primitives provide headless components for displaying long-form articles from Nostr (NIP-23).
        They handle article metadata including title, summary, cover images, and reading time with complete control over styling and layout.
      </p>

      <h3 class="text-xl font-semibold mt-8 mb-4">When You Need These</h3>
      <p class="leading-relaxed mb-4">
        Use Article primitives when you need to:
      </p>
      <ul class="ml-6 mb-4 list-disc space-y-2">
        <li class="leading-relaxed">Display long-form content from Nostr articles (kind:30023)</li>
        <li class="leading-relaxed">Build article preview cards for feeds or listings</li>
        <li class="leading-relaxed">Create custom article layouts with full styling control</li>
        <li class="leading-relaxed">Show article metadata like reading time and publication dates</li>
        <li class="leading-relaxed">Build blog platforms or content aggregators on Nostr</li>
      </ul>
      <p class="leading-relaxed mt-4 text-muted-foreground">
        For rendering the full article content with markdown, see the Article Content component which handles
        markdown parsing and rendering.
      </p>
    </section>
  {/snippet}

  {#snippet anatomyPreview()}
    <Article.Root {ndk} article={mockArticle}>
      <ComponentAnatomy.Layer id="root" label="Article.Root">
        <div class="border border-border rounded-lg overflow-hidden bg-card max-w-2xl">
          <ComponentAnatomy.Layer id="image" label="Article.Image">
            <Article.Image class="w-full h-48 object-cover" />
          </ComponentAnatomy.Layer>
          <div class="p-6 space-y-3">
            <ComponentAnatomy.Layer id="title" label="Article.Title">
              <Article.Title class="text-2xl font-bold" />
            </ComponentAnatomy.Layer>
            <ComponentAnatomy.Layer id="summary" label="Article.Summary">
              <Article.Summary class="text-sm text-muted-foreground line-clamp-2" />
            </ComponentAnatomy.Layer>
            <div class="flex items-center gap-4 text-xs text-muted-foreground">
              <ComponentAnatomy.Layer id="published-at" label="Article.PublishedAt">
                <Article.PublishedAt format="relative" />
              </ComponentAnatomy.Layer>
              <ComponentAnatomy.Layer id="reading-time" label="Article.ReadingTime">
                <Article.ReadingTime />
              </ComponentAnatomy.Layer>
            </div>
          </div>
        </div>
      </ComponentAnatomy.Layer>
    </Article.Root>
  {/snippet}

  {#snippet examples()}
    <div>
      <h3 class="text-xl font-semibold mb-3">Full Article Card</h3>
      <p class="leading-relaxed text-muted-foreground mb-4">
        Compose all primitives together to create a complete article preview card with cover image,
        title, summary, and metadata.
      </p>
      <Preview
        title="Full Article Card"
        description="Complete article preview with all metadata."
        code={FullCardRaw}
      >
        <FullCard />
      </Preview>
    </div>

    <div>
      <h3 class="text-xl font-semibold mb-3">Loading Articles</h3>
      <p class="leading-relaxed text-muted-foreground mb-4">
        Load articles from Nostr using NDK. Articles are kind:30023 replaceable events.
      </p>
      <div class="my-4 bg-muted rounded-lg overflow-hidden">
        <CodeBlock
          lang="typescript"
          code={`import { NDKArticle, NDKKind } from '@nostr-dev-kit/ndk';

// Fetch a specific article
const event = await ndk.fetchEvent({
  kinds: [NDKKind.Article], // 30023
  authors: [authorPubkey],
  '#d': [articleIdentifier]
});

const article = NDKArticle.from(event);

// Subscribe to articles
const sub = ndk.subscribe({
  kinds: [NDKKind.Article]
});

sub.on('event', (event) => {
  const article = NDKArticle.from(event);
  // Use article...
});`}
        />
      </div>
    </div>

    <div>
      <h3 class="text-xl font-semibold mb-3">Publication Date Formats</h3>
      <p class="leading-relaxed text-muted-foreground mb-4">
        Display publication dates in different formats using the format prop.
      </p>
      <div class="my-4 bg-muted rounded-lg overflow-hidden">
        <CodeBlock
          lang="svelte"
          code={`<!-- Relative format: "2 days ago" -->
<Article.PublishedAt format="relative" />

<!-- Absolute format: "January 15, 2024" -->
<Article.PublishedAt format="absolute" />`}
        />
      </div>
    </div>

    <div>
      <h3 class="text-xl font-semibold mb-3">Article Lists</h3>
      <p class="leading-relaxed text-muted-foreground mb-4">
        Common pattern for displaying lists of articles with preview cards.
      </p>
      <div class="my-4 bg-muted rounded-lg overflow-hidden">
        <CodeBlock
          lang="svelte"
          code={`import { Article } from '$lib/registry/ui/article';
import type { NDKArticle } from '@nostr-dev-kit/ndk';

let articles: NDKArticle[] = $state([...]);

{#each articles as article (article.id)}
  <Article.Root {ndk} {article}>
    <div class="article-card">
      <Article.Image class="cover-image" />
      <div class="content">
        <Article.Title class="title" />
        <Article.Summary class="summary" />
        <div class="metadata">
          <Article.PublishedAt format="relative" />
          <Article.ReadingTime />
        </div>
      </div>
    </div>
  </Article.Root>
{/each}`}
        />
      </div>
    </div>

    <div>
      <h3 class="text-xl font-semibold mb-3">With Author Information</h3>
      <p class="leading-relaxed text-muted-foreground mb-4">
        Combine with User primitives to display article author information.
      </p>
      <div class="my-4 bg-muted rounded-lg overflow-hidden">
        <CodeBlock
          lang="svelte"
          code={`import { Article } from '$lib/registry/ui/article';
import { User } from '$lib/registry/ui/user';

<Article.Root {ndk} {article}>
  <div class="article-with-author">
    <Article.Image />
    <Article.Title />
    <Article.Summary />

    <!-- Display author -->
    <User.Root {ndk} user={article.author}>
      <div class="author-info">
        <User.Avatar class="w-8 h-8" />
        <User.Name />
      </div>
    </User.Root>

    <Article.ReadingTime />
  </div>
</Article.Root>`}
        />
      </div>
    </div>
  {/snippet}

  {#snippet contextSection()}
    <section>
      <h2 class="text-2xl font-semibold mb-4">Article Structure (NIP-23)</h2>
      <p class="leading-relaxed text-muted-foreground mb-4">
        Articles are kind:30023 replaceable events with metadata in tags:
      </p>
      <div class="my-4 bg-muted rounded-lg overflow-hidden">
        <CodeBlock
          lang="json"
          code={`{
  "kind": 30023,
  "tags": [
    ["d", "<article-identifier>"],
    ["title", "Article Title"],
    ["summary", "Brief article description"],
    ["image", "https://example.com/cover.jpg"],
    ["published_at", "1704067200"],
    ["t", "nostr"],
    ["t", "decentralization"]
  ],
  "content": "# Article Title\\n\\nMarkdown content here..."
}`}
        />
      </div>

      <h3 class="text-xl font-semibold mt-8 mb-4">Context Access</h3>
      <p class="leading-relaxed text-muted-foreground mb-4">
        Access article context in custom components:
      </p>
      <div class="my-4 bg-muted rounded-lg overflow-hidden">
        <CodeBlock
          lang="typescript"
          code={`import { getContext } from 'svelte';
import { type ArticleContext, ARTICLE_CONTEXT_KEY } from '$lib/registry/ui/article';

const context = getContext<ArticleContext>(ARTICLE_CONTEXT_KEY);

// Available properties:
context.ndk      // NDKSvelte instance
context.article  // NDKArticle instance
context.onclick  // Click handler`}
        />
      </div>
    </section>
  {/snippet}

  {#snippet relatedComponents()}
    <section>
      <h2 class="text-2xl font-semibold mb-4">Related</h2>
      <div class="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
        <a href="/components/cards/article" class="flex flex-col gap-1 p-4 border border-border rounded-lg no-underline transition-all hover:border-primary hover:-translate-y-0.5">
          <strong class="font-semibold text-foreground">Article Cards</strong>
          <span class="text-sm text-muted-foreground">Pre-styled article card layouts</span>
        </a>
        <a href="/ui/user" class="flex flex-col gap-1 p-4 border border-border rounded-lg no-underline transition-all hover:border-primary hover:-translate-y-0.5">
          <strong class="font-semibold text-foreground">User Primitives</strong>
          <span class="text-sm text-muted-foreground">For displaying article authors</span>
        </a>
        <a href="/components/content/article" class="flex flex-col gap-1 p-4 border border-border rounded-lg no-underline transition-all hover:border-primary hover:-translate-y-0.5">
          <strong class="font-semibold text-foreground">Article Content</strong>
          <span class="text-sm text-muted-foreground">Render article content with markdown</span>
        </a>
      </div>
    </section>
  {/snippet}
</UIPrimitivePageTemplate>
