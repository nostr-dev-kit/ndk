<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { NDKEvent } from '@nostr-dev-kit/ndk';
  import PageTitle from '$lib/site/components/PageTitle.svelte';
  import Preview from '$site-components/preview.svelte';

  // Import renderer components
  import MentionModern from '$lib/registry/components/mention-modern/mention-modern.svelte';
  import HashtagModern from '$lib/registry/components/hashtag-modern/hashtag-modern.svelte';
  import LinkInlineBasic from '$lib/registry/components/link-inline-basic/link-inline-basic.svelte';
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

  // Interactive toggles
  let enableMentions = $state(false);
  let enableHashtags = $state(false);
  let enableLinks = $state(false);
  let enableMedia = $state(false);
  let enableEventCards = $state(false);
  let blockNsfw = $state(true);

  // Create dynamic renderer based on toggles
  const dynamicRenderer = $derived.by(() => {
    const renderer = new ContentRenderer();

    if (enableMentions) renderer.setMentionComponent(MentionModern, 1);
    if (enableHashtags) renderer.setHashtagComponent(HashtagModern, 1);
    if (enableLinks) renderer.setLinkComponent(LinkInlineBasic, 1);
    if (enableMedia) renderer.setMediaComponent(MediaCarousel, 1);
    if (enableEventCards) renderer.addKind([1, 1111], NoteCard, 10);

    renderer.blockNsfw = blockNsfw;

    return renderer;
  });

  // Generate code based on active toggles
  const generatedCode = $derived.by(() => {
    const imports: string[] = [
      "import { setContext } from 'svelte';",
      "",
      "// Import components to auto-register with defaultContentRenderer"
    ];

    const componentImports: string[] = [];

    if (enableMentions) componentImports.push("import '$lib/registry/components/mention-modern';");
    if (enableHashtags) componentImports.push("import '$lib/registry/components/hashtag-modern';");
    if (enableLinks) componentImports.push("import '$lib/registry/components/link-embed';");
    if (enableMedia) componentImports.push("import '$lib/registry/components/media-carousel';");
    if (enableEventCards) componentImports.push("import '$lib/registry/components/note-card';");

    if (componentImports.length === 0) {
      componentImports.push("// No components selected - content will render as plain text");
    }

    imports.push(...componentImports);
    imports.push("");
    imports.push("import { CONTENT_RENDERER_CONTEXT_KEY, defaultContentRenderer } from '$lib/registry/ui/content-renderer';");
    imports.push("");
    imports.push("let { children } = $props();");

    if (!blockNsfw) {
      imports.push("");
      imports.push("// Configure NSFW blocking");
      imports.push("defaultContentRenderer.blockNsfw = false;");
    }

    imports.push("");
    imports.push("// Set the default renderer in context");
    imports.push("setContext(CONTENT_RENDERER_CONTEXT_KEY, { renderer: defaultContentRenderer });");

    const scriptOpen = '<' + 'script lang="ts">';
    const scriptClose = '<' + '/script>';
    return scriptOpen + '\n' + imports.join('\n') + '\n' + scriptClose + '\n\n{@render children()}';
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

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Controls Panel -->
      <div class="space-y-6">
        <div class="p-6 border border-border rounded-lg bg-card">
          <h3 class="text-lg font-semibold mb-4">Enable Features</h3>

          <div class="space-y-4">
            <label class="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                bind:checked={enableMentions}
                class="mt-1 w-4 h-4 rounded border-input"
              />
              <div class="flex-1">
                <div class="font-medium group-hover:text-primary transition-colors">Mentions</div>
                <div class="text-sm text-muted-foreground">
                  Render <code class="text-xs bg-muted px-1 rounded">nostr:npub...</code> as interactive user profiles
                </div>
              </div>
            </label>

            <label class="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                bind:checked={enableHashtags}
                class="mt-1 w-4 h-4 rounded border-input"
              />
              <div class="flex-1">
                <div class="font-medium group-hover:text-primary transition-colors">Hashtags</div>
                <div class="text-sm text-muted-foreground">
                  Render <code class="text-xs bg-muted px-1 rounded">#hashtags</code> as clickable, styled elements
                </div>
              </div>
            </label>

            <label class="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                bind:checked={enableLinks}
                class="mt-1 w-4 h-4 rounded border-input"
              />
              <div class="flex-1">
                <div class="font-medium group-hover:text-primary transition-colors">Links</div>
                <div class="text-sm text-muted-foreground">
                  Render URLs as clickable links with optional previews
                </div>
              </div>
            </label>

            <label class="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                bind:checked={enableMedia}
                class="mt-1 w-4 h-4 rounded border-input"
              />
              <div class="flex-1">
                <div class="font-medium group-hover:text-primary transition-colors">Media</div>
                <div class="text-sm text-muted-foreground">
                  Render image and video URLs as embedded media players
                </div>
              </div>
            </label>

            <label class="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                bind:checked={enableEventCards}
                class="mt-1 w-4 h-4 rounded border-input"
              />
              <div class="flex-1">
                <div class="font-medium group-hover:text-primary transition-colors">Event Cards</div>
                <div class="text-sm text-muted-foreground">
                  Render <code class="text-xs bg-muted px-1 rounded">nostr:note...</code> as embedded event cards
                </div>
              </div>
            </label>

            <div class="pt-4 border-t border-border">
              <label class="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  bind:checked={blockNsfw}
                  class="mt-1 w-4 h-4 rounded border-input"
                />
                <div class="flex-1">
                  <div class="font-medium group-hover:text-primary transition-colors">Block NSFW</div>
                  <div class="text-sm text-muted-foreground">
                    Automatically blur NSFW content with click-to-reveal
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>

        <!-- Generated Code -->
        <div class="p-6 border border-border rounded-lg bg-card">
          <h3 class="text-lg font-semibold mb-4">Your +layout.svelte Code</h3>
          <div class="text-sm text-muted-foreground mb-4">
            Copy this into your app's layout file:
          </div>
          <pre class="text-xs bg-muted p-4 rounded overflow-x-auto max-h-96"><code>{generatedCode}</code></pre>
        </div>
      </div>

      <!-- Live Preview Panel -->
      <div class="space-y-6">
        <div class="p-6 border border-border rounded-lg bg-card">
          <h3 class="text-lg font-semibold mb-4">Live Preview</h3>
          <div class="text-sm text-muted-foreground mb-4">
            {#if !enableMentions && !enableHashtags && !enableLinks && !enableMedia && !enableEventCards}
              No features enabled - content renders as plain text
            {:else}
              Showing content with enabled features:
            {/if}
          </div>

          <div class="border border-border rounded-lg p-4 bg-background">
            <EventContent {ndk} event={sampleEvent} renderer={dynamicRenderer} />
          </div>
        </div>

        <div class="p-4 border border-border rounded-lg bg-muted/50">
          <p class="text-xs text-muted-foreground">
            <strong>💡 Pro tip:</strong> Start with basic components, then progressively enhance by importing
            advanced variants like <code>mention-modern</code> or <code>media-carousel</code>. Higher priority
            imports override lower priority ones.
          </p>
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
        </p>
        <Preview code={basicSetupCode}>
          <div class="text-sm text-muted-foreground p-4">
            This example shows the minimal setup you'd place in your <code class="text-xs bg-muted px-1 rounded">+layout.svelte</code>
          </div>
        </Preview>
      </div>

      <div>
        <h3 class="text-xl font-semibold mb-3">Full Setup</h3>
        <p class="text-muted-foreground mb-4">
          Complete configuration with modern components and event kind handlers for a rich experience.
        </p>
        <Preview code={fullSetupCode}>
          <div class="text-sm text-muted-foreground p-4">
            This example includes enhanced components like <code class="text-xs bg-muted px-1 rounded">mention-modern</code>
            and <code class="text-xs bg-muted px-1 rounded">link-embed</code> for richer interactions.
          </div>
        </Preview>
      </div>

      <div>
        <h3 class="text-xl font-semibold mb-3">Manual Configuration</h3>
        <p class="text-muted-foreground mb-4">
          Create a custom renderer instance when you need multiple renderers or special configurations.
        </p>
        <Preview code={manualSetupCode}>
          <div class="text-sm text-muted-foreground p-4">
            Use this approach when you need fine-grained control or want to create multiple renderer instances
            with different configurations.
          </div>
        </Preview>
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
