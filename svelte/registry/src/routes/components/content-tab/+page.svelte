<script lang="ts">
  import { getContext } from 'svelte';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { NDKUser } from '@nostr-dev-kit/ndk';
  import ComponentPageTemplate from '$lib/templates/ComponentPageTemplate.svelte';
  import ComponentsShowcase from '$site-components/ComponentsShowcase.svelte';
  import { contentTabMetadata, contentTabCard } from '$lib/component-registry/content-tab';
  import { EditProps } from '$lib/site-components/edit-props';
  import PageTitle from '$lib/site-components/PageTitle.svelte';
  import type { ShowcaseBlock } from '$lib/templates/types';
  import ComponentCard from '$site-components/ComponentCard.svelte';
  import ComponentPageSectionTitle from '$site-components/ComponentPageSectionTitle.svelte';
  import * as Tabs from '$lib/components/ui/tabs';
  import { kindLabel } from '$lib/registry/utils';
  import { User } from '$lib/registry/ui';

  // Import the component
  import ContentTab from '$lib/registry/components/content-tab/content-tab.svelte';
  import { byCount, byRecency } from '$lib/registry/hooks/content-tab';

  const ndk = getContext<NDKSvelte>('ndk');

  let user1 = $state<NDKUser | undefined>();
  let user2 = $state<NDKUser | undefined>();
  let user3 = $state<NDKUser | undefined>();
  let user4 = $state<NDKUser | undefined>();
  let user5 = $state<NDKUser | undefined>();
  let user6 = $state<NDKUser | undefined>();
  let user7 = $state<NDKUser | undefined>();
  let user8 = $state<NDKUser | undefined>();
  let user9 = $state<NDKUser | undefined>();
  let user10 = $state<NDKUser | undefined>();

  const displayUsers = $derived([user1, user2, user3, user4, user5, user6, user7, user8, user9, user10].filter(Boolean) as NDKUser[]);

  // Sorting state for showcase
  let sortMethod = $state<'count' | 'recency'>('count');

  // Showcase blocks
  const showcaseBlocks: ShowcaseBlock[] = [
    {
      name: 'Default Style',
      description: 'Material bottom nav with sorting control',
      command: 'npx shadcn@latest add content-tab',
      preview: defaultPreview,
      cardData: contentTabCard,
      control: sortControl
    },
    {
      name: 'Custom Style',
      description: 'Card-style tabs with emoji icons',
      command: 'npx shadcn@latest add content-tab',
      preview: customTabPreview,
      cardData: contentTabCard
    }
  ];
</script>

