<!--
  @component ContentTab
  Displays tabs based on the types of content a user actually publishes.

  Uses createContentTab hook to sample user content and conditionally show tabs.
  Requires a snippet for rendering each tab.

  @example Basic
  ```svelte
<script>
    import { ContentTab, byCount } from './';
    import { kindLabel } from '../../utils/kind-label.js';

    const pubkeys = ['hexpubkey'];
    const kinds = [1, 30023, 1063];
  </script>

  <ContentTab {ndk} {pubkeys} {kinds} sort={byCount}>
    {#snippet tab({ kind, name, count })}
      <button>{name} ({count})</button>
    {/snippet}
  </ContentTab>
  ```

  @example With custom styling
  ```svelte
  <ContentTab {ndk} {pubkeys} {kinds}>
    {#snippet tab({ kind, name, count })}
      <button class="px-4 py-2 bg-primary text-primary-foreground rounded-md">
        {name} - {count} posts
      </button>
    {/snippet}
  </ContentTab>
  ```
-->
<script lang="ts">
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import type { NDKSubscriptionOptions } from '@nostr-dev-kit/ndk';
  import type { Snippet } from 'svelte';
  import { createContentSampler, type ContentTab as ContentTabType } from '../../builders/content-tab';
  import { cn } from '../../utils/cn';
  import { kindLabel } from '../../utils/kind-label.js';

  interface Props {
    ndk: NDKSvelte;

    pubkeys: string[];

    kinds: number[];

    since?: number;

    subOpts?: NDKSubscriptionOptions;

    sort?: (tabs: ContentTabType[]) => ContentTabType[];

    class?: string;

    tab: Snippet<[ContentTabType & { name: string }]>;

    onTabClick?: (tab: ContentTabType) => void;
  }

  let {
    ndk,
    pubkeys = [],
    kinds = [],
    since,
    subOpts,
    sort,
    class: className = '',
    tab,
    onTabClick
  }: Props = $props();

  const tabSampler = createContentSampler(() => ({
    pubkeys,
    kinds,
    since,
    subOpts,
    sort
  }), ndk);
</script>

<div
  data-content-tab=""
  class={cn('flex gap-0 bg-background border-b border-border shadow-sm', className)}
  role="tablist"
  aria-label="Content tabs"
>
  {#each tabSampler.tabs as tabItem (tabItem.kind)}
    {@render tab({ ...tabItem, name: kindLabel(tabItem.kind, tabItem.count) })}
  {/each}
</div>
