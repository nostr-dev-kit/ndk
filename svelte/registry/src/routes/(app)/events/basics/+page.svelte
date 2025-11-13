<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { NDKEvent } from '@nostr-dev-kit/ndk';
  import PageTitle from '$lib/site/components/PageTitle.svelte';
  import CodeBlock from '$lib/site/components/CodeBlock.svelte';
  import Preview from '$lib/site/components/preview.svelte';

  // Import all renderer components
  import Mention from '$lib/registry/components/mention/mention.svelte';
  import MentionModern from '$lib/registry/components/mention-modern/mention-modern.svelte';
  import Hashtag from '$lib/registry/components/hashtag/hashtag.svelte';
  import HashtagModern from '$lib/registry/components/hashtag-modern/hashtag-modern.svelte';
  import LinkInlineBasic from '$lib/registry/components/link-inline-basic/link-inline-basic.svelte';
  import LinkEmbed from '$lib/registry/components/link-embed/link-embed.svelte';
  import MediaBasic from '$lib/registry/components/media-basic/media-basic.svelte';
  import MediaBento from '$lib/registry/components/media-bento/media-bento.svelte';
  import MediaCarousel from '$lib/registry/components/media-carousel/media-carousel.svelte';

  // Import event card registration modules
  import * as EventCardInline from '$lib/registry/components/event-card-inline';
  import * as EventCardCompact from '$lib/registry/components/event-card-compact';
  import * as EventCardBasic from '$lib/registry/components/event-card-basic';

  import * as ArticleCardInline from '$lib/registry/components/article-card-inline';
  import * as ArticleCardCompact from '$lib/registry/components/article-card-compact';
  import * as ArticleCardPortrait from '$lib/registry/components/article-card-portrait';
  import * as ArticleCardMedium from '$lib/registry/components/article-card';
  import * as ArticleCardNeon from '$lib/registry/components/article-card-neon';
  import * as ArticleCardHero from '$lib/registry/components/article-card-hero';

  import * as HighlightCardInline from '$lib/registry/components/highlight-card-inline';
  import * as HighlightCardCompact from '$lib/registry/components/highlight-card-compact';
  import * as HighlightCardGrid from '$lib/registry/components/highlight-card-grid';
  import * as HighlightCardElegant from '$lib/registry/components/highlight-card-elegant';
  import * as HighlightCardFeed from '$lib/registry/components/highlight-card-feed';

  import * as ImageCardBase from '$lib/registry/components/image-card-base';
  import * as ImageCardInstagram from '$lib/registry/components/image-card-instagram';
  import * as ImageCardHero from '$lib/registry/components/image-card-hero';

  import * as EventCardFallback from '$lib/registry/components/event-card-fallback';

  import { ContentRenderer } from '$lib/registry/ui/content-renderer';
  import EventContent from '$lib/registry/ui/event-content.svelte';
  import { toast } from 'svelte-sonner';
  import { Toaster } from 'svelte-sonner';

  // Import example code
  import basicSetupCode from './examples/basic-setup/index.txt?raw';
  import fullSetupCode from './examples/full-setup/index.txt?raw';
  import manualSetupCode from './examples/manual-setup/index.txt?raw';

  // Get page data
  let { data } = $props();
  const { metadata } = data;

  const ndk = getContext<NDKSvelte>('ndk');

  // Interactive selections with multiple options
  let selectedMention = $state<'none' | 'basic' | 'modern'>('none');
  let selectedHashtag = $state<'none' | 'basic' | 'modern'>('none');
  let selectedLink = $state<'none' | 'basic' | 'embed'>('none');
  let selectedMedia = $state<'none' | 'basic' | 'bento' | 'carousel'>('none');

  // Event cards by category (single-select)
  let selectedNoteCard = $state<'none' | string>('none');
  let selectedArticleCard = $state<'none' | string>('none');
  let selectedHighlightCard = $state<'none' | string>('none');
  let selectedImageCard = $state<'none' | string>('none');
  let enableGenericFallback = $state(false);

  let blockNsfw = $state(true);

  // Create dynamic renderer and update it when selections change
  let dynamicRenderer = $state(new ContentRenderer());

  // Component registry mapping
  const componentRegistry = {
    'event-card-inline': EventCardInline,
    'event-card-compact': EventCardCompact,
    'event-card-basic': EventCardBasic,
    'article-card-inline': ArticleCardInline,
    'article-card-compact': ArticleCardCompact,
    'article-card-portrait': ArticleCardPortrait,
    'article-card': ArticleCardMedium,
    'article-card-neon': ArticleCardNeon,
    'article-card-hero': ArticleCardHero,
    'highlight-card-inline': HighlightCardInline,
    'highlight-card-compact': HighlightCardCompact,
    'highlight-card-grid': HighlightCardGrid,
    'highlight-card-elegant': HighlightCardElegant,
    'highlight-card-feed': HighlightCardFeed,
    'image-card-base': ImageCardBase,
    'image-card-instagram': ImageCardInstagram,
    'image-card-hero': ImageCardHero,
    'event-card-fallback': EventCardFallback
  };

  $effect(() => {
    const renderer = new ContentRenderer();

    // Apply inline content handlers (synchronous)
    if (selectedMention === 'basic') renderer.setMentionComponent(Mention, 1);
    else if (selectedMention === 'modern') renderer.setMentionComponent(MentionModern, 10);

    if (selectedHashtag === 'basic') renderer.setHashtagComponent(Hashtag, 1);
    else if (selectedHashtag === 'modern') renderer.setHashtagComponent(HashtagModern, 10);

    if (selectedLink === 'basic') renderer.setLinkComponent(LinkInlineBasic, 1);
    else if (selectedLink === 'embed') renderer.setLinkComponent(LinkEmbed, 5);

    if (selectedMedia === 'basic') renderer.setMediaComponent(MediaBasic, 6);
    else if (selectedMedia === 'bento') renderer.setMediaComponent(MediaBento, 8);
    else if (selectedMedia === 'carousel') renderer.setMediaComponent(MediaCarousel, 10);

    // Event cards - register selected components
    if (selectedNoteCard !== 'none' && componentRegistry[selectedNoteCard]) {
      componentRegistry[selectedNoteCard].register(renderer);
    }
    if (selectedArticleCard !== 'none' && componentRegistry[selectedArticleCard]) {
      componentRegistry[selectedArticleCard].register(renderer);
    }
    if (selectedHighlightCard !== 'none' && componentRegistry[selectedHighlightCard]) {
      componentRegistry[selectedHighlightCard].register(renderer);
    }
    if (selectedImageCard !== 'none' && componentRegistry[selectedImageCard]) {
      componentRegistry[selectedImageCard].register(renderer);
    }
    if (enableGenericFallback) {
      EventCardFallback.register(renderer);
    }

    // Configure renderer
    renderer.blockNsfw = blockNsfw;

    // Set up callbacks for demonstration
    renderer.onUserClick = (pubkey) => {
      toast.info(`User clicked: ${pubkey.slice(0, 16)}...`);
    };
    renderer.onEventClick = (event) => {
      toast.info(`Event kind ${event.kind} clicked`);
    };
    renderer.onHashtagClick = (tag) => {
      toast.info(`Hashtag clicked: #${tag}`);
    };
    renderer.onLinkClick = (url) => {
      toast.info(`Link clicked: ${url.slice(0, 40)}...`);
    };
    renderer.onMediaClick = (url) => {
      const urlStr = Array.isArray(url) ? `${url.length} items` : url.toString().slice(0, 40) + '...';
      toast.info(`Media clicked: ${urlStr}`);
    };

    dynamicRenderer = renderer;
  });

  // Component name mapping
  const componentPaths = {
    mention: { basic: 'mention', modern: 'mention-modern' },
    hashtag: { basic: 'hashtag', modern: 'hashtag-modern' },
    link: { basic: 'link-inline-basic', embed: 'link-embed' },
    media: { basic: 'media-basic', bento: 'media-bento', carousel: 'media-carousel' }
  };

  // Generate code based on selections
  const generatedCode = $derived.by(() => {
    const componentImports: string[] = [];
    let hasAnySelection = false;

    // Inline content handlers
    if (selectedMention !== 'none') {
      componentImports.push(`import '$lib/registry/components/${componentPaths.mention[selectedMention]}';`);
      hasAnySelection = true;
    }
    if (selectedHashtag !== 'none') {
      componentImports.push(`import '$lib/registry/components/${componentPaths.hashtag[selectedHashtag]}';`);
      hasAnySelection = true;
    }
    if (selectedLink !== 'none') {
      componentImports.push(`import '$lib/registry/components/${componentPaths.link[selectedLink]}';`);
      hasAnySelection = true;
    }
    if (selectedMedia !== 'none') {
      componentImports.push(`import '$lib/registry/components/${componentPaths.media[selectedMedia]}';`);
      hasAnySelection = true;
    }

    // Event cards
    if (selectedNoteCard !== 'none') {
      componentImports.push(`import '$lib/registry/components/${selectedNoteCard}';`);
      hasAnySelection = true;
    }
    if (selectedArticleCard !== 'none') {
      componentImports.push(`import '$lib/registry/components/${selectedArticleCard}';`);
      hasAnySelection = true;
    }
    if (selectedHighlightCard !== 'none') {
      componentImports.push(`import '$lib/registry/components/${selectedHighlightCard}';`);
      hasAnySelection = true;
    }
    if (selectedImageCard !== 'none') {
      componentImports.push(`import '$lib/registry/components/${selectedImageCard}';`);
      hasAnySelection = true;
    }
    if (enableGenericFallback) {
      componentImports.push(`import '$lib/registry/components/event-card-fallback';`);
      hasAnySelection = true;
    }

    if (!hasAnySelection) {
      componentImports.push("// No components selected - content will render as plain text");
    }

    // Generate code with imports and callbacks
    const imports = [
      "// Import components to auto-register with defaultContentRenderer",
      ...componentImports,
      "",
      "import { defaultContentRenderer } from '$lib/registry/ui/content-renderer';",
      "",
      "let { children } = $props();"
    ];

    // Add NSFW configuration if needed
    if (!blockNsfw) {
      imports.push("", "// Configure NSFW blocking", "defaultContentRenderer.blockNsfw = false;");
    }

    // Add toast imports
    imports.push(
      "",
      "import { toast, Toaster } from 'svelte-sonner';"
    );

    // Add callback handlers
    imports.push(
      "",
      "// Set up click handlers for interactive content",
      "defaultContentRenderer.onUserClick = (pubkey) => {",
      "  toast.info(`User clicked: ${pubkey.slice(0, 16)}...`);",
      "  // Example: goto(`/user/${pubkey}`)",
      "};",
      "",
      "defaultContentRenderer.onEventClick = (event) => {",
      "  toast.info(`Event kind ${event.kind} clicked`);",
      "  // Example: goto(`/event/${event.id}`)",
      "};",
      "",
      "defaultContentRenderer.onHashtagClick = (tag) => {",
      "  toast.info(`Hashtag clicked: #${tag}`);",
      "  // Example: goto(`/search?q=${tag}`)",
      "};",
      "",
      "defaultContentRenderer.onLinkClick = (url) => {",
      "  toast.info(`Link clicked: ${url.slice(0, 40)}...`);",
      "  // Example: window.open(url, '_blank')",
      "};",
      "",
      "defaultContentRenderer.onMediaClick = (url) => {",
      "  const urlStr = Array.isArray(url) ? `${url.length} items` : url.slice(0, 40) + '...';",
      "  toast.info(`Media clicked: ${urlStr}`);",
      "  // Example: openLightbox(url)",
      "};"
    );

    const scriptOpen = '<' + 'script lang="ts">';
    const scriptClose = '<' + '/script>';
    const htmlContent = [
      scriptOpen,
      imports.join('\n'),
      scriptClose,
      '',
      '{@render children()}',
      '',
      '<!-- Add the Toaster component to show toast notifications -->',
      '<Toaster position="bottom-right" />'
    ].join('\n');

    return '<!-- Install svelte-sonner: bun add svelte-sonner -->\n\n' + htmlContent;
  });

  // Create a rich sample event for demonstration
  const sampleEvent = $derived.by(() => {
    const event = new NDKEvent(ndk);
    event.kind = 1;
    event.content = `Just discovered this amazing Nostr library! 🚀

Check out the docs at https://ndk.fyi for more info.

Special thanks to nostr:npub1l2vyh47mk2p0qlsku7hg0vn29faehy9hy34ygaclpn66ukqp3afqutajft for building this!

#nostr #bitcoin #decentralized

Here's a cool image to go with it:
https://r2a.primal.net/uploads2/d/f3/bd/df3bdd118f7db2cdf57821f958033db07dfd9de72248e6869734cbb9e2e8c130.png

This is an article:
nostr:naddr1qvzqqqr4gupzqmjxss3dld622uu8q25gywum9qtg4w4cv4064jmg20xsac2aam5nqythwumn8ghj7un9d3shjtnswf5k6ctv9ehx2ap0qqxnzd3cx5urjd35xg6rwwpee39928

And here's a note worth checking out:
nostr:nevent1qgsxu35yyt0mwjjh8pcz4zprhxegz69t4wr9t74vk6zne58wzh0waycppemhxue69uhkummn9ekx7mp0qqsq3zms08nzx3a72cgc0jtsd0g0g9fdx0f9jvp69kp05peuvmrpj5g0w639m`;
    event.pubkey = "fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52";
    event.created_at = Math.floor(Date.now() / 1000);
    event.id = "sample_event_id";
    return event;
  });
