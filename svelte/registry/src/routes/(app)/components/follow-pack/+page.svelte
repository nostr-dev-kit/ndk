<script lang="ts">
    import { NDKFollowPack, NDKKind } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { ndk } from '$lib/site/ndk.svelte';
  import ComponentPageTemplate from '$lib/site/templates/ComponentPageTemplate.svelte';
  import { EditProps } from '$lib/site/components/edit-props';
  import * as ComponentAnatomy from '$site-components/component-anatomy';
  import { FollowPack } from '$lib/registry/ui/follow-pack';
  import type { ShowcaseComponent } from '$lib/site/templates/types';

  // Import components
  import FollowPackPortrait from '$lib/registry/components/follow-pack-portrait/follow-pack-portrait.svelte';
  import FollowPackHero from '$lib/registry/components/follow-pack-hero/follow-pack-hero.svelte';
  import FollowPackCompact from '$lib/registry/components/follow-pack-compact/follow-pack-compact.svelte';
  import FollowPackListItem from '$lib/registry/components/follow-pack/follow-pack-list-item.svelte';

  // Import code examples
  import followPackHeroCode from './examples/hero/index.txt?raw';
  import followPackPortraitCode from './examples/portrait/index.txt?raw';
  import followPackCompactCode from './examples/compact/index.txt?raw';
  import followPackListItemCode from './examples/list-item/index.txt?raw';

  // Import registry metadata
  import followPackHeroCard from '$lib/registry/components/follow-pack-hero/metadata.json';
  import followPackPortraitCard from '$lib/registry/components/follow-pack-portrait/metadata.json';
  import followPackCompactCard from '$lib/registry/components/follow-pack-compact/metadata.json';
  import followPackListItemCard from '$lib/registry/components/follow-pack/metadata.json';

  // Page metadata
  const metadata = {
    title: 'Follow Packs',
    description: 'Follow pack components for curated user collections'
  };
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
      'follow-pack-hero': heroPreview,
      'follow-pack-portrait': portraitPreview,
      'follow-pack-compact': compactPreview,
      'follow-pack-list-item': listItemPreview
    }
  };

  const showcaseComponents: ShowcaseComponent[] = [
    {
      id: "follow-pack-hero",
      cardData: followPackHeroCard,
      preview: heroPreview,
      orientation: 'horizontal'
    },
    {
      id: "follow-pack-portrait",
      cardData: followPackPortraitCard,
      preview: portraitPreview,
      orientation: 'vertical'
    },
    {
      id: "follow-pack-compact",
      cardData: followPackCompactCard,
      preview: compactPreview,
      orientation: 'horizontal'
    },
    {
      id: "follow-pack-list-item",
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

<!-- Primitives section (includes anatomy) -->
{#snippet primitives()}
  {#if displayPacks.length > 0}
    <section class="mt-16">
      <h2 class="text-3xl font-bold mb-4">Component Anatomy</h2>
      <p class="text-muted-foreground mb-6">
        Understanding the composable building blocks of follow pack components using UI primitives.
      </p>

      <ComponentAnatomy.Root>
        <ComponentAnatomy.Preview>
          <div class="relative bg-card border border-border rounded-xl overflow-hidden">
            <FollowPack.Root {ndk} followPack={pack1!}>
              <ComponentAnatomy.Layer
                id={followPackAnatomyLayers.image.id}
                label={followPackAnatomyLayers.image.label}
                class="h-48 overflow-hidden"
                absolute={true}
              >
                <FollowPack.Image class="w-full h-full object-cover" />
              </ComponentAnatomy.Layer>

              <div class="p-4 space-y-3">
                <ComponentAnatomy.Layer
                  id={followPackAnatomyLayers.title.id}
                  label={followPackAnatomyLayers.title.label}
                >
                  <FollowPack.Title class="text-lg font-semibold" />
                </ComponentAnatomy.Layer>

                <ComponentAnatomy.Layer
                  id={followPackAnatomyLayers.description.id}
                  label={followPackAnatomyLayers.description.label}
                >
                  <FollowPack.Description class="text-sm text-muted-foreground" maxLength={100} />
                </ComponentAnatomy.Layer>

                <ComponentAnatomy.Layer
                  id={followPackAnatomyLayers.memberCount.id}
                  label={followPackAnatomyLayers.memberCount.label}
                  class="w-fit"
                >
                  <FollowPack.MemberCount class="text-xs text-muted-foreground" format="long" />
                </ComponentAnatomy.Layer>
              </div>
            </FollowPack.Root>
          </div>
        </ComponentAnatomy.Preview>

        <ComponentAnatomy.DetailPanel layers={followPackAnatomyLayers} />
      </ComponentAnatomy.Root>
    </section>
  {/if}
{/snippet}

<ComponentPageTemplate
  {metadata}
  {ndk}
  {overview}
  {showcaseComponents}
  {componentsSection}
  {primitives}
>
  <EditProps.Prop name="Pack 1" type="event" bind:value={pack1} options={followPacks} default="naddr1qvzqqqyckypzp7gpv9hspf3lf7w83qw5sudq8heafnh89y02l4ade0h20j2utr38qythwumn8ghj7un9d3shjtnswf5k6ctv9ehx2ap0qy2hwumn8ghj7un9d3shjtnyv9kh2uewd9hj7qqvdajx2mn2duexudfcxfhs0c040z" />
  <EditProps.Prop name="Pack 2" type="event" bind:value={pack2} options={followPacks} default="naddr1qvzqqqyckypzpw9fm7ppszzwfyxc3q6z482g3d70p7eqkxseh93mantga44ttjaaqythwumn8ghj7un9d3shjtnswf5k6ctv9ehx2ap0qy2hwumn8ghj7un9d3shjtnyv9kh2uewd9hj7qqvd5env7t4ddcxgdttw3esjyw7cr" />
  <EditProps.Prop name="Pack 3" type="event" bind:value={pack3} options={followPacks} default="naddr1qvzqqqyckypzqlrkt4q86w5at6s30juts6vk9ptq0plupp9qca404fzfh773y8vyqythwumn8ghj7un9d3shjtnswf5k6ctv9ehx2ap0qqx8gupedph8zurwvd3kxmcu58dse" />
  <EditProps.Prop name="Pack 4" type="event" bind:value={pack4} options={followPacks} default="naddr1qvzqqqyckypzpm0yzdfrja6cz4z3g9ytysgjxzxwm9k3yy3fkrn2v679526qcqlvqythwumn8ghj7un9d3shjtnswf5k6ctv9ehx2ap0qqdhxarjv4sk6etjwdrx7mrvdam4qctrdd5rsjm6xdgryugz7ju6m" />
  <EditProps.Prop name="Pack 5" type="event" bind:value={pack5} options={followPacks} default="naddr1qvzqqqyckypzpaf8e7tsecnquapxzg2t7cfw3a66t8d3sd0d0eq9xvnv8aj7yvhwqythwumn8ghj7un9d3shjtnswf5k6ctv9ehx2ap0qqxxyumzxscxka3edemhydq4wdqvs" />
</ComponentPageTemplate>
