<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import type { NDKEvent } from '@nostr-dev-kit/ndk';
  import { EditProps } from '$lib/site-components/edit-props';
  import Demo from '$site-components/Demo.svelte';
  import ApiTable from '$site-components/api-table.svelte';

  import Basic from './examples/basic.example.svelte';
  import BasicRaw from './examples/basic.example.svelte?raw';
  import CustomRenderer from './examples/custom-renderer.example.svelte';
  import CustomRendererRaw from './examples/custom-renderer.example.svelte?raw';
  import CustomRendererCarousel from './examples/custom-renderer-carousel.example.svelte';
  import CustomRendererCarouselRaw from './examples/custom-renderer-carousel.example.svelte?raw';
  import CustomRendererBento from './examples/custom-renderer-bento.example.svelte';
  import CustomRendererBentoRaw from './examples/custom-renderer-bento.example.svelte?raw';
  import CustomRendererLinkPreview from './examples/custom-renderer-link-preview.example.svelte';
  import CustomRendererLinkPreviewRaw from './examples/custom-renderer-link-preview.example.svelte?raw';
  import CustomRendererLinkEmbed from './examples/custom-renderer-link-embed.example.svelte';
  import CustomRendererLinkEmbedRaw from './examples/custom-renderer-link-embed.example.svelte?raw';
  import Variants from './examples/variants.example.svelte';
  import VariantsRaw from './examples/variants.example.svelte?raw';

  const ndk = getContext<NDKSvelte>('ndk');

  let event = $state<NDKEvent | undefined>();
  const eventBech32 = $derived(event?.encode() || 'nevent1qqsqqe0hd9e2y5mf7qffkfv4w4rxcv63rj458fqj9hn08cwrn23wnvgwrvg7j');
</script>

<svelte:head>
  <title>Event Rendering - NDK Svelte</title>
  <meta name="description" content="Complete event rendering system with content parsing, embedded event display, markdown support, and customizable content handlers." />
</svelte:head>

<div class="component-page">
  <header>
    <EditProps.Root>
      <EditProps.Prop name="Event" type="event" bind:value={event} default="nevent1qqsqqe0hd9e2y5mf7qffkfv4w4rxcv63rj458fqj9hn08cwrn23wnvgwrvg7j" />
      <EditProps.Button>Change Sample Event</EditProps.Button>
    </EditProps.Root>
    <div class="header-badge">
      <span class="badge">UI Primitive</span>
      <span class="badge badge-nip">NIP-30</span>
    </div>
    <div class="header-title">
      <h1>Event Rendering</h1>
    </div>
    <p class="header-description">
      Complete event rendering system combining content parsing, embedded event loading, and markdown support. Parse and display Nostr event content with automatic detection of mentions, hashtags, links, media, custom emojis (NIP-30), and embedded events. Fully customizable with pluggable renderers.
    </p>
    <div class="header-info">
      <div class="info-card">
        <strong>Smart Parsing</strong>
        <span>Auto-detects mentions, links, media, events</span>
      </div>
      <div class="info-card">
        <strong>Embedded Events</strong>
        <span>Automatic loading and kind-based rendering</span>
      </div>
      <div class="info-card">
        <strong>Custom Renderers</strong>
        <span>Override any element's display</span>
      </div>
      <div class="info-card">
        <strong>Markdown Support</strong>
        <span>Full markdown parsing with extensions</span>
      </div>
    </div>
  </header>

  <section class="installation">
    <h2>Installation</h2>
    <pre><code>npx jsrepo add event-rendering</code></pre>
    <p class="mt-4 text-sm text-muted-foreground">This installs all event rendering components and their dependencies.</p>
  </section>

  <section class="components-overview">
    <h2>Components Included</h2>
    <div class="components-grid">
      <div class="component-card">
        <strong>EventContent</strong>
        <p>Parses and renders event content with inline elements (mentions, hashtags, links, media, emojis)</p>
      </div>
      <div class="component-card">
        <strong>EmbeddedEvent</strong>
        <p>Loads and renders embedded event references (nevent, note1) with kind-specific handlers</p>
      </div>
      <div class="component-card">
        <strong>MarkdownEventContent</strong>
        <p>Full markdown parsing with Nostr extensions for long-form content</p>
      </div>
      <div class="component-card">
        <strong>ContentRenderer</strong>
        <p>Pluggable registry system for customizing all rendering behavior</p>
      </div>
    </div>
  </section>

  <section class="usage">
    <h2>Basic Usage</h2>
    <pre><code>import &#123; EventContent, EmbeddedEvent, MarkdownEventContent, ContentRenderer &#125; from '$lib/ui/event-rendering';

