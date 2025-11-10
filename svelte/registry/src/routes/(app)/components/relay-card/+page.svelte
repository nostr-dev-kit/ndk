<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import ComponentPageTemplate from '$lib/site/templates/ComponentPageTemplate.svelte';
  import { EditProps } from '$lib/site/components/edit-props';
  import type { ShowcaseComponent } from '$lib/site/templates/types';

  // Import components
  import RelayCardPortrait from '$lib/registry/components/relay-card-portrait/relay-card-portrait.svelte';
  import RelayCardCompact from '$lib/registry/components/relay-card-compact/relay-card-compact.svelte';
  import RelayCardList from '$lib/registry/components/relay-card/relay-card-list.svelte';

  // Import example components
  import PortraitExampleRaw from './examples/portrait/index.txt?raw';
  import CompactExampleRaw from './examples/compact/index.txt?raw';
  import ListExampleRaw from './examples/list/index.txt?raw';

  // UI primitive examples
  import BasicExample from './examples/primitives-basic/index.svelte';
  import BuilderUsageExample from './examples/builder-usage/index.svelte';

  // Import registry metadata
  import relayCardPortraitCard from '$lib/registry/components/relay-card-portrait/metadata.json';
  import relayCardCompactCard from '$lib/registry/components/relay-card-compact/metadata.json';
  import relayCardListCard from '$lib/registry/components/relay-card/metadata.json';

  // Page metadata
  const metadata = {
    title: 'Relay Cards',
    description: 'Relay card components for displaying relay information'
  };

  const ndk = getContext<NDKSvelte>('ndk');

  let exampleRelay = $state<string>('wss://relay.damus.io');

  // Sample relays for blocks - customizable via EditProps
  let relay1 = $state<string>('wss://relay.damus.io');
  let relay2 = $state<string>('wss://f7z.io');
  let relay3 = $state<string>('wss://140.f7z.io');
  let relay4 = $state<string>('wss://relay.dergigi.com');
  let relay5 = $state<string>('wss://nostr.wine');

  const displayRelays = $derived([relay1, relay2, relay3, relay4, relay5].filter(Boolean));

  // Components section configuration
  const componentsSection = {
    title: 'Components',
    description: 'Explore each variant in detail',
    cards: [
      {...relayCardPortraitCard, code: PortraitExampleRaw},
      {...relayCardCompactCard, code: CompactExampleRaw},
      {...relayCardListCard, code: ListExampleRaw}
    ],
    previews: {
      'relay-portrait': portraitComponentPreview,
      'relay-compact': compactComponentPreview,
      'relay-card-list': listComponentPreview
    }
  };

  const showcaseComponents: ShowcaseComponent[] = [
    {
      id: "relayCardPortraitCard",
      cardData: relayCardPortraitCard,
      preview: portraitPreview,
      orientation: 'horizontal'
    },
    {
      id: "relayCardCompactCard",
      cardData: relayCardCompactCard,
      preview: compactPreview,
      orientation: 'horizontal'
    },
    {
      id: "relayCardListCard",
      cardData: relayCardListCard,
      preview: listPreview,
      orientation: 'vertical'
    }
  ];
</script>

