<script lang="ts">
    import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { ndk } from '$lib/site/ndk.svelte';
  import { NDKUser } from '@nostr-dev-kit/ndk';
  import ComponentPageTemplate from '$lib/site/templates/ComponentPageTemplate.svelte';
  import { EditProps } from '$lib/site/components/edit-props';
  import ComponentCard from '$site-components/ComponentCard.svelte';
  import * as Tabs from '$lib/site/components/ui/tabs';
  import { kindLabel } from '$lib/registry/utils/kind-label.js';
  import { User } from '$lib/registry/ui/user';

  // Import example components
  import BasicUsageRaw from './examples/basic-usage/index.txt?raw';

  // Import registry metadata
  import contentTabCard from '$lib/registry/components/content-tab/metadata.json';

  // Import the component
  import ContentTab from '$lib/registry/components/content-tab/content-tab.svelte';
  import { byCount, byRecency } from '$lib/registry/builders/content-tab';

  // Page metadata
  const metadata = {
    title: 'Content Tab',
    description: 'Smart content type selector with automatic kind detection'
  };
  let user1 = $state<NDKUser | undefined>();
  let user2 = $state<NDKUser | undefined>();
  let user4 = $state<NDKUser | undefined>();
  let user6 = $state<NDKUser | undefined>();
  let user7 = $state<NDKUser | undefined>();
  let user8 = $state<NDKUser | undefined>();
  let user9 = $state<NDKUser | undefined>();
  let user10 = $state<NDKUser | undefined>();

  const displayUsers = $derived([user1, user2, user4, user6, user7, user8, user9, user10].filter((u): u is NDKUser => u !== undefined && u.pubkey !== undefined));

  // Sorting state for showcase
  let sortMethod = $state<'count' | 'recency'>('count');

  // Components section configuration
  const componentsSection = {
    title: 'Components',
    description: 'Explore each variant in detail',
    cards: [
      {...contentTabCard, code: BasicUsageRaw}
    ],
    previews: {
      'content-tab': contentTabComponentPreview
    }
  };
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
        >
          {#snippet tab({ kind, name, count })}
            <button
              type="button"
              class="flex items-center justify-center gap-2 px-4 py-3 flex-1 min-w-0 border-none bg-transparent cursor-pointer transition-all duration-200 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-transparent after:transition-colors hover:bg-accent hover:after:bg-primary hover:after:opacity-30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary focus-visible:-outline-offset-2"
              role="tab"
            >
              <span class="text-sm font-medium text-foreground text-center whitespace-nowrap overflow-hidden text-ellipsis">{name}</span>
              <span class="text-xs font-semibold text-muted-foreground px-2 py-0.5 rounded bg-muted">{count}</span>
            </button>
          {/snippet}
        </ContentTab>
      </div>
    {/each}
  </div>
{/snippet}

{#snippet sortControl()}
  <div class="flex gap-2" onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.stopPropagation()} role="presentation">
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

{#snippet contentTabComponentPreview()}
  {#if user1 && user1.pubkey}
    <div class="flex flex-col gap-2">
      <span class="text-sm text-muted-foreground">Default (no sorting):</span>
      <ContentTab
        {ndk}
        pubkeys={[user1.pubkey]}
        kinds={[1, 30023, 1063, 9802]}
      >
        {#snippet tab({ kind, name, count })}
          <button
            type="button"
            class="flex items-center justify-center gap-2 px-4 py-3 flex-1 min-w-0 border-none bg-transparent cursor-pointer transition-all duration-200 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-transparent after:transition-colors hover:bg-accent hover:after:bg-primary hover:after:opacity-30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary focus-visible:-outline-offset-2"
            role="tab"
          >
            <span class="text-sm font-medium text-foreground text-center whitespace-nowrap overflow-hidden text-ellipsis">{name}</span>
            <span class="text-xs font-semibold text-muted-foreground px-2 py-0.5 rounded bg-muted">{count}</span>
          </button>
        {/snippet}
      </ContentTab>
    </div>
  {/if}
{/snippet}

<!-- Overview section -->
{#snippet overview()}
  <div class="text-lg text-muted-foreground space-y-4">
    <p>
      Content Tab intelligently displays tabs based on the types of content users actually publish. It samples user content to automatically detect which event kinds they use, showing only relevant tabs with accurate counts.
    </p>

    <p>
      The component uses an efficient sampling strategy with customizable sorting (by count or recency), optional click handlers, and fully customizable tab rendering via Svelte 5 snippets. Perfect for user profile content categories or feed filtering interfaces.
    </p>

    <p>
      Common use cases include filtering between notes, articles, images, highlights, and other Nostr event kinds without showing empty categories to users.
    </p>
  </div>
{/snippet}

<!-- Recipes section -->
{#snippet recipes()}
  <div class="space-y-6">
    <div class="bg-muted/50 rounded-lg p-6">
      <h3 class="text-lg font-semibold mb-3">Basic Usage</h3>
      <pre class="text-sm overflow-x-auto"><code>&lt;script&gt;
  import &#123; ContentTab, byCount &#125; from '$lib/registry/components/content-tab';

  const pubkeys = ['hexpubkey'];
  const kinds = [1, 30023, 1063]; // notes, articles, images
&lt;/script&gt;

&lt;ContentTab &#123;ndk&#125; &#123;pubkeys&#125; &#123;kinds&#125; sort=&#123;byCount&#125;&gt;
  &#123;#snippet tab(&#123; kind, name, count &#125;)&#125;
    &lt;button&gt;&#123;name&#125; (&#123;count&#125;)&lt;/button&gt;
  &#123;/snippet&#125;
&lt;/ContentTab&gt;</code></pre>
    </div>

    <div class="bg-muted/50 rounded-lg p-6">
      <h3 class="text-lg font-semibold mb-3">Custom Tab Rendering</h3>
      <pre class="text-sm overflow-x-auto"><code>&lt;ContentTab &#123;ndk&#125; &#123;pubkeys&#125; &#123;kinds&#125; sort=&#123;byRecency&#125;&gt;
  &#123;#snippet tab(&#123; kind, name, count &#125;)&#125;
    &lt;button class="px-4 py-2 bg-primary text-primary-foreground rounded-md"&gt;
      &#123;name&#125; - &#123;count&#125; posts
    &lt;/button&gt;
  &#123;/snippet&#125;
&lt;/ContentTab&gt;</code></pre>
    </div>

    <div class="bg-muted/50 rounded-lg p-6">
      <h3 class="text-lg font-semibold mb-3">Using the Builder Directly</h3>
      <pre class="text-sm overflow-x-auto"><code>&lt;script&gt;
  import &#123; createContentSampler, byCount &#125; from '$lib/registry/builders/content-tab';
  import &#123; kindLabel &#125; from '$lib/registry/utils/kind-label.js';

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
{/snippet}

<!-- Anatomy section (keeping the detailed Tabs-based component examples) -->
{#snippet anatomy()}
  {#if user1}
    <Tabs.Root value="basic">
      <div class="flex items-center justify-between mb-8">
        <Tabs.List>
          <Tabs.Trigger value="basic">Basic</Tabs.Trigger>
          <Tabs.Trigger value="sorting">Sorting</Tabs.Trigger>
          <Tabs.Trigger value="custom">Custom</Tabs.Trigger>
        </Tabs.List>
      </div>

      <section class="min-h-[500px] lg:min-h-[60vh]">
        <Tabs.Content value="basic">
          <ComponentCard data={{ ...contentTabCard, code: BasicUsageRaw }}>
            {#snippet preview()}
              <div class="flex flex-col gap-6">
                <div class="flex flex-col gap-2">
                  <span class="text-sm text-muted-foreground">Default (no sorting):</span>
                  <ContentTab
                    {ndk}
                    pubkeys={[user1!.pubkey]}
                    kinds={[1, 30023, 1063, 9802]}
                  >
                    {#snippet tab({ kind, name, count })}
                      <button
                        type="button"
                        class="flex items-center justify-center gap-2 px-4 py-3 flex-1 min-w-0 border-none bg-transparent cursor-pointer transition-all duration-200 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-transparent after:transition-colors hover:bg-accent hover:after:bg-primary hover:after:opacity-30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary focus-visible:-outline-offset-2"
                        role="tab"
                      >
                        <span class="text-sm font-medium text-foreground text-center whitespace-nowrap overflow-hidden text-ellipsis">{name}</span>
                        <span class="text-xs font-semibold text-muted-foreground px-2 py-0.5 rounded bg-muted">{count}</span>
                      </button>
                    {/snippet}
                  </ContentTab>
                </div>
                <div class="flex flex-col gap-2">
                  <span class="text-sm text-muted-foreground">With click handler:</span>
                  <ContentTab
                    {ndk}
                    pubkeys={[user1!.pubkey]}
                    kinds={[1, 30023, 1063]}
                    onTabClick={(tab) => {}}
                  >
                    {#snippet tab({ kind, name, count })}
                      <button
                        type="button"
                        class="flex items-center justify-center gap-2 px-4 py-3 flex-1 min-w-0 border-none bg-transparent cursor-pointer transition-all duration-200 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-transparent after:transition-colors hover:bg-accent hover:after:bg-primary hover:after:opacity-30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary focus-visible:-outline-offset-2"
                        role="tab"
                      >
                        <span class="text-sm font-medium text-foreground text-center whitespace-nowrap overflow-hidden text-ellipsis">{name}</span>
                        <span class="text-xs font-semibold text-muted-foreground px-2 py-0.5 rounded bg-muted">{count}</span>
                      </button>
                    {/snippet}
                  </ContentTab>
                </div>
              </div>
            {/snippet}
          </ComponentCard>
        </Tabs.Content>

        <Tabs.Content value="sorting">
          <ComponentCard data={{ ...contentTabCard, code: BasicUsageRaw }}>
            {#snippet preview()}
              <div class="flex flex-col gap-6">
                <div class="flex flex-col gap-2">
                  <span class="text-sm text-muted-foreground">Sorted by count (most published):</span>
                  <ContentTab
                    {ndk}
                    pubkeys={[user1!.pubkey]}
                    kinds={[1, 30023, 1063, 9802]}
                    sort={byCount}
                  >
                    {#snippet tab({ kind, name, count })}
                      <button
                        type="button"
                        class="flex items-center justify-center gap-2 px-4 py-3 flex-1 min-w-0 border-none bg-transparent cursor-pointer transition-all duration-200 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-transparent after:transition-colors hover:bg-accent hover:after:bg-primary hover:after:opacity-30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary focus-visible:-outline-offset-2"
                        role="tab"
                      >
                        <span class="text-sm font-medium text-foreground text-center whitespace-nowrap overflow-hidden text-ellipsis">{name}</span>
                        <span class="text-xs font-semibold text-muted-foreground px-2 py-0.5 rounded bg-muted">{count}</span>
                      </button>
                    {/snippet}
                  </ContentTab>
                </div>
                <div class="flex flex-col gap-2">
                  <span class="text-sm text-muted-foreground">Sorted by recency (most recent):</span>
                  <ContentTab
                    {ndk}
                    pubkeys={[user1!.pubkey]}
                    kinds={[1, 30023, 1063, 9802]}
                    sort={byRecency}
                  >
                    {#snippet tab({ kind, name, count })}
                      <button
                        type="button"
                        class="flex items-center justify-center gap-2 px-4 py-3 flex-1 min-w-0 border-none bg-transparent cursor-pointer transition-all duration-200 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-transparent after:transition-colors hover:bg-accent hover:after:bg-primary hover:after:opacity-30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary focus-visible:-outline-offset-2"
                        role="tab"
                      >
                        <span class="text-sm font-medium text-foreground text-center whitespace-nowrap overflow-hidden text-ellipsis">{name}</span>
                        <span class="text-xs font-semibold text-muted-foreground px-2 py-0.5 rounded bg-muted">{count}</span>
                      </button>
                    {/snippet}
                  </ContentTab>
                </div>
              </div>
            {/snippet}
          </ComponentCard>
        </Tabs.Content>

        <Tabs.Content value="custom">
          <ComponentCard data={{ ...contentTabCard, code: BasicUsageRaw }}>
            {#snippet preview()}
              <div class="flex flex-col gap-6">
                <div class="flex flex-col gap-2">
                  <span class="text-sm text-muted-foreground">Custom tab rendering:</span>
                  <ContentTab
                    {ndk}
                    pubkeys={[user1!.pubkey]}
                    kinds={[1, 30023, 1063, 9802]}
                    sort={byCount}
                  >
                    {#snippet tab({ kind, name, count })}
                      <button class="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors flex items-center gap-2">
                        {name}
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
                    pubkeys={[user1!.pubkey]}
                    kinds={[1, 30023, 1063, 9802]}
                    sort={byRecency}
                  >
                    {#snippet tab({ kind, name, count })}
                      <div class="flex flex-col items-center gap-1">
                        <button class="px-6 py-3 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-all hover:scale-105">
                          {name}
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
  {/if}
{/snippet}

<!-- Use the template -->
<ComponentPageTemplate
  {metadata}
  {ndk}
  {overview}
  showcaseComponents={[
    {
      id: "contentTabCard",
      cardData: contentTabCard,
      preview: defaultPreview,
      control: sortControl,
      orientation: 'vertical'
    }
  ]}
  {componentsSection}
  {anatomy}
  {recipes}
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