// Parse event content
&lt;EventContent &#123;ndk&#125; &#123;event&#125; /&gt;

// Load embedded event
&lt;EmbeddedEvent &#123;ndk&#125; bech32="nevent1..." /&gt;

// Render markdown
&lt;MarkdownEventContent &#123;ndk&#125; &#123;event&#125; /&gt;</code></pre>
  </section>

  <section class="demo space-y-8">
    <h2>Examples</h2>

    <h3 class="text-xl font-semibold mt-8 mb-4">EventContent Examples</h3>

    <Demo
      title="Basic Content Parsing"
      description="EventContent automatically parses and renders content with links, hashtags, and custom emojis."
      code={BasicRaw}
    >
      <Basic />
    </Demo>

    <Demo
      title="Custom Renderer"
      description="Use the ContentRenderer class to customize how mentions, hashtags, links, and media are displayed."
      code={CustomRendererRaw}
    >
      <CustomRenderer />
    </Demo>

    <Demo
      title="Carousel Media Component"
      description="Display grouped media in an elegant carousel with navigation controls. Media separated only by whitespace are automatically grouped together."
      code={CustomRendererCarouselRaw}
    >
      <CustomRendererCarousel />
    </Demo>

    <Demo
      title="Bento Grid Media Component"
      description="Display grouped media in a dynamic bento/masonry grid layout that adapts based on the number of items."
      code={CustomRendererBentoRaw}
    >
      <CustomRendererBento />
    </Demo>

    <Demo
      title="Link Preview Component"
      description="Show rich link previews on hover using bits-ui LinkPreview. Grouped links (separated by whitespace) are handled together."
      code={CustomRendererLinkPreviewRaw}
    >
      <CustomRendererLinkPreview />
    </Demo>

    <Demo
      title="Embedded Link Preview Component"
      description="Auto-fetch and display rich link previews inline with OpenGraph metadata. Handles grouped links elegantly."
      code={CustomRendererLinkEmbedRaw}
    >
      <CustomRendererLinkEmbed />
    </Demo>

    <h3 class="text-xl font-semibold mt-8 mb-4">EmbeddedEvent Examples</h3>

    <Demo
      title="Display Variants"
      description="EmbeddedEvent supports three display variants: card (default), compact, and inline."
      code={VariantsRaw}
    >
      <Variants {ndk} {eventBech32} />
    </Demo>
  </section>

  <section class="info">
    <h2>EventContent Component</h2>
    <p class="mb-4">Parses event content and renders it with support for various Nostr content types. Automatically uses EmbeddedEvent for event references.</p>
    <ApiTable
      rows={[
        { name: 'ndk', type: 'NDKSvelte', default: 'from context', description: 'NDK instance for loading embedded content' },
        { name: 'event', type: 'NDKEvent', default: 'optional', description: 'Event object (uses event.content and event.tags)' },
        { name: 'content', type: 'string', default: 'optional', description: 'Raw content string to parse (alternative to event)' },
        { name: 'emojiTags', type: 'string[][]', default: 'optional', description: 'Custom emoji tags from event (NIP-30)' },
        { name: 'renderer', type: 'ContentRenderer', default: 'from context or default', description: 'Custom content renderer (prop overrides context)' },
        { name: 'class', type: 'string', default: "''", description: 'Additional CSS classes' }
      ]}
    />
  </section>

  <section class="info">
    <h2>EmbeddedEvent Component</h2>
    <p class="mb-4">Loads an event from a bech32 reference and renders it using registered handlers from ContentRenderer.</p>
    <ApiTable
      rows={[
        { name: 'ndk', type: 'NDKSvelte', default: 'from context', description: 'NDK instance for fetching the event' },
        { name: 'bech32', type: 'string', default: 'required', description: 'Event reference (nevent, note1, naddr)' },
        { name: 'renderer', type: 'ContentRenderer', default: 'from context or default', description: 'Content renderer (prop overrides context)' },
        { name: 'class', type: 'string', default: "''", description: 'Additional CSS classes' }
      ]}
    />
  </section>

  <section class="info">
    <h2>MarkdownEventContent Component</h2>
    <p class="mb-4">Renders markdown content with Nostr-specific extensions for mentions, event references, and custom emojis.</p>
    <ApiTable
      rows={[
        { name: 'ndk', type: 'NDKSvelte', default: 'from context', description: 'NDK instance for loading embedded content' },
        { name: 'event', type: 'NDKEvent', default: 'optional', description: 'Event object (uses event.content and event.tags)' },
        { name: 'content', type: 'string', default: 'optional', description: 'Raw markdown string to parse' },
        { name: 'renderer', type: 'ContentRenderer', default: 'from context or default', description: 'Custom content renderer' },
        { name: 'class', type: 'string', default: "''", description: 'Additional CSS classes' }
      ]}
    />
  </section>

  <section class="info">
    <h2>Content Types</h2>
    <p class="mb-4">EventContent and MarkdownEventContent automatically detect and render these content types:</p>
    <div class="content-types-grid">
      <div class="content-type-item">
        <strong>Text</strong>
        <p>Plain text segments</p>
      </div>
      <div class="content-type-item">
        <strong>Mentions</strong>
        <p>npub, nprofile references</p>
      </div>
      <div class="content-type-item">
        <strong>Event References</strong>
        <p>Embedded nevent, note1 references</p>
      </div>
      <div class="content-type-item">
        <strong>Hashtags</strong>
        <p>#hashtag detection</p>
      </div>
      <div class="content-type-item">
        <strong>Links</strong>
        <p>HTTP/HTTPS URLs</p>
      </div>
      <div class="content-type-item">
        <strong>Media</strong>
        <p>Images, videos, YouTube</p>
      </div>
      <div class="content-type-item">
        <strong>Custom Emojis</strong>
        <p>:shortcode: from NIP-30</p>
      </div>
      <div class="content-type-item">
        <strong>Image Grids</strong>
        <p>Multiple images grouped together</p>
      </div>
      <div class="content-type-item">
        <strong>Link Groups</strong>
        <p>Multiple links grouped together</p>
      </div>
    </div>
  </section>

  <section class="info">
    <h2>ContentRenderer System</h2>
    <p class="mb-4">The ContentRenderer class is the heart of the customization system. It provides:</p>
    <ul class="ml-6 mb-4 space-y-2">
      <li><strong>Inline element handlers:</strong> Customize mentions, hashtags, links, and media</li>
      <li><strong>Embedded event registry:</strong> Register components by event kind</li>
      <li><strong>Context propagation:</strong> Automatic inheritance through nested components</li>
      <li><strong>Fallback rendering:</strong> Graceful degradation for unknown kinds</li>
    </ul>

    <pre><code>import &#123; ContentRenderer &#125; from '$lib/ui/event-rendering';

