<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
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

  const ndk = getContext<NDKSvelte>('ndk');
</script>

<svelte:head>
  <title>Event Content Primitives - NDK Svelte</title>
  <meta name="description" content="Standalone component for parsing and rendering Nostr event content with support for mentions, hashtags, links, media, and custom emojis." />
</svelte:head>

<div class="component-page">
  <header>
    <div class="header-badge">
      <span class="badge">UI Primitive</span>
      <span class="badge badge-nip">NIP-30</span>
    </div>
    <div class="header-title">
      <h1>Event Content</h1>
    </div>
    <p class="header-description">
      Standalone component for parsing and rendering Nostr event content. Automatically handles mentions (npub, nprofile), hashtags, links, media (images, videos, YouTube), custom emojis (NIP-30), and embedded events with customizable rendering.
    </p>
    <div class="header-info">
      <div class="info-card">
        <strong>Smart Parsing</strong>
        <span>Auto-detects mentions, links, media</span>
      </div>
      <div class="info-card">
        <strong>Custom Renderers</strong>
        <span>Override how elements are displayed</span>
      </div>
      <div class="info-card">
        <strong>Media Support</strong>
        <span>Images, videos, YouTube embeds</span>
      </div>
    </div>
  </header>

  <section class="installation">
    <h2>Installation</h2>
    <pre><code>import &#123; EventContent &#125; from '$lib/registry/ui/embedded-event.svelte';</code></pre>
  </section>

  <section class="demo space-y-8">
    <h2>Examples</h2>

    <Demo
      title="Basic Usage"
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
  </section>

  <section class="info">
    <h2>EventContent Component</h2>
    <p class="mb-4">Standalone component that parses event content and renders it with support for various Nostr content types.</p>
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
    <h2>Content Types</h2>
    <p class="mb-4">EventContent automatically detects and renders the following content types:</p>
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
      <div class="grouping-card">
        <strong>Custom Components Receive Groups</strong>
        <p>When you set a custom <code>mediaComponent</code> or <code>linkComponent</code>, it receives either a single URL string or an array of URLs for grouped content.</p>
        <pre><code>// Your component receives:
url: string | string[]

// Handle both cases:
const urls = Array.isArray(url) ? url : [url];</code></pre>
      </div>
    </div>
  </section>

  <section class="info">
    <h2>ContentRenderer</h2>
    <p class="mb-4">Customize how content elements are rendered by creating a ContentRenderer instance and setting custom components:</p>
    <pre><code>import &#123; ContentRenderer &#125; from '$lib/registry/ui/embedded-event.svelte';

const renderer = new ContentRenderer();

// Set custom components (direct property assignment)
renderer.mentionComponent = MyCustomMention;
renderer.hashtagComponent = MyCustomHashtag;
renderer.linkComponent = MyCustomLink;
renderer.mediaComponent = MyCustomMedia;

// Register embedded event handlers by kind
renderer.addKind([1, 1111], MyNoteComponent);
renderer.addKind([30023], MyArticleComponent);</code></pre>
  </section>

  <section class="info">
    <h2>Renderer Propagation</h2>
    <p class="mb-4">The ContentRenderer uses Svelte context for automatic propagation through nested components. You have two ways to provide a renderer:</p>

    <div class="grouping-info">
      <div class="grouping-card">
        <strong>1. Via Context (Recommended for App-Wide)</strong>
        <p>Set the renderer in context once at your app or page level. All nested EventContent and EmbeddedEvent components automatically inherit it:</p>
        <pre><code>import &#123; setContext &#125; from 'svelte';
import &#123; CONTENT_RENDERER_CONTEXT_KEY &#125; from '$lib/registry/ui/content-renderer.context';

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
    <h2>ContentRenderer Properties & Methods</h2>
    <ApiTable
      rows={[
        { name: 'mentionComponent', type: 'MentionComponent | null', default: 'null', description: 'Component for npub/nprofile mentions (set directly)' },
        { name: 'hashtagComponent', type: 'HashtagComponent | null', default: 'null', description: 'Component for hashtags (set directly)' },
        { name: 'linkComponent', type: 'LinkComponent | null', default: 'null', description: 'Component for links (set directly)' },
        { name: 'mediaComponent', type: 'MediaComponent | null', default: 'null', description: 'Component for media - images, videos (set directly)' },
        { name: 'addKind', type: '(kinds: number[], component: Component) => void', default: '', description: 'Register embedded event handler for specific event kinds' }
      ]}
    />
  </section>

  <section class="info">
    <h2>Component Interfaces</h2>
    <pre><code>// Mention component receives:
interface MentionComponent &#123;
  ndk: NDKSvelte;
  bech32: string; // npub or nprofile
  class?: string;
&#125;

// Hashtag component receives:
interface HashtagComponent &#123;
  tag: string; // hashtag without #
  onclick?: (tag: string) => void;
  class?: string;
&#125;

// Link component receives (single or grouped):
interface LinkComponent &#123;
  url: string | string[]; // Single URL or array for grouped links
  class?: string;
&#125;

// Media component receives (single or grouped):
interface MediaComponent &#123;
  url: string | string[]; // Single URL or array for grouped media
  type?: string;
  class?: string;
&#125;</code></pre>
  </section>

  <section class="info">
    <h2>Default Renderer</h2>
    <p class="mb-4">The defaultContentRenderer provides basic styling for all content types. Import it to extend or reference:</p>
    <pre><code>import &#123; defaultContentRenderer &#125; from '$lib/registry/ui/embedded-event.svelte';

// Use as-is
&lt;EventContent &#123;ndk&#125; &#123;event&#125; renderer=&#123;defaultContentRenderer&#125; /&gt;

// Or extend it
const myRenderer = new ContentRenderer();
// ... customize specific handlers ...</code></pre>
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
    <p class="mb-4">EventContent automatically renders custom emojis from event tags:</p>
    <pre><code>// Event tags format:
["emoji", "party", "https://example.com/party.gif"]

// In content:
"Let's party! :party:"

// Renders as:
&lt;img src="https://example.com/party.gif" alt=":party:" /&gt;</code></pre>
  </section>

  <section class="info">
    <h2>Embedded Events</h2>
    <p class="mb-4">When EventContent encounters event references (nevent, note1), it automatically loads and renders them using the EmbeddedEvent component. Register custom handlers for specific event kinds:</p>
    <pre><code>const renderer = new ContentRenderer();

// Show kind 1 (notes) and kind 1111 (comments) with custom component
renderer.addKind([1, 1111], NoteCard);

// Show kind 30023 (articles) with article component
renderer.addKind([30023], ArticleCard);</code></pre>
  </section>

  <section class="info">
    <h2>Related</h2>
    <div class="related-grid">
      <a href="/ui/embedded-event" class="related-card">
        <strong>Embedded Event Primitives</strong>
        <span>For loading and displaying event references</span>
      </a>
      <a href="/components/event-card" class="related-card">
        <strong>Event Card Component</strong>
        <span>Complete event display with header and content</span>
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
</style>