</script>

<div class="px-8 flex flex-col gap-8">
  <!-- Header -->
  <PageTitle title={metadata.title} subtitle={metadata.oneLiner} />

  <!-- Introduction -->
  <section class="prose prose-lg max-w-none mb-8 flex flex-col gap-4">
    <h2 class="text-3xl font-bold">What is the Content Renderer?</h2>
    <p class="text-muted-foreground">
      The ContentRenderer is a powerful system that transforms plain Nostr event content into rich,
      interactive experiences. It automatically parses event text and renders mentions, hashtags, links,
      media, and embedded events using components you configure.
    </p>

    <div class="p-6 border-l-4 border-primary bg-muted/50 rounded-r-lg">
      <p class="text-sm text-muted-foreground font-semibold mb-2">🎯 The 99% Use Case</p>
      <p class="text-sm text-muted-foreground">
        Configure the content renderer once in your <code class="text-xs bg-background px-2 py-1 rounded">+layout.svelte</code>
        file, and all nested components automatically inherit the configuration. Simply import the components
        you want to use, and they'll auto-register with the default renderer.
      </p>
    </div>
  </section>

  <!-- Interactive Configuration -->
  <section class="mb-12 w-full">
    <h2 class="text-3xl font-bold mb-4">Interactive Configuration</h2>
    <p class="text-muted-foreground mb-6">
      Toggle features below to see how they transform the content. The code updates automatically to show
      exactly what you need in your <code class="text-xs bg-muted px-2 py-1 rounded">+layout.svelte</code>.
    </p>

    <div class="w-full grid grid-cols-1 md:grid-cols-3 gap-8">
      <!-- Left: Configuration Controls (1/3) -->
      <div class="md:col-span-1 space-y-4">
        <h3 class="text-lg font-semibold mb-2">Configure Components</h3>

        <div class="space-y-2">
          <!-- Mentions -->
          <div class="flex items-center justify-between gap-3">
            <label for="mention-select" class="text-sm text-muted-foreground">Mentions</label>
            <select id="mention-select" bind:value={selectedMention} class="px-2 py-1 text-sm border-0 bg-transparent hover:bg-muted focus:bg-muted rounded cursor-pointer">
              <option value="none">None</option>
              <option value="basic">Basic (P1)</option>
              <option value="modern">Modern (P10)</option>
            </select>
          </div>

          <!-- Hashtags -->
          <div class="flex items-center justify-between gap-3">
            <label for="hashtag-select" class="text-sm text-muted-foreground">Hashtags</label>
            <select id="hashtag-select" bind:value={selectedHashtag} class="px-2 py-1 text-sm border-0 bg-transparent hover:bg-muted focus:bg-muted rounded cursor-pointer">
              <option value="none">None</option>
              <option value="basic">Basic (P1)</option>
              <option value="modern">Modern (P10)</option>
            </select>
          </div>

          <!-- Links -->
          <div class="flex items-center justify-between gap-3">
            <label for="link-select" class="text-sm text-muted-foreground">Links</label>
            <select id="link-select" bind:value={selectedLink} class="px-2 py-1 text-sm border-0 bg-transparent hover:bg-muted focus:bg-muted rounded cursor-pointer">
              <option value="none">None</option>
              <option value="basic">Basic (P1)</option>
              <option value="embed">Embed (P5)</option>
            </select>
          </div>

          <!-- Media -->
          <div class="flex items-center justify-between gap-3">
            <label for="media-select" class="text-sm text-muted-foreground">Media</label>
            <select id="media-select" bind:value={selectedMedia} class="px-2 py-1 text-sm border-0 bg-transparent hover:bg-muted focus:bg-muted rounded cursor-pointer">
              <option value="none">None</option>
              <option value="basic">Basic (P6)</option>
              <option value="bento">Bento (P8)</option>
              <option value="carousel">Carousel (P10)</option>
            </select>
          </div>
        </div>

        <!-- Event Cards -->
        <div class="pt-3 border-t border-border space-y-2">
          <div class="text-sm font-medium mb-2">Event Cards</div>

          <!-- Note Cards -->
          <div class="flex items-center justify-between gap-3">
            <label for="note-card-select" class="text-sm text-muted-foreground">Notes</label>
            <select id="note-card-select" bind:value={selectedNoteCard} class="px-2 py-1 text-sm border-0 bg-transparent hover:bg-muted focus:bg-muted rounded cursor-pointer">
              <option value="none">None</option>
              <option value="event-card-inline">Inline (P10)</option>
              <option value="event-card-compact">Compact (P5)</option>
              <option value="event-card-basic">Basic (P1)</option>
            </select>
          </div>

          <!-- Article Cards -->
          <div class="flex items-center justify-between gap-3">
            <label for="article-card-select" class="text-sm text-muted-foreground">Articles</label>
            <select id="article-card-select" bind:value={selectedArticleCard} class="px-2 py-1 text-sm border-0 bg-transparent hover:bg-muted focus:bg-muted rounded cursor-pointer">
              <option value="none">None</option>
              <option value="article-card-inline">Inline (P1)</option>
              <option value="article-card-compact">Compact (P5)</option>
              <option value="article-card-portrait">Portrait (P6)</option>
              <option value="article-card">Medium (P7)</option>
              <option value="article-card-neon">Neon (P8)</option>
              <option value="article-card-hero">Hero (P10)</option>
            </select>
          </div>

          <!-- Highlight Cards -->
          <div class="flex items-center justify-between gap-3">
            <label for="highlight-card-select" class="text-sm text-muted-foreground">Highlights</label>
            <select id="highlight-card-select" bind:value={selectedHighlightCard} class="px-2 py-1 text-sm border-0 bg-transparent hover:bg-muted focus:bg-muted rounded cursor-pointer">
              <option value="none">None</option>
              <option value="highlight-card-inline">Inline (P1)</option>
              <option value="highlight-card-compact">Compact (P5)</option>
              <option value="highlight-card-grid">Grid (P6)</option>
              <option value="highlight-card-elegant">Elegant (P8)</option>
              <option value="highlight-card-feed">Feed (P10)</option>
            </select>
          </div>

          <!-- Image Cards -->
          <div class="flex items-center justify-between gap-3">
            <label for="image-card-select" class="text-sm text-muted-foreground">Images</label>
            <select id="image-card-select" bind:value={selectedImageCard} class="px-2 py-1 text-sm border-0 bg-transparent hover:bg-muted focus:bg-muted rounded cursor-pointer">
              <option value="none">None</option>
              <option value="image-card-base">Base (P5)</option>
              <option value="image-card-instagram">Instagram (P8)</option>
              <option value="image-card-hero">Hero (P10)</option>
            </select>
          </div>

          <!-- Generic Fallback -->
          <div class="flex items-center justify-between gap-3">
            <label for="fallback-select" class="text-sm text-muted-foreground">Fallback</label>
            <select id="fallback-select" bind:value={enableGenericFallback} class="px-2 py-1 text-sm border-0 bg-transparent hover:bg-muted focus:bg-muted rounded cursor-pointer">
              <option value={false}>None</option>
              <option value={true}>Fallback (P1)</option>
            </select>
          </div>
        </div>

        <!-- Options -->
        <div class="pt-3 border-t border-border">
          <label class="flex items-center justify-between gap-3 cursor-pointer group">
            <span class="text-sm text-muted-foreground">Block NSFW</span>
            <input type="checkbox" bind:checked={blockNsfw} class="w-4 h-4 rounded border-input cursor-pointer" />
          </label>
        </div>
      </div>

      <!-- Right: Live Preview (2/3) -->
      <div class="md:col-span-2 space-y-4">
        <Preview code={generatedCode} previewAreaClass="min-h-[400px]">
          <div class="w-full max-w-3xl bg-card border border-border rounded-lg p-4">
            <EventContent {ndk} event={sampleEvent} renderer={dynamicRenderer} />
          </div>
        </Preview>

        <!-- Tips -->
        <div class="flex flex-col gap-2">
          <div class="p-2 border-l-2 border-primary bg-primary/5 rounded-r text-xs text-muted-foreground">
            <strong>💡 Tip:</strong> Higher priority (P10) components provide richer experiences than lower priority ones (P1).
          </div>
          <div class="p-2 border-l-2 border-accent bg-accent/5 rounded-r text-xs text-muted-foreground">
            <strong>🎯 Click handlers:</strong> Try clicking on mentions, hashtags, links, or events in the preview to see toast notifications! Replace with your navigation logic (e.g., <code>goto()</code>).
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- How Auto-Registration Works -->
  <section class="mb-12">
    <h2 class="text-3xl font-bold mb-4">How Auto-Registration Works</h2>
    <p class="text-muted-foreground mb-6">
      When you import a component, it automatically registers itself with the <code class="text-xs bg-muted px-2 py-1 rounded">defaultContentRenderer</code>
      at a specific priority level. No manual configuration needed!
    </p>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="p-6 border border-border rounded-lg bg-card">
        <h3 class="text-lg font-semibold mb-3">✅ Auto-Registration (Recommended)</h3>
        <p class="text-sm text-muted-foreground mb-4">
          Simply import the component - it registers itself automatically.
        </p>
        <pre class="text-xs bg-muted p-4 rounded overflow-x-auto"><code>// In your +layout.svelte
