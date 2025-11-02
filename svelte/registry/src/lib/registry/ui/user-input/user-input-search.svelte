<!-- @ndk-version: user-input@0.6.0 -->
<script lang="ts">
  import { getContext } from 'svelte';
  import { USER_INPUT_CONTEXT_KEY, type UserInputContext } from './context.svelte.js';

  interface Props {
    /** Placeholder text */
    placeholder?: string;

    /** Additional CSS classes */
    class?: string;

    /** Whether to autofocus */
    autofocus?: boolean;
  }

  let {
    placeholder = 'Search users by name, NIP-05, npub...',
    class: className = '',
    autofocus = false
  }: Props = $props();

  const context = getContext<UserInputContext>(USER_INPUT_CONTEXT_KEY);
  if (!context) {
    throw new Error('UserInput.Search must be used within UserInput.Root');
  }

  let query = $derived(context.query);

  function handleInput(event: Event) {
    const target = event.target as HTMLInputElement;
    context.setQuery(target.value);
  }
</script>

<div class="user-input-search {className}">
  <input
    type="text"
    value={query}
    oninput={handleInput}
    {placeholder}
    {autofocus}
    class="user-input-search-input"
    class:loading={context.loading}
  />
  {#if context.loading}
    <div class="user-input-search-loading">
      <svg class="spinner" viewBox="0 0 50 50">
        <circle cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle>
      </svg>
    </div>
  {/if}
</div>

<style>
  .user-input-search {
    position: relative;
    display: inline-block;
    width: 100%;
  }

  .user-input-search-input {
    width: 100%;
  }

  .user-input-search-loading {
    position: absolute;
    right: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    pointer-events: none;
  }
</style>
