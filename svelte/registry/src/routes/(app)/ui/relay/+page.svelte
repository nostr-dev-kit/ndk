<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import UIPrimitivePageTemplate from '$lib/site/templates/UIPrimitivePageTemplate.svelte';
  import Preview from '$site-components/Demo.svelte';
  import CodeBlock from '$site-components/CodeBlock.svelte';
  import * as ComponentAnatomy from '$site-components/component-anatomy';
  import { Relay } from '$lib/registry/ui/relay';

  import Basic from './examples/basic-usage/index.svelte';
  import BasicRaw from './examples/basic-usage/index.txt?raw';
  import FullCard from './examples/full-card/index.svelte';
  import FullCardRaw from './examples/full-card/index.txt?raw';

  const ndk = getContext<NDKSvelte>('ndk');

  // Mock relay URL for anatomy visualization
  const mockRelayUrl = 'wss://relay.damus.io';

  // Page metadata
  const metadata = {
    title: 'Relay',
    description: 'Headless, composable primitives for displaying relay information (NIP-11), connection status, and bookmark functionality (NIP-65).',
    importPath: 'ui/relay',
    nips: ['11', '65'],
    primitives: [
      {
        name: 'Relay.Root',
        title: 'Relay.Root',
        description: 'Context provider that fetches NIP-11 metadata and provides it to child components. Required wrapper for all Relay primitives.',
        apiDocs: [
          { name: 'ndk', type: 'NDKSvelte', default: 'from context', description: 'NDK instance' },
          { name: 'relayUrl', type: 'string', default: 'required', description: 'Relay WebSocket URL (wss://...)' },
          { name: 'class', type: 'string', default: "''", description: 'Additional CSS classes' },
          { name: 'children', type: 'Snippet', default: 'required', description: 'Child components' }
        ]
      },
      {
        name: 'Relay.Icon',
        title: 'Relay.Icon',
        description: 'Displays the relay icon from NIP-11 metadata. Shows fallback icon if not available.',
        apiDocs: [
          { name: 'class', type: 'string', default: "''", description: 'Additional CSS classes' },
          { name: 'fallback', type: 'string', default: 'undefined', description: 'Fallback icon URL when relay has no icon' }
        ]
      },
      {
        name: 'Relay.Name',
        title: 'Relay.Name',
        description: 'Displays the relay name from NIP-11 metadata.',
        apiDocs: [
          { name: 'class', type: 'string', default: "''", description: 'Additional CSS classes' }
        ]
      },
      {
        name: 'Relay.Url',
        title: 'Relay.Url',
        description: 'Displays the relay WebSocket URL.',
        apiDocs: [
          { name: 'class', type: 'string', default: "''", description: 'Additional CSS classes' }
        ]
      },
      {
        name: 'Relay.Description',
        title: 'Relay.Description',
        description: 'Displays the relay description from NIP-11 metadata.',
        apiDocs: [
          { name: 'class', type: 'string', default: "''", description: 'Additional CSS classes' }
        ]
      },
      {
        name: 'Relay.ConnectionStatus',
        title: 'Relay.ConnectionStatus',
        description: 'Shows live connection status (connected, connecting, disconnected). Updates in real-time as connection status changes.',
        apiDocs: [
          { name: 'showLabel', type: 'boolean', default: 'false', description: 'Show text label with status (e.g., "Connected", "Disconnected")' },
          { name: 'class', type: 'string', default: "''", description: 'Additional CSS classes' }
        ]
      },
      {
        name: 'Relay.BookmarkButton',
        title: 'Relay.BookmarkButton',
        description: 'Toggle bookmark status for the relay. Uses NIP-65 relay lists to add/remove bookmarks.',
        apiDocs: [
          { name: 'bookmarks', type: 'BookmarkedRelayList', default: 'undefined', description: 'Bookmarked relay list builder instance' },
          { name: 'class', type: 'string', default: "''", description: 'Additional CSS classes' }
        ]
      },
      {
        name: 'Relay.BookmarkedBy',
        title: 'Relay.BookmarkedBy',
        description: 'Display list of users who bookmarked this relay. Shows user avatars and counts.',
        apiDocs: [
          { name: 'bookmarks', type: 'BookmarkedRelayList', default: 'required', description: 'Bookmarked relay list builder instance' },
          { name: 'class', type: 'string', default: "''", description: 'Additional CSS classes' }
        ]
      },
      {
        name: 'Relay.Input',
        title: 'Relay.Input',
        description: 'Input field for relay URLs with NIP-11 autocomplete. Validates URL format and fetches relay info.',
        apiDocs: [
          { name: 'ndk', type: 'NDKSvelte', default: 'from context', description: 'NDK instance' },
          { name: 'value', type: 'string', default: "''", description: 'Bound input value (relay URL)' },
          { name: 'placeholder', type: 'string', default: "'wss://...'", description: 'Input placeholder text' },
          { name: 'class', type: 'string', default: "''", description: 'Additional CSS classes' }
        ]
      }
    ],
    anatomyLayers: [
      {
        id: 'root',
        label: 'Relay.Root',
        description: 'Container that fetches and provides relay metadata.',
        props: ['ndk', 'relayUrl', 'class']
      },
      {
        id: 'icon',
        label: 'Relay.Icon',
        description: 'Relay icon from NIP-11.',
        props: ['class', 'fallback']
      },
      {
        id: 'name',
        label: 'Relay.Name',
        description: 'Relay name text.',
        props: ['class']
      },
      {
        id: 'url',
        label: 'Relay.Url',
        description: 'Relay WebSocket URL.',
        props: ['class']
      },
      {
        id: 'description',
        label: 'Relay.Description',
        description: 'Relay description text.',
        props: ['class']
      },
      {
        id: 'connection-status',
        label: 'Relay.ConnectionStatus',
        description: 'Live connection status indicator.',
        props: ['showLabel', 'class']
      },
      {
        id: 'bookmark-button',
        label: 'Relay.BookmarkButton',
        description: 'Bookmark toggle button (NIP-65).',
        props: ['bookmarks', 'class']
      },
      {
        id: 'bookmarked-by',
        label: 'Relay.BookmarkedBy',
        description: 'List of users who bookmarked this relay.',
        props: ['bookmarks', 'class']
      },
      {
        id: 'input',
        label: 'Relay.Input',
        description: 'URL input with autocomplete.',
        props: ['ndk', 'value', 'placeholder', 'class']
      }
    ]
  };
