<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import UIPrimitivePageTemplate from '$lib/site/templates/UIPrimitivePageTemplate.svelte';
  import Preview from '$site-components/preview.svelte';
  import CodeBlock from '$site-components/CodeBlock.svelte';
  import * as ComponentAnatomy from '$site-components/component-anatomy';
  import Event from '$lib/registry/ui/embedded-event.svelte';

  import Basic from './examples/basic-usage/index.svelte';
  import BasicRaw from './examples/basic-usage/index.txt?raw';
  import WithClick from './examples/with-click/index.svelte';
  import WithClickRaw from './examples/with-click/index.txt?raw';

  const ndk = getContext<NDKSvelte>('ndk');

  // Mock event for anatomy visualization
  const mockReplyEvent = {
    id: 'event123',
    kind: 1,
    content: 'This is a reply',
    tags: [
      ['e', 'parent-event-id', '', 'reply'],
      ['p', 'author-pubkey']
    ]
  };

  // Page metadata
  const metadata = {
    title: 'Event',
    description: 'Headless primitives for displaying event metadata and relationships. Automatically detects and displays event relationships like replies, with support for NIP-10 reply markers.',
    importPath: 'ui/embedded-event',
    nips: ['10'],
    primitives: [
      {
        name: 'Event.ReplyIndicator',
        title: 'Event.ReplyIndicator',
        description: 'Displays a "Replying to @user" indicator when an event is a reply. Automatically detects reply relationships using NIP-10 markers and reactively fetches the parent event and user profile.',
        apiDocs: [
          { name: 'ndk', type: 'NDKSvelte', default: 'from context', description: 'NDK instance (optional, falls back to context)' },
          { name: 'event', type: 'NDKEvent', default: 'required', description: 'The event to check for reply relationship' },
          { name: 'onclick', type: '(event: NDKEvent) => void', default: 'optional', description: 'Click handler that receives the event being replied to' },
          { name: 'class', type: 'string', default: "''", description: 'Additional CSS classes' },
          { name: 'children', type: 'Snippet<[{ event: NDKEvent | null, loading: boolean }]>', default: 'optional', description: 'Custom rendering snippet receiving event and loading state' }
        ]
      }
    ],
    anatomyLayers: [
      {
        id: 'reply-indicator',
        label: 'Event.ReplyIndicator',
        description: 'Reply indicator showing who is being replied to with automatic event fetching.',
        props: ['ndk', 'event', 'onclick', 'class', 'children']
      }
    ]
  };
</script>

<svelte:head>
  <title>Event Primitives - NDK Svelte</title>
  <meta name="description" content="Headless primitives for displaying event metadata and relationships." />
</svelte:head>

