<script lang="ts">
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { UserInput } from '../index.js';

  interface Props {
    ndk: NDKSvelte;
  }

  let { ndk }: Props = $props();

  function handleSelect(user: any) {
    console.log('Selected user:', user);
  }
</script>

<div class="example-container">
  <UserInput.Root {ndk} onSelect={handleSelect}>
    <UserInput.Search placeholder="Search users..." autofocus />

    <UserInput.Results maxResults={10}>
      {#snippet children(result)}
        <UserInput.ResultItem {result} />
      {/snippet}

      {#snippet empty()}
        <div class="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
          <p>No users found</p>
          <p class="hint">Try searching by name, NIP-05, or npub</p>
        </div>
      {/snippet}
    </UserInput.Results>
  </UserInput.Root>
</div>

<style>
  .example-container {
    max-width: 24rem;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    padding: 2rem 1rem;
    text-align: center;
  }

  .empty-state svg {
    width: 3rem;
    height: 3rem;
    color: hsl(var(--muted-foreground));
    opacity: 0.5;
  }

  .empty-state p {
    margin: 0;
    color: hsl(var(--muted-foreground));
    font-size: 0.875rem;
  }

  .empty-state .hint {
    font-size: 0.75rem;
    opacity: 0.7;
  }
</style>
