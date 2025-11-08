<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import UIPrimitivePageTemplate from '$lib/site/templates/UIPrimitivePageTemplate.svelte';
  import Preview from '$site-components/preview.svelte';
  import CodeBlock from '$site-components/CodeBlock.svelte';
  import * as ComponentAnatomy from '$site-components/component-anatomy';
  import EventContent from '$lib/registry/ui/event-content.svelte';
  import EmbeddedEvent from '$lib/registry/ui/embedded-event.svelte';

  import Basic from './examples/basic-usage/index.svelte';
  import BasicRaw from './examples/basic-usage/index.txt?raw';
  import CustomRenderer from './examples/custom-renderer/index.svelte';
  import CustomRendererRaw from './examples/custom-renderer/index.txt?raw';
  import CustomRendererCarousel from './examples/custom-renderer-carousel/index.svelte';
  import CustomRendererCarouselRaw from './examples/custom-renderer-carousel/index.txt?raw';
  import CustomRendererBento from './examples/custom-renderer-bento/index.svelte';
  import CustomRendererBentoRaw from './examples/custom-renderer-bento/index.txt?raw';
  import CustomRendererLinkPreview from './examples/custom-renderer-link-preview/index.svelte';
  import CustomRendererLinkPreviewRaw from './examples/custom-renderer-link-preview/index.txt?raw';
  import CustomRendererLinkEmbed from './examples/custom-renderer-link-embed/index.svelte';
  import CustomRendererLinkEmbedRaw from './examples/custom-renderer-link-embed/index.txt?raw';
  import Variants from './examples/variants/index.svelte';
  import VariantsRaw from './examples/variants/index.txt?raw';

  const ndk = getContext<NDKSvelte>('ndk');

  // Mock event for anatomy visualization
  const mockEvent = {
    content: 'Check out nostr:npub1... and #nostr https://example.com/image.jpg',
    tags: [['emoji', 'party', 'https://example.com/party.gif']],
    kind: 1
  };

  // Page metadata
  const metadata = {
    title: 'Event Rendering',
    description: 'Complete event rendering system combining content parsing, embedded event loading, and markdown support. Parse and display Nostr event content with automatic detection of mentions, hashtags, links, media, custom emojis (NIP-30), and embedded events. Fully customizable with pluggable renderers.',
    importPath: 'ui/event-rendering',
    nips: ['30'],
    primitives: [
      {
        name: 'EventContent',
        title: 'EventContent',
        description: 'Parses and renders event content with support for various Nostr content types. Automatically detects mentions, hashtags, links, media, and custom emojis.',
        apiDocs: [
          { name: 'ndk', type: 'NDKSvelte', default: 'from context', description: 'NDK instance for loading embedded content' },
          { name: 'event', type: 'NDKEvent', default: 'optional', description: 'Event object (uses event.content and event.tags)' },
          { name: 'content', type: 'string', default: 'optional', description: 'Raw content string to parse (alternative to event)' },
          { name: 'emojiTags', type: 'string[][]', default: 'optional', description: 'Custom emoji tags from event (NIP-30)' },
          { name: 'renderer', type: 'ContentRenderer', default: 'from context or default', description: 'Custom content renderer (prop overrides context)' },
          { name: 'class', type: 'string', default: "''", description: 'Additional CSS classes' }
        ]
      },
      {
        name: 'EmbeddedEvent',
        title: 'EmbeddedEvent',
        description: 'Loads an event from a bech32 reference and renders it using registered handlers from ContentRenderer.',
        apiDocs: [
          { name: 'ndk', type: 'NDKSvelte', default: 'from context', description: 'NDK instance for fetching the event' },
          { name: 'bech32', type: 'string', default: 'required', description: 'Event reference (nevent, note1, naddr)' },
          { name: 'renderer', type: 'ContentRenderer', default: 'from context or default', description: 'Content renderer (prop overrides context)' },
          { name: 'class', type: 'string', default: "''", description: 'Additional CSS classes' }
        ]
      },
      {
        name: 'MarkdownEventContent',
        title: 'MarkdownEventContent',
        description: 'Renders markdown content with Nostr-specific extensions for mentions, event references, and custom emojis.',
        apiDocs: [
          { name: 'ndk', type: 'NDKSvelte', default: 'from context', description: 'NDK instance for loading embedded content' },
          { name: 'event', type: 'NDKEvent', default: 'optional', description: 'Event object (uses event.content and event.tags)' },
          { name: 'content', type: 'string', default: 'optional', description: 'Raw markdown string to parse' },
          { name: 'renderer', type: 'ContentRenderer', default: 'from context or default', description: 'Custom content renderer' },
          { name: 'class', type: 'string', default: "''", description: 'Additional CSS classes' }
        ]
      },
      {
        name: 'ContentRenderer',
        title: 'ContentRenderer Class',
        description: 'Pluggable registry system for customizing all rendering behavior. Allows registration of custom components for inline elements (mentions, hashtags, links, media) and event kinds.',
        apiDocs: [
          { name: 'mentionComponent', type: 'Component', default: 'default mention', description: 'Component for rendering user mentions (npub, nprofile)' },
          { name: 'hashtagComponent', type: 'Component', default: 'default hashtag', description: 'Component for rendering hashtags' },
          { name: 'linkComponent', type: 'Component', default: 'default link', description: 'Component for rendering links and link groups' },
          { name: 'mediaComponent', type: 'Component', default: 'default media', description: 'Component for rendering media and image grids' },
          { name: 'fallbackComponent', type: 'Component', default: 'default card', description: 'Fallback component for unknown event kinds' },
          { name: 'addKind', type: '(kinds: number[] | NDKClass, component: Component) => void', default: 'method', description: 'Register component for specific event kinds' }
        ]
      }
    ],
    anatomyLayers: [
      {
        id: 'event-content',
        label: 'EventContent',
        description: 'Main content parser rendering inline elements',
        props: ['ndk', 'event', 'content', 'emojiTags', 'renderer', 'class']
      },
      {
        id: 'embedded-event',
        label: 'EmbeddedEvent',
        description: 'Loads and renders embedded event references',
        props: ['ndk', 'bech32', 'renderer', 'class']
      }
    ]
  };
