<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { NDKEvent } from '@nostr-dev-kit/ndk';
  import PageTitle from '$lib/site/components/PageTitle.svelte';
  import CodeBlock from '$lib/site/components/CodeBlock.svelte';

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
  import NoteCard from '$lib/registry/components/note-card/note-card.svelte';

  import { ContentRenderer } from '$lib/registry/ui/content-renderer';
  import EventContent from '$lib/registry/ui/event-content.svelte';

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

  // Event cards by category (multi-select)
  let selectedNoteCards = $state<string[]>([]);
  let selectedArticleCards = $state<string[]>([]);
  let selectedHighlightCards = $state<string[]>([]);
  let selectedImageCards = $state<string[]>([]);
  let enableGenericFallback = $state(false);

  let blockNsfw = $state(true);
  let advancedMode = $state(false);

  // Create dynamic renderer based on selections
  const dynamicRenderer = $derived.by(() => {
    const renderer = new ContentRenderer();

    // Apply inline content handlers
    if (selectedMention === 'basic') renderer.setMentionComponent(Mention, 1);
    else if (selectedMention === 'modern') renderer.setMentionComponent(MentionModern, 10);

    if (selectedHashtag === 'basic') renderer.setHashtagComponent(Hashtag, 1);
    else if (selectedHashtag === 'modern') renderer.setHashtagComponent(HashtagModern, 10);

    if (selectedLink === 'basic') renderer.setLinkComponent(LinkInlineBasic, 1);
    else if (selectedLink === 'embed') renderer.setLinkComponent(LinkEmbed, 5);

    if (selectedMedia === 'basic') renderer.setMediaComponent(MediaBasic, 6);
    else if (selectedMedia === 'bento') renderer.setMediaComponent(MediaBento, 8);
    else if (selectedMedia === 'carousel') renderer.setMediaComponent(MediaCarousel, 10);

    // Event cards (simplified for now - just showing note cards)
    if (selectedNoteCards.includes('note-card')) renderer.addKind([1, 1111], NoteCard, 10);

    renderer.blockNsfw = blockNsfw;

    return renderer;
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
    if (selectedNoteCards.length > 0) {
      selectedNoteCards.forEach(card => componentImports.push(`import '$lib/registry/components/${card}';`));
      hasAnySelection = true;
    }
    if (selectedArticleCards.length > 0) {
      selectedArticleCards.forEach(card => componentImports.push(`import '$lib/registry/components/${card}';`));
      hasAnySelection = true;
    }
    if (selectedHighlightCards.length > 0) {
      selectedHighlightCards.forEach(card => componentImports.push(`import '$lib/registry/components/${card}';`));
      hasAnySelection = true;
    }
    if (selectedImageCards.length > 0) {
      selectedImageCards.forEach(card => componentImports.push(`import '$lib/registry/components/${card}';`));
      hasAnySelection = true;
    }
    if (enableGenericFallback) {
      componentImports.push(`import '$lib/registry/components/event-card-generic';`);
      hasAnySelection = true;
    }

    if (!hasAnySelection) {
      componentImports.push("// No components selected - content will render as plain text");
    }

    if (advancedMode) {
      // Advanced mode with context and callbacks
      const imports = [
        "import { setContext } from 'svelte';",
        "",
        "// Import components to auto-register with defaultContentRenderer",
        ...componentImports,
        "",
        "import { CONTENT_RENDERER_CONTEXT_KEY, defaultContentRenderer } from '$lib/registry/ui/content-renderer';",
        "",
        "let { children } = $props();"
      ];

      if (!blockNsfw) {
        imports.push("", "// Configure NSFW blocking", "defaultContentRenderer.blockNsfw = false;");
      }

      imports.push(
        "",
        "// Set renderer in context with optional callbacks",
        "setContext(CONTENT_RENDERER_CONTEXT_KEY, {",
        "  renderer: defaultContentRenderer,",
        "  // Optional: Add click callbacks",
        "  // onUserClick: (pubkey) => goto(`/user/${pubkey}`),",
        "  // onEventClick: (event) => goto(`/event/${event.id}`),",
        "  // onHashtagClick: (tag) => goto(`/search?q=${tag}`),",
        "});"
      );

      const scriptOpen = '<' + 'script lang="ts">';
      const scriptClose = '<' + '/script>';
      return scriptOpen + '\n' + imports.join('\n') + '\n' + scriptClose + '\n\n{@render children()}';
    } else {
      // Minimal mode - just imports
      const imports = [
        "// Import components to auto-register",
        ...componentImports
      ];

      if (!blockNsfw) {
        imports.push(
          "",
          "import { defaultContentRenderer } from '$lib/registry/ui/content-renderer';",
          "defaultContentRenderer.blockNsfw = false;"
        );
      }

      imports.push(
        "",
        "let { children } = $props();"
      );

      const scriptOpen = '<' + 'script lang="ts">';
      const scriptClose = '<' + '/script>';
      return scriptOpen + '\n' + imports.join('\n') + '\n' + scriptClose + '\n\n{@render children()}';
    }
  });

  // Create a rich sample event for demonstration
  const sampleEvent = $derived.by(() => {
    const event = new NDKEvent(ndk);
    event.kind = 1;
    event.content = `Just discovered this amazing Nostr library! 🚀

Check out the docs at https://nostr-dev-kit.com for more info.

Special thanks to nostr:npub1l2vyh47mk2p0qlsku7hg0vn29faehy9hy34ygaclpn66ukqp3afqutajft for building this!

#nostr #bitcoin #decentralized

Here's a cool image to go with it:
https://image.nostr.build/example.jpg

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
  <section class="mb-12">
    <h2 class="text-3xl font-bold mb-4">Interactive Configuration</h2>
    <p class="text-muted-foreground mb-6">
      Toggle features below to see how they transform the content. The code updates automatically to show
      exactly what you need in your <code class="text-xs bg-muted px-2 py-1 rounded">+layout.svelte</code>.
    </p>

    <!-- Configuration Controls -->
    <div class="space-y-6">
      <div class="p-6 border border-border rounded-lg bg-card">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold">Configure Components</h3>
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" bind:checked={advancedMode} class="w-4 h-4 rounded border-input" />
            <span class="text-sm text-muted-foreground">Advanced mode</span>
          </label>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Mentions -->
          <div class="space-y-2">
            <label for="mention-select" class="font-medium text-sm">
              Mentions <span class="text-xs text-muted-foreground">(nostr:npub...)</span>
            </label>
            <select id="mention-select" bind:value={selectedMention} class="w-full px-3 py-2 text-sm border border-border rounded-md bg-background">
              <option value="none">None - Plain text</option>
              <option value="basic">Basic - P1 - Simple clickable</option>
              <option value="modern">Modern - P10 - Avatar + popover</option>
            </select>
          </div>

          <!-- Hashtags -->
          <div class="space-y-2">
            <label for="hashtag-select" class="font-medium text-sm">
              Hashtags <span class="text-xs text-muted-foreground">(#tags)</span>
            </label>
            <select id="hashtag-select" bind:value={selectedHashtag} class="w-full px-3 py-2 text-sm border border-border rounded-md bg-background">
              <option value="none">None - Plain text</option>
              <option value="basic">Basic - P1 - Simple styled</option>
              <option value="modern">Modern - P10 - Gradient + popover</option>
            </select>
          </div>

          <!-- Links -->
          <div class="space-y-2">
            <label for="link-select" class="font-medium text-sm">
              Links <span class="text-xs text-muted-foreground">(https://...)</span>
            </label>
            <select id="link-select" bind:value={selectedLink} class="w-full px-3 py-2 text-sm border border-border rounded-md bg-background">
              <option value="none">None - Plain text</option>
              <option value="basic">Basic - P1 - Simple link</option>
              <option value="embed">Embed - P5 - Rich preview</option>
            </select>
          </div>

          <!-- Media -->
          <div class="space-y-2">
            <label for="media-select" class="font-medium text-sm">
              Media <span class="text-xs text-muted-foreground">(images/videos)</span>
            </label>
            <select id="media-select" bind:value={selectedMedia} class="w-full px-3 py-2 text-sm border border-border rounded-md bg-background">
              <option value="none">None - Plain text</option>
              <option value="basic">Basic - P6 - Simple display</option>
              <option value="bento">Bento - P8 - Grid layout</option>
              <option value="carousel">Carousel - P10 - Swipeable</option>
            </select>
          </div>
        </div>

        <!-- Event Cards -->
        <div class="mt-6 pt-6 border-t border-border">
          <div class="font-medium text-sm mb-3">Event Cards <span class="text-xs text-muted-foreground">(embedded events)</span></div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <!-- Note Cards -->
            <div class="space-y-2">
              <div class="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Notes (kind 1, 1111)</div>
              <div class="space-y-1 pl-2">
                {#each [{ value: 'note-card-inline', label: 'Inline', priority: 'P1' }, { value: 'note-card-compact', label: 'Compact', priority: 'P5' }, { value: 'note-card', label: 'Full', priority: 'P10' }] as card}
                  <label class="flex items-center gap-2 cursor-pointer group text-sm">
                    <input type="checkbox" bind:group={selectedNoteCards} value={card.value} class="w-3.5 h-3.5 rounded" />
                    <span class="group-hover:text-primary transition-colors">{card.label}</span>
                    <span class="text-xs text-muted-foreground">({card.priority})</span>
                  </label>
                {/each}
              </div>
            </div>

            <!-- Article Cards -->
            <div class="space-y-2">
              <div class="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Articles (kind 30023)</div>
              <div class="space-y-1 pl-2">
                {#each [
                  { value: 'article-card-inline', label: 'Inline', priority: 'P1' },
                  { value: 'article-card-compact', label: 'Compact', priority: 'P5' },
                  { value: 'article-card-portrait', label: 'Portrait', priority: 'P6' },
                  { value: 'article-card', label: 'Medium', priority: 'P7' },
                  { value: 'article-card-neon', label: 'Neon', priority: 'P8' },
                  { value: 'article-card-hero', label: 'Hero', priority: 'P10' }
                ] as card}
                  <label class="flex items-center gap-2 cursor-pointer group text-sm">
                    <input type="checkbox" bind:group={selectedArticleCards} value={card.value} class="w-3.5 h-3.5 rounded" />
                    <span class="group-hover:text-primary transition-colors">{card.label}</span>
                    <span class="text-xs text-muted-foreground">({card.priority})</span>
                  </label>
                {/each}
              </div>
            </div>

            <!-- Highlight Cards -->
            <div class="space-y-2">
              <div class="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Highlights (kind 9802)</div>
              <div class="space-y-1 pl-2">
                {#each [
                  { value: 'highlight-card-inline', label: 'Inline', priority: 'P1' },
                  { value: 'highlight-card-compact', label: 'Compact', priority: 'P5' },
                  { value: 'highlight-card-grid', label: 'Grid', priority: 'P6' },
                  { value: 'highlight-card-elegant', label: 'Elegant', priority: 'P8' },
                  { value: 'highlight-card-feed', label: 'Feed', priority: 'P10' }
                ] as card}
                  <label class="flex items-center gap-2 cursor-pointer group text-sm">
                    <input type="checkbox" bind:group={selectedHighlightCards} value={card.value} class="w-3.5 h-3.5 rounded" />
                    <span class="group-hover:text-primary transition-colors">{card.label}</span>
                    <span class="text-xs text-muted-foreground">({card.priority})</span>
                  </label>
                {/each}
              </div>
            </div>

            <!-- Image Cards -->
            <div class="space-y-2">
              <div class="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Images (kind 20)</div>
              <div class="space-y-1 pl-2">
                {#each [
                  { value: 'image-card-base', label: 'Base', priority: 'P5' },
                  { value: 'image-card-instagram', label: 'Instagram', priority: 'P8' },
                  { value: 'image-card-hero', label: 'Hero', priority: 'P10' }
                ] as card}
                  <label class="flex items-center gap-2 cursor-pointer group text-sm">
                    <input type="checkbox" bind:group={selectedImageCards} value={card.value} class="w-3.5 h-3.5 rounded" />
                    <span class="group-hover:text-primary transition-colors">{card.label}</span>
                    <span class="text-xs text-muted-foreground">({card.priority})</span>
                  </label>
                {/each}
              </div>
            </div>
          </div>

          <!-- Generic Fallback -->
          <div class="mt-4 pt-4 border-t border-border/50">
            <label class="flex items-center gap-2 cursor-pointer group text-sm">
              <input type="checkbox" bind:checked={enableGenericFallback} class="w-3.5 h-3.5 rounded" />
              <span class="group-hover:text-primary transition-colors">Generic fallback</span>
              <span class="text-xs text-muted-foreground">(P1 - for unknown event kinds)</span>
            </label>
          </div>
        </div>

        <!-- Options -->
        <div class="mt-6 pt-6 border-t border-border">
          <label class="flex items-start gap-3 cursor-pointer group">
            <input type="checkbox" bind:checked={blockNsfw} class="mt-0.5 w-4 h-4 rounded border-input" />
            <div>
              <div class="font-medium text-sm group-hover:text-primary transition-colors">Block NSFW</div>
              <div class="text-xs text-muted-foreground">Automatically blur NSFW content</div>
            </div>
          </label>
        </div>
      </div>

      <!-- Preview with Code -->
      <div class="p-6 border border-border rounded-lg bg-card">
        <div class="mb-4">
          <h3 class="text-lg font-semibold mb-2">Live Preview</h3>
          <div class="text-sm text-muted-foreground">
            {#if selectedMention === 'none' && selectedHashtag === 'none' && selectedLink === 'none' && selectedMedia === 'none' && selectedNoteCards.length === 0 && selectedArticleCards.length === 0 && selectedHighlightCards.length === 0 && selectedImageCards.length === 0 && !enableGenericFallback}
              No components selected - content renders as plain text
            {:else}
              Content with selected components:
            {/if}
          </div>
        </div>

        <div class="border border-border rounded-lg p-4 bg-background mb-6">
          <EventContent {ndk} event={sampleEvent} renderer={dynamicRenderer} />
        </div>

        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <h4 class="text-sm font-semibold">Your +layout.svelte</h4>
            {#if !advancedMode}
              <span class="text-xs text-muted-foreground">Minimal mode (imports only)</span>
            {:else}
              <span class="text-xs text-muted-foreground">Advanced mode (with callbacks)</span>
            {/if}
          </div>
          <pre class="text-xs bg-muted p-4 rounded overflow-x-auto max-h-96 border border-border"><code>{generatedCode}</code></pre>
        </div>

        <div class="mt-4 p-3 border-l-2 border-primary bg-primary/5 rounded-r text-xs text-muted-foreground">
          <strong>💡 Tip:</strong> Higher priority components override lower ones. Import multiple to enable progressive enhancement!
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
