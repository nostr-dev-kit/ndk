<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import UIPrimitivePageTemplate from '$lib/site/templates/UIPrimitivePageTemplate.svelte';
  import Preview from '$site-components/preview.svelte';
  import CodeBlock from '$site-components/CodeBlock.svelte';
  import * as ComponentAnatomy from '$site-components/component-anatomy';
  import { Reaction } from '$lib/registry/ui/reaction';

  import Basic from './examples/basic-usage/index.svelte';
  import BasicRaw from './examples/basic-usage/index.txt?raw';
  import CustomEmoji from './examples/custom-emoji/index.svelte';
  import CustomEmojiRaw from './examples/custom-emoji/index.txt?raw';

  const ndk = getContext<NDKSvelte>('ndk');

  // Page metadata
  const metadata = {
    title: 'Reaction',
    description: 'Headless primitives for displaying emoji reactions. Supports both standard Unicode emojis and custom emojis from NIP-30, with automatic extraction from kind:7 reaction events and flexible sizing.',
    importPath: 'ui/reaction',
    nips: ['25', '30'],
    primitives: [
      {
        name: 'Reaction.Display',
        title: 'Reaction.Display',
        description: 'Display component for rendering emoji reactions with support for both standard Unicode emojis and custom NIP-30 emojis. Automatically extracts emoji data from kind:7 reaction events and handles proper rendering for both text-based and image-based emojis.',
        apiDocs: [
          { name: 'emoji', type: 'string', default: 'optional', description: 'Emoji character or shortcode (e.g., "❤️" or ":custom:")' },
          { name: 'url', type: 'string', default: 'optional', description: 'Custom emoji image URL (NIP-30)' },
          { name: 'shortcode', type: 'string', default: 'optional', description: 'Emoji shortcode for accessibility' },
          { name: 'event', type: 'NDKEvent', default: 'optional', description: 'Kind:7 reaction event (auto-extracts emoji data)' },
          { name: 'size', type: 'number', default: '20', description: 'Display size in pixels' },
          { name: 'class', type: 'string', default: "''", description: 'Additional CSS classes' }
        ]
      }
    ],
    anatomyLayers: [
      {
        id: 'display',
        label: 'Reaction.Display',
        description: 'Renders emoji reactions as either text (standard emojis) or images (custom NIP-30 emojis). Automatically handles sizing and accessibility.',
        props: ['emoji', 'url', 'shortcode', 'event', 'size', 'class']
      }
    ]
  };
</script>

<svelte:head>
  <title>Reaction Primitives - NDK Svelte</title>
  <meta name="description" content="Headless primitives for displaying emoji reactions with support for standard emojis and custom NIP-30 emojis." />
</svelte:head>

