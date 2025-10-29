<!-- @ndk-version: user-input@0.4.0 -->
<script lang="ts">
  import { getContext } from 'svelte';
  import type { Snippet } from 'svelte';
  import type { UserInputResult } from '@nostr-dev-kit/svelte';
  import { USER_INPUT_CONTEXT_KEY, type UserInputContext } from './context.svelte.js';

  interface Props {
    /** Optional snippet to render each result */
    children?: Snippet<[UserInputResult]>;

    /** Empty state snippet */
    empty?: Snippet;

    /** Maximum number of results to show */
    maxResults?: number;

    /** Additional CSS classes */
    class?: string;
  }

  let {
    children,
    empty,
    maxResults,
    class: className = ''
  }: Props = $props();

  const context = getContext<UserInputContext>(USER_INPUT_CONTEXT_KEY);

  const displayedResults = $derived(
    maxResults ? context.results.slice(0, maxResults) : context.results
  );

  const hasResults = $derived(displayedResults.length > 0);
  const hasQuery = $derived(context.query.trim().length > 0);
</script>

<div class="user-input-results {className}">
  {#if hasResults && children}
    {#each displayedResults as result (result.user.pubkey)}
      {@render children(result)}
    {/each}
  {:else if hasQuery && !context.loading && empty}
    {@render empty()}
  {:else if hasQuery && !context.loading}
    <div class="user-input-results-empty">
      No users found
    </div>
  {/if}
</div>

<style>
  .user-input-results {
    position: absolute;
    top: calc(100% + 0.25rem);
    left: 0;
    right: 0;
    z-index: 50;
    max-height: 20rem;
    overflow-y: auto;
    background-color: hsl(var(--popover));
    border: 1px solid hsl(var(--border));
    border-radius: 0.375rem;
    box-shadow: 0 4px 6px -1px color-mix(in srgb, var(--foreground) 10%, transparent), 0 2px 4px -2px color-mix(in srgb, var(--foreground) 10%, transparent);
  }

  .user-input-results:empty {
    display: none;
  }

  .user-input-results-empty {
    padding: 1rem;
    text-align: center;
    color: hsl(var(--muted-foreground));
    font-size: 0.875rem;
  }
</style>
