<script lang="ts">
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';
  import { Input } from '$lib/registry/components/input/index.js';

  interface Props {
    ndk: NDKSvelte;
  }

  let { ndk }: Props = $props();

  function handleSelect(user: any) {
    console.log('Selected user:', user);
  }
</script>

<div class="example-container">
  <Input.Root {ndk} onSelect={handleSelect}>
    <Input.Search placeholder="Search users..." autofocus />

    <Input.Results maxResults={10}>
      {#snippet children(result)}
        <Input.ResultItem {result} />
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
    </Input.Results>
  </Input.Root>
</div>


