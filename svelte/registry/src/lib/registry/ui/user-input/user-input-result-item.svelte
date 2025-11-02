<!-- @ndk-version: user-input@0.6.0 -->
<script lang="ts">
  import { getContext } from 'svelte';
  import type { UserInputResult } from '@nostr-dev-kit/svelte';
  import { USER_INPUT_CONTEXT_KEY, type UserInputContext } from './context.svelte.js';
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
  if (!context) {
    throw new Error('UserInput.ResultItem must be used within UserInput.Root');
  }
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
    all: unset;
    display: block;
    width: 100%;
    cursor: pointer;
  }
</style>
