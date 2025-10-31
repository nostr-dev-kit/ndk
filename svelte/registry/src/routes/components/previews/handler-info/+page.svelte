<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { NDKEvent } from '@nostr-dev-kit/ndk';
  import { EditProps } from '$lib/components/ndk/edit-props';
  import Demo from '$site-components/Demo.svelte';

  import HandlerInfoCardExample from './examples/handler-info-card.svelte';

  const ndk = getContext<NDKSvelte>('ndk');

  let sampleEvent = $state<NDKEvent | undefined>();
</script>

<div class="container mx-auto p-8 max-w-7xl">
  <!-- Header -->
  <div class="mb-12">
    <h1 class="text-4xl font-bold mb-4">Handler Info Preview</h1>
    <p class="text-lg text-muted-foreground mb-2">
      Handler for NIP-89 Handler Information events (kind 31990). These events declare an application's
      capabilities and how it handles specific event kinds.
    </p>
    <p class="text-sm text-muted-foreground mb-6">
      <a href="/components/previews/introduction" class="text-primary hover:underline">
        ← Back to Embedded Previews
      </a>
    </p>

    <EditProps.Root>
      <EditProps.Prop
        name="Sample Handler Info (Kind 31990)"
        type="event"
        bind:value={sampleEvent}
      />
    </EditProps.Root>
  </div>

  <!-- Overview -->
  <section class="mb-12">
    <div class="p-6 border border-border rounded-lg bg-card">
      <h2 class="text-xl font-semibold mb-3">Overview</h2>
      <p class="text-sm text-muted-foreground mb-4">
        NIP-89 defines a system for discovering applications that handle specific event kinds.
        Kind 31990 events are published by applications to declare their capabilities and provide
        platform-specific handlers.
      </p>
      <div class="text-sm space-y-2">
        <div><strong>Kind:</strong> 31990</div>
        <div><strong>NIP:</strong> <a href="https://nips.nostr.com/89" class="text-primary hover:underline" target="_blank">NIP-89</a></div>
        <div><strong>Component:</strong> <code class="px-2 py-1 bg-muted rounded">HandlerInfoEmbedded</code></div>
      </div>
    </div>
  </section>

  <!-- Event Structure -->
  <section class="mb-12">
    <h2 class="text-3xl font-bold mb-4">Event Structure</h2>
    <div class="p-6 border border-border rounded-lg bg-card">
      <div class="space-y-4 text-sm">
        <div>
          <div class="font-semibold mb-1">d tag</div>
          <p class="text-muted-foreground">Random identifier for this handler</p>
        </div>
        <div>
          <div class="font-semibold mb-1">k tags</div>
          <p class="text-muted-foreground">List of supported event kinds (e.g., ["k", "30023"] for articles)</p>
        </div>
        <div>
          <div class="font-semibold mb-1">Platform tags</div>
          <p class="text-muted-foreground">URL handlers for different platforms (web, ios, android)</p>
          <code class="block p-3 bg-muted rounded text-xs font-mono mt-2">
            ["web", "https://myapp.com/event/&lt;bech32&gt;"]<br />
            ["ios", "myapp://event/&lt;bech32&gt;"]
          </code>
        </div>
        <div>
          <div class="font-semibold mb-1">Content</div>
          <p class="text-muted-foreground">JSON metadata with app information (name, about, picture, etc.)</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Features -->
  <section class="mb-12">
    <h2 class="text-3xl font-bold mb-4">Features</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="p-6 border border-border rounded-lg bg-card">
        <h3 class="text-lg font-semibold mb-3">App Metadata</h3>
        <p class="text-sm text-muted-foreground">
          Displays app name, description, and icon from the event's JSON content.
        </p>
      </div>

      <div class="p-6 border border-border rounded-lg bg-card">
        <h3 class="text-lg font-semibold mb-3">Supported Kinds</h3>
        <p class="text-sm text-muted-foreground">
          Shows all event kinds that this application can handle.
        </p>
      </div>

      <div class="p-6 border border-border rounded-lg bg-card">
        <h3 class="text-lg font-semibold mb-3">Platform Handlers</h3>
        <p class="text-sm text-muted-foreground">
          Displays URL patterns for each platform (web, iOS, Android).
        </p>
      </div>

      <div class="p-6 border border-border rounded-lg bg-card">
        <h3 class="text-lg font-semibold mb-3">Developer Info</h3>
        <p class="text-sm text-muted-foreground">
          Shows the developer/publisher through the event author.
        </p>
      </div>
    </div>
  </section>

  <!-- Visual Example -->
  <section class="mb-12">
    <h2 class="text-3xl font-bold mb-6">Visual Example</h2>

    <div class="space-y-8">
      <Demo
        title="Card Variant"
        description="Default card display for handler information events."
      >
        {#if sampleEvent}
          <HandlerInfoCardExample {ndk} event={sampleEvent} variant="card" />
        {:else}
          <div class="p-12 border border-dashed border-border rounded-lg bg-muted/20 text-center">
            <p class="text-sm text-muted-foreground">Select a sample event above to preview</p>
          </div>
        {/if}
      </Demo>
    </div>
  </section>

  <!-- Use Cases -->
  <section class="mb-12">
    <h2 class="text-3xl font-bold mb-4">Use Cases</h2>
    <div class="p-6 border border-border rounded-lg bg-card">
      <ul class="list-disc list-inside space-y-2 text-sm text-muted-foreground">
        <li>Applications advertising their capabilities to potential users</li>
        <li>Clients discovering available handlers for unknown event kinds</li>
        <li>Building an app directory based on NIP-89 events</li>
        <li>Deep linking to platform-specific apps (mobile vs web)</li>
        <li>Providing fallback handlers when encountering unknown content</li>
      </ul>
    </div>
  </section>
</div>
