<script lang="ts">
  import { PaintBoardIcon, CodeIcon, Layers01Icon, PackageIcon } from '@hugeicons/core-free-icons';
  import { HugeiconsIcon } from '@hugeicons/svelte';
</script>

<svelte:head>
  <title>UI Primitives - NDK Svelte</title>
  <meta name="description" content="Headless, composable UI primitives for building Nostr interfaces." />
</svelte:head>

<div class="ui-page">
  <header class="page-header">
    <div class="header-icon">
      <HugeiconsIcon icon={PaintBoardIcon} size={48} strokeWidth={2} />
    </div>
    <h1 class="page-title">UI Primitives</h1>
    <p class="page-description">
      Headless, composable building blocks for creating Nostr interfaces. UI primitives are unstyled,
      accessible components that give you complete control over styling and behavior.
    </p>
  </header>

  <section class="philosophy-section">
    <h2 class="section-title">What are UI Primitives?</h2>
    <div class="philosophy-grid">
      <div class="philosophy-card">
        <div class="card-icon">
          <HugeiconsIcon icon={PaintBoardIcon} size={24} strokeWidth={2} />
        </div>
        <h3>Headless & Unstyled</h3>
        <p>No opinions about appearance. Bring your own styles, design system, or CSS framework.</p>
      </div>

      <div class="philosophy-card">
        <div class="card-icon">
          <HugeiconsIcon icon={PackageIcon} size={24} strokeWidth={2} />
        </div>
        <h3>Composable</h3>
        <p>Mix and match primitives to build exactly what you need. Full control over structure and layout.</p>
      </div>

      <div class="philosophy-card">
        <div class="card-icon">
          <HugeiconsIcon icon={CodeIcon} size={24} strokeWidth={2} />
        </div>
        <h3>Reactive</h3>
        <p>Built with Svelte 5 runes and NDK's reactive builders. Automatically updates when data changes.</p>
      </div>
    </div>
  </section>

  <section class="architecture-section">
    <h2 class="section-title">Architecture Layers</h2>
    <p class="section-intro">
      NDK Svelte provides three architectural layers. Each serves a specific purpose:
    </p>

    <div class="layers-grid">
      <div class="layer-card ui-layer">
        <div class="layer-header">
          <div class="layer-icon">
            <HugeiconsIcon icon={PaintBoardIcon} size={20} strokeWidth={2} />
          </div>
          <div class="layer-badge">You are here</div>
        </div>
        <h3 class="layer-title">UI Primitives</h3>
        <p class="layer-path">/ui/*</p>
        <p class="layer-description">
          Headless, composable building blocks. Complete control over styling and layout.
          Use these when you need maximum flexibility.
        </p>
        <div class="layer-examples">
          <code>&lt;Article.Root&gt;</code>
          <code>&lt;User.Avatar /&gt;</code>
          <code>&lt;Relay.Icon /&gt;</code>
        </div>
      </div>

      <div class="layer-card components-layer">
        <div class="layer-header">
          <div class="layer-icon">
            <HugeiconsIcon icon={CodeIcon} size={20} strokeWidth={2} />
          </div>
        </div>
        <h3 class="layer-title">Components</h3>
        <p class="layer-path">/components/*</p>
        <p class="layer-description">
          Styled, opinionated components for specific use cases. Good defaults with customization options.
        </p>
        <div class="layer-examples">
          <code>&lt;EventContent /&gt;</code>
          <code>&lt;NoteComposer /&gt;</code>
        </div>
      </div>

      <div class="layer-card blocks-layer">
        <div class="layer-header">
          <div class="layer-icon">
            <HugeiconsIcon icon={Layers01Icon} size={20} strokeWidth={2} />
          </div>
        </div>
        <h3 class="layer-title">Blocks</h3>
        <p class="layer-path">/blocks/*</p>
        <p class="layer-description">
          Pre-built, ready-to-use layouts composed from primitives. Drop-in solutions for common patterns.
        </p>
        <div class="layer-examples">
          <code>&lt;ArticleCardHero /&gt;</code>
          <code>&lt;UserCardPortrait /&gt;</code>
        </div>
      </div>
    </div>
  </section>

  <section class="primitives-section">
    <h2 class="section-title">Available Primitives</h2>
    <p class="section-intro">
      Browse all available UI primitives. Each provides a set of composable components for building custom interfaces.
    </p>

    <div class="primitives-grid">
      <a href="/ui/article" class="primitive-card">
        <h3>Article</h3>
        <p>Display long-form articles (NIP-23)</p>
        <div class="primitive-components">
          <span>Root</span>
          <span>Image</span>
          <span>Title</span>
          <span>Summary</span>
          <span>+3</span>
        </div>
      </a>

      <a href="/ui/user" class="primitive-card">
        <h3>User</h3>
        <p>Display user profiles and metadata</p>
        <div class="primitive-components">
          <span>Root</span>
          <span>Avatar</span>
          <span>Name</span>
          <span>Bio</span>
          <span>+6</span>
        </div>
      </a>

      <a href="/ui/highlight" class="primitive-card">
        <h3>Highlight</h3>
        <p>Display text highlights (NIP-84)</p>
        <div class="primitive-components">
          <span>Root</span>
          <span>Content</span>
          <span>Source</span>
        </div>
      </a>

      <a href="/ui/relay" class="primitive-card">
        <h3>Relay</h3>
        <p>Display relay information and controls</p>
        <div class="primitive-components">
          <span>Root</span>
          <span>Icon</span>
          <span>Name</span>
          <span>Description</span>
          <span>+6</span>
        </div>
      </a>

      <a href="/components/emoji-picker" class="primitive-card">
        <h3>Emoji Picker</h3>
        <p>Select emojis from custom sets</p>
        <div class="primitive-components">
          <span>List</span>
          <span>Content</span>
          <span>Item</span>
        </div>
      </a>

      <a href="/ui/media-upload" class="primitive-card">
        <h3>Media Upload</h3>
        <p>Upload files to Blossom servers</p>
        <div class="primitive-components">
          <span>Root</span>
          <span>Button</span>
          <span>Preview</span>
          <span>+2</span>
        </div>
      </a>

      <a href="/ui/reaction" class="primitive-card">
        <h3>Reaction</h3>
        <p>Display event reactions</p>
        <div class="primitive-components">
          <span>Display</span>
        </div>
      </a>

      <a href="/ui/follow-pack" class="primitive-card">
        <h3>Follow Pack</h3>
        <p>Display curated user lists</p>
        <div class="primitive-components">
          <span>Root</span>
          <span>Image</span>
          <span>Title</span>
          <span>+2</span>
        </div>
      </a>

      <a href="/ui/user-input" class="primitive-card">
        <h3>User Input</h3>
        <p>Search and select users</p>
        <div class="primitive-components">
          <span>Root</span>
          <span>Textarea</span>
          <span>Actions</span>
        </div>
      </a>

      <a href="/ui/voice-message" class="primitive-card">
        <h3>Voice Message</h3>
        <p>Play voice messages with waveforms</p>
        <div class="primitive-components">
          <span>Root</span>
          <span>Player</span>
          <span>Waveform</span>
          <span>+1</span>
        </div>
      </a>

      <a href="/ui/zap" class="primitive-card">
        <h3>Zap</h3>
        <p>Display lightning payments</p>
        <div class="primitive-components">
          <span>Amount</span>
          <span>Content</span>
        </div>
      </a>

      <a href="/ui/event-content" class="primitive-card">
        <h3>Event Content</h3>
        <p>Render event content with rich formatting</p>
        <div class="primitive-components">
          <span>Standalone</span>
        </div>
      </a>

      <a href="/ui/embedded-event" class="primitive-card">
        <h3>Embedded Event</h3>
        <p>Load and display embedded events</p>
        <div class="primitive-components">
          <span>Standalone</span>
        </div>
      </a>
    </div>
  </section>

  <section class="getting-started-section">
    <h2 class="section-title">Getting Started</h2>
    <div class="getting-started-content">
      <div class="code-example">
        <div class="code-header">
          <span>Import primitives from /ui</span>
        </div>
        <pre><code>import &#123; Article, User &#125; from '$lib/registry/ui';</code></pre>
      </div>

      <div class="code-example">
        <div class="code-header">
          <span>Compose your own layouts</span>
        </div>
        <pre><code>&lt;Article.Root &#123;ndk&#125; &#123;article&#125;&gt;
  &lt;Article.Image /&gt;
  &lt;Article.Title /&gt;
  &lt;Article.Summary /&gt;
&lt;/Article.Root&gt;</code></pre>
      </div>

      <div class="code-example">
        <div class="code-header">
          <span>Style with your own CSS</span>
        </div>
        <pre><code>&lt;Article.Title class="text-3xl font-bold" /&gt;
&lt;Article.Summary class="text-gray-600" /&gt;</code></pre>
      </div>
    </div>
  </section>
</div>

<style>
  .ui-page {
    max-width: 1400px;
    margin: 0 auto;
    padding: 2rem;
  }

  .page-header {
    text-align: center;
    margin-bottom: 4rem;
    max-width: 800px;
    margin-left: auto;
    margin-right: auto;
  }

  .header-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 5rem;
    height: 5rem;
    margin: 0 auto 1.5rem;
    border-radius: 1rem;
    background: linear-gradient(135deg,
      color-mix(in srgb, var(--color-primary) 10%, transparent),
      color-mix(in srgb, var(--color-primary) 5%, transparent)
    );
    color: var(--color-primary);
  }

  .page-title {
    font-size: 3.5rem;
    font-weight: 700;
    margin: 0 0 1rem 0;
    background: linear-gradient(135deg, var(--color-primary) 0%, color-mix(in srgb, var(--color-primary) 70%, transparent) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .page-description {
    font-size: 1.25rem;
    line-height: 1.7;
    color: var(--color-muted-foreground);
    margin: 0;
  }

  .philosophy-section,
  .architecture-section,
  .primitives-section,
  .getting-started-section {
    margin-bottom: 4rem;
  }

  .section-title {
    font-size: 2rem;
    font-weight: 600;
    margin: 0 0 1rem 0;
    color: var(--color-foreground);
  }

  .section-intro {
    font-size: 1.125rem;
    line-height: 1.7;
    color: var(--color-muted-foreground);
    margin: 0 0 2rem 0;
  }

  .philosophy-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5rem;
  }

  .philosophy-card {
    padding: 2rem;
    border: 1px solid var(--color-border);
    border-radius: 0.75rem;
    background: var(--color-background);
  }

  .philosophy-card .card-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 3rem;
    height: 3rem;
    margin-bottom: 1rem;
    border-radius: 0.5rem;
    background: color-mix(in srgb, var(--color-primary) 10%, transparent);
    color: var(--color-primary);
  }

  .philosophy-card h3 {
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0 0 0.5rem 0;
    color: var(--color-foreground);
  }

  .philosophy-card p {
    font-size: 0.9375rem;
    line-height: 1.6;
    color: var(--color-muted-foreground);
    margin: 0;
  }

  .layers-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
    margin-top: 2rem;
  }

  .layer-card {
    padding: 1.5rem;
    border: 2px solid var(--color-border);
    border-radius: 0.75rem;
    background: var(--color-background);
    position: relative;
  }

  .layer-card.ui-layer {
    border-color: var(--color-primary);
    background: linear-gradient(135deg,
      color-mix(in srgb, var(--color-primary) 3%, var(--color-background)),
      var(--color-background) 50%
    );
  }

  .layer-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1rem;
  }

  .layer-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 0.375rem;
    background: color-mix(in srgb, var(--color-primary) 10%, transparent);
    color: var(--color-primary);
  }

  .layer-badge {
    padding: 0.25rem 0.75rem;
    border-radius: 9999px;
    background: var(--color-primary);
    color: white;
    font-size: 0.75rem;
    font-weight: 600;
  }

  .layer-title {
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0 0 0.25rem 0;
    color: var(--color-foreground);
  }

  .layer-path {
    font-family: monospace;
    font-size: 0.875rem;
    color: var(--color-primary);
    margin: 0 0 0.75rem 0;
  }

  .layer-description {
    font-size: 0.9375rem;
    line-height: 1.6;
    color: var(--color-muted-foreground);
    margin: 0 0 1rem 0;
  }

  .layer-examples {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .layer-examples code {
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    background: var(--color-muted);
    font-family: monospace;
    font-size: 0.8125rem;
    color: var(--color-foreground);
  }

  .primitives-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1rem;
  }

  .primitive-card {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding: 1.5rem;
    border: 1px solid var(--color-border);
    border-radius: 0.5rem;
    background: var(--color-background);
    text-decoration: none;
    transition: all 0.2s ease-in-out;
  }

  .primitive-card:hover {
    border-color: var(--color-primary);
    transform: translateY(-2px);
    box-shadow: 0 8px 16px -4px color-mix(in srgb, var(--color-primary) 20%, transparent);
  }

  .primitive-card h3 {
    font-size: 1.125rem;
    font-weight: 600;
    margin: 0;
    color: var(--color-foreground);
  }

  .primitive-card p {
    font-size: 0.875rem;
    line-height: 1.5;
    color: var(--color-muted-foreground);
    margin: 0;
  }

  .primitive-components {
    display: flex;
    flex-wrap: wrap;
    gap: 0.375rem;
    margin-top: auto;
  }

  .primitive-components span {
    padding: 0.125rem 0.5rem;
    border-radius: 0.25rem;
    background: var(--color-muted);
    font-size: 0.75rem;
    font-weight: 500;
    color: var(--color-muted-foreground);
  }

  .getting-started-content {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .code-example {
    border: 1px solid var(--color-border);
    border-radius: 0.5rem;
    overflow: hidden;
  }

  .code-header {
    padding: 0.75rem 1rem;
    background: var(--color-muted);
    border-bottom: 1px solid var(--color-border);
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--color-muted-foreground);
  }

  .code-example pre {
    margin: 0;
    padding: 1rem;
    background: var(--color-background);
    overflow-x: auto;
  }

  .code-example code {
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 0.875rem;
    line-height: 1.6;
    color: var(--color-foreground);
  }

  @media (max-width: 768px) {
    .ui-page {
      padding: 1.5rem;
    }

    .page-header {
      margin-bottom: 3rem;
    }

    .page-title {
      font-size: 2.5rem;
    }

    .page-description {
      font-size: 1rem;
    }

    .philosophy-section,
    .architecture-section,
    .primitives-section,
    .getting-started-section {
      margin-bottom: 3rem;
    }

    .section-title {
      font-size: 1.5rem;
    }

    .primitives-grid {
      grid-template-columns: 1fr;
    }

    .layers-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
