<script lang="ts">
  import { getContext } from 'svelte';
  import { NDKFollowPack, NDKKind } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import ComponentPageTemplate from '$lib/templates/ComponentPageTemplate.svelte';
  import ComponentsShowcase from '$site-components/ComponentsShowcase.svelte';
  import {
    followPackMetadata,
    followPackHeroCard,
    followPackPortraitCard,
    followPackCompactCard,
    followPackListItemCard,
    followPackAnatomyLayers
  } from '$lib/component-registry/follow-pack';
  import { EditProps } from '$lib/site-components/edit-props';
  import type { ShowcaseBlock } from '$lib/templates/types';
  import ComponentPageSectionTitle from '$site-components/ComponentPageSectionTitle.svelte';
  import * as ComponentAnatomy from '$site-components/component-anatomy';
  import { FollowPack } from '$lib/registry/ui/follow-pack';

  import FollowPackPortrait from '$lib/registry/components/follow-pack/follow-pack-portrait.svelte';
  import FollowPackHero from '$lib/registry/components/follow-pack/follow-pack-hero.svelte';
  import FollowPackCompact from '$lib/registry/components/follow-pack/follow-pack-compact.svelte';
  import FollowPackListItem from '$lib/registry/components/follow-pack/follow-pack-list-item.svelte';

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

  // Showcase blocks using ComponentsShowcase with orientation
  const showcaseBlocks: ShowcaseBlock[] = [
    {
      name: 'Hero',
      description: 'Featured display with full-bleed imagery. Perfect for landing pages and hero sections.',
      command: 'npx shadcn@latest add follow-pack-hero',
      preview: heroPreview,
      cardData: followPackHeroCard,
      orientation: 'horizontal'
    },
    {
      name: 'Portrait',
      description: 'Vertical elegance for grid displays. Ideal for galleries and multi-column layouts.',
      command: 'npx shadcn@latest add follow-pack-portrait',
      preview: portraitPreview,
      cardData: followPackPortraitCard,
      orientation: 'vertical'
    },
    {
      name: 'Compact',
      description: 'Information-dense for feeds. Optimized for content streams and horizontal layouts.',
      command: 'npx shadcn@latest add follow-pack-compact',
      preview: compactPreview,
      cardData: followPackCompactCard,
      orientation: 'horizontal'
    },
    {
      name: 'List Item',
      description: 'Minimal design for sidebars. Maximum impact with minimal footprint.',
      command: 'npx shadcn@latest add follow-pack-list-item',
      preview: listItemPreview,
      cardData: followPackListItemCard,
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

<!-- EditProps snippet -->
{#snippet editPropsSection()}
  {#key followPacks}
    <EditProps.Root>
      <EditProps.Prop name="Pack 1" type="event" bind:value={pack1} options={followPacks} />
      <EditProps.Prop name="Pack 2" type="event" bind:value={pack2} options={followPacks} />
      <EditProps.Prop name="Pack 3" type="event" bind:value={pack3} options={followPacks} />
      <EditProps.Prop name="Pack 4" type="event" bind:value={pack4} options={followPacks} />
      <EditProps.Prop name="Pack 5" type="event" bind:value={pack5} options={followPacks} />
      <EditProps.Button>Change Sample Packs</EditProps.Button>
    </EditProps.Root>
  {/key}
{/snippet}

<!-- Custom Anatomy section -->
{#snippet customSections()}
  {#if displayPacks.length > 0}
    <ComponentPageSectionTitle title="Anatomy" description="Click on any layer to see its details and props" />

    <ComponentAnatomy.Root>
      <ComponentAnatomy.Preview>
        <div class="relative bg-card border border-border rounded-xl overflow-hidden">
          <FollowPack.Root {ndk} followPack={pack1}>
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

<!-- Preview snippets for Components section -->
{#snippet heroComponentPreview()}
  {#if pack1}
    <div class="min-w-[800px]">
      <FollowPackHero {ndk} followPack={pack1} />
    </div>
  {/if}
{/snippet}

{#snippet portraitComponentPreview()}
  <div class="flex gap-4 flex-wrap">
    {#each displayPacks.slice(0, 3) as pack (pack.id)}
      <FollowPackPortrait {ndk} followPack={pack} />
    {/each}
  </div>
{/snippet}

{#snippet compactComponentPreview()}
  <div class="space-y-2 max-w-2xl">
    {#each displayPacks.slice(0, 3) as pack (pack.id)}
      <FollowPackCompact {ndk} followPack={pack} />
    {/each}
  </div>
{/snippet}

{#snippet listItemComponentPreview()}
  <div class="space-y-2 max-w-md">
    {#each displayPacks.slice(0, 4) as pack (pack.id)}
      <FollowPackListItem {ndk} followPack={pack} />
    {/each}
  </div>
{/snippet}

<!-- Conditional rendering -->
{#if displayPacks.length > 0}
  <ComponentPageTemplate
    metadata={followPackMetadata}
    {ndk}
    showcaseComponent={ComponentsShowcase}
    {showcaseBlocks}
    {editPropsSection}
    {customSections}
    componentsSection={{
      cards: followPackMetadata.cards,
      previews: {
        'follow-pack-hero': heroComponentPreview,
        'follow-pack-portrait': portraitComponentPreview,
        'follow-pack-compact': compactComponentPreview,
        'follow-pack-list-item': listItemComponentPreview
      }
    }}
    apiDocs={followPackMetadata.apiDocs}
  />
{:else}
  <div class="px-8">
    <div class="mb-12 pt-8">
      <h1 class="text-4xl font-bold">{followPackMetadata.title}</h1>
      <p class="text-lg text-muted-foreground mb-6">{followPackMetadata.description}</p>
      {@render editPropsSection()}
    </div>
    <div class="flex items-center justify-center py-12">
      <div class="text-muted-foreground">Loading follow packs...</div>
    </div>
  </div>
{/if}
