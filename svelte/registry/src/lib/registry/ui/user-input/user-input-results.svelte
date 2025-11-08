<script lang="ts">
  import { getContext } from 'svelte';
  import type { Snippet } from 'svelte';
  import type { UserInputResult } from '@nostr-dev-kit/svelte';
  import { USER_INPUT_CONTEXT_KEY, type UserInputContext } from './user-input.context.js';

  interface Props {
    children?: Snippet<[UserInputResult]>;

    empty?: Snippet;

    maxResults?: number;

    class?: string;
  }

  let {
    children,
    empty,
    maxResults,
    class: className = ''
  }: Props = $props();

  const context = getContext<UserInputContext>(USER_INPUT_CONTEXT_KEY);
  if (!context) {
    throw new Error('UserInput.Results must be used within UserInput.Root');
  }

  const displayedResults = $derived(
    maxResults ? context.results.slice(0, maxResults) : context.results
  );

  const hasResults = $derived(displayedResults.length > 0);
  const hasQuery = $derived(context.query.trim().length > 0);
</script>

<div class="absolute top-full left-0 right-0 z-50 empty:hidden {className}" role="listbox">
  {#if hasResults && children}
    {#each displayedResults as result (result.user.pubkey)}
      {@render children(result)}
    {/each}
  {:else if hasQuery && !context.loading && empty}
    {@render empty()}
  {:else if hasQuery && !context.loading}
    <div>
      No users found
    </div>
  {/if}
</div>
