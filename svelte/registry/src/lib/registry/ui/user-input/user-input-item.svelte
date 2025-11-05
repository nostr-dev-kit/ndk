<script lang="ts">
  import { mergeProps } from '../../utils/merge-props.js';
  import { getContext } from 'svelte';
  import type { Snippet } from 'svelte';
  import type { UserInputResult } from '@nostr-dev-kit/svelte';
  import { USER_INPUT_CONTEXT_KEY, type UserInputContext } from './user-input.context.js';

  interface Props {
    /** Result to display */
    result: UserInputResult;

    /** Additional CSS classes */
    class?: string;

    /** Custom rendering with access to merged props */
    child?: Snippet<[{ props: Record<string, any>; result: UserInputResult }]>;

    /** Default children rendering */
    children?: Snippet<[{ result: UserInputResult }]>;

    /** Custom click handler (will be merged with selection logic) */
    onclick?: (e: MouseEvent) => void;

    [key: string]: any;
  }

  let {
    result,
    class: className = '',
    child,
    children,
    onclick,
    ...restProps
  }: Props = $props();

  const context = getContext<UserInputContext>(USER_INPUT_CONTEXT_KEY);
  if (!context) {
    throw new Error('UserInput.Item must be used within UserInput.Root');
  }

  function handleClick(e: MouseEvent) {
    onclick?.(e);
    context.selectUser(result.user);
  }

  const itemProps = $derived({
    onclick: handleClick,
    type: 'button' as const,
    role: 'option' as const,
    tabindex: 0,
  });

  const mergedProps = $derived(mergeProps(restProps, itemProps, { class: className }));
</script>

{#if child}
  {@render child({ props: mergedProps, result })}
{:else}
  <button {...mergedProps}>
    {@render children?.({ result })}
  </button>
{/if}

<style>
  button {
    all: unset;
    display: block;
    width: 100%;
    cursor: pointer;
  }
</style>
