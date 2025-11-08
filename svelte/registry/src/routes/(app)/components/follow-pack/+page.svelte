<script lang="ts">
  import { getContext } from 'svelte';
  import { NDKFollowPack, NDKKind } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import ComponentPageTemplate from '$lib/site/templates/ComponentPageTemplate.svelte';
  import ComponentCard from '$site-components/ComponentCard.svelte';
  import { EditProps } from '$lib/site/components/edit-props';
  import PageTitle from '$lib/site/components/PageTitle.svelte';
  import SectionTitle from '$site-components/SectionTitle.svelte';
  import * as ComponentAnatomy from '$site-components/component-anatomy';
  import { FollowPack } from '$lib/registry/ui/follow-pack';

  // Import components
  import FollowPackPortrait from '$lib/registry/components/follow/packs/portrait/follow-pack-portrait.svelte';
  import FollowPackHero from '$lib/registry/components/follow/packs/hero/follow-pack-hero.svelte';
  import FollowPackCompact from '$lib/registry/components/follow/packs/compact/follow-pack-compact.svelte';
  import FollowPackListItem from '$lib/registry/components/follow/packs/basic/follow-pack-list-item.svelte';

  // Import code examples
  import followPackHeroCode from './examples/hero/index.txt?raw';
  import followPackPortraitCode from './examples/portrait/index.txt?raw';
  import followPackCompactCode from './examples/compact/index.txt?raw';
  import followPackListItemCode from './examples/list-item/index.txt?raw';

  // Import registry metadata
  import followPackHeroCard from '$lib/registry/components/follow/packs/hero/registry.json';
  import followPackPortraitCard from '$lib/registry/components/follow/packs/portrait/registry.json';
  import followPackCompactCard from '$lib/registry/components/follow/packs/compact/registry.json';
  import followPackListItemCard from '$lib/registry/components/follow/packs/basic/registry.json';

  // Page metadata
  const metadata = {
    title: 'Follow Packs',
    description: 'Follow pack components for curated user collections',
    showcaseTitle: 'Follow Pack Variants',
    showcaseDescription: 'Display and manage follow pack collections',
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

<!-- Components snippet -->
{#snippet components()}
  <ComponentCard data={{...followPackHeroCard, code: followPackHeroCode}}>
    {#snippet preview()}
      {@render heroPreview()}
    {/snippet}
  </ComponentCard>

  <ComponentCard data={{...followPackPortraitCard, code: followPackPortraitCode}}>
    {#snippet preview()}
      {@render portraitPreview()}
    {/snippet}
  </ComponentCard>

  <ComponentCard data={{...followPackCompactCard, code: followPackCompactCode}}>
    {#snippet preview()}
      {@render compactPreview()}
    {/snippet}
  </ComponentCard>

  <ComponentCard data={{...followPackListItemCard, code: followPackListItemCode}}>
    {#snippet preview()}
      {@render listItemPreview()}
    {/snippet}
  </ComponentCard>
{/snippet}

<!-- Custom Anatomy section -->
{#snippet customSections()}
  {#if displayPacks.length > 0}
    <SectionTitle title="Anatomy" description="Click on any layer to see its details and props" />

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
    showcaseComponents={[
      {
        cardData: followPackHeroCard,
        preview: heroPreview,
        orientation: 'horizontal'
      },
      {
        cardData: followPackPortraitCard,
        preview: portraitPreview,
        orientation: 'vertical'
      },
      {
        cardData: followPackCompactCard,
        preview: compactPreview,
        orientation: 'horizontal'
      },
      {
        cardData: followPackListItemCard,
        preview: listItemPreview,
        orientation: 'vertical'
      }
    ]}
    {components}
    {customSections}
    apiDocs={followPackHeroCard.apiDocs}
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
