<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import type { NDKUser } from '@nostr-dev-kit/ndk';
  import ComponentPageTemplate from '$lib/templates/ComponentPageTemplate.svelte';
  import {
    userCardMetadata,
    userCardClassicCard,
    userCardCompactCard,
    userCardListItemCard,
    userCardPortraitCard,
    userCardLandscapeCard,
    userCardNeonCard,
    userCardGlassCard,
    userCardAnatomyLayers,
    userCardPrimitiveData
  } from '$lib/component-registry/user-card';
  import { EditProps } from '$lib/site-components/edit-props';
  import ComponentPageSectionTitle from '$site-components/ComponentPageSectionTitle.svelte';
  import * as ComponentAnatomy from '$site-components/component-anatomy';
  import { User } from '$lib/registry/ui';
  import { ScrollArea } from '$lib/site-components/ui/scroll-area';
  import { Select } from 'bits-ui';
  import ComponentCard from '$site-components/ComponentCard.svelte';
  import ComponentsShowcase from '$site-components/ComponentsShowcase.svelte';
  import type { ShowcaseBlock } from '$lib/templates/types';

  // Import blocks
  import UserCardClassic from '$lib/registry/components/user-card/user-card-classic.svelte';
  import UserCardPortrait from '$lib/registry/components/user-card/user-card-portrait.svelte';
  import UserCardLandscape from '$lib/registry/components/user-card/user-card-landscape.svelte';
  import UserCardCompact from '$lib/registry/components/user-card/user-card-compact.svelte';
  import UserCardNeon from '$lib/registry/components/user-card/user-card-neon.svelte';
  import UserCardGlass from '$lib/registry/components/user-card/user-card-glass.svelte';
  import UserListItem from '$lib/registry/components/user-card/user-list-item.svelte';

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
  <div class="max-w-sm border border-border rounded-lg max-h-[250px]">
    {#each displayUsers as user (user.pubkey)}
      <UserListItem {ndk} pubkey={user.pubkey} />
    {/each}
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
  <div class="flex gap-2" onclick={(e) => e.stopPropagation()}>
    <button
      class="px-3 py-1.5 text-xs rounded-md transition-colors {glassVariant === 'gradient' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}"
      onclick={() => glassVariant = 'gradient'}
    >
      Gradient
    </button>
    <button
      class="px-3 py-1.5 text-xs rounded-md transition-colors {glassVariant === 'transparent' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}"
      onclick={() => glassVariant = 'transparent'}
    >
      Transparent
    </button>
  </div>
{/snippet}

<!-- EditProps snippet -->
{#snippet editPropsSection()}
  {#key users}
    <EditProps.Root>
      <EditProps.Prop name="User 1" type="user" bind:value={user1} options={users} default="npub1l2vyh47mk2p0qlsku7hg0vn29faehy9hy34ygaclpn66ukqp3afqutajft" />
      <EditProps.Prop name="User 2" type="user" bind:value={user2} options={users} default="npub180cvv07tjdrrgpa0j7j7tmnyl2yr6yr7l8j4s3evf6u64th6gkwsyjh6w6" />
      <EditProps.Prop name="User 3" type="user" bind:value={user3} options={users} default="npub1sg6plzptd64u62a878hep2kev88swjh3tw00gjsfl8f237lmu63q0uf63m" />
      <EditProps.Prop name="User 4" type="user" bind:value={user4} options={users} default="npub1gcxzte5zlkncx26j68ez60fzkvtkm9e0vrwdcvsjakxf9mu9qewqlfnj5z" />
      <EditProps.Prop name="User 5" type="user" bind:value={user5} options={users} default="npub1a2cww4kn9wqte4ry70vyfwqyqvpswksna27rtxd8vty6c74era8sdcw83a" />
      <EditProps.Prop name="User 6" type="user" bind:value={user6} options={users} default="npub1hu3hdctm5nkzd8gslnyedfr5ddz3z547jqcl5j88g4fame2jd08qep89nw" />
      <EditProps.Prop name="User 7" type="user" bind:value={user7} options={users} default="npub1xtscya34g58tk0z605fvr788k263gsu6cy9x0mhnm87echrgufzsevkk5s" />
      <EditProps.Prop name="User 8" type="user" bind:value={user8} options={users} default="npub1qny3tkh0acurzla8x3zy4nhrjz5zd8l9sy9jys09umwng00manysew95gx" />
      <EditProps.Prop name="User 9" type="user" bind:value={user9} options={users} default="npub1r0rs5q2gk0e3dk3nlc7gnu378ec6cnlenqp8a3cjhyzu6f8k5sgs4sq9ac" />
      <EditProps.Button>Edit Examples</EditProps.Button>
    </EditProps.Root>
  {/key}
{/snippet}

<!-- Custom sections (Anatomy + Primitives) -->
{#snippet customSections()}
  {#if displayUsers.length > 0}
    <!-- Anatomy Section -->
    <ComponentPageSectionTitle title="Anatomy" description="Click on any layer to see its details and props" />

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
                  <User.Field name="website" class="text-xs text-foreground" />
                </ComponentAnatomy.Layer>
              </div>
            </User.Root>
          </div>
        {/if}
      </ComponentAnatomy.Preview>

      <ComponentAnatomy.DetailPanel layers={userCardAnatomyLayers} />
    </ComponentAnatomy.Root>

    <!-- Primitives Section -->
    <ComponentPageSectionTitle title="Primitives" />

    <section class="min-h-[500px] lg:min-h-[60vh] py-12">
      <div class="grid grid-cols-3">
        {#each Object.entries(userCardPrimitiveData) as [id, data], i}
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
                      <User.Field name="website" class="text-sm text-foreground" />
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

<!-- Components section previews -->
{#snippet classicComponentPreview()}
  <UserCardClassic {ndk} pubkey={user1?.pubkey || ''} />
{/snippet}

{#snippet compactComponentPreview()}
  <div class="space-y-2 max-w-sm">
    {#each displayUsers as user (user.pubkey)}
      <UserCardCompact {ndk} pubkey={user.pubkey} />
    {/each}
  </div>
{/snippet}

{#snippet listItemComponentPreview()}
  <div class="max-w-sm border border-border rounded-lg overflow-hidden">
    {#each displayUsers as user (user.pubkey)}
      <UserListItem {ndk} pubkey={user.pubkey} />
    {/each}
  </div>
{/snippet}

{#snippet portraitComponentPreview()}
  <ScrollArea orientation="horizontal" class="w-full">
    <div class="flex gap-4 pb-4">
      {#each displayUsers as user (user.pubkey)}
        <UserCardPortrait {ndk} pubkey={user.pubkey} />
      {/each}
    </div>
  </ScrollArea>
{/snippet}

{#snippet landscapeComponentPreview()}
  <div class="space-y-4 max-w-2xl">
    {#each displayUsers as user (user.pubkey)}
      <UserCardLandscape {ndk} pubkey={user.pubkey} />
    {/each}
  </div>
{/snippet}

{#snippet neonComponentPreview()}
  <ScrollArea orientation="horizontal" class="w-full">
    <div class="flex gap-4 pb-4">
      {#each displayUsers as user (user.pubkey)}
        <UserCardNeon {ndk} pubkey={user.pubkey} />
      {/each}
    </div>
  </ScrollArea>
{/snippet}

{#snippet glassComponentPreview()}
  <ScrollArea orientation="horizontal" class="w-full">
    <div class="flex gap-4 pb-4">
      {#each displayUsers.slice(0, 5) as user (user.pubkey)}
        <UserCardGlass {ndk} pubkey={user.pubkey} variant={glassVariant} />
      {/each}
    </div>
  </ScrollArea>
{/snippet}

{#if displayUsers.length > 0 && user1}
  <!-- Showcase blocks -->
  {@const showcaseBlocks = [
    {
      name: 'Classic',
      description: 'Classic user card with banner, avatar, name, bio, and stats. Perfect for popovers, dialogs, and standalone displays.',
      command: 'npx shadcn@latest add user-card-classic',
      preview: classicPreview,
      cardData: userCardClassicCard,
      orientation: 'horizontal'
    },
    {
      name: 'Compact',
      description: 'Minimal user card for lists, showing avatar, name, and follow button. Ideal for sidebars and compact layouts.',
      command: 'npx shadcn@latest add user-card-compact',
      preview: compactPreview,
      cardData: userCardCompactCard,
      orientation: 'vertical'
    },
    {
      name: 'List Item',
      description: 'Ultra-compact list item showing avatar, name, and follow status badge. Perfect for dense user lists.',
      command: 'npx shadcn@latest add user-list-item',
      preview: listItemPreview,
      cardData: userCardListItemCard,
      orientation: 'vertical'
    },
    {
      name: 'Portrait',
      description: 'Vertical card layout showing avatar, name, bio, and stats. Great for grids and profile galleries.',
      command: 'npx shadcn@latest add user-card-portrait',
      preview: portraitPreview,
      cardData: userCardPortraitCard,
      orientation: 'horizontal'
    },
    {
      name: 'Landscape',
      description: 'Horizontal card layout with avatar on left. Perfect for feed views and detailed lists.',
      command: 'npx shadcn@latest add user-card-landscape',
      preview: landscapePreview,
      cardData: userCardLandscapeCard,
      orientation: 'vertical'
    },
    {
      name: 'Neon',
      description: 'Neon-style card with full background image and glossy top border. Perfect for modern, visually striking user displays.',
      command: 'npx shadcn@latest add user-card-neon',
      preview: neonPreview,
      cardData: userCardNeonCard,
      orientation: 'horizontal'
    },
    {
      name: 'Glass',
      description: 'Glassmorphic card with frosted glass effect and gradient mesh background. Modern, elegant design with soft glows.',
      command: 'npx shadcn@latest add user-card-glass',
      preview: glassPreview,
      cardData: userCardGlassCard,
      orientation: 'horizontal',
      control: glassControlNew
    }
  ] as ShowcaseBlock[]}

  <!-- Use template with custom showcase component -->
  <ComponentPageTemplate
    metadata={userCardMetadata}
    {ndk}
    showcaseComponent={ComponentsShowcase}
    showcaseBlocks={showcaseBlocks}
    {editPropsSection}
    {customSections}
    componentsSection={{
      cards: userCardMetadata.cards,
      previews: {
        'user-card-classic': classicComponentPreview,
        'user-card-compact': compactComponentPreview,
        'user-list-item': listItemComponentPreview,
        'user-card-portrait': portraitComponentPreview,
        'user-card-landscape': landscapeComponentPreview,
        'user-card-neon': neonComponentPreview,
        'user-card-glass': glassComponentPreview
      }
    }}
    apiDocs={userCardMetadata.apiDocs}
  />
{:else}
  <!-- Loading state -->
  <div class="px-8">
    <div class="mb-12 pt-8">
      <div class="flex items-start justify-between gap-4 mb-4">
        <h1 class="text-4xl font-bold">User Card</h1>
      </div>
      <p class="text-lg text-muted-foreground mb-6">
        Display user information in card layouts. Choose from compact list items, portrait cards, or landscape layouts for different contexts.
      </p>
    </div>
    <div class="flex items-center justify-center py-12">
      <div class="text-muted-foreground">Loading users...</div>
    </div>
  </div>
{/if}

<!-- API Drawer (Primitives drawer) -->
{#if focusedPrimitive && userCardPrimitiveData[focusedPrimitive]}
  {@const data = userCardPrimitiveData[focusedPrimitive]}
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
          {#each data.props as prop (prop.name || prop)}
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