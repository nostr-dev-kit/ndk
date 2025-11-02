<!-- @ndk-version: user-search-combobox@0.1.0 -->
<!--
  @component UserSearchCombobox
  User search combobox using bits-ui for accessible keyboard navigation.
  Search users by name, NIP-05, or npub with real-time results.

  @example Default usage
  ```svelte
  <UserSearchCombobox {ndk} onSelect={(user) => console.log(user)} />
  ```

  @example With custom input element
  ```svelte
  <UserSearchCombobox {ndk} onSelect={(user) => console.log(user)}>
    {#snippet input({ value, oninput, loading })}
      <input {value} {oninput} placeholder="Search..." class="my-custom-input" />
    {/snippet}
  </UserSearchCombobox>
  ```

  @example With textarea
  ```svelte
  <UserSearchCombobox {ndk}>
    {#snippet input({ value, oninput, loading })}
      <textarea {value} {oninput} placeholder="Type to search users..." class="custom-textarea" />
    {/snippet}
  </UserSearchCombobox>
  ```
-->
<script lang="ts">
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import type { NDKUser } from '@nostr-dev-kit/ndk';
  import type { Snippet } from 'svelte';
  import { createUserInput } from '@nostr-dev-kit/svelte';
  import { Combobox } from 'bits-ui';
  import { cn } from '../utils/index.js';
  import { User } from '../ui/user';

  interface Props {
    /** NDK instance */
    ndk: NDKSvelte;

    /** Callback when user is selected */
    onSelect?: (user: NDKUser) => void;

    /** Placeholder text (only used with default input) */
    placeholder?: string;

    /** Debounce delay in ms */
    debounceMs?: number;

    /** Additional CSS classes */
    class?: string;

    /** Optional custom input snippet */
    input?: Snippet<[{ value: string; oninput: (e: Event) => void; loading: boolean }]>;
  }

  let {
    ndk,
    onSelect,
    placeholder = 'Search users by name, NIP-05, npub...',
    debounceMs = 300,
    class: className = '',
    input
  }: Props = $props();

  let query = $state('');
  let selectedValue = $state<string[]>([]);
  let open = $state(false);

  const userInputState = createUserInput(() => ({
    query,
    onSelect: (user) => {
      if (onSelect) onSelect(user);
      open = false;
      query = '';
      selectedValue = [];
    },
    debounceMs
  }), ndk);

  const displayedResults = $derived(userInputState.results.slice(0, 8));

  const items = $derived(displayedResults.map(result => ({
    value: result.user.pubkey,
    label: result.user.profile?.displayName || result.user.profile?.name || result.user.npub
  })));

  // Handle value changes from Combobox
  function handleValueChange(value: string[]) {
    selectedValue = value;
    if (value.length > 0) {
      const pubkey = value[0];
      const result = displayedResults.find(r => r.user.pubkey === pubkey);
      if (result) {
        userInputState.selectUser(result.user);
      }
    }
  }

  // Input handler for custom input elements
  function handleInput(e: Event) {
    query = (e.target as HTMLInputElement | HTMLTextAreaElement).value;
  }
</script>

<Combobox.Root
  bind:open
  bind:value={selectedValue}
  onValueChange={handleValueChange}
  {items}
  inputValue={query}
  class={cn('relative w-full', className)}
>
  <div class="relative">
    {#if input}
      {@render input({ value: query, oninput: handleInput, loading: userInputState.loading })}
    {:else}
      <Combobox.Input
        oninput={(e) => query = e.currentTarget.value}
        {placeholder}
        aria-label="Search users"
        class={cn(
          'flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm',
          'placeholder:text-muted-foreground',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          'disabled:cursor-not-allowed disabled:opacity-50'
        )}
      />
    {/if}
    {#if userInputState.loading}
      <div class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
        <svg class="animate-spin h-4 w-4 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    {/if}
  </div>

  <Combobox.Content
    class={cn(
      'z-50 max-h-96 min-w-full overflow-y-auto rounded-md border border-border bg-popover text-popover-foreground shadow-md',
      'data-[state=open]:animate-in data-[state=closed]:animate-out',
      'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
      'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95'
    )}
    sideOffset={4}
  >
    {#if displayedResults.length > 0}
      {#each displayedResults as result (result.user.pubkey)}
        <Combobox.Item
          value={result.user.pubkey}
          label={result.user.profile?.displayName || result.user.profile?.name || result.user.npub}
          class={cn(
            'relative flex cursor-pointer select-none items-center gap-3 px-4 py-3 border-b border-border last:border-b-0',
            'data-[highlighted]:bg-muted/50 transition-colors outline-none'
          )}
        >
          <User.Root {ndk} pubkey={result.user.pubkey}>
            <div class="flex items-center gap-3 w-full">
              <User.Avatar size={40} />
              <div class="flex-1 min-w-0">
                <User.Name field="displayName" size="sm" truncate={true} />
              </div>
            </div>
          </User.Root>
        </Combobox.Item>
      {/each}
    {:else if query.trim().length > 0 && !userInputState.loading}
      <div class="py-6 text-center text-sm text-muted-foreground">
        No users found
      </div>
    {/if}
  </Combobox.Content>
</Combobox.Root>