import '$lib/registry/components/mention';
import '$lib/registry/components/hashtag';

// Done! They're now active for all child components</code></pre>
      </div>

      <div class="p-6 border border-border rounded-lg bg-card">
        <h3 class="text-lg font-semibold mb-3">⚙️ Manual Configuration</h3>
        <p class="text-sm text-muted-foreground mb-4">
          For custom renderers or multiple instances, configure manually.
        </p>
        <pre class="text-xs bg-muted p-4 rounded overflow-x-auto"><code>// Create a custom renderer
const renderer = new ContentRenderer();
renderer.setMentionComponent(Mention, 1);
renderer.setHashtagComponent(Hashtag, 1);</code></pre>
      </div>
    </div>
  </section>

  <!-- Common Options -->
  <section class="mb-12">
    <h2 class="text-3xl font-bold mb-4">Common Options & Callbacks</h2>
    <p class="text-muted-foreground mb-6">
      Content renderer components support various options and callbacks. Here are the most commonly used:
    </p>

    <div class="space-y-4">
      <div class="p-6 border border-border rounded-lg bg-card">
        <h3 class="text-lg font-semibold mb-3">NSFW Content Blocking</h3>
        <p class="text-sm text-muted-foreground mb-4">
          Automatically blur NSFW content (enabled by default). Users can click to reveal.
        </p>
        <pre class="text-xs bg-muted p-4 rounded overflow-x-auto"><code>defaultContentRenderer.blockNsfw = true;  // Default
