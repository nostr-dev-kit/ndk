<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import Demo from '$site-components/Demo.svelte';
  import ApiTable from '$site-components/api-table.svelte';

  import Basic from './examples/basic.example.svelte';
  import BasicRaw from './examples/basic.example.svelte?raw';
  import CustomRenderer from './examples/custom-renderer.example.svelte';
  import CustomRendererRaw from './examples/custom-renderer.example.svelte?raw';

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
    <pre><code>import &#123; EventContent &#125; from '$lib/registry/ui';</code></pre>
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
        { name: 'renderer', type: 'ContentRenderer', default: 'defaultContentRenderer', description: 'Custom content renderer instance' },
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
        <p>Multiple images in a grid</p>
      </div>
    </div>
  </section>

  <section class="info">
    <h2>ContentRenderer</h2>
    <p class="mb-4">Customize how content elements are rendered by creating a ContentRenderer instance and setting custom components:</p>
    <pre><code>import &#123; ContentRenderer &#125; from '$lib/registry/ui';

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
&#125;

// Hashtag component receives:
interface HashtagComponent &#123;
  tag: string; // hashtag without #
&#125;

// Link component receives:
interface LinkComponent &#123;
  url: string;
&#125;

// Media component receives:
interface MediaComponent &#123;
  url: string;
&#125;</code></pre>
  </section>

  <section class="info">
    <h2>Default Renderer</h2>
    <p class="mb-4">The defaultContentRenderer provides basic styling for all content types. Import it to extend or reference:</p>
    <pre><code>import &#123; defaultContentRenderer &#125; from '$lib/registry/ui';

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
</style>