<!-- Preview snippets for showcase -->
{#snippet defaultPreview()}
  <div class="flex flex-col gap-6 py-8">
    {#each displayUsers as user (user.pubkey)}
      <div class="flex items-center gap-4">
        <User.Root {ndk} {user}>
          <User.Avatar class="w-12 h-12 flex-shrink-0" />
        </User.Root>
        <ContentTab
          {ndk}
          pubkeys={[user.pubkey]}
          kinds={[1, 30023, 9802, 6, 7, 20, 21, 22, 1111, 1337, 1984, 30818]}
          since={Math.floor(Date.now() / 1000) - (7 * 24 * 60 * 60)}
          sort={sortMethod === 'count' ? byCount : byRecency}
        />
      </div>
    {/each}
  </div>
{/snippet}

{#snippet sortControl()}
  <div class="flex gap-2" onclick={(e) => e.stopPropagation()}>
    <button
      class="px-3 py-1.5 text-xs rounded-md transition-colors {sortMethod === 'count' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}"
      onclick={() => sortMethod = 'count'}
    >
      By Count
    </button>
    <button
      class="px-3 py-1.5 text-xs rounded-md transition-colors {sortMethod === 'recency' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}"
      onclick={() => sortMethod = 'recency'}
    >
      By Recency
    </button>
  </div>
{/snippet}

{#snippet customTabPreview()}
  <div class="flex flex-col gap-8 py-8">
    {#each [user10, user8].filter(Boolean) as user (user.pubkey)}
      <div class="flex flex-col gap-4">
        <div class="flex items-center gap-3">
          <User.Root {ndk} {user}>
            <User.Avatar class="w-10 h-10 flex-shrink-0 ring-2 ring-primary/20" />
          </User.Root>
          <div class="flex flex-col">
            <User.Root {ndk} {user}>
              <User.Name class="font-semibold text-sm" />
            </User.Root>
            <span class="text-xs text-muted-foreground">Content Activity</span>
          </div>
        </div>
        <ContentTab
          {ndk}
          pubkeys={[user.pubkey]}
          kinds={[1, 30023, 9802, 6, 7]}
          since={Math.floor(Date.now() / 1000) - (7 * 24 * 60 * 60)}
          sort={byCount}
          class="!border-0 !shadow-none !bg-transparent"
        >
          {#snippet tab({ kind, count })}
            <div class="flex flex-col items-center gap-2 px-4 py-3 rounded-lg hover:bg-accent/50 transition-all cursor-pointer group min-w-[80px]">
              <div class="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                <span class="text-lg">
                  {#if kind === 1}
                    📝
                  {:else if kind === 30023}
                    📄
                  {:else if kind === 9802}
                    ✨
                  {:else if kind === 6}
                    🔁
                  {:else if kind === 7}
                    ❤️
                  {:else}
                    📌
                  {/if}
                </span>
              </div>
              <div class="flex flex-col items-center gap-0.5">
                <span class="text-xs font-medium text-foreground">{kindLabel(kind)}</span>
                <span class="text-xs font-bold text-primary">{count}</span>
              </div>
            </div>
          {/snippet}
        </ContentTab>
      </div>
    {/each}
  </div>
{/snippet}

<!-- EditProps snippet -->
<!-- Custom Components section with tabs -->
{#snippet customComponentsSection()}
  <Tabs.Root value="basic">
    <ComponentPageSectionTitle title="Components" description="Explore ContentTab variants and usage">
      {#snippet tabs()}
        <Tabs.List>
          <Tabs.Trigger value="basic">Basic</Tabs.Trigger>
          <Tabs.Trigger value="sorting">Sorting</Tabs.Trigger>
          <Tabs.Trigger value="custom">Custom</Tabs.Trigger>
        </Tabs.List>
      {/snippet}
    </ComponentPageSectionTitle>

    <section class="min-h-[500px] lg:min-h-[60vh] py-12">
      <Tabs.Content value="basic">
        <ComponentCard data={contentTabCard}>
          {#snippet preview()}
            <div class="flex flex-col gap-6">
              <div class="flex flex-col gap-2">
                <span class="text-sm text-muted-foreground">Default (no sorting):</span>
                <ContentTab
                  {ndk}
                  pubkeys={[user1.pubkey]}
                  kinds={[1, 30023, 1063, 9802]}
                />
              </div>
              <div class="flex flex-col gap-2">
                <span class="text-sm text-muted-foreground">With click handler:</span>
                <ContentTab
                  {ndk}
                  pubkeys={[user1.pubkey]}
                  kinds={[1, 30023, 1063]}
                  onTabClick={(tab) => console.log('Clicked:', tab)}
                />
              </div>
            </div>
          {/snippet}
        </ComponentCard>
      </Tabs.Content>

      <Tabs.Content value="sorting">
        <ComponentCard data={contentTabCard}>
          {#snippet preview()}
            <div class="flex flex-col gap-6">
              <div class="flex flex-col gap-2">
                <span class="text-sm text-muted-foreground">Sorted by count (most published):</span>
                <ContentTab
                  {ndk}
                  pubkeys={[user1.pubkey]}
                  kinds={[1, 30023, 1063, 9802]}
                  sort={byCount}
                />
              </div>
              <div class="flex flex-col gap-2">
                <span class="text-sm text-muted-foreground">Sorted by recency (most recent):</span>
                <ContentTab
                  {ndk}
                  pubkeys={[user1.pubkey]}
                  kinds={[1, 30023, 1063, 9802]}
                  sort={byRecency}
                />
              </div>
            </div>
          {/snippet}
        </ComponentCard>
      </Tabs.Content>

      <Tabs.Content value="custom">
        <ComponentCard data={contentTabCard}>
          {#snippet preview()}
            <div class="flex flex-col gap-6">
              <div class="flex flex-col gap-2">
                <span class="text-sm text-muted-foreground">Custom tab rendering with kindLabel:</span>
                <ContentTab
                  {ndk}
                  pubkeys={[user1.pubkey]}
                  kinds={[1, 30023, 1063, 9802]}
                  sort={byCount}
                >
                  {#snippet tab({ kind, count })}
                    <button class="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors flex items-center gap-2">
                      {kindLabel(kind)}
                      <span class="px-2 py-0.5 bg-background/50 rounded-full text-xs">
                        {count}
                      </span>
                    </button>
                  {/snippet}
                </ContentTab>
              </div>

              <div class="flex flex-col gap-2">
                <span class="text-sm text-muted-foreground">Pill style tabs:</span>
                <ContentTab
                  {ndk}
                  pubkeys={[user1.pubkey]}
                  kinds={[1, 30023, 1063, 9802]}
                  sort={byRecency}
                >
                  {#snippet tab({ kind, count })}
                    <div class="flex flex-col items-center gap-1">
                      <button class="px-6 py-3 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-all hover:scale-105">
                        {kindLabel(kind, count)}
                      </button>
                      <span class="text-xs text-muted-foreground">{count} items</span>
                    </div>
                  {/snippet}
                </ContentTab>
              </div>
            </div>
          {/snippet}
        </ComponentCard>
      </Tabs.Content>
    </section>
  </Tabs.Root>
{/snippet}

<!-- Custom sections for Builder API and Usage Examples -->
{#snippet customSections()}
  <!-- Builder API -->
  <section class="mt-16">
    <h2 class="text-3xl font-bold mb-4">Builder API</h2>
    <p class="text-muted-foreground mb-6">
      Use <code class="px-2 py-1 bg-muted rounded text-sm">createContentSampler()</code>
      to build custom content-aware UI with reactive state management.
    </p>

    <div class="bg-muted/50 rounded-lg p-6">
      <h3 class="text-lg font-semibold mb-3">createContentSampler</h3>
      <pre class="text-sm overflow-x-auto"><code>import &#123; createContentSampler, byCount &#125; from '$lib/registry/hooks/content-tab';

// Create content tab sampler
const tabSampler = createContentSampler(() => (&#123;
  pubkeys: ['hexpubkey'],
  kinds: [1, 30023, 1063],  // notes, articles, images
  sort: byCount
&#125;), ndk);

// Access reactive tabs
tabSampler.tabs  // ContentTab[] - only kinds user has published

// Each tab contains:
// &#123; kind: number, count: number, lastPublished?: number &#125;</code></pre>

      <div class="mt-4">
        <h4 class="font-semibold mb-2">Parameters:</h4>
        <ul class="list-disc list-inside space-y-1 text-sm text-muted-foreground">
          <li>
            <code>config</code>: Function returning &#123; pubkeys, kinds, since?, subOpts?, sort? &#125;
          </li>
          <li><code>ndk</code>: NDKSvelte instance (optional, uses context)</li>
        </ul>
      </div>

      <div class="mt-4">
        <h4 class="font-semibold mb-2">Returns:</h4>
        <ul class="list-disc list-inside space-y-1 text-sm text-muted-foreground">
          <li><code>tabs</code>: ContentTab[] - Array of active content types</li>
        </ul>
      </div>

      <div class="mt-4">
        <h4 class="font-semibold mb-2">Subscription Strategy:</h4>
        <p class="text-sm text-muted-foreground">
          Creates a single subscription with n+1 filters where n = kinds.length:
        </p>
        <ul class="list-disc list-inside space-y-1 text-sm text-muted-foreground mt-2">
          <li>One filter with limit 400 for sampling across all kinds</li>
          <li>One filter per kind with limit 1 to detect if user publishes that kind</li>
        </ul>
      </div>
    </div>
  </section>

  <!-- Usage Examples -->
  <section class="mt-16 mb-8">
    <h2 class="text-3xl font-bold mb-4">Usage Examples</h2>

    <div class="space-y-6">
      <div class="bg-muted/50 rounded-lg p-6">
        <h3 class="text-lg font-semibold mb-3">Basic Usage</h3>
        <pre class="text-sm overflow-x-auto"><code>&lt;script&gt;
  import &#123; ContentTab, byCount &#125; from '$lib/registry/components/content-tab';

  const pubkeys = ['hexpubkey'];
  const kinds = [1, 30023, 1063]; // notes, articles, images
&lt;/script&gt;

&lt;ContentTab &#123;ndk&#125; &#123;pubkeys&#125; &#123;kinds&#125; sort=&#123;byCount&#125; /&gt;</code></pre>
      </div>

      <div class="bg-muted/50 rounded-lg p-6">
        <h3 class="text-lg font-semibold mb-3">Custom Tab Rendering with kindLabel</h3>
        <pre class="text-sm overflow-x-auto"><code>&lt;script&gt;
  import &#123; kindLabel &#125; from '$lib/registry/utils';
&lt;/script&gt;

&lt;ContentTab &#123;ndk&#125; &#123;pubkeys&#125; &#123;kinds&#125; sort=&#123;byRecency&#125;&gt;
  &#123;#snippet tab(&#123; kind, count &#125;)&#125;
    &lt;button&gt;
      &#123;kindLabel(kind, count)&#125; (&#123;count&#125;)
    &lt;/button&gt;
  &#123;/snippet&#125;
&lt;/ContentTab&gt;</code></pre>
      </div>

      <div class="bg-muted/50 rounded-lg p-6">
        <h3 class="text-lg font-semibold mb-3">Using the Hook Directly</h3>
        <pre class="text-sm overflow-x-auto"><code>&lt;script&gt;
  import &#123; createContentSampler, byCount &#125; from '$lib/registry/hooks/content-tab';
  import &#123; kindLabel &#125; from '$lib/registry/utils';

  const tabSampler = createContentSampler(() => (&#123;
    pubkeys: ['hexpubkey'],
    kinds: [1, 30023, 1063],
    sort: byCount
  &#125;), ndk);
&lt;/script&gt;

&#123;#each tabSampler.tabs as tab&#125;
  &lt;button&gt;&#123;kindLabel(tab.kind, tab.count)&#125; - &#123;tab.count&#125; items&lt;/button&gt;
&#123;/each&#125;</code></pre>
      </div>

      <div class="bg-muted/50 rounded-lg p-6">
        <h3 class="text-lg font-semibold mb-3">Common Event Kinds</h3>
        <div class="text-sm text-muted-foreground space-y-2">
          <p><code>1</code> - {kindLabel(1, 2)}</p>
          <p><code>30023</code> - {kindLabel(30023, 2)}</p>
          <p><code>1063</code> - {kindLabel(1063, 2)}</p>
          <p><code>9802</code> - Highlights</p>
          <p><code>30311</code> - Live events</p>
          <p><code>1111</code> - Generic replies/comments</p>
        </div>
      </div>
    </div>
  </section>
{/snippet}

<!-- Conditional rendering based on data loading -->
{#if user1 && displayUsers.length > 0}
  <ComponentPageTemplate
    metadata={contentTabMetadata}
    {ndk}
    showcaseComponent={ComponentsShowcase}
    {showcaseBlocks}{customSections}
    beforeComponents={customComponentsSection}
    apiDocs={contentTabMetadata.apiDocs}
  >
    <EditProps.Prop name="User 1" type="user" bind:value={user1} default="npub1l2vyh47mk2p0qlsku7hg0vn29faehy9hy34ygaclpn66ukqp3afqutajft" />
    <EditProps.Prop name="User 2" type="user" bind:value={user2} default="npub180cvv07tjdrrgpa0j7j7tmnyl2yr6yr7l8j4s3evf6u64th6gkwsyjh6w6" />
    <EditProps.Prop name="User 4" type="user" bind:value={user4} default="npub1gcxzte5zlkncx26j68ez60fzkvtkm9e0vrwdcvsjakxf9mu9qewqlfnj5z" />
    <EditProps.Prop name="User 6" type="user" bind:value={user6} default="npub1hu3hdctm5nkzd8gslnyedfr5ddz3z547jqcl5j88g4fame2jd08qep89nw" />
    <EditProps.Prop name="User 7" type="user" bind:value={user7} default="npub1xtscya34g58tk0z605fvr788k263gsu6cy9x0mhnm87echrgufzsevkk5s" />
    <EditProps.Prop name="User 8" type="user" bind:value={user8} default="npub1qny3tkh0acurzla8x3zy4nhrjz5zd8l9sy9jys09umwng00manysew95gx" />
    <EditProps.Prop name="User 9" type="user" bind:value={user9} default="npub1r0rs5q2gk0e3dk3nlc7gnu378ec6cnlenqp8a3cjhyzu6f8k5sgs4sq9ac" />
    <EditProps.Prop name="User 10 (Gigi)" type="user" bind:value={user10} default="npub1dergggklka99wwrs92yz8wdjs952h2ux2ha2ed598ngwu9w7a6fsh9xzpc" />
  </ComponentPageTemplate>
{:else}
  <div class="px-8">
    <PageTitle title={contentTabMetadata.title} subtitle={contentTabMetadata.description}>
      <EditProps.Prop name="User 1" type="user" bind:value={user1} default="npub1l2vyh47mk2p0qlsku7hg0vn29faehy9hy34ygaclpn66ukqp3afqutajft" />
    <EditProps.Prop name="User 2" type="user" bind:value={user2} default="npub180cvv07tjdrrgpa0j7j7tmnyl2yr6yr7l8j4s3evf6u64th6gkwsyjh6w6" />
    <EditProps.Prop name="User 4" type="user" bind:value={user4} default="npub1gcxzte5zlkncx26j68ez60fzkvtkm9e0vrwdcvsjakxf9mu9qewqlfnj5z" />
    <EditProps.Prop name="User 6" type="user" bind:value={user6} default="npub1hu3hdctm5nkzd8gslnyedfr5ddz3z547jqcl5j88g4fame2jd08qep89nw" />
    <EditProps.Prop name="User 7" type="user" bind:value={user7} default="npub1xtscya34g58tk0z605fvr788k263gsu6cy9x0mhnm87echrgufzsevkk5s" />
    <EditProps.Prop name="User 8" type="user" bind:value={user8} default="npub1qny3tkh0acurzla8x3zy4nhrjz5zd8l9sy9jys09umwng00manysew95gx" />
    <EditProps.Prop name="User 9" type="user" bind:value={user9} default="npub1r0rs5q2gk0e3dk3nlc7gnu378ec6cnlenqp8a3cjhyzu6f8k5sgs4sq9ac" />
    <EditProps.Prop name="User 10 (Gigi)" type="user" bind:value={user10} default="npub1dergggklka99wwrs92yz8wdjs952h2ux2ha2ed598ngwu9w7a6fsh9xzpc" />
    </PageTitle>
    <div class="flex items-center justify-center py-12">
      <div class="text-muted-foreground">Select a user to see the components...</div>
    </div>
  </div>
{/if}