<UIPrimitivePageTemplate {metadata} {ndk}>
  {#snippet topExample()}
    <Preview
      title="Basic Usage"
      code={BasicRaw}
    >
      <Basic />
    </Preview>
  {/snippet}

  {#snippet overview()}
    <section>
      <h2 class="text-2xl font-semibold mb-4">Overview</h2>
      <p class="text-lg leading-relaxed text-muted-foreground mb-8">
        Reaction primitives provide a flexible way to display emoji reactions from Nostr events (kind:7, NIP-25).
        They handle both standard Unicode emojis and custom emoji images (NIP-30), automatically extracting emoji data
        from reaction events and rendering them appropriately.
      </p>

      <h3 class="text-xl font-semibold mt-8 mb-4">When You Need These</h3>
      <p class="leading-relaxed mb-4">
        Use Reaction primitives when you need to:
      </p>
      <ul class="ml-6 mb-4 list-disc space-y-2">
        <li class="leading-relaxed">Display emoji reactions on posts, comments, or other content</li>
        <li class="leading-relaxed">Support both standard Unicode emojis and custom emoji images</li>
        <li class="leading-relaxed">Build reaction buttons with counts and interactive states</li>
        <li class="leading-relaxed">Automatically extract and display reactions from kind:7 events</li>
        <li class="leading-relaxed">Create custom emoji pickers integrated with reaction systems</li>
      </ul>
    </section>
  {/snippet}

  {#snippet anatomyPreview()}
    <ComponentAnatomy.Layer id="display" label="Reaction.Display">
      <div class="flex items-center gap-4 p-6 border border-border rounded-lg bg-card">
        <Reaction.Display emoji="❤️" class="text-3xl" />
        <Reaction.Display emoji="🔥" class="text-3xl" />
        <Reaction.Display emoji="👍" class="text-3xl" />
        <Reaction.Display emoji="🎉" class="text-3xl" />
      </div>
    </ComponentAnatomy.Layer>
  {/snippet}

  {#snippet examples()}
    <div>
      <h3 class="text-xl font-semibold mb-3">Custom Emojis (NIP-30)</h3>
      <p class="leading-relaxed text-muted-foreground mb-4">
        Display custom emoji images using NIP-30 format. Custom emojis use URL-based images with shortcodes
        for accessibility, allowing communities to create unique reaction sets.
      </p>
      <Preview
        title="Custom Emojis (NIP-30)"
        code={CustomEmojiRaw}
      >
        <CustomEmoji />
      </Preview>
    </div>

    <div>
      <h3 class="text-xl font-semibold mb-3">From Reaction Events</h3>
      <p class="leading-relaxed text-muted-foreground mb-4">
        Automatically extract and display emoji data from kind:7 reaction events. The component reads the
        emoji content and any custom emoji tags to render the reaction correctly.
      </p>
      <div class="my-4 bg-muted rounded-lg overflow-hidden">
        <CodeBlock
          lang="svelte"
          code={`import type { NDKEvent } from '@nostr-dev-kit/ndk';

// kind:7 reaction event
const reactionEvent: NDKEvent = ...;

<Reaction.Display event={reactionEvent} class="text-2xl" />`}
        />
      </div>
    </div>

    <div>
      <h3 class="text-xl font-semibold mb-3">Sizing Control</h3>
      <p class="leading-relaxed text-muted-foreground mb-4">
        Control the display size using Tailwind text classes for standard emojis or width/height classes for custom emoji images.
      </p>
      <div class="my-4 bg-muted rounded-lg overflow-hidden">
        <CodeBlock
          lang="svelte"
          code={`<!-- Standard emojis with text sizing -->
<Reaction.Display emoji="💜" class="text-base" />  <!-- Small -->
<Reaction.Display emoji="💜" class="text-xl" />    <!-- Default -->
<Reaction.Display emoji="💜" class="text-2xl" />   <!-- Medium -->
<Reaction.Display emoji="💜" class="text-3xl" />   <!-- Large -->

<!-- Custom emojis with width/height -->
<Reaction.Display url="..." class="w-4 h-4" />  <!-- Small -->
<Reaction.Display url="..." class="w-8 h-8" />  <!-- Large -->`}
        />
      </div>
    </div>

    <div>
      <h3 class="text-xl font-semibold mb-3">Reaction Lists Pattern</h3>
      <p class="leading-relaxed text-muted-foreground mb-4">
        Common pattern for displaying multiple reactions with counts and interactive states.
      </p>
      <div class="my-4 bg-muted rounded-lg overflow-hidden">
        <CodeBlock
          lang="svelte"
          code={`import type { NDKEvent } from '@nostr-dev-kit/ndk';

interface ReactionGroup {
  emoji: string;
  url?: string;
  shortcode?: string;
  count: number;
  reacted: boolean;
}

let reactions: ReactionGroup[] = $state([...]);

{#each reactions as reaction}
  <button
    class:reacted={reaction.reacted}
    onclick={() => handleReaction(reaction.emoji)}
  >
    <Reaction.Display
      emoji={reaction.emoji}
      url={reaction.url}
      shortcode={reaction.shortcode}
      size={20}
    />
    <span>{reaction.count}</span>
  </button>
{/each}`}
        />
      </div>
    </div>
  {/snippet}

  {#snippet contextSection()}
    <section>
      <h2 class="text-2xl font-semibold mb-4">Event Tag Format</h2>
      <p class="leading-relaxed text-muted-foreground mb-4">
        For kind:7 reaction events with custom emojis, use the following tag format:
      </p>
      <div class="my-4 bg-muted rounded-lg overflow-hidden">
        <CodeBlock
          lang="json"
          code={`{
  "kind": 7,
  "content": ":party:",
  "tags": [
    ["emoji", "party", "https://example.com/party.gif"],
    ["e", "<reacted-event-id>"],
    ["p", "<author-pubkey>"]
  ]
}`}
        />
      </div>
      <p class="leading-relaxed text-muted-foreground mt-4">
        The component automatically extracts emoji content from <code class="font-mono text-[0.9em] px-1.5 py-0.5 bg-muted rounded">event.content</code>
        and custom emoji data from <code class="font-mono text-[0.9em] px-1.5 py-0.5 bg-muted rounded">["emoji", "&lt;shortcode&gt;", "&lt;url&gt;"]</code> tags.
        Custom emojis are displayed as images with the shortcode used as alt text for accessibility.
      </p>
    </section>
  {/snippet}

  {#snippet relatedComponents()}
    <section>
      <h2 class="text-2xl font-semibold mb-4">Related</h2>
      <div class="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
        <a href="/components/emoji-picker" class="flex flex-col gap-1 p-4 border border-border rounded-lg no-underline transition-all hover:border-primary hover:-translate-y-0.5">
          <strong class="font-semibold text-foreground">Emoji Picker Component</strong>
          <span class="text-sm text-muted-foreground">For selecting emojis to react with</span>
        </a>
        <a href="/components/reaction" class="flex flex-col gap-1 p-4 border border-border rounded-lg no-underline transition-all hover:border-primary hover:-translate-y-0.5">
          <strong class="font-semibold text-foreground">Reaction Components</strong>
          <span class="text-sm text-muted-foreground">Pre-built reaction UI components</span>
        </a>
      </div>
    </section>
  {/snippet}
</UIPrimitivePageTemplate>
