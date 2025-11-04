<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { NDKEvent, NDKKind, NDKArticle } from '@nostr-dev-kit/ndk';
  import { EventContent } from '$lib/registry/ui';
  import { ArticleContent } from '$lib/registry/components/article-content';
  import { ImageContent } from '$lib/registry/components/image-content';
  import { EditProps } from '$lib/site-components/edit-props';
  import ComponentsShowcaseGrid from '$site-components/ComponentsShowcaseGrid.svelte';
  import ComponentCard from '$site-components/ComponentCard.svelte';
  import ComponentPageSectionTitle from '$site-components/ComponentPageSectionTitle.svelte';

  const ndk = getContext<NDKSvelte>('ndk');

  // Example note event
  const noteEvent = new NDKEvent(ndk, {
    kind: NDKKind.Text,
    content: 'Check out this #nostr client! 🎉\n\nMention: nostr:npub1l2vyh47mk2p0qlsku7hg0vn29faehy9hy34ygaclpn66ukqp3afqutajft\nLink: https://nostr.com',
    pubkey: 'fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52',
    created_at: Math.floor(Date.now() / 1000),
    tags: []
  } as any);

  let article = $state<NDKArticle | null>();

  $effect(() => {
    (async () => {
      try {
        const event = await ndk.fetchEvent("naddr1qvzqqqr4gupzpv3hez4ctpnahwghs5jeh2zvyrggw5s4e5p2ct0407l6v58kv87dqyvhwumn8ghj7urjv4kkjatd9ec8y6tdv9kzumn9wshsq9fdfppksd62fpm5zdrntfyywjr4ge0454zx353ujx");
        article = event ? NDKArticle.from(event) : null;
      } catch (error) {
        console.error('Failed to fetch article:', error);
      }
    })();
  });

  const noteContentData = {
    name: 'event-content-note',
    title: 'EventContent - Note (Kind:1)',
    description: 'Renders short-form text notes.',
    richDescription: 'Renders short-form text notes with automatic parsing of mentions, hashtags, links, images, videos, and custom emojis.',
    command: 'npx shadcn@latest add event-content',
    apiDocs: []
  };

  const articleContentData = {
    name: 'article-content',
    title: 'ArticleContent - Article (NIP-23)',
    description: 'Renders long-form articles.',
    richDescription: 'Renders long-form articles with markdown support, inline highlights, and text selection. Supports images, code blocks, lists, and rich formatting.',
    command: 'npx shadcn@latest add article-content',
    apiDocs: []
  };
</script>

