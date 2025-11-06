<script lang="ts">
  import { getContext } from 'svelte';
  import { USER_INPUT_CONTEXT_KEY, type UserInputContext } from './user-input.context.js';
  import type { Snippet } from 'svelte';
  import { mergeProps } from '../../utils/merge-props.js';

  interface SearchSnippetProps {
    query: string;
    loading: boolean;
  }

  interface Props {
    placeholder?: string;

    class?: string;

    autofocus?: boolean;

    child?: Snippet<[{ props: any } & SearchSnippetProps]>;

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
