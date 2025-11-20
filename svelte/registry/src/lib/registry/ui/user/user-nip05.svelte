<script lang="ts">
  import { getContext } from 'svelte';
  import { USER_CONTEXT_KEY, type UserContext } from './user.context.js';
  import type { Snippet } from 'svelte';

  const NIP05_REGEX = /^(?:([\w.+-]+)@)?([\w.-]+)$/;

  // Format NIP-05 identifier for display
  function formatNip05(nip05: string | undefined): string {
    if (!nip05) return '';
    return nip05;
  }

  interface Props {
    showNip05?: boolean;
    showVerified?: boolean;
    class?: string;

    /**
     * Custom snippet to display verification status
     * Receives the verification status as a parameter
     */
    verificationSnippet?: Snippet<[{
      status: boolean | null | undefined;
      isVerifying: boolean;
    }]>;
  }

  let {
    showNip05 = true,
    showVerified = true,
    class: className = '',
    verificationSnippet
  }: Props = $props();

  const context = getContext<UserContext>(USER_CONTEXT_KEY);
  if (!context) {
    throw new Error('User.Nip05 must be used within User.Root');
  }

  const profile = $derived(context.profile);
  const ndkUser = $derived(context.ndkUser);

  const nip05 = $derived(profile?.nip05);

  // Validate nip05 format
  const isValidFormat = $derived(nip05 ? NIP05_REGEX.test(nip05) : false);

  // Format display text using NDK utility
  const displayText = $derived(formatNip05(nip05));

  // Actual NIP-05 verification state
  // true = verified, false = invalid, null = not verified/error, undefined = not checked yet
  let verificationStatus = $state<boolean | null | undefined>(undefined);
  let isVerifying = $state(false);

  // Verify NIP-05 when showVerified is true and we have the data
  $effect(() => {
    if (!showVerified || !nip05 || !ndkUser || !isValidFormat) {
      verificationStatus = undefined;
      return;
    }

    // Reset and verify
    verificationStatus = undefined;
    isVerifying = true;

    ndkUser.validateNip05(nip05).then(result => {
      verificationStatus = result;
      isVerifying = false;
    }).catch(() => {
      verificationStatus = null;
      isVerifying = false;
    });
  });
</script>

{#if showNip05 && nip05}
  <span data-user-nip05="" class={className}>
    {displayText}
    {#if showVerified}
      {#if verificationSnippet}
        {@render verificationSnippet({ status: verificationStatus, isVerifying })}
      {:else}
        {#if isVerifying}
          <span title="Verifying NIP-05...">⋯</span>
        {:else if verificationStatus === true}
          <span title="NIP-05 verified">✓</span>
        {:else if verificationStatus === false}
          <span title="NIP-05 does not match pubkey">✗</span>
        {/if}
      {/if}
    {/if}
  </span>
{/if}
