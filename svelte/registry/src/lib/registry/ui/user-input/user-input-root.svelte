<!-- @ndk-version: user-input@0.6.0 -->
<script lang="ts">
  import { setContext } from 'svelte';
  import type { NDKUser } from '@nostr-dev-kit/ndk';
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { createUserInput } from '@nostr-dev-kit/svelte';
  import { USER_INPUT_CONTEXT_KEY, type UserInputContext } from './context.svelte.js';
  import { getNDKFromContext } from '../../utils/ndk-context.svelte.js';
  import type { Snippet } from 'svelte';

  interface Props {
    /** NDK instance (optional, falls back to context) */
    ndk?: NDKSvelte;

    /** Callback when user is selected */
    onSelect?: (user: NDKUser) => void;

    /** Debounce delay for NIP-05/npub lookups (default: 300ms) */
    debounceMs?: number;

    /** Additional CSS classes */
    class?: string;

    /** Child components */
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

<div class="user-input-root {className}">
  {@render children()}
</div>

<style>
  .user-input-root {
    position: relative;
    width: 100%;
  }
</style>
