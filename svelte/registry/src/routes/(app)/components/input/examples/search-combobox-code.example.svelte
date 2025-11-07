<script lang="ts">
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import type { NDKUser } from '@nostr-dev-kit/ndk';
  import { createUserInput } from '$lib/registry/builders/user-input/index.svelte.js';
  import { Combobox } from 'bits-ui';
  import { cn } from '$lib/registry/utils/cn.js';
  import { User } from '$lib/registry/ui/user';

  interface Props {
    ndk: NDKSvelte;
    onSelect?: (user: NDKUser) => void;
    placeholder?: string;
  }

  let { ndk, onSelect, placeholder = 'Search users...' }: Props = $props();

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
    }
  }), ndk);

  const displayedResults = $derived(userInputState.results.slice(0, 8));

  const items = $derived(displayedResults.map(result => ({
    value: result.user.pubkey,
    label: result.user.profile?.displayName || result.user.profile?.name || result.user.npub
  })));

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
</script>

<Combobox.Root
  bind:open
  bind:value={selectedValue}
  onValueChange={handleValueChange}
  {items}
  inputValue={query}
  class="relative w-full"
>
  <Combobox.Input
    oninput={(e) => query = e.currentTarget.value}
    {placeholder}
    aria-label="Search users"
    class={cn(
      'flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm',
      'placeholder:text-muted-foreground',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
    )}
  />

  <Combobox.Content
    class={cn(
      'z-50 max-h-96 min-w-full overflow-y-auto rounded-md border border-border bg-popover shadow-md',
      'data-[state=open]:animate-in data-[state=closed]:animate-out'
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
              <User.Avatar class="w-10 h-10" />
              <div class="flex-1 min-w-0">
                <User.Name field="displayName" class="text-sm truncate" />
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
