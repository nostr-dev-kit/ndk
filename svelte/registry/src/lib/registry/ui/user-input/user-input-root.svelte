<script lang="ts">
  import { setContext } from 'svelte';
  import type { NDKUser } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { createUserInput } from '$lib/registry/builders/user-input/index.svelte.js';
  import { USER_INPUT_CONTEXT_KEY, type UserInputContext } from './user-input.context.js';
  import { getNDKFromContext } from '../../utils/ndk-context.svelte.js';
  import type { Snippet } from 'svelte';

  interface Props {
    ndk?: NDKSvelte;

    onSelect?: (user: NDKUser) => void;

    debounceMs?: number;

    class?: string;

    children: Snippet;
  }

  let {
    ndk: providedNdk,
    onSelect,
    debounceMs = 300,
    class: className = '',
    children
  }: Props = $props();

  const ndk = getNDKFromContext(providedNdk);

  // Local query state
  let query = $state('');

  // Create user input builder with reactive config
  const userInputState = createUserInput(() => ({
    query,
    onSelect,
    debounceMs
  }), ndk);

  // Create reactive context with getters
  const context: UserInputContext = {
    get ndk() { return ndk; },
    get query() { return query; },
    setQuery(newQuery: string) { query = newQuery; },
    get results() { return userInputState.results; },
    get selectedUser() { return userInputState.selectedUser; },
    selectUser: userInputState.selectUser,
    clear: userInputState.clear,
    get loading() { return userInputState.loading; },
    get onSelect() { return onSelect; }
  };

  setContext(USER_INPUT_CONTEXT_KEY, context);
</script>

<div class="relative w-full {className}">
  {@render children()}
</div>
