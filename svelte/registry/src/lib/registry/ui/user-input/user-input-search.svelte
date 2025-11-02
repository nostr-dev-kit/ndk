<!-- @ndk-version: user-input@0.7.0 -->
<!--
  @component UserInput.Search
  Headless search input that connects to UserInput context.

  @example Basic usage:
  ```svelte
  <UserInput.Search />
  ```

  @example Custom input:
  ```svelte
  <UserInput.Search>
    {#snippet child({ props, loading })}
      <div class="custom-wrapper">
        <input {...props} class="custom-input" />
        {#if loading}<span>Searching...</span>{/if}
      </div>
    {/snippet}
  </UserInput.Search>
  ```
-->
<script lang="ts">
  import { getContext } from 'svelte';
  import { USER_INPUT_CONTEXT_KEY, type UserInputContext } from './context.svelte.js';
  import type { Snippet } from 'svelte';
  import { mergeProps } from '../../utils/index.js';

  interface SearchSnippetProps {
    query: string;
    loading: boolean;
  }

  interface Props {
    /** Placeholder text */
    placeholder?: string;

    /** Additional CSS classes */
    class?: string;

    /** Whether to autofocus */
    autofocus?: boolean;

    /** Child snippet for custom element rendering */
    child?: Snippet<[{ props: any } & SearchSnippetProps]>;

    /** Content snippet for custom content */
    children?: Snippet<[SearchSnippetProps]>;
  }

  let {
    placeholder = 'Search users by name, NIP-05, npub...',
    class: className = '',
    autofocus = false,
    child,
    children,
    ...restProps
  }: Props = $props();

  const context = getContext<UserInputContext>(USER_INPUT_CONTEXT_KEY);
  if (!context) {
    throw new Error('UserInput.Search must be used within UserInput.Root');
  }

  let query = $derived(context.query);
  let loading = $derived(context.loading);

  function handleInput(event: Event) {
    const target = event.target as HTMLInputElement;
    context.setQuery(target.value);
  }

  const mergedProps = $derived(mergeProps(restProps, {
    type: 'text',
    value: query,
    oninput: handleInput,
    placeholder,
    autofocus,
    class: className,
    'data-loading': loading
  }));

  const snippetProps = $derived({ query, loading });
</script>

{#if child}
  {@render child({ props: mergedProps, ...snippetProps })}
{:else}
  <input {...mergedProps}>
  {#if children}
    {@render children(snippetProps)}
  {/if}
{/if}
