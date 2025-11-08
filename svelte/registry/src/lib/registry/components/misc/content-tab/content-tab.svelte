<!--
  @component ContentTab
  Displays tabs based on the types of content a user actually publishes.

  Uses createContentTab hook to sample user content and conditionally show tabs.
  Minimal styling - users should provide their own styles.

  @example Basic
  ```svelte
<script>
    import { ContentTab, byCount } from '$lib/registry/components/misc/content-tab';

    const pubkeys = ['hexpubkey'];
    const kinds = [1, 30023, 1063];
  </script>

  <ContentTab {ndk} {pubkeys} {kinds} sort={byCount} />
  ```

  @example With custom tab renderer
  ```svelte
  <ContentTab {ndk} {pubkeys} {kinds}>
    {#snippet tab({ kind, count })}
      <button>Kind {kind} ({count} posts)</button>
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

    tab?: Snippet<[ContentTabType]>;

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
  class={cn('content-tab-container', className)}
  role="tablist"
  aria-label="Content tabs"
>
  {#each tabSampler.tabs as tab (tab.kind)}
    {#if tabSnippet}
      {@render tabSnippet(tab)}
    {:else}
      <button
        type="button"
        class="content-tab-item"
        role="tab"
        onclick={() => onTabClick?.(tab)}
      >
        <span class="content-tab-kind">{kindLabel(tab.kind, tab.count)}</span>
        <span class="content-tab-count">{tab.count}</span>
      </button>
    {/if}
  {/each}
</div>

<style>
  .content-tab-container {
    display: flex;
    gap: 0;
    background: var(--background, white);
    border-bottom: 1px solid var(--border, #e5e7eb);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }

  .content-tab-item {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    flex: 1;
    min-width: 0;
    border: none;
    background: transparent;
    cursor: pointer;
    transition: all 0.2s ease;
    position: relative;
  }

  .content-tab-item::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: transparent;
    transition: background 0.2s ease;
  }

  .content-tab-item:hover {
    background: var(--accent, rgba(0, 0, 0, 0.04));
  }

  .content-tab-item:hover::after {
    background: var(--primary, #3b82f6);
    opacity: 0.3;
  }

  .content-tab-item:focus-visible {
    outline: 2px solid var(--primary, #3b82f6);
    outline-offset: -2px;
  }

  .content-tab-kind {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--foreground, #1f2937);
    text-align: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .content-tab-count {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--muted-foreground, #6b7280);
    padding: 0.125rem 0.5rem;
    border-radius: 0.25rem;
    background: var(--muted, #f3f4f6);
  }
</style>
