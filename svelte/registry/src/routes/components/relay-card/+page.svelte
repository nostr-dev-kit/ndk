<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import ComponentPageTemplate from '$lib/templates/ComponentPageTemplate.svelte';
  import ComponentsShowcase from '$site-components/ComponentsShowcase.svelte';
  import ComponentPageSectionTitle from '$site-components/ComponentPageSectionTitle.svelte';
  import ComponentCard from '$site-components/ComponentCard.svelte';
  import { relayCardMetadata } from '$lib/component-registry/relay-card';
  import type { ShowcaseBlock } from '$lib/templates/types';
  import { EditProps } from '$lib/site-components/edit-props';

  import RelayCardPortrait from '$lib/registry/components/relay-card/relay-card-portrait.svelte';
  import RelayCardCompact from '$lib/registry/components/relay-card/relay-card-compact.svelte';
  import RelayCardList from '$lib/registry/components/relay-card/relay-card-list.svelte';

  // UI component examples
  import BasicExample from './examples/basic.example.svelte';
  import BuilderUsageExample from './examples/builder-usage.example.svelte';

  const ndk = getContext<NDKSvelte>('ndk');

  let exampleRelay = $state<string>('wss://relay.damus.io');

  // Sample relays for blocks - customizable via EditProps
  let relay1 = $state<string>('wss://relay.damus.io');
  let relay2 = $state<string>('wss://f7z.io');
  let relay3 = $state<string>('wss://140.f7z.io');
  let relay4 = $state<string>('wss://relay.dergigi.com');
  let relay5 = $state<string>('wss://nostr.wine');

  const displayRelays = $derived([relay1, relay2, relay3, relay4, relay5].filter(Boolean));

  // Blocks showcase blocks
  const showcaseBlocks: ShowcaseBlock[] = [
    {
      name: 'Portrait',
      description: 'Vertical card with icon on top',
      command: 'npx shadcn@latest add relay-card-portrait',
      preview: portraitPreview,
      cardData: relayCardMetadata.cards[0]
    },
    {
      name: 'Compact',
      description: 'Small square card',
      command: 'npx shadcn@latest add relay-card-compact',
      preview: compactPreview,
      cardData: relayCardMetadata.cards[1]
    },
    {
      name: 'List',
      description: 'Horizontal list layout',
      command: 'npx shadcn@latest add relay-card-list',
      preview: listPreview,
      cardData: relayCardMetadata.cards[2]
    }
  ];
</script>

<!-- Preview snippets for blocks -->
{#snippet portraitPreview()}
  <div class="flex gap-6 overflow-x-auto pb-4">
    {#each displayRelays as relayUrl (relayUrl)}
      <RelayCardPortrait {ndk} {relayUrl} class="flex-none" />
    {/each}
  </div>
{/snippet}

{#snippet compactPreview()}
  <div class="flex gap-4 overflow-x-auto pb-4">
    {#each displayRelays as relayUrl (relayUrl)}
      <RelayCardCompact {ndk} {relayUrl} />
    {/each}
  </div>
{/snippet}

{#snippet listPreview()}
  <div class="space-y-4">
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

<!-- EditProps snippet -->
<!-- Component previews for blocks -->
{#snippet portraitComponentPreview()}
  <div class="flex gap-6 overflow-x-auto pb-4">
    {#each displayRelays as relayUrl (relayUrl)}
      <RelayCardPortrait {ndk} {relayUrl} class="flex-none" />
    {/each}
  </div>
{/snippet}

{#snippet compactComponentPreview()}
  <div class="flex gap-4 overflow-x-auto pb-4">
    {#each displayRelays as relayUrl (relayUrl)}
      <RelayCardCompact {ndk} {relayUrl} />
    {/each}
  </div>
{/snippet}

{#snippet listComponentPreview()}
  <div class="space-y-4">
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

<!-- UI Primitives section -->
{#snippet afterComponents()}
  <ComponentPageSectionTitle title="UI Primitives" description="Primitive components for building custom relay card layouts" />

  <section class="py-12 space-y-16">
    <ComponentCard data={relayCardMetadata.cards[3]}>
      {#snippet preview()}
        <BasicExample {ndk} relayUrl={exampleRelay} />
      {/snippet}
    </ComponentCard>

    <ComponentCard data={relayCardMetadata.cards[4]}>
      {#snippet preview()}
        <BuilderUsageExample {ndk} />
      {/snippet}
    </ComponentCard>
  </section>
{/snippet}

<!-- Builder API section -->
{#snippet customSections()}
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
  metadata={relayCardMetadata}
  {ndk}
  showcaseComponent={ComponentsShowcase}
  {showcaseBlocks}componentsSection={{
    cards: relayCardMetadata.cards.slice(0, 3),
    previews: {
      'relay-card-portrait': portraitComponentPreview,
      'relay-card-compact': compactComponentPreview,
      'relay-card-list': listComponentPreview
    }
  }}
  {afterComponents}
  apiDocs={relayCardMetadata.apiDocs}
  {customSections}
>
    <EditProps.Prop name="Example Relay" type="text" bind:value={exampleRelay} />
    <EditProps.Prop name="Relay 1" type="text" bind:value={relay1} />
    <EditProps.Prop name="Relay 2" type="text" bind:value={relay2} />
    <EditProps.Prop name="Relay 3" type="text" bind:value={relay3} />
    <EditProps.Prop name="Relay 4" type="text" bind:value={relay4} />
    <EditProps.Prop name="Relay 5" type="text" bind:value={relay5} />
  </ComponentPageTemplate>
