<script lang="ts">
  import type { NDKSvelte } from '@nostr-dev-kit/svelte';

  interface Props {
    ndk: NDKSvelte;
    value?: string;
    onUserChange: (pubkey: string | undefined) => void;
    defaultValue?: string;
  }

  let { ndk, value = $bindable(), onUserChange, defaultValue = 'npub1l2vyh47mk2p0qlsku7hg0vn29faehy9hy34ygaclpn66ukqp3afqutajft' }: Props = $props();

  let input = $state(defaultValue);
  let error = $state('');
  let isProcessing = $state(false);

  // Process input whenever it changes
  $effect(() => {
    const processInput = async () => {
      if (!input.trim()) {
        onUserChange(undefined);
        error = '';
        return;
      }

      isProcessing = true;
      error = '';

      try {
        // fetchUser handles all formats: hex, npub, nprofile, and NIP-05
        console.log(input.trim())
        const user = await ndk.fetchUser(input.trim());
        console.log(user);

        if (user) {
          onUserChange(user.pubkey);
          error = '';
        } else {
          error = 'User not found';
          onUserChange(undefined);
        }
      } catch (e) {
        error = e instanceof Error ? e.message : 'Invalid input';
        onUserChange(undefined);
      } finally {
        isProcessing = false;
      }
    };

    processInput();
  });

  // Sync value with input
  $effect(() => {
    if (value !== undefined && value !== input) {
      input = value;
    }
  });
</script>

<div class="user-input-control">
  <label>
    <span class="label-text">Test with different user (npub, nprofile, hex, or NIP-05):</span>
    <input
      type="text"
      bind:value={input}
      placeholder="npub1... / nprofile1... / name@domain / hex"
      class="user-input"
      class:error={error}
    />
  </label>

  {#if isProcessing}
    <p class="status processing">Processing...</p>
  {:else if error}
    <p class="status error-message">{error}</p>
  {/if}
</div>

<style>
  .user-input-control {
    margin-bottom: 2rem;
    padding: 1.5rem;
    background: hsl(var(--color-card));
    border: 1px solid hsl(var(--color-border));
    border-radius: 0.75rem;
  }

  label {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .label-text {
    font-size: 0.875rem;
    font-weight: 600;
    color: hsl(var(--color-foreground));
  }

  .user-input {
    padding: 0.5rem 0.75rem;
    border: 1px solid hsl(var(--color-border));
    background: hsl(var(--color-background));
    color: hsl(var(--color-foreground));
    border-radius: 0.375rem;
    font-family: 'Monaco', 'Menlo', monospace;
    font-size: 0.875rem;
    width: 100%;
    max-width: 600px;
    transition: border-color 0.2s;
  }

  .user-input:focus {
    outline: none;
    border-color: hsl(var(--color-ring));
    box-shadow: 0 0 0 3px hsl(var(--color-ring) / 0.2);
  }

  .user-input.error {
    border-color: hsl(var(--color-destructive));
  }

  .status {
    margin: 0.5rem 0 0 0;
    font-size: 0.875rem;
  }

  .processing {
    color: hsl(var(--color-muted-foreground));
  }

  .error-message {
    color: hsl(var(--color-destructive));
  }
</style>