defaultContentRenderer.blockNsfw = false; // Disable</code></pre>
      </div>

      <div class="p-6 border border-border rounded-lg bg-card">
        <h3 class="text-lg font-semibold mb-3">Hashtag Click Handler</h3>
        <p class="text-sm text-muted-foreground mb-4">
          Add custom behavior when users click hashtags (e.g., navigation, search).
        </p>
        <pre class="text-xs bg-muted p-4 rounded overflow-x-auto"><code>{'// In the Hashtag component\n<Hashtag\n  {ndk}\n  tag="nostr"\n  onclick={(tag) => goto(`/search?q=${tag}`)}\n/>'}</code></pre>
      </div>

      <div class="p-6 border border-border rounded-lg bg-card">
        <h3 class="text-lg font-semibold mb-3">Custom Styling</h3>
        <p class="text-sm text-muted-foreground mb-4">
          All renderer components accept a <code class="text-xs bg-muted px-1 rounded">class</code> prop for custom styling.
        </p>
        <pre class="text-xs bg-muted p-4 rounded overflow-x-auto"><code>{'// Components accept class for styling\n<Mention\n  {ndk}\n  bech32="npub1..."\n  class="text-primary hover:underline"\n/>'}</code></pre>
      </div>
    </div>

    <div class="mt-6 p-4 border-l-4 border-primary bg-muted/50 rounded-r-lg">
      <p class="text-sm text-muted-foreground">
        <strong>📚 Component-Specific Options:</strong> Each component has its own set of props and callbacks.
        Visit the component-specific documentation pages for detailed API references:
        <a href="/events/embeds/mention" class="text-primary hover:underline ml-1">Mentions</a>,
        <a href="/events/embeds/hashtag" class="text-primary hover:underline ml-1">Hashtags</a>,
        <a href="/events/embeds/links" class="text-primary hover:underline ml-1">Links</a>,
        <a href="/events/embeds/media" class="text-primary hover:underline ml-1">Media</a>
      </p>
    </div>
  </section>

  <!-- Example Files -->
  <section class="mb-12">
    <h2 class="text-3xl font-bold mb-4">Complete Examples</h2>
    <p class="text-muted-foreground mb-6">
      Here are complete, copy-paste ready examples for different use cases:
    </p>

    <div class="space-y-8">
      <div>
        <h3 class="text-xl font-semibold mb-3">Minimal Setup</h3>
        <p class="text-muted-foreground mb-4">
          Basic configuration with essential handlers for mentions, hashtags, links, and media.
          This example shows the minimal setup you'd place in your <code class="text-xs bg-muted px-1 rounded">+layout.svelte</code>
        </p>
        <div class="border border-border rounded-lg bg-muted overflow-hidden">
          <CodeBlock code={basicSetupCode} lang="svelte" />
        </div>
      </div>

      <div>
        <h3 class="text-xl font-semibold mb-3">Full Setup</h3>
        <p class="text-muted-foreground mb-4">
          Complete configuration with modern components and event kind handlers for a rich experience.
          This example includes enhanced components like <code class="text-xs bg-muted px-1 rounded">mention-modern</code>
          and <code class="text-xs bg-muted px-1 rounded">link-embed</code> for richer interactions.
        </p>
        <div class="border border-border rounded-lg bg-muted overflow-hidden">
          <CodeBlock code={fullSetupCode} lang="svelte" />
        </div>
      </div>

      <div>
        <h3 class="text-xl font-semibold mb-3">Manual Configuration</h3>
        <p class="text-muted-foreground mb-4">
          Create a custom renderer instance when you need multiple renderers or special configurations.
          Use this approach when you need fine-grained control or want to create multiple renderer instances
          with different configurations.
        </p>
        <div class="border border-border rounded-lg bg-muted overflow-hidden">
          <CodeBlock code={manualSetupCode} lang="svelte" />
        </div>
      </div>
    </div>
  </section>

  <!-- Next Steps -->
  <section class="mb-16">
    <h2 class="text-3xl font-bold mb-4">Next Steps</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <a href="/events/embeds" class="p-6 border border-border rounded-lg bg-card hover:border-primary transition-colors group">
        <h3 class="text-lg font-semibold mb-2 group-hover:text-primary">Explore Embed Components</h3>
        <p class="text-sm text-muted-foreground">
          Learn about available mention, hashtag, link, and media components and their variants.
        </p>
      </a>

      <a href="/events/cards" class="p-6 border border-border rounded-lg bg-card hover:border-primary transition-colors group">
        <h3 class="text-lg font-semibold mb-2 group-hover:text-primary">Event Cards & Chromes</h3>
        <p class="text-sm text-muted-foreground">
          Discover chrome components for different event kinds: notes, articles, highlights, and more.
        </p>
      </a>

      <a href="/events/content/plain-text" class="p-6 border border-border rounded-lg bg-card hover:border-primary transition-colors group">
        <h3 class="text-lg font-semibold mb-2 group-hover:text-primary">Plain Text Content</h3>
        <p class="text-sm text-muted-foreground">
          Deep dive into the EventContent component and custom snippet overrides.
        </p>
      </a>

      <a href="/docs/architecture" class="p-6 border border-border rounded-lg bg-card hover:border-primary transition-colors group">
        <h3 class="text-lg font-semibold mb-2 group-hover:text-primary">Architecture Guide</h3>
        <p class="text-sm text-muted-foreground">
          Understand the reactive architecture and how components work together.
        </p>
      </a>
    </div>
  </section>
</div>

<Toaster position="bottom-right" />
