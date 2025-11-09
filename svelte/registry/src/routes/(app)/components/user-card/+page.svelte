<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import type { NDKUser } from '@nostr-dev-kit/ndk';
  import ComponentPageTemplate from '$lib/site/templates/ComponentPageTemplate.svelte';
  import { EditProps } from '$lib/site/components/edit-props';
  import SectionTitle from '$site-components/SectionTitle.svelte';
  import * as ComponentAnatomy from '$site-components/component-anatomy';
  import { User } from '$lib/registry/ui/user';
  import * as Tabs from '$lib/site/components/ui/tabs';
  import type { ShowcaseComponent } from '$lib/site/templates/types';

  // Import code examples
  import userCardClassicCode from './examples/classic/index.txt?raw';
  import userCardCompactCode from './examples/compact/index.txt?raw';
  import userListItemCode from './examples/list-item/index.txt?raw';
  import userCardPortraitCode from './examples/portrait/index.txt?raw';
  import userCardLandscapeCode from './examples/landscape/index.txt?raw';
  import userCardNeonCode from './examples/neon/index.txt?raw';
  import userCardGlassCode from './examples/glass/index.txt?raw';

  // Import blocks
  import UserCardClassic from '$lib/registry/components/user/cards/classic/user-card-classic.svelte';
  import UserCardPortrait from '$lib/registry/components/user/cards/portrait/user-card-portrait.svelte';
  import UserCardLandscape from '$lib/registry/components/user/cards/landscape/user-card-landscape.svelte';
  import UserCardCompact from '$lib/registry/components/user/cards/compact/user-card-compact.svelte';
  import UserCardNeon from '$lib/registry/components/user/cards/neon/user-card-neon.svelte';
  import UserCardGlass from '$lib/registry/components/user/cards/glass/user-card-glass.svelte';
  import UserListItem from '$lib/registry/components/user/displays/list-item/user-list-item.svelte';

  // Import registry metadata
  import userCardClassicCard from '$lib/registry/components/user/cards/classic/metadata.json';
  import userCardPortraitCard from '$lib/registry/components/user/cards/portrait/metadata.json';
  import userCardLandscapeCard from '$lib/registry/components/user/cards/landscape/metadata.json';
  import userCardCompactCard from '$lib/registry/components/user/cards/compact/metadata.json';
  import userCardNeonCard from '$lib/registry/components/user/cards/neon/metadata.json';
  import userCardGlassCard from '$lib/registry/components/user/cards/glass/metadata.json';
  import userCardListItemCard from '$lib/registry/components/user/displays/list-item/metadata.json';

  // Page metadata
  const metadata = {
    title: 'User Cards',
    description: 'Beautiful user profile cards with multiple variants and styles'
  };

  const ndk = getContext<NDKSvelte>('ndk');

  // State for users
  let users = $state<NDKUser[]>([]);
  let user1 = $state<NDKUser | undefined>();
  let user2 = $state<NDKUser | undefined>();
  let user3 = $state<NDKUser | undefined>();
  let user4 = $state<NDKUser | undefined>();
  let user5 = $state<NDKUser | undefined>();
  let user6 = $state<NDKUser | undefined>();
  let user7 = $state<NDKUser | undefined>();
  let user8 = $state<NDKUser | undefined>();
  let user9 = $state<NDKUser | undefined>();

  const displayUsers = $derived([user1, user2, user3, user4, user5, user6, user7, user8, user9].filter(Boolean) as NDKUser[]);

  // Glass card variant state
  let glassVariant = $state<'gradient' | 'transparent'>('gradient');

  // Primitives drawer state
  let focusedPrimitive = $state<string | null>(null);

  function openPrimitiveDrawer(primitiveId: string) {
    focusedPrimitive = primitiveId;
  }

  function closePrimitiveDrawer() {
    focusedPrimitive = null;
  }

  // Anatomy layers for the component anatomy viewer
  const userCardAnatomyLayers = {
    root: { id: 'root', label: 'User.Root', description: 'Container that provides user context' },
    avatar: { id: 'avatar', label: 'User.Avatar', description: 'User profile picture' },
    name: { id: 'name', label: 'User.Name', description: 'User display name' },
    nip05: { id: 'nip05', label: 'User.Nip05', description: 'NIP-05 verified identifier' },
    field: { id: 'field', label: 'User.Field', description: 'Custom profile field' },
  };

  // Primitive data for the primitives section
  const userCardPrimitiveData = {
    root: { name: 'User.Root', description: 'Container component that provides user context' },
    avatar: { name: 'User.Avatar', description: 'Display user profile picture' },
    name: { name: 'User.Name', description: 'Display user name' },
    nip05: { name: 'User.Nip05', description: 'Display NIP-05 identifier' },
    field: { name: 'User.Field', description: 'Display custom profile field' },
    bio: { name: 'User.Bio', description: 'Display user bio' },
    banner: { name: 'User.Banner', description: 'Display profile banner' },
  };

  // Components section configuration
  const componentsSection = {
    title: 'Components',
    description: 'Explore each variant in detail',
    cards: [
      {...userCardClassicCard, code: userCardClassicCode},
      {...userCardCompactCard, code: userCardCompactCode},
      {...userCardListItemCard, code: userListItemCode},
      {...userCardPortraitCard, code: userCardPortraitCode},
      {...userCardLandscapeCard, code: userCardLandscapeCode},
      {...userCardNeonCard, code: userCardNeonCode},
      {...userCardGlassCard, code: userCardGlassCode}
    ],
    previews: {
      'user-card-classic': userCardClassicComponentPreview,
      'user-card-compact': userCardCompactComponentPreview,
      'user-card-list-item': userCardListItemComponentPreview,
      'user-card-portrait': userCardPortraitComponentPreview,
      'user-card-landscape': userCardLandscapeComponentPreview,
      'user-card-neon': userCardNeonComponentPreview,
      'user-card-glass': userCardGlassComponentPreview
    }
  };

  const showcaseComponents: ShowcaseComponent[] = [
    {
      id: 'user-card-classic',
      cardData: userCardClassicCard,
      preview: classicPreview,
      orientation: 'horizontal'
    },
    {
      id: 'user-card-compact',
      cardData: userCardCompactCard,
      preview: compactPreview,
      orientation: 'vertical'
    },
    {
      id: 'user-card-list-item',
      cardData: userCardListItemCard,
      preview: listItemPreview,
      orientation: 'vertical'
    },
    {
      id: 'user-card-portrait',
      cardData: userCardPortraitCard,
      preview: portraitPreview,
      orientation: 'horizontal'
    },
    {
      id: 'user-card-landscape',
      cardData: userCardLandscapeCard,
      preview: landscapePreview,
      orientation: 'vertical'
    },
    {
      id: 'user-card-neon',
      cardData: userCardNeonCard,
      preview: neonPreview,
      orientation: 'horizontal'
    },
    {
      id: 'user-card-glass',
      cardData: userCardGlassCard,
      preview: glassPreview,
      orientation: 'horizontal',
      control: glassControlNew
    }
  ];
