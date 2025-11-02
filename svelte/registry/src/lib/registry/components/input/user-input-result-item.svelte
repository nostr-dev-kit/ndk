<!-- @ndk-version: user-input@0.6.0 -->
<script lang="ts">
  import { getContext } from 'svelte';
  import type { UserInputResult } from '@nostr-dev-kit/svelte';
  import { USER_INPUT_CONTEXT_KEY, type UserInputContext } from './context.svelte.ts';
  import UserListItem from '$lib/registry/components/blocks/user-list-item.svelte';

  interface Props {
    /** Result to display */
    result: UserInputResult;

    /** Additional CSS classes */
    class?: string;
  }

  let {
    result,
    class: className = ''
  }: Props = $props();

  const context = getContext<UserInputContext>(USER_INPUT_CONTEXT_KEY);
  const ndk = context.ndk;

  function handleClick() {
    context.selectUser(result.user);
  }
</script>

<button
  type="button"
  class="user-input-result-item {className}"
  onclick={handleClick}
>
  <UserListItem {ndk} pubkey={result.user.pubkey} class="py-2 px-0 border-none hover:bg-transparent" />
</button>

<style>
  .user-input-result-item {
    width: 100%;
    padding: 0;
    border: none;
    background: transparent;
    cursor: pointer;
    transition: background-color 0.15s;
  }

  .user-input-result-item:hover {
    background-color: hsl(var(--color-accent));
  }

  .user-input-result-item:focus {
    outline: none;
    background-color: hsl(var(--color-accent));
  }
</style>
