<script lang="ts">
  import { getContext } from 'svelte';
  import { NDKFollowPack, NDKKind } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import ComponentPageTemplate from '$lib/site/templates/ComponentPageTemplate.svelte';
  import { EditProps } from '$lib/site/components/edit-props';
  import PageTitle from '$lib/site/components/PageTitle.svelte';
  import * as ComponentAnatomy from '$site-components/component-anatomy';
  import { FollowPack } from '$lib/registry/ui/follow-pack';
  import type { ShowcaseComponent } from '$lib/site/templates/types';

  // Import components
  import FollowPackPortrait from '$lib/registry/components/follow-pack/portrait/follow-pack-portrait.svelte';
  import FollowPackHero from '$lib/registry/components/follow-pack/hero/follow-pack-hero.svelte';
  import FollowPackCompact from '$lib/registry/components/follow-pack/compact/follow-pack-compact.svelte';
  import FollowPackListItem from '$lib/registry/components/follow-pack/basic/follow-pack-list-item.svelte';

  // Import code examples
  import followPackHeroCode from './examples/hero/index.txt?raw';
  import followPackPortraitCode from './examples/portrait/index.txt?raw';
  import followPackCompactCode from './examples/compact/index.txt?raw';
  import followPackListItemCode from './examples/list-item/index.txt?raw';

  // Import registry metadata
  import followPackHeroCard from '$lib/registry/components/follow-pack/hero/metadata.json';
  import followPackPortraitCard from '$lib/registry/components/follow-pack/portrait/metadata.json';
  import followPackCompactCard from '$lib/registry/components/follow-pack/compact/metadata.json';
  import followPackListItemCard from '$lib/registry/components/follow-pack/basic/metadata.json';

  // Page metadata
  const metadata = {
    title: 'Follow Packs',
    description: 'Follow pack components for curated user collections'
  };

  const ndk = getContext<NDKSvelte>('ndk');

  let followPacks = $state<NDKFollowPack[]>([]);
  let pack1 = $state<NDKFollowPack | undefined>();
  let pack2 = $state<NDKFollowPack | undefined>();
  let pack3 = $state<NDKFollowPack | undefined>();
  let pack4 = $state<NDKFollowPack | undefined>();
  let pack5 = $state<NDKFollowPack | undefined>();

  $effect(() => {
    (async () => {
      const fetched = await ndk.fetchEvents({
        kinds: [NDKKind.FollowPack],
        limit: 10
      });
      const packs = Array.from(fetched).map((e) => NDKFollowPack.from(e));
      followPacks = packs;

      if (packs.length > 0) {
        if (!pack1) pack1 = packs[0];
        if (!pack2 && packs.length > 1) pack2 = packs[1];
        if (!pack3 && packs.length > 2) pack3 = packs[2];
        if (!pack4 && packs.length > 3) pack4 = packs[3];
        if (!pack5 && packs.length > 4) pack5 = packs[4];
      }
    })();
  });

  const displayPacks = $derived([pack1, pack2, pack3, pack4, pack5].filter(Boolean) as NDKFollowPack[]);

  // Anatomy layers for the component anatomy viewer
  const followPackAnatomyLayers = {
    image: { id: 'image', label: 'FollowPack.Image', description: 'Follow pack cover image' },
    title: { id: 'title', label: 'FollowPack.Title', description: 'Follow pack title' },
    description: { id: 'description', label: 'FollowPack.Description', description: 'Follow pack description' },
    memberCount: { id: 'memberCount', label: 'FollowPack.MemberCount', description: 'Number of users in pack' },
  };

  // Components section configuration
  const componentsSection = {
    title: 'Components',
    description: 'Explore each variant in detail',
    cards: [
      {...followPackHeroCard, code: followPackHeroCode},
      {...followPackPortraitCard, code: followPackPortraitCode},
      {...followPackCompactCard, code: followPackCompactCode},
      {...followPackListItemCard, code: followPackListItemCode}
    ],
    previews: {
      'follow-pack-hero': heroComponentPreview,
      'follow-pack-portrait': portraitComponentPreview,
      'follow-pack-compact': compactComponentPreview,
      'follow-pack-list-item': listItemComponentPreview
    }
  };

  const showcaseComponents: ShowcaseComponent[] = [
    {
      id: "followPackHeroCard",
      cardData: followPackHeroCard,
      preview: heroPreview,
      orientation: 'horizontal'
    },
    {
      id: "followPackPortraitCard",
      cardData: followPackPortraitCard,
      preview: portraitPreview,
      orientation: 'vertical'
    },
    {
      id: "followPackCompactCard",
      cardData: followPackCompactCard,
      preview: compactPreview,
      orientation: 'horizontal'
    },
    {
      id: "followPackListItemCard",
      cardData: followPackListItemCard,
      preview: listItemPreview,
      orientation: 'vertical'
    }
  ];
</script>

