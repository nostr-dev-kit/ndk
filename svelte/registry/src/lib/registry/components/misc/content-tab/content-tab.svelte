<!--
  @component ContentTab
  Displays tabs based on the types of content a user actually publishes.

  Uses createContentTab hook to sample user content and conditionally show tabs.
  Requires a snippet for rendering each tab.

  @example Basic
  ```svelte
<script>
    import { ContentTab, byCount } from '$lib/registry/components/misc/content-tab';
    import { kindLabel } from '$lib/registry/utils/kind-label.js';

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
  import { createContentSampler, type ContentTab as ContentTabType } from '$lib/registry/builders/content-tab';
  import { cn } from '$lib/registry/utils/cn';
  import { kindLabel } from '$lib/registry/utils/kind-label.js';

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
    tab: tabSnippet,
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
  {#each tabSampler.tabs as tab (tab.kind)}
    {#if tabSnippet}
      {@render tabSnippet(tab)}
    {:else}
      <button
        type="button"
        class="flex items-center justify-center gap-2 px-4 py-3 flex-1 min-w-0 border-none bg-transparent cursor-pointer transition-all duration-200 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-transparent after:transition-colors hover:bg-accent hover:after:bg-primary hover:after:opacity-30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary focus-visible:-outline-offset-2"
        role="tab"
        onclick={() => onTabClick?.(tab)}
      >
        <span class="text-sm font-medium text-foreground text-center whitespace-nowrap overflow-hidden text-ellipsis">{kindLabel(tab.kind, tab.count)}</span>
        <span class="text-xs font-semibold text-muted-foreground px-2 py-0.5 rounded bg-muted">{tab.count}</span>
      </button>
    {/if}
  {/each}
</div>