<!-- Preview snippets -->
{#snippet portraitPreview()}
  <div class="flex gap-6 pb-4 w-full">
    {#each displayRelays as relayUrl (relayUrl)}
      <RelayCardPortrait {ndk} {relayUrl} class="flex-none" />
    {/each}
  </div>
{/snippet}

{#snippet compactPreview()}
  <div class="flex gap-4 pb-4">
    {#each displayRelays as relayUrl (relayUrl)}
      <RelayCardCompact {ndk} {relayUrl} class="flex-none" />
    {/each}
  </div>
{/snippet}

{#snippet listPreview()}
  <div class="space-y-4 max-h-[300px]">
    <div>
      <h3 class="text-sm font-semibold mb-2">Default</h3>
      <div class="space-y-0 border border-border rounded-lg overflow-hidden">
        {#each displayRelays.slice(0, 4) as relayUrl (relayUrl)}
          <RelayCardList {ndk} {relayUrl} />
        {/each}
      </div>
    </div>
    <div>
      <h3 class="text-sm font-semibold mb-2">Compact</h3>
      <div class="space-y-0 border border-border rounded-lg overflow-hidden">
        {#each displayRelays.slice(0, 4) as relayUrl (relayUrl)}
          <RelayCardList {ndk} {relayUrl} compact />
        {/each}
      </div>
    </div>
  </div>
{/snippet}

<!-- Component preview snippets for componentsSection -->
{#snippet portraitComponentPreview()}
  {@render portraitPreview()}
{/snippet}

{#snippet compactComponentPreview()}
  {@render compactPreview()}
{/snippet}

{#snippet listComponentPreview()}
  {@render listPreview()}
{/snippet}

<!-- Overview section -->
{#snippet overview()}
  <div class="text-lg text-muted-foreground space-y-4">
    <p>
      Relay Cards display Nostr relay information with NIP-11 metadata fetching. Choose from portrait cards for featured relays, compact cards for dense layouts, or list items for relay browsers and settings interfaces.
    </p>

    <p>
      All cards automatically fetch and display relay information documents (NIP-11) including relay name, description, supported NIPs, and software version. They support bookmark functionality through the createBookmarkedRelayList builder for tracking user-saved relays.
    </p>

    <p>
      Built with composable Relay primitives (Relay.Root, Relay.Name, Relay.Description, etc.) for creating custom relay display layouts.
    </p>
  </div>
{/snippet}

<!-- Anatomy section (UI Primitives examples) -->
{#snippet anatomy()}
  <div class="space-y-8">
    <div>
      <h3 class="text-xl font-semibold mb-3">Basic Composition</h3>
      <p class="text-muted-foreground mb-4">Build custom relay cards using Relay primitives</p>
      <BasicExample {ndk} relayUrl={exampleRelay} />
    </div>

    <div>
      <h3 class="text-xl font-semibold mb-3">With Builder</h3>
      <p class="text-muted-foreground mb-4">Using createBookmarkedRelayList for bookmark tracking</p>
      <BuilderUsageExample {ndk} />
    </div>
  </div>
{/snippet}

<!-- Recipes section (Builder API) -->
{#snippet recipes()}
  <section class="mt-16">
    <h2 class="text-3xl font-bold mb-4">Builder API</h2>

    <div class="space-y-6">
      <div class="border border-border rounded-lg p-6">
        <h3 class="text-xl font-semibold mb-3">createBookmarkedRelayList</h3>
        <p class="text-muted-foreground mb-4">
          Creates a reactive store that tracks relays bookmarked by a set of users. Returns a
          <code class="text-sm bg-muted px-2 py-1 rounded">BookmarkedRelayListState</code> with sorted
          relay list and bookmark counts.
        </p>

        <div class="bg-muted p-4 rounded-lg mb-4">
          <code class="text-sm">
            createBookmarkedRelayList(
            <br />
            &nbsp;&nbsp;options: () => {'{'} authors: string[], includeCurrentUser?: boolean {'}'},
            <br />
            &nbsp;&nbsp;ndk: NDKSvelte
            <br />
            ): BookmarkedRelayListState
          </code>
        </div>

        <div class="space-y-3">
          <div>
            <h4 class="text-sm font-semibold mb-1">Parameters</h4>
            <ul class="space-y-2 text-sm text-muted-foreground">
              <li>
                <code class="bg-muted px-2 py-1 rounded">options</code> - Function returning configuration
                object:
                <ul class="ml-4 mt-1 space-y-1">
                  <li>
                    <code class="bg-muted px-1 py-0.5 rounded">authors</code>: Array of pubkeys to track
                  </li>
                  <li>
                    <code class="bg-muted px-1 py-0.5 rounded">includeCurrentUser</code>: Include
                    current user's bookmarks (enables toggle)
                  </li>
                </ul>
              </li>
              <li>
                <code class="bg-muted px-2 py-1 rounded">ndk</code> - NDK instance
              </li>
            </ul>
          </div>

          <div>
            <h4 class="text-sm font-semibold mb-1">Returns</h4>
            <div class="text-sm text-muted-foreground">
              <code class="bg-muted px-2 py-1 rounded">BookmarkedRelayListState</code> with:
              <ul class="ml-4 mt-1 space-y-1">
                <li>
                  <code class="bg-muted px-1 py-0.5 rounded">relays</code>: Array of {'{'}url: string,
                  count: number{'}'} sorted by count
                </li>
                <li>
                  <code class="bg-muted px-1 py-0.5 rounded">loading</code>: Boolean loading state
                </li>
                <li>
                  <code class="bg-muted px-1 py-0.5 rounded">toggle(relay)</code>: Function to
                  bookmark/unbookmark relay
                </li>
              </ul>
            </div>
          </div>

          <div>
            <h4 class="text-sm font-semibold mb-1">Example</h4>
            <div class="bg-muted p-3 rounded-lg">
              <code class="text-sm">
                const bookmarks = createBookmarkedRelayList(
                <br />
                &nbsp;&nbsp;() => ({'{'} authors: followPubkeys, includeCurrentUser: true {'}'}),
                <br />
                &nbsp;&nbsp;ndk
                <br />
                );
              </code>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
{/snippet}

<ComponentPageTemplate
  {metadata}
  {ndk}
  {overview}
  {showcaseComponents}
  {componentsSection}
  {anatomy}
  {recipes}
>
    <EditProps.Prop name="Example Relay" type="text" bind:value={exampleRelay} />
    <EditProps.Prop name="Relay 1" type="text" bind:value={relay1} />
    <EditProps.Prop name="Relay 2" type="text" bind:value={relay2} />
    <EditProps.Prop name="Relay 3" type="text" bind:value={relay3} />
    <EditProps.Prop name="Relay 4" type="text" bind:value={relay4} />
    <EditProps.Prop name="Relay 5" type="text" bind:value={relay5} />
  </ComponentPageTemplate>
