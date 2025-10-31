<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { NDKEvent } from '@nostr-dev-kit/ndk';
  import { EditProps } from '$lib/registry/components/edit-props';
  import Demo from '$site-components/Demo.svelte';

  import AppRecommendationCardExample from './examples/app-recommendation-card.svelte';

  const ndk = getContext<NDKSvelte>('ndk');

  let sampleEvent = $state<NDKEvent | undefined>();
</script>

<div class="container mx-auto p-8 max-w-7xl">
  <!-- Header -->
  <div class="mb-12">
    <h1 class="text-4xl font-bold mb-4">App Recommendation Preview</h1>
    <p class="text-lg text-muted-foreground mb-2">
      Handler for NIP-89 App Recommendation events (kind 31989). These events recommend applications
      that can handle specific event kinds.
    </p>
    <p class="text-sm text-muted-foreground mb-6">
      <a href="/components/previews/introduction" class="text-primary hover:underline">
        ← Back to Embedded Previews
      </a>
    </p>

    <EditProps.Root>
      <EditProps.Prop
        name="Sample App Recommendation (Kind 31989)"
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
        Kind 31989 events allow users to recommend handler applications for specific event kinds.
      </p>
      <div class="text-sm space-y-2">
        <div><strong>Kind:</strong> 31989</div>
        <div><strong>NIP:</strong> <a href="https://nips.nostr.com/89" class="text-primary hover:underline" target="_blank">NIP-89</a></div>
        <div><strong>Component:</strong> <code class="px-2 py-1 bg-muted rounded">AppRecommendationEmbedded</code></div>
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
          <p class="text-muted-foreground">Specifies the event kind being recommended (e.g., "30023" for articles)</p>
        </div>
        <div>
          <div class="font-semibold mb-1">a tags</div>
          <p class="text-muted-foreground">References to handler applications (kind 31990 events) with optional relay hints and platform information</p>
        </div>
        <div>
          <div class="font-semibold mb-1">Format</div>
          <code class="block p-3 bg-muted rounded text-xs font-mono mt-2">
            ["a", "&lt;kind:pubkey:d-identifier&gt;", "&lt;relay-url&gt;", "web"]
          </code>
        </div>
      </div>
    </div>
  </section>

  <!-- Features -->
  <section class="mb-12">
    <h2 class="text-3xl font-bold mb-4">Features</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="p-6 border border-border rounded-lg bg-card">
        <h3 class="text-lg font-semibold mb-3">Kind Discovery</h3>
        <p class="text-sm text-muted-foreground">
          Shows which event kind the recommendation is for, helping users understand which apps to use.
        </p>
      </div>

      <div class="p-6 border border-border rounded-lg bg-card">
        <h3 class="text-lg font-semibold mb-3">Handler List</h3>
        <p class="text-sm text-muted-foreground">
          Displays all recommended applications with their addresses and relay hints.
        </p>
      </div>

      <div class="p-6 border border-border rounded-lg bg-card">
        <h3 class="text-lg font-semibold mb-3">Platform Badges</h3>
        <p class="text-sm text-muted-foreground">
          Shows platform-specific handlers (web, iOS, Android) with visual badges.
        </p>
      </div>

      <div class="p-6 border border-border rounded-lg bg-card">
        <h3 class="text-lg font-semibold mb-3">User Context</h3>
        <p class="text-sm text-muted-foreground">
          Shows the author making the recommendation, adding trust signals.
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
        description="Default card display for app recommendation events."
      >
        {#if sampleEvent}
          <AppRecommendationCardExample {ndk} event={sampleEvent} variant="card" />
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
        <li>Users sharing their preferred apps for viewing specific content types</li>
        <li>Clients discovering which applications their network recommends</li>
        <li>Building recommendation feeds based on follows</li>
        <li>Platform-specific app discovery (iOS vs web vs Android)</li>
      </ul>
    </div>
  </section>
</div>
