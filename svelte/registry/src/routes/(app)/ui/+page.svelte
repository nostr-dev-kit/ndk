<script lang="ts">
  import { PaintBoardIcon, CodeIcon, Layers01Icon, PackageIcon } from '@hugeicons/core-free-icons';
  import { HugeiconsIcon } from '@hugeicons/svelte';
  import PageTitle from '$lib/site/components/PageTitle.svelte';
</script>

<svelte:head>
  <title>UI Primitives - NDK Svelte</title>
  <meta name="description" content="Headless, composable UI primitives for building Nostr interfaces." />
</svelte:head>

<div class="max-w-7xl mx-auto px-8 pb-8">
  <PageTitle
    title="UI Primitives"
    subtitle="Headless, composable building blocks for creating Nostr interfaces. UI primitives are unstyled, accessible components that give you complete control over styling and behavior."
  />

  <section class="mb-12">
    <h2 class="text-[1.75rem] font-bold mb-6">What are UI Primitives?</h2>
    <div class="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6">
      <div class="p-8 border border-border rounded-xl bg-card">
        <div class="flex items-center justify-center w-12 h-12 mb-4 rounded-lg bg-primary/10 text-primary">
          <HugeiconsIcon icon={PaintBoardIcon} size={24} strokeWidth={2} />
        </div>
        <h3 class="text-lg font-semibold mb-2">Headless & Unstyled</h3>
        <p class="text-muted-foreground text-sm leading-relaxed">No opinions about appearance. Bring your own styles, design system, or CSS framework.</p>
      </div>

      <div class="p-8 border border-border rounded-xl bg-card">
        <div class="flex items-center justify-center w-12 h-12 mb-4 rounded-lg bg-primary/10 text-primary">
          <HugeiconsIcon icon={PackageIcon} size={24} strokeWidth={2} />
        </div>
        <h3 class="text-lg font-semibold mb-2">Composable</h3>
        <p class="text-muted-foreground text-sm leading-relaxed">Mix and match primitives to build exactly what you need. Full control over structure and layout.</p>
      </div>

      <div class="p-8 border border-border rounded-xl bg-card">
        <div class="flex items-center justify-center w-12 h-12 mb-4 rounded-lg bg-primary/10 text-primary">
          <HugeiconsIcon icon={CodeIcon} size={24} strokeWidth={2} />
        </div>
        <h3 class="text-lg font-semibold mb-2">Reactive</h3>
        <p class="text-muted-foreground text-sm leading-relaxed">Built with Svelte 5 runes and NDK's reactive builders. Automatically updates when data changes.</p>
      </div>
    </div>
  </section>

  <section class="mb-12">
    <h2 class="text-[1.75rem] font-bold mb-3">Architecture Layers</h2>
    <p class="text-muted-foreground mb-8 text-[1.05rem]">
      NDK Svelte provides three architectural layers. Each serves a specific purpose:
    </p>

    <div class="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-6">
      <div class="p-6 border-2 border-primary rounded-xl bg-gradient-to-br from-primary/5 to-transparent">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary">
            <HugeiconsIcon icon={PaintBoardIcon} size={20} strokeWidth={2} />
          </div>
          <span class="px-3 py-1 rounded-full bg-primary text-white text-xs font-semibold">You are here</span>
        </div>
        <h3 class="text-lg font-semibold mb-1">UI Primitives</h3>
        <p class="font-mono text-sm text-primary mb-3">/ui/*</p>
        <p class="text-muted-foreground text-sm leading-relaxed mb-4">
          Headless, composable building blocks. Complete control over styling and layout.
          Use these when you need maximum flexibility.
        </p>
        <div class="flex flex-wrap gap-2">
          <code class="px-2 py-1 rounded bg-muted font-mono text-xs">&lt;Article.Root&gt;</code>
          <code class="px-2 py-1 rounded bg-muted font-mono text-xs">&lt;User.Avatar /&gt;</code>
          <code class="px-2 py-1 rounded bg-muted font-mono text-xs">&lt;Relay.Icon /&gt;</code>
        </div>
      </div>

      <div class="p-6 border border-border rounded-xl bg-card">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary">
            <HugeiconsIcon icon={CodeIcon} size={20} strokeWidth={2} />
          </div>
        </div>
        <h3 class="text-lg font-semibold mb-1">Components</h3>
        <p class="font-mono text-sm text-primary mb-3">/components/*</p>
        <p class="text-muted-foreground text-sm leading-relaxed mb-4">
          Styled, opinionated components for specific use cases. Good defaults with customization options.
        </p>
        <div class="flex flex-wrap gap-2">
          <code class="px-2 py-1 rounded bg-muted font-mono text-xs">&lt;EventContent /&gt;</code>
          <code class="px-2 py-1 rounded bg-muted font-mono text-xs">&lt;NoteComposer /&gt;</code>
        </div>
      </div>

      <div class="p-6 border border-border rounded-xl bg-card">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary">
            <HugeiconsIcon icon={Layers01Icon} size={20} strokeWidth={2} />
          </div>
        </div>
        <h3 class="text-lg font-semibold mb-1">Blocks</h3>
        <p class="font-mono text-sm text-primary mb-3">/blocks/*</p>
        <p class="text-muted-foreground text-sm leading-relaxed mb-4">
          Pre-built, ready-to-use layouts composed from primitives. Drop-in solutions for common patterns.
        </p>
        <div class="flex flex-wrap gap-2">
          <code class="px-2 py-1 rounded bg-muted font-mono text-xs">&lt;ArticleCardHero /&gt;</code>
          <code class="px-2 py-1 rounded bg-muted font-mono text-xs">&lt;UserCardPortrait /&gt;</code>
        </div>
      </div>
    </div>
  </section>

  <section class="mb-12">
    <h2 class="text-[1.75rem] font-bold mb-3">Available Primitives</h2>
    <p class="text-muted-foreground mb-8 text-[1.05rem]">
      Browse all available UI primitives. Each provides a set of composable components for building custom interfaces.
    </p>

    <div class="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
      <a href="/ui/article" class="flex flex-col gap-3 p-6 border border-border rounded-lg bg-card hover:border-primary hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/20 transition-all no-underline">
        <h3 class="text-lg font-semibold m-0">Article</h3>
        <p class="text-sm text-muted-foreground leading-relaxed m-0">Display long-form articles (NIP-23)</p>
        <div class="flex flex-wrap gap-1.5 mt-auto">
          <span class="px-2 py-0.5 rounded bg-muted text-muted-foreground text-xs font-medium">Root</span>
          <span class="px-2 py-0.5 rounded bg-muted text-muted-foreground text-xs font-medium">Image</span>
          <span class="px-2 py-0.5 rounded bg-muted text-muted-foreground text-xs font-medium">Title</span>
          <span class="px-2 py-0.5 rounded bg-muted text-muted-foreground text-xs font-medium">Summary</span>
          <span class="px-2 py-0.5 rounded bg-muted text-muted-foreground text-xs font-medium">+3</span>
        </div>
      </a>

      <a href="/ui/user" class="flex flex-col gap-3 p-6 border border-border rounded-lg bg-card hover:border-primary hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/20 transition-all no-underline">
        <h3 class="text-lg font-semibold m-0">User</h3>
        <p class="text-sm text-muted-foreground leading-relaxed m-0">Display user profiles and metadata</p>
        <div class="flex flex-wrap gap-1.5 mt-auto">
          <span class="px-2 py-0.5 rounded bg-muted text-muted-foreground text-xs font-medium">Root</span>
          <span class="px-2 py-0.5 rounded bg-muted text-muted-foreground text-xs font-medium">Avatar</span>
          <span class="px-2 py-0.5 rounded bg-muted text-muted-foreground text-xs font-medium">Name</span>
          <span class="px-2 py-0.5 rounded bg-muted text-muted-foreground text-xs font-medium">Bio</span>
          <span class="px-2 py-0.5 rounded bg-muted text-muted-foreground text-xs font-medium">+6</span>
        </div>
      </a>

      <a href="/ui/highlight" class="flex flex-col gap-3 p-6 border border-border rounded-lg bg-card hover:border-primary hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/20 transition-all no-underline">
        <h3 class="text-lg font-semibold m-0">Highlight</h3>
        <p class="text-sm text-muted-foreground leading-relaxed m-0">Display text highlights (NIP-84)</p>
        <div class="flex flex-wrap gap-1.5 mt-auto">
          <span class="px-2 py-0.5 rounded bg-muted text-muted-foreground text-xs font-medium">Root</span>
          <span class="px-2 py-0.5 rounded bg-muted text-muted-foreground text-xs font-medium">Content</span>
          <span class="px-2 py-0.5 rounded bg-muted text-muted-foreground text-xs font-medium">Source</span>
        </div>
      </a>

      <a href="/ui/relay" class="flex flex-col gap-3 p-6 border border-border rounded-lg bg-card hover:border-primary hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/20 transition-all no-underline">
        <h3 class="text-lg font-semibold m-0">Relay</h3>
        <p class="text-sm text-muted-foreground leading-relaxed m-0">Display relay information and controls</p>
        <div class="flex flex-wrap gap-1.5 mt-auto">
          <span class="px-2 py-0.5 rounded bg-muted text-muted-foreground text-xs font-medium">Root</span>
          <span class="px-2 py-0.5 rounded bg-muted text-muted-foreground text-xs font-medium">Icon</span>
          <span class="px-2 py-0.5 rounded bg-muted text-muted-foreground text-xs font-medium">Name</span>
          <span class="px-2 py-0.5 rounded bg-muted text-muted-foreground text-xs font-medium">Description</span>
          <span class="px-2 py-0.5 rounded bg-muted text-muted-foreground text-xs font-medium">+6</span>
        </div>
      </a>

      <a href="/components/emoji-picker" class="flex flex-col gap-3 p-6 border border-border rounded-lg bg-card hover:border-primary hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/20 transition-all no-underline">
        <h3 class="text-lg font-semibold m-0">Emoji Picker</h3>
        <p class="text-sm text-muted-foreground leading-relaxed m-0">Select emojis from custom sets</p>
        <div class="flex flex-wrap gap-1.5 mt-auto">
          <span class="px-2 py-0.5 rounded bg-muted text-muted-foreground text-xs font-medium">List</span>
          <span class="px-2 py-0.5 rounded bg-muted text-muted-foreground text-xs font-medium">Content</span>
          <span class="px-2 py-0.5 rounded bg-muted text-muted-foreground text-xs font-medium">Item</span>
        </div>
      </a>

      <a href="/ui/media-upload" class="flex flex-col gap-3 p-6 border border-border rounded-lg bg-card hover:border-primary hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/20 transition-all no-underline">
        <h3 class="text-lg font-semibold m-0">Media Upload</h3>
        <p class="text-sm text-muted-foreground leading-relaxed m-0">Upload files to Blossom servers</p>
        <div class="flex flex-wrap gap-1.5 mt-auto">
          <span class="px-2 py-0.5 rounded bg-muted text-muted-foreground text-xs font-medium">Root</span>
          <span class="px-2 py-0.5 rounded bg-muted text-muted-foreground text-xs font-medium">Button</span>
          <span class="px-2 py-0.5 rounded bg-muted text-muted-foreground text-xs font-medium">Preview</span>
          <span class="px-2 py-0.5 rounded bg-muted text-muted-foreground text-xs font-medium">+2</span>
        </div>
      </a>

      <a href="/ui/reaction" class="flex flex-col gap-3 p-6 border border-border rounded-lg bg-card hover:border-primary hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/20 transition-all no-underline">
        <h3 class="text-lg font-semibold m-0">Reaction</h3>
        <p class="text-sm text-muted-foreground leading-relaxed m-0">Display event reactions</p>
        <div class="flex flex-wrap gap-1.5 mt-auto">
          <span class="px-2 py-0.5 rounded bg-muted text-muted-foreground text-xs font-medium">Display</span>
        </div>
      </a>

      <a href="/ui/event" class="flex flex-col gap-3 p-6 border border-border rounded-lg bg-card hover:border-primary hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/20 transition-all no-underline">
        <h3 class="text-lg font-semibold m-0">Event</h3>
        <p class="text-sm text-muted-foreground leading-relaxed m-0">Display event metadata and relationships</p>
        <div class="flex flex-wrap gap-1.5 mt-auto">
          <span class="px-2 py-0.5 rounded bg-muted text-muted-foreground text-xs font-medium">ReplyIndicator</span>
        </div>
      </a>

      <a href="/ui/follow-pack" class="flex flex-col gap-3 p-6 border border-border rounded-lg bg-card hover:border-primary hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/20 transition-all no-underline">
        <h3 class="text-lg font-semibold m-0">Follow Pack</h3>
        <p class="text-sm text-muted-foreground leading-relaxed m-0">Display curated user lists</p>
        <div class="flex flex-wrap gap-1.5 mt-auto">
          <span class="px-2 py-0.5 rounded bg-muted text-muted-foreground text-xs font-medium">Root</span>
          <span class="px-2 py-0.5 rounded bg-muted text-muted-foreground text-xs font-medium">Image</span>
          <span class="px-2 py-0.5 rounded bg-muted text-muted-foreground text-xs font-medium">Title</span>
          <span class="px-2 py-0.5 rounded bg-muted text-muted-foreground text-xs font-medium">+2</span>
        </div>
      </a>

      <a href="/ui/user-input" class="flex flex-col gap-3 p-6 border border-border rounded-lg bg-card hover:border-primary hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/20 transition-all no-underline">
        <h3 class="text-lg font-semibold m-0">User Input</h3>
        <p class="text-sm text-muted-foreground leading-relaxed m-0">Search and select users</p>
        <div class="flex flex-wrap gap-1.5 mt-auto">
          <span class="px-2 py-0.5 rounded bg-muted text-muted-foreground text-xs font-medium">Root</span>
          <span class="px-2 py-0.5 rounded bg-muted text-muted-foreground text-xs font-medium">Textarea</span>
          <span class="px-2 py-0.5 rounded bg-muted text-muted-foreground text-xs font-medium">Actions</span>
        </div>
      </a>

      <a href="/ui/zap" class="flex flex-col gap-3 p-6 border border-border rounded-lg bg-card hover:border-primary hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/20 transition-all no-underline">
        <h3 class="text-lg font-semibold m-0">Zap</h3>
        <p class="text-sm text-muted-foreground leading-relaxed m-0">Display lightning payments</p>
        <div class="flex flex-wrap gap-1.5 mt-auto">
          <span class="px-2 py-0.5 rounded bg-muted text-muted-foreground text-xs font-medium">Amount</span>
          <span class="px-2 py-0.5 rounded bg-muted text-muted-foreground text-xs font-medium">Content</span>
        </div>
      </a>

      <a href="/ui/event-rendering" class="flex flex-col gap-3 p-6 border border-border rounded-lg bg-card hover:border-primary hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/20 transition-all no-underline">
        <h3 class="text-lg font-semibold m-0">Event Content</h3>
        <p class="text-sm text-muted-foreground leading-relaxed m-0">Render event content with rich formatting</p>
        <div class="flex flex-wrap gap-1.5 mt-auto">
          <span class="px-2 py-0.5 rounded bg-muted text-muted-foreground text-xs font-medium">Standalone</span>
        </div>
      </a>

      <a href="/ui/embedded-event" class="flex flex-col gap-3 p-6 border border-border rounded-lg bg-card hover:border-primary hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/20 transition-all no-underline">
        <h3 class="text-lg font-semibold m-0">Embedded Event</h3>
        <p class="text-sm text-muted-foreground leading-relaxed m-0">Load and display embedded events</p>
        <div class="flex flex-wrap gap-1.5 mt-auto">
          <span class="px-2 py-0.5 rounded bg-muted text-muted-foreground text-xs font-medium">Standalone</span>
        </div>
      </a>
    </div>
  </section>

  <section class="mb-12">
    <h2 class="text-[1.75rem] font-bold mb-6">Getting Started</h2>
    <div class="flex flex-col gap-6">
      <div class="border border-border rounded-lg overflow-hidden">
        <div class="px-4 py-3 bg-muted border-b border-border text-sm font-medium text-muted-foreground">
          Import primitives from /ui
        </div>
        <pre class="m-0 p-4 bg-background overflow-x-auto"><code class="font-mono text-sm leading-relaxed">import &#123; Article, User &#125; from '$lib/registry/ui/embedded-event.svelte';</code></pre>
      </div>

      <div class="border border-border rounded-lg overflow-hidden">
        <div class="px-4 py-3 bg-muted border-b border-border text-sm font-medium text-muted-foreground">
          Compose your own layouts
        </div>
        <pre class="m-0 p-4 bg-background overflow-x-auto"><code class="font-mono text-sm leading-relaxed">&lt;Article.Root &#123;ndk&#125; &#123;article&#125;&gt;
  &lt;Article.Image /&gt;
  &lt;Article.Title /&gt;
  &lt;Article.Summary /&gt;
&lt;/Article.Root&gt;</code></pre>
      </div>

      <div class="border border-border rounded-lg overflow-hidden">
        <div class="px-4 py-3 bg-muted border-b border-border text-sm font-medium text-muted-foreground">
          Style with your own CSS
        </div>
        <pre class="m-0 p-4 bg-background overflow-x-auto"><code class="font-mono text-sm leading-relaxed">&lt;Article.Title class="text-3xl font-bold" /&gt;
&lt;Article.Summary class="text-gray-600" /&gt;</code></pre>
      </div>
    </div>
  </section>
</div>