<UIPrimitivePageTemplate {metadata} {ndk}>
  {#snippet topExample()}
    <Preview code={BasicRaw}>
      <Basic {ndk} />
    </Preview>
  {/snippet}

  {#snippet overview()}
    <section>
      <h2 class="text-2xl font-semibold mb-4">Overview</h2>
      <p class="text-lg leading-relaxed text-muted-foreground mb-8">
        Event primitives provide headless components for displaying event metadata and relationships.
        They automatically detect and display event relationships like replies, with support for NIP-10 reply markers.
      </p>

      <h3 class="text-xl font-semibold mt-8 mb-4">When You Need These</h3>
      <p class="leading-relaxed mb-4">
        Use Event primitives when you need to:
      </p>
      <ul class="ml-6 mb-4 list-disc space-y-2">
        <li class="leading-relaxed">Display reply relationships between events</li>
        <li class="leading-relaxed">Show "Replying to @user" indicators</li>
        <li class="leading-relaxed">Build thread views with reply context</li>
        <li class="leading-relaxed">Automatically fetch and display parent events</li>
        <li class="leading-relaxed">Handle NIP-10 reply markers correctly</li>
      </ul>
    </section>
  {/snippet}

  {#snippet anatomyPreview()}
    <ComponentAnatomy.Layer id="reply-indicator" label="Event.ReplyIndicator">
      <div class="flex items-center gap-2 p-4 border border-border rounded-lg bg-card max-w-md">
        <Event.ReplyIndicator {ndk} event={mockReplyEvent} class="text-sm text-muted-foreground" />
      </div>
    </ComponentAnatomy.Layer>
  {/snippet}

  {#snippet examples()}
    <div>
      <h3 class="text-xl font-semibold mb-3">With Click Handler</h3>
      <p class="leading-relaxed text-muted-foreground mb-4">
        Handle clicks to navigate to the event being replied to. The onclick handler receives
        the full NDKEvent object being replied to.
      </p>
      <Preview
        title="With Click Handler"
        code={WithClickRaw}
      >
        <WithClick {ndk} />
      </Preview>
    </div>

    <div>
      <h3 class="text-xl font-semibold mb-3">Reply Detection</h3>
      <p class="leading-relaxed text-muted-foreground mb-4">
        The component automatically detects reply relationships using NIP-10 markers:
      </p>
      <ol class="ml-6 mb-4 list-decimal space-y-2 text-muted-foreground">
        <li>Looks for an <code class="font-mono text-[0.9em] px-1.5 py-0.5 bg-muted rounded">e</code> tag with <code class="font-mono text-[0.9em] px-1.5 py-0.5 bg-muted rounded">reply</code> marker</li>
        <li>Falls back to <code class="font-mono text-[0.9em] px-1.5 py-0.5 bg-muted rounded">e</code> tag with <code class="font-mono text-[0.9em] px-1.5 py-0.5 bg-muted rounded">root</code> marker</li>
        <li>If only one <code class="font-mono text-[0.9em] px-1.5 py-0.5 bg-muted rounded">e</code> tag exists, treats it as a reply</li>
      </ol>
      <div class="my-4 bg-muted rounded-lg overflow-hidden">
        <CodeBlock
          lang="json"
          code={`{
  "kind": 1,
  "content": "This is a reply",
  "tags": [
    ["e", "<parent-event-id>", "<relay-url>", "reply"],
    ["p", "<author-pubkey>"]
  ]
}`}
        />
      </div>
    </div>

    <div>
      <h3 class="text-xl font-semibold mb-3">Custom Rendering</h3>
      <p class="leading-relaxed text-muted-foreground mb-4">
        Use the children snippet for complete control over how the reply indicator is rendered.
        The snippet receives the parent event and loading state.
      </p>
      <div class="my-4 bg-muted rounded-lg overflow-hidden">
        <CodeBlock
          lang="svelte"
          code={`<Event.ReplyIndicator {ndk} {event}>
  {#snippet children({ event, loading })}
    {#if loading}
      <span>Loading...</span>
    {:else if event}
      <div class="custom-reply-indicator">
        In response to {event.id.slice(0, 8)}...
        <span>{event.author.profile?.name}</span>
      </div>
    {/if}
  {/snippet}
</Event.ReplyIndicator>`}
        />
      </div>
    </div>

    <div>
      <h3 class="text-xl font-semibold mb-3">Thread Context</h3>
      <p class="leading-relaxed text-muted-foreground mb-4">
        Use reply indicators to provide thread context in your UI:
      </p>
      <div class="my-4 bg-muted rounded-lg overflow-hidden">
        <CodeBlock
          lang="svelte"
          code={`import { Event } from '$lib/registry/ui/embedded-event';
import type { NDKEvent } from '@nostr-dev-kit/ndk';

let events: NDKEvent[] = $state([...]);

{#each events as event (event.id)}
  <div class="event-card">
    <!-- Show reply context if this is a reply -->
    <Event.ReplyIndicator {ndk} {event} onclick={navigateToParent} />

    <!-- Event content -->
    <div class="content">{event.content}</div>
  </div>
{/each}`}
        />
      </div>
    </div>

    <div>
      <h3 class="text-xl font-semibold mb-3">Reactive Fetching</h3>
      <p class="leading-relaxed text-muted-foreground mb-4">
        The component automatically fetches parent events when they're not already cached.
        It shows a loading state while fetching and caches the result.
      </p>
      <div class="my-4 bg-muted rounded-lg overflow-hidden">
        <CodeBlock
          lang="svelte"
          code={`<!-- Component automatically fetches parent event -->
<Event.ReplyIndicator {ndk} {event} />

<!-- Shows loading state while fetching -->
<!-- Caches result for subsequent renders -->`}
        />
      </div>
    </div>
  {/snippet}

  {#snippet contextSection()}
    <section>
      <h2 class="text-2xl font-semibold mb-4">NIP-10 Reply Markers</h2>
      <p class="leading-relaxed text-muted-foreground mb-4">
        NIP-10 defines how to mark event relationships using tags. Event.ReplyIndicator
        follows the NIP-10 specification for detecting replies:
      </p>
      <div class="my-4 bg-muted rounded-lg overflow-hidden">
        <CodeBlock
          lang="text"
          code={`["e", <event-id>, <relay-url>, <marker>]

Markers:
- "reply"  - Direct reply to this event
- "root"   - Root event of the thread
- "mention"- Event is mentioned (not a reply)`}
        />
      </div>

      <h3 class="text-xl font-semibold mt-8 mb-4">Reply Detection Algorithm</h3>
      <p class="leading-relaxed text-muted-foreground mb-4">
        The component uses the following priority order to determine the parent event:
      </p>
      <ol class="ml-6 list-decimal space-y-2 text-muted-foreground">
        <li>First <code class="font-mono text-[0.9em] px-1.5 py-0.5 bg-muted rounded">e</code> tag with <code class="font-mono text-[0.9em] px-1.5 py-0.5 bg-muted rounded">reply</code> marker (highest priority)</li>
        <li>First <code class="font-mono text-[0.9em] px-1.5 py-0.5 bg-muted rounded">e</code> tag with <code class="font-mono text-[0.9em] px-1.5 py-0.5 bg-muted rounded">root</code> marker (if no reply marker)</li>
        <li>The only <code class="font-mono text-[0.9em] px-1.5 py-0.5 bg-muted rounded">e</code> tag (if exactly one e tag exists without markers)</li>
      </ol>

      <h3 class="text-xl font-semibold mt-8 mb-4">Event Fetching</h3>
      <p class="leading-relaxed text-muted-foreground mb-4">
        When a reply relationship is detected, the component:
      </p>
      <ul class="ml-6 list-disc space-y-2 text-muted-foreground">
        <li>Checks if the parent event is already in the NDK cache</li>
        <li>If not cached, fetches it from relays using the event ID</li>
        <li>Fetches the parent event author's profile</li>
        <li>Shows a loading state during fetch</li>
        <li>Caches results for performance</li>
      </ul>
    </section>
  {/snippet}

  {#snippet relatedComponents()}
    <section>
      <h2 class="text-2xl font-semibold mb-4">Related</h2>
      <div class="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
        <a href="/ui/user" class="flex flex-col gap-1 p-4 border border-border rounded-lg no-underline transition-all hover:border-primary hover:-translate-y-0.5">
          <strong class="font-semibold text-foreground">User Primitives</strong>
          <span class="text-sm text-muted-foreground">For displaying event authors</span>
        </a>
        <a href="/ui/event-rendering" class="flex flex-col gap-1 p-4 border border-border rounded-lg no-underline transition-all hover:border-primary hover:-translate-y-0.5">
          <strong class="font-semibold text-foreground">Event Content Primitives</strong>
          <span class="text-sm text-muted-foreground">For rendering event content</span>
        </a>
      </div>
    </section>
  {/snippet}
</UIPrimitivePageTemplate>