</script>

<svelte:head>
  <title>Event Rendering Primitives - NDK Svelte</title>
  <meta name="description" content="Complete event rendering system with content parsing, embedded events, and markdown support." />
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
        Event Rendering primitives provide a complete system for parsing and displaying Nostr event content.
        Automatically detect mentions, hashtags, links, media, custom emojis (NIP-30), and embedded events with
        full customization through pluggable renderers.
      </p>

      <h3 class="text-xl font-semibold mt-8 mb-4">When You Need These</h3>
      <p class="leading-relaxed mb-4">
        Use Event Rendering primitives when you need to:
      </p>
      <ul class="ml-6 mb-4 list-disc space-y-2">
        <li class="leading-relaxed">Parse and display Nostr event content with rich formatting</li>
        <li class="leading-relaxed">Render mentions, hashtags, and links with custom components</li>
        <li class="leading-relaxed">Display embedded media (images, videos, YouTube)</li>
        <li class="leading-relaxed">Load and render embedded event references (nevent, note1)</li>
        <li class="leading-relaxed">Support custom emojis (NIP-30)</li>
        <li class="leading-relaxed">Render markdown content with Nostr extensions</li>
        <li class="leading-relaxed">Customize how different event kinds are displayed</li>
      </ul>

      <h3 class="text-xl font-semibold mt-8 mb-4">Components Included</h3>
      <div class="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
        <div class="flex flex-col gap-1 p-4 border border-border rounded-lg bg-card">
          <strong class="font-semibold text-foreground">EventContent</strong>
          <span class="text-sm text-muted-foreground">Parses and renders event content with inline elements</span>
        </div>
        <div class="flex flex-col gap-1 p-4 border border-border rounded-lg bg-card">
          <strong class="font-semibold text-foreground">EmbeddedEvent</strong>
          <span class="text-sm text-muted-foreground">Loads and renders embedded event references</span>
        </div>
        <div class="flex flex-col gap-1 p-4 border border-border rounded-lg bg-card">
          <strong class="font-semibold text-foreground">MarkdownEventContent</strong>
          <span class="text-sm text-muted-foreground">Full markdown parsing with Nostr extensions</span>
        </div>
        <div class="flex flex-col gap-1 p-4 border border-border rounded-lg bg-card">
          <strong class="font-semibold text-foreground">ContentRenderer</strong>
          <span class="text-sm text-muted-foreground">Pluggable registry system for customization</span>
        </div>
      </div>
    </section>
  {/snippet}

  {#snippet anatomyPreview()}
    <div class="space-y-4">
      <ComponentAnatomy.Layer id="event-content" label="EventContent">
        <div class="border border-border rounded-lg p-4 bg-card max-w-2xl">
          <EventContent {ndk} event={mockEvent} class="text-sm" />
        </div>
      </ComponentAnatomy.Layer>
      <ComponentAnatomy.Layer id="embedded-event" label="EmbeddedEvent">
        <div class="border border-border rounded-lg p-4 bg-card max-w-2xl">
          <EmbeddedEvent {ndk} bech32="nevent1qqsqqe0hd9e2y5mf7qffkfv4w4rxcv63rj458fqj9hn08cwrn23wnvgwrvg7j" class="text-sm" />
        </div>
      </ComponentAnatomy.Layer>
    </div>
  {/snippet}

  {#snippet examples()}
    <div>
      <h3 class="text-xl font-semibold mb-3">Custom Renderer</h3>
      <p class="leading-relaxed text-muted-foreground mb-4">
        Use the ContentRenderer class to customize how mentions, hashtags, links, and media are displayed.
      </p>
      <Preview
        title="Custom Renderer"
        description="Customize inline element rendering."
        code={CustomRendererRaw}
      >
        <CustomRenderer />
      </Preview>
    </div>

    <div>
      <h3 class="text-xl font-semibold mb-3">Carousel Media Component</h3>
      <p class="leading-relaxed text-muted-foreground mb-4">
        Display grouped media in an elegant carousel with navigation controls. Media separated only by whitespace
        are automatically grouped together.
      </p>
      <Preview
        title="Carousel Media"
        description="Display media in a carousel layout."
        code={CustomRendererCarouselRaw}
      >
        <CustomRendererCarousel />
      </Preview>
    </div>

    <div>
      <h3 class="text-xl font-semibold mb-3">Bento Grid Media Component</h3>
      <p class="leading-relaxed text-muted-foreground mb-4">
        Display grouped media in a dynamic bento/masonry grid layout that adapts based on the number of items.
      </p>
      <Preview
        title="Bento Grid"
        description="Display media in a dynamic grid layout."
        code={CustomRendererBentoRaw}
      >
        <CustomRendererBento />
      </Preview>
    </div>

    <div>
      <h3 class="text-xl font-semibold mb-3">Link Preview Component</h3>
      <p class="leading-relaxed text-muted-foreground mb-4">
        Show rich link previews on hover using bits-ui LinkPreview. Grouped links (separated by whitespace)
        are handled together.
      </p>
      <Preview
        title="Link Preview"
        description="Show previews on hover."
        code={CustomRendererLinkPreviewRaw}
      >
        <CustomRendererLinkPreview />
      </Preview>
    </div>

    <div>
      <h3 class="text-xl font-semibold mb-3">Embedded Link Preview Component</h3>
      <p class="leading-relaxed text-muted-foreground mb-4">
        Auto-fetch and display rich link previews inline with OpenGraph metadata. Handles grouped links elegantly.
      </p>
      <Preview
        title="Embedded Link Preview"
        description="Auto-fetch and display link metadata."
        code={CustomRendererLinkEmbedRaw}
      >
        <CustomRendererLinkEmbed />
      </Preview>
    </div>

    <div>
      <h3 class="text-xl font-semibold mb-3">EmbeddedEvent Display Variants</h3>
      <p class="leading-relaxed text-muted-foreground mb-4">
        EmbeddedEvent supports three display variants: card (default), compact, and inline.
      </p>
      <Preview
        title="Display Variants"
        description="Different ways to display embedded events."
        code={VariantsRaw}
      >
        <Variants {ndk} eventBech32="nevent1qqsqqe0hd9e2y5mf7qffkfv4w4rxcv63rj458fqj9hn08cwrn23wnvgwrvg7j" />
      </Preview>
    </div>
  {/snippet}

  {#snippet contextSection()}
    <section>
      <h2 class="text-2xl font-semibold mb-4">ContentRenderer System</h2>
      <p class="leading-relaxed text-muted-foreground mb-4">
        The ContentRenderer class is the heart of the customization system. It provides a pluggable registry
        for customizing how all content types are rendered.
      </p>

      <h3 class="text-xl font-semibold mt-8 mb-4">Creating a Custom Renderer</h3>
      <div class="my-4 bg-muted rounded-lg overflow-hidden">
        <CodeBlock
          lang="typescript"
          code={`import { ContentRenderer } from '$lib/registry/ui/event-rendering';

const renderer = new ContentRenderer();

// Set custom inline element handlers (direct property assignment)
renderer.mentionComponent = MyCustomMention;
renderer.hashtagComponent = MyCustomHashtag;
renderer.linkComponent = MyCustomLink;
renderer.mediaComponent = MyCustomMedia;
renderer.fallbackComponent = MyGenericCard;

// Register embedded event handlers by kind
renderer.addKind([1, 1111], MyNoteComponent);
renderer.addKind([30023], MyArticleComponent);`}
        />
      </div>

      <h3 class="text-xl font-semibold mt-8 mb-4">Renderer Propagation</h3>
      <p class="leading-relaxed text-muted-foreground mb-4">
        ContentRenderer uses Svelte context for automatic propagation. You have two ways to provide a renderer:
      </p>
      <div class="space-y-4">
        <div class="p-4 border border-border rounded-lg bg-card">
          <h4 class="font-semibold mb-2">1. Via Context (Recommended for App-Wide)</h4>
          <p class="text-sm text-muted-foreground mb-3">
            Set the renderer in context once at your app or page level. All nested components automatically inherit it.
          </p>
          <div class="bg-muted rounded-lg overflow-hidden">
            <CodeBlock
              lang="svelte"
              code={`import { setContext } from 'svelte';
import { CONTENT_RENDERER_CONTEXT_KEY } from '$lib/registry/ui/event-rendering';

// At app/page level
setContext(CONTENT_RENDERER_CONTEXT_KEY, { renderer: myRenderer });

// All nested components inherit automatically
<EventContent {ndk} {event} />
<EmbeddedEvent {ndk} bech32="..." />`}
            />
          </div>
        </div>

        <div class="p-4 border border-border rounded-lg bg-card">
          <h4 class="font-semibold mb-2">2. Via Prop (Override for Specific Use)</h4>
          <p class="text-sm text-muted-foreground mb-3">
            Pass the renderer as a prop to override the context for a specific component and its children.
          </p>
          <div class="bg-muted rounded-lg overflow-hidden">
            <CodeBlock
              lang="svelte"
              code={`// Override for this component only
<EventContent {ndk} {event} renderer={specialRenderer} />

// Great for testing
test('custom rendering', () => {
  render(EventContent, {
    props: { ndk, event, renderer: mockRenderer }
  });
});`}
            />
          </div>
        </div>

        <div class="p-4 border border-border rounded-lg bg-card">
          <h4 class="font-semibold mb-2">Resolution Order</h4>
          <p class="text-sm text-muted-foreground">
            Components use this priority: <code class="font-mono text-[0.9em] px-1.5 py-0.5 bg-muted rounded">prop → context → defaultContentRenderer</code>
          </p>
          <p class="text-sm text-muted-foreground mt-2">
            When you pass a renderer via prop, that component automatically sets it in context for its children.
            This means nested embeds inherit the overridden renderer without you passing it explicitly.
          </p>
        </div>
      </div>

      <h3 class="text-xl font-semibold mt-8 mb-4">Content Grouping Behavior</h3>
      <p class="leading-relaxed text-muted-foreground mb-4">
        EventContent automatically groups consecutive media and links for better presentation:
      </p>
      <div class="space-y-4">
        <div class="p-4 border border-border rounded-lg bg-card">
          <h4 class="font-semibold mb-2">Image Grouping</h4>
          <p class="text-sm text-muted-foreground mb-3">
            Consecutive images separated only by whitespace (spaces, newlines) are automatically grouped into an
            <code class="font-mono text-[0.9em] px-1.5 py-0.5 bg-muted rounded">image-grid</code>.
            Single images remain as individual <code class="font-mono text-[0.9em] px-1.5 py-0.5 bg-muted rounded">media</code> segments.
          </p>
          <div class="bg-muted rounded-lg overflow-hidden">
            <CodeBlock
              lang="text"
              code={`// These images will be grouped:
https://example.com/1.jpg
https://example.com/2.jpg

https://example.com/3.jpg

// Result: One image-grid with 3 images`}
            />
          </div>
        </div>

        <div class="p-4 border border-border rounded-lg bg-card">
          <h4 class="font-semibold mb-2">Link Grouping</h4>
          <p class="text-sm text-muted-foreground mb-3">
            Consecutive links separated only by whitespace are automatically grouped into a
            <code class="font-mono text-[0.9em] px-1.5 py-0.5 bg-muted rounded">link-group</code>.
            Single links remain as individual <code class="font-mono text-[0.9em] px-1.5 py-0.5 bg-muted rounded">link</code> segments.
          </p>
          <div class="bg-muted rounded-lg overflow-hidden">
            <CodeBlock
              lang="text"
              code={`// These links will be grouped:
https://github.com/nostr
https://nostr.com

https://njump.me

// Result: One link-group with 3 URLs`}
            />
          </div>
        </div>
      </div>

      <h3 class="text-xl font-semibold mt-8 mb-4">Content Types Detected</h3>
      <p class="leading-relaxed text-muted-foreground mb-4">
        EventContent and MarkdownEventContent automatically detect and render these content types:
      </p>
      <div class="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-3">
        <div class="p-3 border border-border rounded bg-card">
          <strong class="text-sm font-semibold">Text</strong>
          <p class="text-xs text-muted-foreground mt-1">Plain text segments</p>
        </div>
        <div class="p-3 border border-border rounded bg-card">
          <strong class="text-sm font-semibold">Mentions</strong>
          <p class="text-xs text-muted-foreground mt-1">npub, nprofile references</p>
        </div>
        <div class="p-3 border border-border rounded bg-card">
          <strong class="text-sm font-semibold">Event References</strong>
          <p class="text-xs text-muted-foreground mt-1">Embedded nevent, note1</p>
        </div>
        <div class="p-3 border border-border rounded bg-card">
          <strong class="text-sm font-semibold">Hashtags</strong>
          <p class="text-xs text-muted-foreground mt-1">#hashtag detection</p>
        </div>
        <div class="p-3 border border-border rounded bg-card">
          <strong class="text-sm font-semibold">Links</strong>
          <p class="text-xs text-muted-foreground mt-1">HTTP/HTTPS URLs</p>
        </div>
        <div class="p-3 border border-border rounded bg-card">
          <strong class="text-sm font-semibold">Media</strong>
          <p class="text-xs text-muted-foreground mt-1">Images, videos, YouTube</p>
        </div>
        <div class="p-3 border border-border rounded bg-card">
          <strong class="text-sm font-semibold">Custom Emojis</strong>
          <p class="text-xs text-muted-foreground mt-1">:shortcode: from NIP-30</p>
        </div>
        <div class="p-3 border border-border rounded bg-card">
          <strong class="text-sm font-semibold">Image Grids</strong>
          <p class="text-xs text-muted-foreground mt-1">Multiple images grouped</p>
        </div>
        <div class="p-3 border border-border rounded bg-card">
          <strong class="text-sm font-semibold">Link Groups</strong>
          <p class="text-xs text-muted-foreground mt-1">Multiple links grouped</p>
        </div>
      </div>

      <h3 class="text-xl font-semibold mt-8 mb-4">Registering Event Handlers</h3>
      <p class="leading-relaxed text-muted-foreground mb-4">
        Register custom components for specific event kinds to control how embedded events are displayed:
      </p>
      <div class="my-4 bg-muted rounded-lg overflow-hidden">
        <CodeBlock
          lang="typescript"
          code={`import { ContentRenderer } from '$lib/registry/ui/event-rendering';
import NoteCard from './NoteCard.svelte';
import ArticleCard from './ArticleCard.svelte';
import { NDKArticle } from '@nostr-dev-kit/ndk';

const renderer = new ContentRenderer();

// Register handlers by kind (manual)
renderer.addKind([1, 1111], NoteCard);      // Notes and comments

// Register with NDK wrapper class (automatic wrapping)
renderer.addKind(NDKArticle, ArticleCard);  // Uses NDKArticle.kinds and .from()`}
        />
      </div>

      <h3 class="text-xl font-semibold mt-8 mb-4">Handler Component Interface</h3>
      <p class="leading-relaxed text-muted-foreground mb-4">
        Components registered as kind handlers receive these props:
      </p>
      <div class="my-4 bg-muted rounded-lg overflow-hidden">
        <CodeBlock
          lang="typescript"
          code={`interface KindHandlerProps {
  ndk: NDKSvelte;
  event: NDKEvent;  // Wrapped with NDK class if registered
}

// Inline element handlers receive different props:

// Mention component
interface MentionProps {
  ndk: NDKSvelte;
  bech32: string;
  class?: string;
}

// Hashtag component
interface HashtagProps {
  ndk: NDKSvelte;
  tag: string;
  onclick?: (tag: string) => void;
  class?: string;
}

// Link/Media component (single or grouped)
interface LinkMediaProps {
  url: string | string[];  // Array for grouped content
  class?: string;
  type?: string;  // Media only
}`}
        />
      </div>

      <h3 class="text-xl font-semibold mt-8 mb-4">Media Detection</h3>
      <p class="leading-relaxed text-muted-foreground mb-4">
        EventContent automatically detects and renders:
      </p>
      <ul class="ml-6 mb-4 list-disc space-y-2 text-muted-foreground">
        <li><strong>Images:</strong> .jpg, .jpeg, .png, .gif, .webp, .svg</li>
        <li><strong>Videos:</strong> .mp4, .webm, .mov</li>
        <li><strong>YouTube:</strong> youtube.com/watch?v=, youtu.be/, youtube.com/embed/</li>
      </ul>
      <p class="text-sm text-muted-foreground">
        Override media rendering with a custom mediaComponent in your ContentRenderer.
      </p>

      <h3 class="text-xl font-semibold mt-8 mb-4">Custom Emojis (NIP-30)</h3>
      <p class="leading-relaxed text-muted-foreground mb-4">
        All components automatically render custom emojis from event tags:
      </p>
      <div class="my-4 bg-muted rounded-lg overflow-hidden">
        <CodeBlock
          lang="javascript"
          code={`// Event tags format:
["emoji", "party", "https://example.com/party.gif"]

// In content:
"Let's party! :party:"

// Renders as:
<img src="https://example.com/party.gif" alt=":party:" />`}
        />
      </div>

      <h3 class="text-xl font-semibold mt-8 mb-4">Loading States</h3>
      <p class="leading-relaxed text-muted-foreground mb-4">
        EmbeddedEvent automatically handles loading, error, and loaded states with built-in UI:
      </p>
      <div class="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
        <div class="p-4 border border-border rounded bg-card">
          <strong class="font-semibold">Loading</strong>
          <p class="text-sm text-muted-foreground mt-2">Shows spinner and "Loading event..." message while fetching from relays.</p>
        </div>
        <div class="p-4 border border-border rounded bg-card">
          <strong class="font-semibold">Error</strong>
          <p class="text-sm text-muted-foreground mt-2">Displays "Failed to load event" if the event cannot be fetched.</p>
        </div>
        <div class="p-4 border border-border rounded bg-card">
          <strong class="font-semibold">Loaded</strong>
          <p class="text-sm text-muted-foreground mt-2">Renders using registered handler or shows fallback for unknown kinds.</p>
        </div>
      </div>

      <h3 class="text-xl font-semibold mt-8 mb-4">Bech32 Reference Types</h3>
      <p class="leading-relaxed text-muted-foreground mb-4">
        EmbeddedEvent supports the following Nostr bech32 reference formats:
      </p>
      <ul class="ml-6 list-disc space-y-2 text-muted-foreground">
        <li><strong>nevent:</strong> Event reference with relay hints</li>
        <li><strong>note1:</strong> Event ID reference</li>
        <li><strong>naddr:</strong> Replaceable event address reference</li>
      </ul>
    </section>
  {/snippet}

  {#snippet relatedComponents()}
    <section>
      <h2 class="text-2xl font-semibold mb-4">Related</h2>
      <div class="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
        <a href="/components/event-card" class="flex flex-col gap-1 p-4 border border-border rounded-lg no-underline transition-all hover:border-primary hover:-translate-y-0.5">
          <strong class="font-semibold text-foreground">Event Card Component</strong>
          <span class="text-sm text-muted-foreground">Complete event display with header and content</span>
        </a>
        <a href="/builders/event-rendering" class="flex flex-col gap-1 p-4 border border-border rounded-lg no-underline transition-all hover:border-primary hover:-translate-y-0.5">
          <strong class="font-semibold text-foreground">Event Content Builder</strong>
          <span class="text-sm text-muted-foreground">Low-level parsing utilities</span>
        </a>
      </div>
    </section>
  {/snippet}
</UIPrimitivePageTemplate>