const renderer = new ContentRenderer();

// Set custom inline element handlers (direct property assignment)
renderer.mentionComponent = MyCustomMention;
renderer.hashtagComponent = MyCustomHashtag;
renderer.linkComponent = MyCustomLink;
renderer.mediaComponent = MyCustomMedia;
renderer.fallbackComponent = MyGenericCard;

// Register embedded event handlers by kind
renderer.addKind([1, 1111], MyNoteComponent);
renderer.addKind([30023], MyArticleComponent);</code></pre>
  </section>

  <section class="info">
    <h2>Renderer Propagation</h2>
    <p class="mb-4">ContentRenderer uses Svelte context for automatic propagation. You have two ways to provide a renderer:</p>

    <div class="grouping-info">
      <div class="grouping-card">
        <strong>1. Via Context (Recommended for App-Wide)</strong>
        <p>Set the renderer in context once at your app or page level. All nested components automatically inherit it:</p>
        <pre><code>import &#123; setContext &#125; from 'svelte';
import &#123; CONTENT_RENDERER_CONTEXT_KEY &#125; from '$lib/ui/event-rendering';

// At app/page level
setContext(CONTENT_RENDERER_CONTEXT_KEY, &#123; renderer: myRenderer &#125;);

// All nested components inherit automatically
&lt;EventContent &#123;ndk&#125; &#123;event&#125; /&gt;
&lt;EmbeddedEvent &#123;ndk&#125; bech32="..." /&gt;</code></pre>
      </div>

      <div class="grouping-card">
        <strong>2. Via Prop (Override for Specific Use)</strong>
        <p>Pass the renderer as a prop to override the context for a specific component and its children:</p>
        <pre><code>// Override for this component only
&lt;EventContent &#123;ndk&#125; &#123;event&#125; renderer=&#123;specialRenderer&#125; /&gt;

// Great for testing
test('custom rendering', () => &#123;
  render(EventContent, &#123;
    props: &#123; ndk, event, renderer: mockRenderer &#125;
  &#125;);
&#125;);</code></pre>
      </div>

      <div class="grouping-card">
        <strong>Resolution Order</strong>
        <p>Components use this priority: <code>prop → context → defaultContentRenderer</code></p>
        <p>When you pass a renderer via prop, that component automatically sets it in context for its children. This means nested embeds inherit the overridden renderer without you passing it explicitly.</p>
      </div>
    </div>
  </section>

  <section class="info">
    <h2>Content Grouping Behavior</h2>
    <p class="mb-4">EventContent automatically groups consecutive media and links for better presentation:</p>
    <div class="grouping-info">
      <div class="grouping-card">
        <strong>Image Grouping</strong>
        <p>Consecutive images separated only by whitespace (spaces, newlines) are automatically grouped into an <code>image-grid</code>. Single images remain as individual <code>media</code> segments.</p>
        <pre><code>// These images will be grouped:
https://example.com/1.jpg
https://example.com/2.jpg

https://example.com/3.jpg

// Result: One image-grid with 3 images</code></pre>
      </div>
      <div class="grouping-card">
        <strong>Link Grouping</strong>
        <p>Consecutive links separated only by whitespace are automatically grouped into a <code>link-group</code>. Single links remain as individual <code>link</code> segments.</p>
        <pre><code>// These links will be grouped:
https://github.com/nostr
https://nostr.com

https://njump.me

// Result: One link-group with 3 URLs</code></pre>
      </div>
    </div>
  </section>

  <section class="info">
    <h2>Registering Event Handlers</h2>
    <p class="mb-4">Register custom components for specific event kinds to control how embedded events are displayed:</p>
    <pre><code>import &#123; ContentRenderer &#125; from '$lib/ui/event-rendering';
import NoteCard from './NoteCard.svelte';
import ArticleCard from './ArticleCard.svelte';
import &#123; NDKArticle &#125; from '@nostr-dev-kit/ndk';

const renderer = new ContentRenderer();

// Register handlers by kind (manual)
renderer.addKind([1, 1111], NoteCard);      // Notes and comments

// Register with NDK wrapper class (automatic wrapping)
renderer.addKind(NDKArticle, ArticleCard);  // Uses NDKArticle.kinds and .from()</code></pre>
  </section>

  <section class="info">
    <h2>Handler Component Interface</h2>
    <p class="mb-4">Components registered as kind handlers receive these props:</p>
    <pre><code>interface KindHandlerProps &#123;
  ndk: NDKSvelte;
  event: NDKEvent;  // Wrapped with NDK class if registered
&#125;

// Inline element handlers receive different props:

// Mention component
interface MentionProps &#123;
  ndk: NDKSvelte;
  bech32: string;
  class?: string;
&#125;

// Hashtag component
interface HashtagProps &#123;
  ndk: NDKSvelte;
  tag: string;
  onclick?: (tag: string) => void;
  class?: string;
&#125;

// Link/Media component (single or grouped)
interface LinkMediaProps &#123;
  url: string | string[];  // Array for grouped content
  class?: string;
  type?: string;  // Media only
&#125;</code></pre>
  </section>

  <section class="info">
    <h2>Loading States</h2>
    <p class="mb-4">EmbeddedEvent automatically handles loading, error, and loaded states with built-in UI:</p>
    <div class="states-grid">
      <div class="state-item">
        <strong>Loading</strong>
        <p>Shows spinner and "Loading event..." message while fetching from relays.</p>
      </div>
      <div class="state-item">
        <strong>Error</strong>
        <p>Displays "Failed to load event" if the event cannot be fetched.</p>
      </div>
      <div class="state-item">
        <strong>Loaded</strong>
        <p>Renders using registered handler or shows fallback for unknown kinds.</p>
      </div>
    </div>
  </section>

  <section class="info">
    <h2>Media Detection</h2>
    <p class="mb-4">EventContent automatically detects and renders:</p>
    <ul class="ml-6 mb-4 space-y-2">
      <li><strong>Images:</strong> .jpg, .jpeg, .png, .gif, .webp, .svg</li>
      <li><strong>Videos:</strong> .mp4, .webm, .mov</li>
      <li><strong>YouTube:</strong> youtube.com/watch?v=, youtu.be/, youtube.com/embed/</li>
    </ul>
    <p class="mb-4">Override media rendering with a custom mediaComponent in your ContentRenderer.</p>
  </section>

  <section class="info">
    <h2>Custom Emojis (NIP-30)</h2>
    <p class="mb-4">All components automatically render custom emojis from event tags:</p>
    <pre><code>// Event tags format:
["emoji", "party", "https://example.com/party.gif"]

// In content:
"Let's party! :party:"

// Renders as:
&lt;img src="https://example.com/party.gif" alt=":party:" /&gt;</code></pre>
  </section>

  <section class="info">
    <h2>Bech32 Reference Types</h2>
    <p class="mb-4">EmbeddedEvent supports the following Nostr bech32 reference formats:</p>
    <ul class="ml-6 mb-4 space-y-2">
      <li><strong>nevent:</strong> Event reference with relay hints</li>
      <li><strong>note1:</strong> Event ID reference</li>
      <li><strong>naddr:</strong> Replaceable event address reference</li>
    </ul>
  </section>

  <section class="info">
    <h2>Related</h2>
    <div class="related-grid">
      <a href="/components/event-card" class="related-card">
        <strong>Event Card Component</strong>
        <span>Complete event display with header and content</span>
      </a>
      <a href="/builders/event-rendering" class="related-card">
        <strong>Event Content Builder</strong>
        <span>Low-level parsing utilities</span>
      </a>
    </div>
  </section>
</div>

<style>
  .component-page {
    max-width: 900px;
  }

  header {
    margin-bottom: 3rem;
  }

  .header-badge {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
    flex-wrap: wrap;
  }

  .badge {
    padding: 0.25rem 0.75rem;
    border-radius: 9999px;
    background: var(--muted);
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--muted-foreground);
  }

  .badge-nip {
    background: var(--primary);
    color: white;
  }

  .header-title h1 {
    font-size: 3rem;
    font-weight: 700;
    margin: 0;
    background: linear-gradient(135deg, var(--primary) 0%, color-mix(in srgb, var(--primary) 70%, transparent) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .header-description {
    font-size: 1.125rem;
    line-height: 1.7;
    color: var(--muted-foreground);
    margin: 1rem 0 1.5rem 0;
  }

  .header-info {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 1rem;
  }

  .info-card {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    padding: 1rem;
    border: 1px solid var(--border);
    border-radius: 0.5rem;
  }

  .info-card strong {
    font-weight: 600;
    color: var(--foreground);
  }

  .info-card span {
    font-size: 0.875rem;
    color: var(--muted-foreground);
  }

  .installation h2 {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 1rem;
  }

  .installation pre {
    padding: 1rem;
    background: var(--muted);
    border-radius: 0.5rem;
  }

  section {
    margin-bottom: 3rem;
  }

  section h2 {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 1rem;
  }

  section h3 {
    font-size: 1.25rem;
    font-weight: 600;
    margin-top: 2rem;
    margin-bottom: 1rem;
    color: var(--primary);
  }

  .components-overview {
    background: var(--muted);
    padding: 2rem;
    border-radius: 1rem;
    margin: 2rem 0;
  }

  .components-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
  }

  .component-card {
    padding: 1.5rem;
    background: var(--background);
    border: 1px solid var(--border);
    border-radius: 0.5rem;
  }

  .component-card strong {
    display: block;
    font-weight: 600;
    color: var(--primary);
    margin-bottom: 0.5rem;
    font-size: 1rem;
  }

  .component-card p {
    font-size: 0.875rem;
    color: var(--muted-foreground);
    margin: 0;
    line-height: 1.5;
  }

  .content-types-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
  }

  .content-type-item {
    padding: 1rem;
    border: 1px solid var(--border);
    border-radius: 0.5rem;
  }

  .content-type-item strong {
    font-weight: 600;
    color: var(--primary);
    display: block;
    margin-bottom: 0.25rem;
  }

  .content-type-item p {
    font-size: 0.875rem;
    color: var(--muted-foreground);
    margin: 0;
  }

  .states-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
  }

  .state-item {
    padding: 1rem;
    border: 1px solid var(--border);
    border-radius: 0.5rem;
  }

  .state-item strong {
    font-weight: 600;
    color: var(--primary);
    display: block;
    margin-bottom: 0.25rem;
  }

  .state-item p {
    font-size: 0.875rem;
    color: var(--muted-foreground);
    margin: 0;
    line-height: 1.5;
  }

  .related-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
  }

  .related-card {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    padding: 1rem;
    border: 1px solid var(--border);
    border-radius: 0.5rem;
    text-decoration: none;
    transition: all 0.2s;
  }

  .related-card:hover {
    border-color: var(--primary);
    transform: translateY(-2px);
  }

  .related-card strong {
    font-weight: 600;
    color: var(--foreground);
  }

  .related-card span {
    font-size: 0.875rem;
    color: var(--muted-foreground);
  }

  pre {
    margin: 1rem 0;
    padding: 1rem;
    background: var(--muted);
    border-radius: 0.5rem;
    overflow-x: auto;
  }

  pre code {
    font-family: 'Monaco', 'Menlo', monospace;
    font-size: 0.875rem;
    line-height: 1.6;
  }

  ul {
    list-style: disc;
  }

  ul li {
    color: var(--muted-foreground);
    line-height: 1.6;
  }

  .grouping-info {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .grouping-card {
    padding: 1.5rem;
    border: 1px solid var(--border);
    border-radius: 0.75rem;
    background: var(--muted);
  }

  .grouping-card strong {
    display: block;
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--foreground);
    margin-bottom: 0.75rem;
  }

  .grouping-card p {
    margin-bottom: 1rem;
    line-height: 1.6;
    color: var(--muted-foreground);
  }

  .grouping-card pre {
    margin-top: 1rem;
  }

  .grouping-card code {
    font-size: 0.8125rem;
  }

  .usage pre {
    background: var(--muted);
    padding: 1.5rem;
    border-radius: 0.5rem;
  }
</style>