</script>

<!-- Preview snippets for showcase -->
{#snippet classicPreview()}
  <div class="flex gap-4 pb-4">
    {#each displayUsers as user (user.pubkey)}
      <UserCardClassic {ndk} pubkey={user.pubkey} />
    {/each}
  </div>
{/snippet}

{#snippet compactPreview()}
  <div class="space-y-2 max-w-sm max-h-[250px]">
    {#each displayUsers as user (user.pubkey)}
      <UserCardCompact {ndk} pubkey={user.pubkey} />
    {/each}
  </div>
{/snippet}

{#snippet listItemPreview()}
  <div class="max-h-[250px]">
    <div class="max-w-sm border border-border rounded-lg">
      {#each displayUsers as user (user.pubkey)}
        <UserListItem {ndk} pubkey={user.pubkey} />
      {/each}
    </div>
  </div>
{/snippet}

{#snippet portraitPreview()}
  <div class="flex gap-4 pb-4">
    {#each displayUsers as user (user.pubkey)}
      <UserCardPortrait {ndk} pubkey={user.pubkey} />
    {/each}
  </div>
{/snippet}

{#snippet landscapePreview()}
  <div class="space-y-4 max-w-2xl max-h-[300px]">
    {#each displayUsers as user (user.pubkey)}
      <UserCardLandscape {ndk} pubkey={user.pubkey} />
    {/each}
  </div>
{/snippet}

{#snippet neonPreview()}
  <div class="flex gap-4 pb-4">
    {#each displayUsers as user (user.pubkey)}
      <UserCardNeon {ndk} pubkey={user.pubkey} />
    {/each}
  </div>
{/snippet}

{#snippet glassPreview()}
  <div class="flex gap-4 pb-4">
    {#each displayUsers.slice(0, 5) as user (user.pubkey)}
      <UserCardGlass {ndk} pubkey={user.pubkey} variant={glassVariant} />
    {/each}
  </div>
{/snippet}

{#snippet glassControlNew()}
  <div onclick={(e) => e.stopPropagation()}>
    <Tabs.Root bind:value={glassVariant}>
      <Tabs.List>
        <Tabs.Trigger value="gradient">Gradient</Tabs.Trigger>
        <Tabs.Trigger value="transparent">Transparent</Tabs.Trigger>
      </Tabs.List>
    </Tabs.Root>
  </div>
{/snippet}

<!-- Component preview snippets for componentsSection -->
{#snippet userCardClassicComponentPreview()}
  <UserCardClassic {ndk} pubkey={user1?.pubkey || ''} />
{/snippet}

{#snippet userCardCompactComponentPreview()}
  <div class="space-y-2 max-w-sm">
    {#each displayUsers as user (user.pubkey)}
      <UserCardCompact {ndk} pubkey={user.pubkey} />
    {/each}
  </div>
{/snippet}

{#snippet userCardListItemComponentPreview()}
  <div class="max-w-sm border border-border rounded-lg overflow-hidden">
    {#each displayUsers as user (user.pubkey)}
      <UserListItem {ndk} pubkey={user.pubkey} />
    {/each}
  </div>
{/snippet}

{#snippet userCardPortraitComponentPreview()}
  <div class="flex gap-4 pb-4">
    {#each displayUsers as user (user.pubkey)}
      <UserCardPortrait {ndk} pubkey={user.pubkey} />
    {/each}
  </div>
{/snippet}

{#snippet userCardLandscapeComponentPreview()}
  <div class="space-y-4 max-w-2xl">
    {#each displayUsers as user (user.pubkey)}
      <UserCardLandscape {ndk} pubkey={user.pubkey} />
    {/each}
  </div>
{/snippet}

{#snippet userCardNeonComponentPreview()}
  <div class="flex gap-4 pb-4">
    {#each displayUsers as user (user.pubkey)}
      <UserCardNeon {ndk} pubkey={user.pubkey} />
    {/each}
  </div>
{/snippet}

{#snippet userCardGlassComponentPreview()}
  <div class="flex gap-4 pb-4">
    {#each displayUsers.slice(0, 5) as user (user.pubkey)}
      <UserCardGlass {ndk} pubkey={user.pubkey} variant={glassVariant} />
    {/each}
  </div>
{/snippet}

<!-- Overview section -->
{#snippet overview()}
  <div class="text-lg text-muted-foreground space-y-4">
    <p>
      User Cards provide beautiful, customizable displays for Nostr user profiles. With seven distinct variants, you can choose the perfect style for your application - from classic cards to modern glass morphism designs.
    </p>

    <p>
      Each variant is built using composable User primitives (Avatar, Name, Nip05, Bio, Banner, etc.), making it easy to create custom layouts or modify existing designs. All cards automatically fetch and display user profile data from NDK.
    </p>

    <p>
      The cards support various layouts: compact for lists, portrait and landscape for grids, classic for traditional profiles, and special effect variants like neon and glass for modern interfaces.
    </p>
  </div>
{/snippet}

<!-- Anatomy section -->
{#snippet anatomy()}
  {#if displayUsers.length > 0}
    <ComponentAnatomy.Root>
      <ComponentAnatomy.Preview>
        {#if user1}
          <div class="relative bg-card border border-border rounded-xl overflow-hidden">
            <User.Root {ndk} pubkey={user1.pubkey}>
              <ComponentAnatomy.Layer id="banner" label="User.Banner">
                <User.Banner class="w-full h-32" />
              </ComponentAnatomy.Layer>

              <div class="p-4 space-y-3">
                <ComponentAnatomy.Layer id="avatar" label="User.Avatar" class="w-fit mx-auto -mt-16">
                  <User.Avatar class="w-24 h-24 ring-4 ring-card" />
                </ComponentAnatomy.Layer>

                <ComponentAnatomy.Layer id="name" label="User.Name" class="text-center">
                  <User.Name class="text-lg font-semibold" />
                </ComponentAnatomy.Layer>

                <ComponentAnatomy.Layer id="handle" label="User.Handle" class="text-center">
                  <User.Handle class="text-sm text-muted-foreground" />
                </ComponentAnatomy.Layer>

                <ComponentAnatomy.Layer id="bio" label="User.Bio">
                  <User.Bio class="text-sm text-muted-foreground text-center" />
                </ComponentAnatomy.Layer>

                <ComponentAnatomy.Layer id="nip05" label="User.Nip05" class="w-fit mx-auto">
                  <User.Nip05 class="text-xs text-muted-foreground" />
                </ComponentAnatomy.Layer>

                <ComponentAnatomy.Layer id="field" label="User.Field" class="w-fit mx-auto">
                  <User.Field field="website" class="text-xs text-foreground" />
                </ComponentAnatomy.Layer>
              </div>
            </User.Root>
          </div>
        {/if}
      </ComponentAnatomy.Preview>

      <ComponentAnatomy.DetailPanel layers={userCardAnatomyLayers} />
    </ComponentAnatomy.Root>

    <!-- Primitives Section -->
    <SectionTitle title="Primitives" />

    <section class="min-h-[500px] lg:min-h-[60vh] py-12">
      <div class="grid grid-cols-3">
        {#each Object.entries(userCardPrimitiveData) as [id, data], i (id)}
          <button
            type="button"
            class="p-12 border-border transition-all {i % 3 !== 2
              ? 'border-r'
              : ''} {i < 6 ? 'border-b' : ''} {focusedPrimitive && focusedPrimitive !== id
              ? 'opacity-30'
              : ''}"
            onclick={() => openPrimitiveDrawer(id)}
          >
            <div class="flex flex-col items-center justify-start">
              <h3 class="text-base font-semibold text-foreground mb-4">{data.name}</h3>
              <div class="border border-dashed border-border rounded-lg p-6 w-full min-h-[240px] flex items-center justify-center opacity-50 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-300">
                {#if user1}
                  <User.Root {ndk} pubkey={user1.pubkey}>
                    {#if id === 'root'}
                      <div class="text-center">
                        <div class="font-semibold text-foreground mb-1">Container Component</div>
                        <div class="text-sm text-muted-foreground">Wraps all primitives</div>
                      </div>
                    {:else if id === 'avatar'}
                      <User.Avatar class="w-16 h-16" />
                    {:else if id === 'banner'}
                      <User.Banner class="w-full h-24 rounded-lg" />
                    {:else if id === 'name'}
                      <User.Name class="text-xl font-bold text-center" />
                    {:else if id === 'handle'}
                      <User.Handle class="text-base text-muted-foreground text-center" />
                    {:else if id === 'bio'}
                      <User.Bio class="text-sm text-muted-foreground text-center leading-relaxed px-2" />
                    {:else if id === 'nip05'}
                      <User.Nip05 class="text-base text-foreground" />
                    {:else if id === 'field'}
                      <User.Field field="website" class="text-sm text-foreground" />
                    {/if}
                  </User.Root>
                {/if}
              </div>
            </div>
          </button>
        {/each}
      </div>
    </section>
  {/if}
{/snippet}

<!-- Use template -->
<ComponentPageTemplate
  {metadata}
  {ndk}
  {overview}
  {showcaseComponents}
  {componentsSection}
  {anatomy}
>
  <EditProps.Prop name="User 1" type="user" bind:value={user1} options={users} default="npub1l2vyh47mk2p0qlsku7hg0vn29faehy9hy34ygaclpn66ukqp3afqutajft" />
    <EditProps.Prop name="User 2" type="user" bind:value={user2} options={users} default="npub180cvv07tjdrrgpa0j7j7tmnyl2yr6yr7l8j4s3evf6u64th6gkwsyjh6w6" />
    <EditProps.Prop name="User 3" type="user" bind:value={user3} options={users} default="npub1sg6plzptd64u62a878hep2kev88swjh3tw00gjsfl8f237lmu63q0uf63m" />
    <EditProps.Prop name="User 4" type="user" bind:value={user4} options={users} default="npub1gcxzte5zlkncx26j68ez60fzkvtkm9e0vrwdcvsjakxf9mu9qewqlfnj5z" />
    <EditProps.Prop name="User 5" type="user" bind:value={user5} options={users} default="npub1a2cww4kn9wqte4ry70vyfwqyqvpswksna27rtxd8vty6c74era8sdcw83a" />
    <EditProps.Prop name="User 6" type="user" bind:value={user6} options={users} default="npub1hu3hdctm5nkzd8gslnyedfr5ddz3z547jqcl5j88g4fame2jd08qep89nw" />
    <EditProps.Prop name="User 7" type="user" bind:value={user7} options={users} default="npub1xtscya34g58tk0z605fvr788k263gsu6cy9x0mhnm87echrgufzsevkk5s" />
    <EditProps.Prop name="User 8" type="user" bind:value={user8} options={users} default="npub1qny3tkh0acurzla8x3zy4nhrjz5zd8l9sy9jys09umwng00manysew95gx" />
    <EditProps.Prop name="User 9" type="user" bind:value={user9} options={users} default="npub1r0rs5q2gk0e3dk3nlc7gnu378ec6cnlenqp8a3cjhyzu6f8k5sgs4sq9ac" />
</ComponentPageTemplate>

<!-- API Drawer (Primitives drawer) -->
{#if focusedPrimitive && userCardPrimitiveData[focusedPrimitive as keyof typeof userCardPrimitiveData]}
  {@const data = userCardPrimitiveData[focusedPrimitive as keyof typeof userCardPrimitiveData]}
  <div
    class="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
    onclick={closePrimitiveDrawer}
    role="button"
    tabindex="-1"
  ></div>
  <div
    class="fixed right-0 top-0 bottom-0 w-full md:w-[480px] bg-card border-l border-border shadow-2xl z-50 overflow-y-auto animate-in slide-in-from-right duration-300"
  >
    <div class="sticky top-0 bg-card border-b border-border p-8 z-10">
      <button
        type="button"
        class="absolute top-8 right-8 text-muted-foreground hover:text-foreground text-2xl"
        onclick={closePrimitiveDrawer}
      >
        ×
      </button>
      <h2 class="font-mono text-2xl font-bold text-primary">{data.name}</h2>
    </div>

    <div class="p-8">
      <div class="mb-8">
        <p class="text-muted-foreground leading-relaxed">{data.description}</p>
      </div>

      <div>
        <h3 class="text-lg font-bold mb-4">Props</h3>
        <div class="space-y-4">
          {#each data.props as prop (prop.name)}
            <div class="bg-muted/50 border border-border rounded-lg p-4">
              <div class="flex justify-between items-start mb-2">
                <code class="font-mono font-semibold text-primary">{prop.name}</code>
                <code class="font-mono text-xs text-muted-foreground">{prop.type}</code>
              </div>
              <p class="text-sm text-muted-foreground">{prop.desc}</p>
            </div>
          {/each}
        </div>
      </div>
    </div>
  </div>
{/if}