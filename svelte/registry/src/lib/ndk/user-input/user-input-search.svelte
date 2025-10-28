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

  // Bind to context query
  let inputValue = $state(context.query);

  // Update context when input changes
  $effect(() => {
    context.setQuery(inputValue);
  });

  // Sync with context changes (if query is changed externally)
  $effect(() => {
    if (context.query !== inputValue) {
      inputValue = context.query;
    }
  });
</script>

<div class="user-input-search {className}">
  <input
    type="text"
    bind:value={inputValue}
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
    width: 100%;
  }

  .user-input-search-input {
    width: 100%;
    padding: 0.5rem 0.75rem;
    border: 1px solid hsl(var(--border));
    border-radius: 0.375rem;
    background-color: hsl(var(--background));
    color: hsl(var(--foreground));
    font-size: 0.875rem;
    outline: none;
    transition: border-color 0.15s;
  }

  .user-input-search-input:focus {
    border-color: hsl(var(--ring));
    box-shadow: 0 0 0 2px hsl(var(--ring) / 0.2);
  }

  .user-input-search-input.loading {
    padding-right: 2.5rem;
  }

  .user-input-search-loading {
    position: absolute;
    right: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    width: 1rem;
    height: 1rem;
  }

  .spinner {
    animation: rotate 2s linear infinite;
    width: 100%;
    height: 100%;
  }

  .spinner circle {
    stroke: hsl(var(--primary));
    stroke-linecap: round;
    animation: dash 1.5s ease-in-out infinite;
  }

  @keyframes rotate {
    100% {
      transform: rotate(360deg);
    }
  }

  @keyframes dash {
    0% {
      stroke-dasharray: 1, 150;
      stroke-dashoffset: 0;
    }
    50% {
      stroke-dasharray: 90, 150;
      stroke-dashoffset: -35;
    }
    100% {
      stroke-dasharray: 90, 150;
      stroke-dashoffset: -124;
    }
  }
</style>