</script>

<svelte:head>
  <title>Relay Primitives - NDK Svelte</title>
  <meta name="description" content="Headless, composable primitives for displaying relay information and controls." />
</svelte:head>

<UIPrimitivePageTemplate {metadata} {ndk}>
  {#snippet topExample()}
    <Preview code={BasicRaw}>
      <Basic />
    </Preview>
  {/snippet}

  {#snippet overview()}
    <section>
      <h2 class="text-2xl font-semibold mb-4">Overview</h2>
      <p class="text-lg leading-relaxed text-muted-foreground mb-8">
        Relay primitives provide headless components for displaying relay information, connection status,
        and bookmark functionality. They automatically fetch NIP-11 metadata and support NIP-65 relay bookmarks.
      </p>

      <h3 class="text-xl font-semibold mt-8 mb-4">When You Need These</h3>
      <p class="leading-relaxed mb-4">
        Use Relay primitives when you need to:
      </p>
      <ul class="ml-6 mb-4 list-disc space-y-2">
        <li class="leading-relaxed">Display relay information and metadata</li>
        <li class="leading-relaxed">Show connection status with live updates</li>
        <li class="leading-relaxed">Build relay directories or browsers</li>
        <li class="leading-relaxed">Create bookmark/favorite relay lists (NIP-65)</li>
        <li class="leading-relaxed">Build relay selection interfaces</li>
      </ul>
      <p class="leading-relaxed mt-4 text-muted-foreground">
        Includes a Relay.Selector namespace for building relay selection dropdowns and pickers.
      </p>
    </section>
  {/snippet}

  {#snippet anatomyPreview()}
    <Relay.Root {ndk} relayUrl={mockRelayUrl}>
      <ComponentAnatomy.Layer id="root" label="Relay.Root">
        <div class="border border-border rounded-lg p-6 bg-card max-w-lg space-y-4">
          <div class="flex items-center gap-3">
            <ComponentAnatomy.Layer id="icon" label="Relay.Icon">
              <Relay.Icon class="w-12 h-12 rounded" />
            </ComponentAnatomy.Layer>
            <div class="flex-1">
              <ComponentAnatomy.Layer id="name" label="Relay.Name">
                <Relay.Name class="font-semibold text-lg" />
              </ComponentAnatomy.Layer>
              <ComponentAnatomy.Layer id="url" label="Relay.Url">
                <Relay.Url class="text-xs text-muted-foreground" />
              </ComponentAnatomy.Layer>
            </div>
            <ComponentAnatomy.Layer id="connection-status" label="Relay.ConnectionStatus">
              <Relay.ConnectionStatus showLabel={true} class="text-sm" />
            </ComponentAnatomy.Layer>
          </div>
          <ComponentAnatomy.Layer id="description" label="Relay.Description">
            <Relay.Description class="text-sm text-muted-foreground" />
          </ComponentAnatomy.Layer>
          <ComponentAnatomy.Layer id="bookmark-button" label="Relay.BookmarkButton">
            <Relay.BookmarkButton class="px-4 py-2 border border-border rounded" />
          </ComponentAnatomy.Layer>
        </div>
      </ComponentAnatomy.Layer>
    </Relay.Root>
  {/snippet}

  {#snippet examples()}
    <div>
      <h3 class="text-xl font-semibold mb-3">Full Relay Card</h3>
      <p class="leading-relaxed text-muted-foreground mb-4">
        Compose all primitives together to create a complete relay information card with icon,
        name, description, connection status, and bookmark button.
      </p>
      <Preview
        title="Full Relay Card"
        description="Complete relay card with all metadata and controls."
        code={FullCardRaw}
      >
        <FullCard />
      </Preview>
    </div>

    <div>
      <h3 class="text-xl font-semibold mb-3">Relay Selector</h3>
      <p class="leading-relaxed text-muted-foreground mb-4">
        Use the Relay.Selector namespace to build relay selection dropdowns:
      </p>
      <div class="my-4 bg-muted rounded-lg overflow-hidden">
        <CodeBlock
          lang="svelte"
          code={`import { Relay } from '$lib/registry/ui/relay';

<Relay.Selector.Root {ndk}>
  <Relay.Selector.List class="relay-dropdown">
    {#snippet item(relay)}
      <Relay.Selector.Item {relay}>
        <Relay.Root {ndk} relayUrl={relay.url}>
          <Relay.Icon class="w-6 h-6" />
          <Relay.Name />
        </Relay.Root>
      </Relay.Selector.Item>
    {/snippet}
  </Relay.Selector.List>
</Relay.Selector.Root>`}
        />
      </div>
    </div>

    <div>
      <h3 class="text-xl font-semibold mb-3">NIP-11 Metadata</h3>
      <p class="leading-relaxed text-muted-foreground mb-4">
        Relay primitives automatically fetch NIP-11 metadata from the relay's HTTP endpoint.
        The metadata includes name, description, icon, and other relay information.
      </p>
      <div class="my-4 bg-muted rounded-lg overflow-hidden">
        <CodeBlock
          lang="json"
          code={`{
  "name": "Relay Name",
  "description": "A description of this relay",
  "pubkey": "relay operator pubkey",
  "contact": "operator@example.com",
  "supported_nips": [1, 2, 9, 11, 15, 20],
  "software": "relay-software-name",
  "version": "1.0.0",
  "icon": "https://example.com/icon.png"
}`}
        />
      </div>
    </div>

    <div>
      <h3 class="text-xl font-semibold mb-3">NIP-65 Bookmarks</h3>
      <p class="leading-relaxed text-muted-foreground mb-4">
        Use Relay.BookmarkButton to add/remove relays from user's NIP-65 relay list:
      </p>
      <div class="my-4 bg-muted rounded-lg overflow-hidden">
        <CodeBlock
          lang="svelte"
          code={`import { createBookmarkedRelayList } from '@nostr-dev-kit/svelte';

const bookmarks = createBookmarkedRelayList(ndk);

<Relay.Root {ndk} relayUrl={relayUrl}>
  <Relay.BookmarkButton {bookmarks} />
  <Relay.BookmarkedBy {bookmarks} />
</Relay.Root>`}
        />
      </div>
    </div>

    <div>
      <h3 class="text-xl font-semibold mb-3">Connection Status</h3>
      <p class="leading-relaxed text-muted-foreground mb-4">
        Display live connection status with or without labels:
      </p>
      <div class="my-4 bg-muted rounded-lg overflow-hidden">
        <CodeBlock
          lang="svelte"
          code={`<!-- Just status indicator -->
<Relay.ConnectionStatus />

<!-- With label text -->
<Relay.ConnectionStatus showLabel={true} />

<!-- Status updates automatically as connection changes -->`}
        />
      </div>
    </div>

    <div>
      <h3 class="text-xl font-semibold mb-3">Relay Input</h3>
      <p class="leading-relaxed text-muted-foreground mb-4">
        Use Relay.Input for relay URL input with validation and autocomplete:
      </p>
      <div class="my-4 bg-muted rounded-lg overflow-hidden">
        <CodeBlock
          lang="svelte"
          code={`let relayUrl = $state('');

<Relay.Input
  {ndk}
  bind:value={relayUrl}
  placeholder="Enter relay URL (wss://...)"
  class="relay-input"
/>

{#if relayUrl}
  <Relay.Root {ndk} {relayUrl}>
    <Relay.Name />
  </Relay.Root>
{/if}`}
        />
      </div>
    </div>
  {/snippet}

  {#snippet contextSection()}
    <section>
      <h2 class="text-2xl font-semibold mb-4">NIP-11 Relay Information Document</h2>
      <p class="leading-relaxed text-muted-foreground mb-4">
        NIP-11 defines a standard way for relays to publish metadata via HTTP. Relay.Root
        automatically fetches this metadata by converting the WebSocket URL to HTTP:
      </p>
      <div class="my-4 bg-muted rounded-lg overflow-hidden">
        <CodeBlock
          lang="text"
          code={`WebSocket URL: wss://relay.example.com
HTTP Endpoint:  https://relay.example.com

Request: GET https://relay.example.com
Headers: Accept: application/nostr+json`}
        />
      </div>

      <h3 class="text-xl font-semibold mt-8 mb-4">Context Access</h3>
      <p class="leading-relaxed text-muted-foreground mb-4">
        Access relay context in custom components:
      </p>
      <div class="my-4 bg-muted rounded-lg overflow-hidden">
        <CodeBlock
          lang="typescript"
          code={`import { getContext } from 'svelte';
import { type RelayContext } from '$lib/registry/ui/relay';

const context = getContext<RelayContext>('relay');

// Available properties:
context.relayInfo  // NIP-11 metadata object
context.relayUrl   // Relay WebSocket URL
context.ndk        // NDKSvelte instance`}
        />
      </div>

      <h3 class="text-xl font-semibold mt-8 mb-4">Relay Selector Components</h3>
      <p class="leading-relaxed text-muted-foreground mb-4">
        The Relay.Selector namespace provides components for building relay selection UIs:
      </p>
      <ul class="ml-6 list-disc space-y-2 text-muted-foreground">
        <li><code class="font-mono text-[0.9em] px-1.5 py-0.5 bg-muted rounded">Relay.Selector.Root</code> - Dropdown root with relay list state management</li>
        <li><code class="font-mono text-[0.9em] px-1.5 py-0.5 bg-muted rounded">Relay.Selector.List</code> - List of selectable relays with filtering</li>
        <li><code class="font-mono text-[0.9em] px-1.5 py-0.5 bg-muted rounded">Relay.Selector.Item</code> - Individual relay list item with selection handling</li>
      </ul>
    </section>
  {/snippet}

  {#snippet relatedComponents()}
    <section>
      <h2 class="text-2xl font-semibold mb-4">Related</h2>
      <div class="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
        <a href="/components/relay-card" class="flex flex-col gap-1 p-4 border border-border rounded-lg no-underline transition-all hover:border-primary hover:-translate-y-0.5">
          <strong class="font-semibold text-foreground">Relay Card Blocks</strong>
          <span class="text-sm text-muted-foreground">Pre-styled relay card layouts</span>
        </a>
        <a href="/components/relay-input" class="flex flex-col gap-1 p-4 border border-border rounded-lg no-underline transition-all hover:border-primary hover:-translate-y-0.5">
          <strong class="font-semibold text-foreground">Relay Input Component</strong>
          <span class="text-sm text-muted-foreground">Styled relay URL input</span>
        </a>
        <a href="/components/relay-selector" class="flex flex-col gap-1 p-4 border border-border rounded-lg no-underline transition-all hover:border-primary hover:-translate-y-0.5">
          <strong class="font-semibold text-foreground">Relay Selector Component</strong>
          <span class="text-sm text-muted-foreground">Styled relay dropdown selector</span>
        </a>
      </div>
    </section>
  {/snippet}
</UIPrimitivePageTemplate>