<!-- Preview snippets -->
{#snippet heroPreview()}
  {#if pack1}
    <div class="min-w-[800px]">
      <FollowPackHero {ndk} followPack={pack1} />
    </div>
  {/if}
{/snippet}

{#snippet portraitPreview()}
  {#if pack1}
    <FollowPackPortrait {ndk} followPack={pack1} />
  {/if}
{/snippet}

{#snippet compactPreview()}
  {#if pack1}
    <div class="w-full max-w-3xl">
      <FollowPackCompact {ndk} followPack={pack1} />
    </div>
  {/if}
{/snippet}

{#snippet listItemPreview()}
  <div class="space-y-2 max-w-2xl">
    {#each displayPacks.slice(0, 4) as pack (pack.id)}
      <FollowPackListItem {ndk} followPack={pack} />
    {/each}
  </div>
{/snippet}

<!-- Component preview snippets for componentsSection -->
{#snippet heroComponentPreview()}
  {@render heroPreview()}
{/snippet}

{#snippet portraitComponentPreview()}
  {@render portraitPreview()}
{/snippet}

{#snippet compactComponentPreview()}
  {@render compactPreview()}
{/snippet}

{#snippet listItemComponentPreview()}
  {@render listItemPreview()}
{/snippet}

<!-- Overview section -->
{#snippet overview()}
  <div class="text-lg text-muted-foreground space-y-4">
    <p>
      Follow Packs are curated lists of Nostr users grouped by topic, interest, or community (NIP-51, kind 39089). They help users discover and follow groups of people who share common interests or expertise.
    </p>

    <p>
      Choose from hero cards for featured packs, portrait cards for grid layouts, compact cards for dense views, or list items for browsable pack directories. All variants automatically display pack metadata including title, description, cover image, and member count.
    </p>

    <p>
      Built with composable FollowPack primitives (FollowPack.Root, FollowPack.Title, FollowPack.Image, etc.) for creating custom follow pack displays.
    </p>
  </div>
{/snippet}

<!-- Anatomy section -->
{#snippet anatomy()}
  {#if displayPacks.length > 0}
    <ComponentAnatomy.Root>
      <ComponentAnatomy.Preview>
        <div class="relative bg-card border border-border rounded-xl overflow-hidden">
          <FollowPack.Root {ndk} followPack={pack1!}>
            <ComponentAnatomy.Layer id="image" label="FollowPack.Image" class="h-48 overflow-hidden" absolute={true}>
              <FollowPack.Image class="w-full h-full object-cover" />
            </ComponentAnatomy.Layer>

            <div class="p-4 space-y-3">
              <ComponentAnatomy.Layer id="title" label="FollowPack.Title">
                <FollowPack.Title class="text-lg font-semibold" />
              </ComponentAnatomy.Layer>

              <ComponentAnatomy.Layer id="description" label="FollowPack.Description">
                <FollowPack.Description class="text-sm text-muted-foreground" maxLength={100} />
              </ComponentAnatomy.Layer>

              <ComponentAnatomy.Layer id="memberCount" label="FollowPack.MemberCount" class="w-fit">
                <FollowPack.MemberCount class="text-xs text-muted-foreground" format="long" />
              </ComponentAnatomy.Layer>
            </div>
          </FollowPack.Root>
        </div>
      </ComponentAnatomy.Preview>

      <ComponentAnatomy.DetailPanel layers={followPackAnatomyLayers} />
    </ComponentAnatomy.Root>
  {/if}
{/snippet}

<!-- Conditional rendering -->
{#if displayPacks.length > 0}
  <ComponentPageTemplate
    {metadata}
    {ndk}
    {overview}
    {showcaseComponents}
    {componentsSection}
    {anatomy}
  >
    <EditProps.Prop name="Pack 1" type="event" bind:value={pack1} options={followPacks} />
    <EditProps.Prop name="Pack 2" type="event" bind:value={pack2} options={followPacks} />
    <EditProps.Prop name="Pack 3" type="event" bind:value={pack3} options={followPacks} />
    <EditProps.Prop name="Pack 4" type="event" bind:value={pack4} options={followPacks} />
    <EditProps.Prop name="Pack 5" type="event" bind:value={pack5} options={followPacks} />
  </ComponentPageTemplate>
{:else}
  <div class="px-8">
    <PageTitle title={metadata.title}>
      <EditProps.Prop name="Pack 1" type="event" bind:value={pack1} options={followPacks} />
      <EditProps.Prop name="Pack 2" type="event" bind:value={pack2} options={followPacks} />
      <EditProps.Prop name="Pack 3" type="event" bind:value={pack3} options={followPacks} />
      <EditProps.Prop name="Pack 4" type="event" bind:value={pack4} options={followPacks} />
      <EditProps.Prop name="Pack 5" type="event" bind:value={pack5} options={followPacks} />
    </PageTitle>
    <div class="flex items-center justify-center py-12">
      <div class="text-muted-foreground">Loading follow packs...</div>
    </div>
  </div>
{/if}