<div class="px-8">
  <!-- Header -->
  <div class="mb-12 pt-8">
    <div class="flex items-start justify-between gap-4 mb-4">
      <h1 class="text-4xl font-bold">Content Components</h1>
      <EditProps.Button>Edit Examples</EditProps.Button>
    </div>
    <p class="text-lg text-muted-foreground mb-6">
      Understanding content rendering in NDK Components
    </p>
  </div>

  <!-- Introduction Content -->
  <section class="prose prose-lg max-w-none mb-12">
    <h2 class="text-3xl font-bold mb-4">What are Content Components?</h2>
    <p class="text-muted-foreground mb-6">
      Content components are specialized renderers that transform raw Nostr event data into rich,
      interactive displays. Unlike Card components that provide visual containers and layouts,
      Content components focus on parsing and rendering the actual content within events — handling
      markdown, mentions, hashtags, links, media embeds, and other rich content features.
    </p>

    <p class="text-muted-foreground mb-6">
      Think of Content components as the "smart readers" of the Nostr ecosystem. They understand
      the structure and semantics of different event types (notes, articles, images) and automatically
      detect special patterns like <code>nostr:npub...</code> mentions, <code>#hashtags</code>, URLs,
      and media links, transforming them into interactive elements. For example, <code>EventContent</code>
      will parse a note's text to make mentions clickable, render images inline, and format hashtags —
      all without you writing any parsing logic.
    </p>

    <h3 class="text-2xl font-bold mb-3 mt-8">Content vs Cards: When to Use Each</h3>
    <p class="text-muted-foreground mb-4">
      <strong>Use Content components when:</strong>
    </p>
    <ul class="space-y-2 text-muted-foreground mb-6">
      <li>You want to render the actual body/content of an event (text, markdown, media)</li>
      <li>You need automatic parsing of mentions, hashtags, links, and embeds</li>
      <li>You're building article readers, note viewers, or media galleries</li>
      <li>You want users to interact with content (select text, click mentions, etc.)</li>
    </ul>

    <p class="text-muted-foreground mb-4">
      <strong>Use Card components when:</strong>
    </p>
    <ul class="space-y-2 text-muted-foreground mb-6">
      <li>You want to display event metadata (author, timestamp, actions)</li>
      <li>You're building feeds, lists, or grids of events</li>
      <li>You need consistent visual "chrome" around content</li>
      <li>You want pre-built layouts for common display patterns</li>
    </ul>

    <p class="text-muted-foreground mb-8">
      Often, you'll use both together — a Card component providing the frame and metadata,
      with a Content component inside rendering the actual content. But Content components
      can also stand alone for focused reading experiences like article pages or media viewers.
    </p>
  </section>

  <!-- Available Content Components -->
  {#snippet noteContentPreview()}
    <div class="p-4 border rounded-lg">
      <EventContent {ndk} event={noteEvent} />
    </div>
  {/snippet}

  {#snippet articleContentPreview()}
    {#if article}
      <div class="p-4 border rounded-lg max-h-96 overflow-y-auto">
        <ArticleContent {ndk} {article} />
      </div>
    {/if}
  {/snippet}

  <ComponentPageSectionTitle
    title="Available Content Components"
    description="Different content renderers for various event types."
  />

  <ComponentsShowcaseGrid
    blocks={[
      {
        name: 'EventContent',
        description: 'Note (Kind:1) renderer',
        command: 'npx shadcn@latest add event-content',
        preview: noteContentPreview,
        cardData: noteContentData
      },
      ...(article ? [{
        name: 'ArticleContent',
        description: 'Article (NIP-23) renderer',
        command: 'npx shadcn@latest add article-content',
        preview: articleContentPreview,
        cardData: articleContentData
      }] : [])
    ]}
  />

  <div class="bg-muted/30 border border-border rounded-lg p-6 mb-12">
    <h3 class="text-lg font-semibold mb-3">ImageContent - Image (NIP-68)</h3>
    <p class="text-muted-foreground">
      Renders image events with optimized loading, responsive sizing, and optional metadata display.
      Visit the <a href="/components/content/image" class="text-primary hover:underline">Image Content</a> page for examples.
    </p>
  </div>

  <!-- Components Section -->
  <ComponentPageSectionTitle title="Components" description="Explore each variant in detail" />

  <section class="py-12 space-y-16">
    <ComponentCard inline data={noteContentData}>
      {#snippet preview()}
        <div class="p-4 border rounded-lg">
          <EventContent {ndk} event={noteEvent} />
        </div>
      {/snippet}
    </ComponentCard>

    {#if article}
      <ComponentCard inline data={articleContentData}>
        {#snippet preview()}
          <div class="p-4 border rounded-lg max-h-96 overflow-y-auto">
            <ArticleContent {ndk} {article} />
          </div>
        {/snippet}
      </ComponentCard>
    {/if}
  </section>

  <!-- Pro Tip -->
  <section class="mt-12 p-6 bg-blue-500/10 border border-blue-500/20 rounded-lg">
    <h3 class="text-lg font-semibold mb-2">💡 Pro Tip</h3>
    <p class="text-muted-foreground">
      All Content components support custom snippets, allowing you to override how specific
      elements (mentions, hashtags, etc.) are rendered. Check each component's documentation
      for snippet customization examples.
    </p>
  </section>
</div>

<style>
  code {
    background: hsl(var(--muted));
    padding: 0.2em 0.4em;
    border-radius: 0.25rem;
    font-size: 0.9em;
  }
</style>
